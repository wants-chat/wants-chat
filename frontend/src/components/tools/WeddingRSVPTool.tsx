import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Plus, Trash2, CheckCircle, XCircle, Clock, Send, Users, Calendar, Sparkles, Filter, Download, MessageSquare } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WeddingRSVPToolProps {
  uiConfig?: UIConfig;
}

interface RSVPEntry {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'declined' | 'maybe';
  attending: number;
  dietaryRestrictions: string;
  mealChoice: string;
  songRequest: string;
  notes: string;
  sentDate: string | null;
  responseDate: string | null;
  remindersSent: number;
}

const mealOptions = ['Beef', 'Chicken', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal'];

export const WeddingRSVPTool: React.FC<WeddingRSVPToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [entries, setEntries] = useState<RSVPEntry[]>([]);
  const [weddingDate, setWeddingDate] = useState<string>('');
  const [rsvpDeadline, setRsvpDeadline] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newEntry, setNewEntry] = useState<Omit<RSVPEntry, 'id'>>({
    guestName: '',
    email: '',
    phone: '',
    status: 'pending',
    attending: 1,
    dietaryRestrictions: '',
    mealChoice: '',
    songRequest: '',
    notes: '',
    sentDate: null,
    responseDate: null,
    remindersSent: 0,
  });

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.date) {
        setWeddingDate(params.date.toString());
        setIsPrefilled(true);
      }
      if (params.items && Array.isArray(params.items)) {
        const prefillEntries: RSVPEntry[] = params.items.map((item, idx) => ({
          id: `rsvp-${idx}-${Date.now()}`,
          guestName: typeof item === 'string' ? item : item.name || '',
          email: typeof item === 'object' ? item.email || '' : '',
          phone: '',
          status: 'pending',
          attending: 1,
          dietaryRestrictions: '',
          mealChoice: '',
          songRequest: '',
          notes: '',
          sentDate: null,
          responseDate: null,
          remindersSent: 0,
        }));
        setEntries(prefillEntries);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredEntries = useMemo(() => {
    if (filterStatus === 'all') return entries;
    return entries.filter((e) => e.status === filterStatus);
  }, [entries, filterStatus]);

  const stats = useMemo(() => {
    const total = entries.length;
    const confirmed = entries.filter((e) => e.status === 'confirmed').length;
    const declined = entries.filter((e) => e.status === 'declined').length;
    const pending = entries.filter((e) => e.status === 'pending').length;
    const maybe = entries.filter((e) => e.status === 'maybe').length;
    const totalAttending = entries
      .filter((e) => e.status === 'confirmed')
      .reduce((sum, e) => sum + e.attending, 0);
    const responseRate = total > 0 ? ((confirmed + declined) / total) * 100 : 0;

    // Days until deadline
    let daysUntilDeadline = null;
    if (rsvpDeadline) {
      const deadline = new Date(rsvpDeadline);
      const today = new Date();
      daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    return { total, confirmed, declined, pending, maybe, totalAttending, responseRate, daysUntilDeadline };
  }, [entries, rsvpDeadline]);

  const handleAddEntry = () => {
    if (!newEntry.guestName.trim()) return;
    const entry: RSVPEntry = {
      ...newEntry,
      id: `rsvp-${Date.now()}`,
    };
    setEntries((prev) => [...prev, entry]);
    setNewEntry({
      guestName: '',
      email: '',
      phone: '',
      status: 'pending',
      attending: 1,
      dietaryRestrictions: '',
      mealChoice: '',
      songRequest: '',
      notes: '',
      sentDate: null,
      responseDate: null,
      remindersSent: 0,
    });
    setShowAddForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateEntry = (id: string, updates: Partial<RSVPEntry>) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          if (updates.status && updates.status !== 'pending' && !e.responseDate) {
            updated.responseDate = new Date().toISOString().split('T')[0];
          }
          return updated;
        }
        return e;
      })
    );
  };

  const handleMarkAsSent = (id: string) => {
    handleUpdateEntry(id, { sentDate: new Date().toISOString().split('T')[0] });
  };

  const handleSendReminder = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      handleUpdateEntry(id, { remindersSent: entry.remindersSent + 1 });
    }
  };

  const exportToCSV = () => {
    const headers = ['Guest Name', 'Email', 'Phone', 'Status', 'Attending', 'Meal Choice', 'Dietary Restrictions', 'Song Request', 'Response Date', 'Notes'];
    const rows = entries.map((e) => [
      e.guestName,
      e.email,
      e.phone,
      e.status,
      e.attending.toString(),
      e.mealChoice,
      e.dietaryRestrictions,
      e.songRequest,
      e.responseDate || '',
      e.notes,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding_rsvp.csv';
    a.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'maybe':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return isDark ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200';
      case 'declined':
        return isDark ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
      case 'maybe':
        return isDark ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Mail className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingRSVP.weddingRsvpTracker', 'Wedding RSVP Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingRSVP.trackGuestResponsesAndMeal', 'Track guest responses and meal choices')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Plus className="w-4 h-4" /> Add Guest
            </button>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.weddingRSVP.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Date Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" /> Wedding Date
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" /> RSVP Deadline
            </label>
            <input
              type="date"
              value={rsvpDeadline}
              onChange={(e) => setRsvpDeadline(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRSVP.invited', 'Invited')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className="text-2xl font-bold text-green-500">{stats.confirmed}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRSVP.confirmed', 'Confirmed')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <div className="text-2xl font-bold text-red-500">{stats.declined}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRSVP.declined', 'Declined')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRSVP.pending', 'Pending')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
            <div className="text-2xl font-bold text-teal-500">{stats.totalAttending}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRSVP.totalAttending', 'Total Attending')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
            <div className="text-2xl font-bold text-purple-500">{stats.responseRate.toFixed(0)}%</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRSVP.responseRate', 'Response Rate')}</div>
          </div>
        </div>

        {/* Deadline Alert */}
        {stats.daysUntilDeadline !== null && stats.daysUntilDeadline <= 14 && stats.daysUntilDeadline > 0 && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
            <Clock className="w-5 h-5" />
            <span className="text-sm">
              RSVP deadline is in {stats.daysUntilDeadline} day{stats.daysUntilDeadline !== 1 ? 's' : ''}!
              {stats.pending > 0 && ` ${stats.pending} guest${stats.pending !== 1 ? 's' : ''} haven't responded yet.`}
            </span>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">{t('tools.weddingRSVP.allGuests', 'All Guests')}</option>
            <option value="confirmed">{t('tools.weddingRSVP.confirmed2', 'Confirmed')}</option>
            <option value="declined">{t('tools.weddingRSVP.declined2', 'Declined')}</option>
            <option value="pending">{t('tools.weddingRSVP.pending2', 'Pending')}</option>
            <option value="maybe">{t('tools.weddingRSVP.maybe', 'Maybe')}</option>
          </select>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingRSVP.addNewGuest', 'Add New Guest')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                value={newEntry.guestName}
                onChange={(e) => setNewEntry({ ...newEntry, guestName: e.target.value })}
                placeholder={t('tools.weddingRSVP.guestName', 'Guest Name *')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="email"
                value={newEntry.email}
                onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
                placeholder={t('tools.weddingRSVP.email', 'Email')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="tel"
                value={newEntry.phone}
                onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                placeholder={t('tools.weddingRSVP.phone', 'Phone')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="number"
                value={newEntry.attending}
                onChange={(e) => setNewEntry({ ...newEntry, attending: parseInt(e.target.value) || 1 })}
                placeholder={t('tools.weddingRSVP.partySize', 'Party Size')}
                min="1"
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={newEntry.mealChoice}
                onChange={(e) => setNewEntry({ ...newEntry, mealChoice: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">{t('tools.weddingRSVP.selectMeal', 'Select Meal')}</option>
                {mealOptions.map((meal) => (
                  <option key={meal} value={meal}>{meal}</option>
                ))}
              </select>
              <input
                type="text"
                value={newEntry.dietaryRestrictions}
                onChange={(e) => setNewEntry({ ...newEntry, dietaryRestrictions: e.target.value })}
                placeholder={t('tools.weddingRSVP.dietaryRestrictions', 'Dietary Restrictions')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddEntry} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">
                {t('tools.weddingRSVP.addGuest', 'Add Guest')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {t('tools.weddingRSVP.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* RSVP List */}
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {entries.length === 0 ? (
                <>
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.weddingRSVP.noGuestsAddedYetClick', 'No guests added yet. Click "Add Guest" to start tracking RSVPs.')}</p>
                </>
              ) : (
                <p>{t('tools.weddingRSVP.noGuestsMatchTheCurrent', 'No guests match the current filter.')}</p>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(entry.status)}
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{entry.guestName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                      {entry.attending > 1 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                          <Users className="w-3 h-3 inline mr-1" />{entry.attending}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {entry.email && <span className="mr-4">{entry.email}</span>}
                      {entry.mealChoice && <span className="mr-4">Meal: {entry.mealChoice}</span>}
                      {entry.dietaryRestrictions && <span>Diet: {entry.dietaryRestrictions}</span>}
                    </div>
                    {entry.songRequest && (
                      <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Song: {entry.songRequest}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={entry.status}
                      onChange={(e) => handleUpdateEntry(entry.id, { status: e.target.value as RSVPEntry['status'] })}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="pending">{t('tools.weddingRSVP.pending3', 'Pending')}</option>
                      <option value="confirmed">{t('tools.weddingRSVP.confirmed3', 'Confirmed')}</option>
                      <option value="declined">{t('tools.weddingRSVP.declined3', 'Declined')}</option>
                      <option value="maybe">{t('tools.weddingRSVP.maybe2', 'Maybe')}</option>
                    </select>
                    {entry.status === 'confirmed' && (
                      <input
                        type="number"
                        value={entry.attending}
                        onChange={(e) => handleUpdateEntry(entry.id, { attending: parseInt(e.target.value) || 1 })}
                        min="1"
                        className={`w-16 px-2 py-1.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    )}
                    {!entry.sentDate && entry.email && (
                      <button
                        onClick={() => handleMarkAsSent(entry.id)}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-teal-400' : 'hover:bg-gray-200 text-teal-600'}`}
                        title={t('tools.weddingRSVP.markAsSent', 'Mark as Sent')}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {entry.sentDate && entry.status === 'pending' && (
                      <button
                        onClick={() => handleSendReminder(entry.id)}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-200 text-yellow-600'}`}
                        title={`Send Reminder (${entry.remindersSent} sent)`}
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {(entry.sentDate || entry.responseDate) && (
                  <div className={`mt-2 pt-2 border-t text-xs flex gap-4 ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                    {entry.sentDate && <span>Sent: {entry.sentDate}</span>}
                    {entry.responseDate && <span>Responded: {entry.responseDate}</span>}
                    {entry.remindersSent > 0 && <span>Reminders: {entry.remindersSent}</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Meal Summary */}
        {entries.filter((e) => e.status === 'confirmed' && e.mealChoice).length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingRSVP.mealSummary', 'Meal Summary')}</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {mealOptions.map((meal) => {
                const count = entries.filter((e) => e.status === 'confirmed' && e.mealChoice === meal).length;
                if (count === 0) return null;
                return (
                  <div key={meal} className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{count}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{meal}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeddingRSVPTool;
