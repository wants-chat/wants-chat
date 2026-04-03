'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  Clock,
  Phone,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Check,
  AlertCircle,
  Bell,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface WaitlistToolProps {
  uiConfig?: UIConfig;
}

type WaitStatus = 'waiting' | 'notified' | 'seated' | 'no-show' | 'cancelled';

interface WaitlistEntry {
  id: string;
  guestName: string;
  partySize: number;
  phoneNumber: string;
  email: string;
  status: WaitStatus;
  checkInTime: string;
  estimatedWait: number;
  notifiedAt: string;
  seatedAt: string;
  preferredSection: string;
  specialRequests: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<WaitStatus, { label: string; color: string; bgColor: string }> = {
  waiting: { label: 'Waiting', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  notified: { label: 'Notified', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  seated: { label: 'Seated', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  'no-show': { label: 'No Show', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700' },
};

const SECTIONS = ['No Preference', 'Main Floor', 'Patio', 'Bar', 'Window', 'Booth', 'Private'];

const WAITLIST_COLUMNS: ColumnConfig[] = [
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'partySize', header: 'Party Size', type: 'number' },
  { key: 'phoneNumber', header: 'Phone', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'checkInTime', header: 'Check-in Time', type: 'string' },
  { key: 'estimatedWait', header: 'Est. Wait (min)', type: 'number' },
  { key: 'preferredSection', header: 'Preferred Section', type: 'string' },
  { key: 'specialRequests', header: 'Special Requests', type: 'string' },
];

export const WaitlistTool: React.FC<WaitlistToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: waitlist,
    setData: setWaitlist,
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
  } = useToolData<WaitlistEntry>('waitlist', [], WAITLIST_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('waiting');
  const [averageWaitTime, setAverageWaitTime] = useState(15);

  const [newEntry, setNewEntry] = useState<Partial<WaitlistEntry>>({
    guestName: '',
    partySize: 2,
    phoneNumber: '',
    email: '',
    preferredSection: 'No Preference',
    specialRequests: '',
    notes: '',
  });

  const filteredWaitlist = useMemo(() => {
    if (selectedStatus === 'all') return waitlist;
    return waitlist.filter((entry) => entry.status === selectedStatus);
  }, [waitlist, selectedStatus]);

  const activeWaitlist = useMemo(() => {
    return waitlist.filter((e) => e.status === 'waiting' || e.status === 'notified');
  }, [waitlist]);

  const stats = useMemo(() => {
    const waiting = waitlist.filter((e) => e.status === 'waiting').length;
    const notified = waitlist.filter((e) => e.status === 'notified').length;
    const seated = waitlist.filter((e) => e.status === 'seated').length;
    const noShow = waitlist.filter((e) => e.status === 'no-show').length;
    const totalGuests = activeWaitlist.reduce((sum, e) => sum + e.partySize, 0);

    return { waiting, notified, seated, noShow, totalGuests };
  }, [waitlist, activeWaitlist]);

  const getPositionInQueue = (entry: WaitlistEntry) => {
    const waitingEntries = waitlist
      .filter((e) => e.status === 'waiting')
      .sort((a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime());
    return waitingEntries.findIndex((e) => e.id === entry.id) + 1;
  };

  const getEstimatedWait = (entry: WaitlistEntry) => {
    const position = getPositionInQueue(entry);
    return position * averageWaitTime;
  };

  const getWaitingTime = (checkInTime: string) => {
    if (!checkInTime) return '';
    const checkIn = new Date(checkInTime);
    const now = new Date();
    const diffMs = now.getTime() - checkIn.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const handleAddEntry = () => {
    if (!newEntry.guestName) return;

    const entry: WaitlistEntry = {
      id: `wait-${Date.now()}`,
      guestName: newEntry.guestName || '',
      partySize: newEntry.partySize || 2,
      phoneNumber: newEntry.phoneNumber || '',
      email: newEntry.email || '',
      status: 'waiting',
      checkInTime: new Date().toISOString(),
      estimatedWait: activeWaitlist.length * averageWaitTime,
      notifiedAt: '',
      seatedAt: '',
      preferredSection: newEntry.preferredSection || 'No Preference',
      specialRequests: newEntry.specialRequests || '',
      notes: newEntry.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(entry);
    setNewEntry({
      guestName: '',
      partySize: 2,
      phoneNumber: '',
      email: '',
      preferredSection: 'No Preference',
      specialRequests: '',
      notes: '',
    });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;
    updateItem(editingEntry.id, { ...editingEntry, updatedAt: new Date().toISOString() });
    setEditingEntry(null);
  };

  const handleNotify = (id: string) => {
    updateItem(id, {
      status: 'notified',
      notifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSeat = (id: string) => {
    updateItem(id, {
      status: 'seated',
      seatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleNoShow = (id: string) => {
    updateItem(id, {
      status: 'no-show',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCancel = (id: string) => {
    updateItem(id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to clear the waitlist?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setWaitlist([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <Users className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.waitlist.customerWaitlist', 'Customer Waitlist')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.waitlist.manageRestaurantWaitlistAndGuest', 'Manage restaurant waitlist and guest queuing')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="waitlist" toolName="Waitlist" />

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
                  onExportCSV={() => exportCSV({ filename: 'waitlist' })}
                  onExportExcel={() => exportExcel({ filename: 'waitlist' })}
                  onExportJSON={() => exportJSON({ filename: 'waitlist' })}
                  onExportPDF={() => exportPDF({
                    filename: 'waitlist',
                    title: 'Customer Waitlist',
                    subtitle: `${waitlist.length} entries`,
                  })}
                  onPrint={() => print('Customer Waitlist')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={waitlist.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.waitlist.clear', 'Clear')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-yellow-500">{t('tools.waitlist.waiting', 'Waiting')}</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-blue-500">{t('tools.waitlist.notified', 'Notified')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.notified}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-green-500">{t('tools.waitlist.seatedToday', 'Seated Today')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.seated}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-red-500">{t('tools.waitlist.noShows', 'No Shows')}</div>
            <div className="text-2xl font-bold text-red-600">{stats.noShow}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waitlist.guestsWaiting', 'Guests Waiting')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalGuests}</div>
          </div>
        </div>

        {/* Average Wait Time Setting */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-[#0D9488]" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waitlist.averageWaitTime', 'Average Wait Time:')}</span>
              <input
                type="number"
                value={averageWaitTime}
                onChange={(e) => setAverageWaitTime(parseInt(e.target.value) || 15)}
                min="5"
                max="120"
                className={`w-20 px-3 py-1 border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
                } rounded-lg text-center`}
              />
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.waitlist.minutesPerParty', 'minutes per party')}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Guest Form */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <UserPlus className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.waitlist.addToWaitlist', 'Add to Waitlist')}
                </CardTitle>
                {showAddForm ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waitlist.guestName', 'Guest Name *')}
                  </label>
                  <input
                    type="text"
                    value={newEntry.guestName}
                    onChange={(e) => setNewEntry({ ...newEntry, guestName: e.target.value })}
                    placeholder={t('tools.waitlist.guestName2', 'Guest name')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waitlist.partySize', 'Party Size')}
                    </label>
                    <input
                      type="number"
                      value={newEntry.partySize}
                      onChange={(e) => setNewEntry({ ...newEntry, partySize: parseInt(e.target.value) || 2 })}
                      min="1"
                      max="20"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waitlist.estWait', 'Est. Wait')}
                    </label>
                    <div className={`px-4 py-2 border rounded-lg ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-gray-100 text-gray-900'
                    }`}>
                      ~{activeWaitlist.length * averageWaitTime} min
                    </div>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waitlist.phoneNumber', 'Phone Number')}
                  </label>
                  <input
                    type="tel"
                    value={newEntry.phoneNumber}
                    onChange={(e) => setNewEntry({ ...newEntry, phoneNumber: e.target.value })}
                    placeholder="(555) 123-4567"
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waitlist.preferredSection', 'Preferred Section')}
                  </label>
                  <select
                    value={newEntry.preferredSection}
                    onChange={(e) => setNewEntry({ ...newEntry, preferredSection: e.target.value })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  >
                    {SECTIONS.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waitlist.specialRequests', 'Special Requests')}
                  </label>
                  <textarea
                    value={newEntry.specialRequests}
                    onChange={(e) => setNewEntry({ ...newEntry, specialRequests: e.target.value })}
                    placeholder={t('tools.waitlist.highChairWheelchairAccessEtc', 'High chair, wheelchair access, etc.')}
                    rows={2}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg resize-none`}
                  />
                </div>
                <button
                  onClick={handleAddEntry}
                  disabled={!newEntry.guestName}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  {t('tools.waitlist.addToWaitlist2', 'Add to Waitlist')}
                </button>
              </CardContent>
            )}
          </Card>

          {/* Waitlist */}
          <div className="lg:col-span-2">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Users className="w-5 h-5 text-[#0D9488]" />
                    Waitlist ({filteredWaitlist.length})
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    {['waiting', 'notified', 'seated', 'all'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                          selectedStatus === status
                            ? 'bg-[#0D9488] text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'all' ? 'All' : STATUS_CONFIG[status as WaitStatus]?.label || status}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredWaitlist.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.waitlist.noGuestsInWaitlist', 'No guests in waitlist')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWaitlist
                      .sort((a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime())
                      .map((entry) => {
                        const statusConfig = STATUS_CONFIG[entry.status];
                        const position = getPositionInQueue(entry);
                        return (
                          <div
                            key={entry.id}
                            className={`p-4 rounded-xl border ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {entry.status === 'waiting' && position > 0 && (
                                    <span className="w-8 h-8 flex items-center justify-center bg-[#0D9488] text-white rounded-full text-sm font-bold">
                                      {position}
                                    </span>
                                  )}
                                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {entry.guestName}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                                    {statusConfig.label}
                                  </span>
                                </div>
                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{entry.partySize} guests</span>
                                  </div>
                                  {entry.phoneNumber && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      <span>{entry.phoneNumber}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Waiting: {getWaitingTime(entry.checkInTime)}</span>
                                  </div>
                                  {entry.preferredSection !== 'No Preference' && (
                                    <div>{entry.preferredSection}</div>
                                  )}
                                </div>
                                {entry.specialRequests && (
                                  <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <MessageSquare className="w-3 h-3 inline mr-1" />
                                    {entry.specialRequests}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                {entry.status === 'waiting' && (
                                  <button
                                    onClick={() => handleNotify(entry.id)}
                                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                                  >
                                    <Bell className="w-4 h-4" />
                                    {t('tools.waitlist.notify', 'Notify')}
                                  </button>
                                )}
                                {(entry.status === 'waiting' || entry.status === 'notified') && (
                                  <button
                                    onClick={() => handleSeat(entry.id)}
                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-1"
                                  >
                                    <Check className="w-4 h-4" />
                                    {t('tools.waitlist.seat', 'Seat')}
                                  </button>
                                )}
                                {entry.status === 'notified' && (
                                  <button
                                    onClick={() => handleNoShow(entry.id)}
                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                                  >
                                    {t('tools.waitlist.noShow', 'No Show')}
                                  </button>
                                )}
                                {entry.status === 'waiting' && (
                                  <button
                                    onClick={() => handleCancel(entry.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm ${
                                      isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                  >
                                    {t('tools.waitlist.cancel', 'Cancel')}
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteItem(entry.id)}
                                  className="px-3 py-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default WaitlistTool;
