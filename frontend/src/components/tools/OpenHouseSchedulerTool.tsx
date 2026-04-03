'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Clock,
  MapPin,
  Users,
  Bell,
  CheckCircle,
  Calendar,
  User,
  Phone,
  Mail,
  Home,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestedLevel: 'high' | 'medium' | 'low';
  notes?: string;
}

interface OpenHouse {
  id: string;
  propertyAddress: string;
  propertyType: string;
  listingPrice: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  hostName: string;
  hostPhone: string;
  hostEmail: string;
  maxCapacity?: number;
  registeredVisitors: Visitor[];
  actualAttendance?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  refreshments: boolean;
  signageReady: boolean;
  virtualTourLink?: string;
  notes?: string;
  followUpSent: boolean;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'eventDate', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start', type: 'string' },
  { key: 'endTime', header: 'End', type: 'string' },
  { key: 'hostName', header: 'Host', type: 'string' },
  { key: 'listingPrice', header: 'Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const EVENT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'in_progress', label: 'In Progress', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'completed', label: 'Completed', color: 'text-green-500 bg-green-500/10' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-500 bg-red-500/10' },
];

export const OpenHouseSchedulerTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: openHouses,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    forceSync,
  } = useToolData<OpenHouse>('open-house-scheduler', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OpenHouse | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OpenHouse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const [form, setForm] = useState<Partial<OpenHouse>>({
    propertyAddress: '',
    propertyType: 'house',
    listingPrice: 0,
    eventDate: '',
    startTime: '10:00',
    endTime: '12:00',
    hostName: '',
    hostPhone: '',
    hostEmail: '',
    registeredVisitors: [],
    status: 'scheduled',
    refreshments: false,
    signageReady: false,
    followUpSent: false,
  });

  const [visitorForm, setVisitorForm] = useState<Partial<Visitor>>({
    name: '',
    email: '',
    phone: '',
    interestedLevel: 'medium',
  });

  const filteredOpenHouses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return openHouses.filter(event => {
      const matchesSearch = !searchQuery ||
        event.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.hostName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesDate = dateFilter === 'all' ||
        (dateFilter === 'upcoming' && event.eventDate >= today) ||
        (dateFilter === 'past' && event.eventDate < today);
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [openHouses, searchQuery, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = openHouses.filter(e => e.eventDate >= today && e.status === 'scheduled').length;
    const completed = openHouses.filter(e => e.status === 'completed').length;
    const totalVisitors = openHouses.reduce((sum, e) => sum + e.registeredVisitors.length, 0);
    const todayEvents = openHouses.filter(e => e.eventDate === today).length;
    return { upcoming, completed, totalVisitors, todayEvents };
  }, [openHouses]);

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.eventDate || !form.hostName) return;

    const now = new Date().toISOString();
    if (editingEvent) {
      updateItem(editingEvent.id, { ...form, updatedAt: now });
    } else {
      const newEvent: OpenHouse = {
        id: `oh-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        propertyType: form.propertyType || 'house',
        listingPrice: form.listingPrice || 0,
        eventDate: form.eventDate || '',
        startTime: form.startTime || '10:00',
        endTime: form.endTime || '12:00',
        hostName: form.hostName || '',
        hostPhone: form.hostPhone || '',
        hostEmail: form.hostEmail || '',
        maxCapacity: form.maxCapacity,
        registeredVisitors: [],
        status: 'scheduled',
        refreshments: form.refreshments || false,
        signageReady: form.signageReady || false,
        virtualTourLink: form.virtualTourLink,
        notes: form.notes,
        followUpSent: false,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newEvent);
    }
    resetForm();
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleAddVisitor = () => {
    if (!selectedEvent || !visitorForm.name || !visitorForm.email) return;

    const newVisitor: Visitor = {
      id: `visitor-${Date.now()}`,
      name: visitorForm.name,
      email: visitorForm.email,
      phone: visitorForm.phone || '',
      interestedLevel: visitorForm.interestedLevel || 'medium',
      notes: visitorForm.notes,
    };

    const updatedVisitors = [...selectedEvent.registeredVisitors, newVisitor];
    updateItem(selectedEvent.id, {
      registeredVisitors: updatedVisitors,
      updatedAt: new Date().toISOString(),
    });
    setSelectedEvent({ ...selectedEvent, registeredVisitors: updatedVisitors });
    setVisitorForm({ name: '', email: '', phone: '', interestedLevel: 'medium' });
  };

  const handleRemoveVisitor = (visitorId: string) => {
    if (!selectedEvent) return;
    const updatedVisitors = selectedEvent.registeredVisitors.filter(v => v.id !== visitorId);
    updateItem(selectedEvent.id, {
      registeredVisitors: updatedVisitors,
      updatedAt: new Date().toISOString(),
    });
    setSelectedEvent({ ...selectedEvent, registeredVisitors: updatedVisitors });
  };

  const handleStatusChange = (id: string, status: OpenHouse['status']) => {
    updateItem(id, { status, updatedAt: new Date().toISOString() });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Open House',
      message: 'Are you sure you want to delete this open house?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const resetForm = () => {
    setForm({
      propertyAddress: '',
      propertyType: 'house',
      listingPrice: 0,
      eventDate: '',
      startTime: '10:00',
      endTime: '12:00',
      hostName: '',
      hostPhone: '',
      hostEmail: '',
      registeredVisitors: [],
      status: 'scheduled',
      refreshments: false,
      signageReady: false,
      followUpSent: false,
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-lg">
                  <CalendarDays className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.openHouseScheduler.openHouseScheduler', 'Open House Scheduler')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.openHouseScheduler.scheduleAndManageOpenHouse', 'Schedule and manage open house events')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="open-house-scheduler" toolName="Open House Scheduler" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.openHouseScheduler.upcoming', 'Upcoming')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.upcoming}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.openHouseScheduler.today', 'Today')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayEvents}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.openHouseScheduler.completed', 'Completed')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.openHouseScheduler.totalVisitors', 'Total Visitors')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalVisitors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.openHouseScheduler.searchEvents', 'Search events...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.openHouseScheduler.allStatus', 'All Status')}</option>
                {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as 'all' | 'upcoming' | 'past')} className={inputClass}>
                <option value="all">{t('tools.openHouseScheduler.allDates', 'All Dates')}</option>
                <option value="upcoming">{t('tools.openHouseScheduler.upcoming2', 'Upcoming')}</option>
                <option value="past">{t('tools.openHouseScheduler.past', 'Past')}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'open-houses' })}
                onExportExcel={() => exportExcel({ filename: 'open-houses' })}
                onExportJSON={() => exportJSON({ filename: 'open-houses' })}
                onExportPDF={async () => { await exportPDF({ filename: 'open-houses', title: 'Open Houses' }); }}
                onPrint={() => print('Open Houses')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={openHouses.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.openHouseScheduler.scheduleOpenHouse', 'Schedule Open House')}
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredOpenHouses.map(event => {
            const statusInfo = EVENT_STATUSES.find(s => s.value === event.status);
            const isToday = event.eventDate === new Date().toISOString().split('T')[0];

            return (
              <div key={event.id} className={`${cardClass} p-4 ${isToday ? 'ring-2 ring-rose-500' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isToday ? 'bg-rose-500/20' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Home className={`w-6 h-6 ${isToday ? 'text-rose-500' : 'text-rose-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.propertyAddress}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
                        {isToday && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500 text-white">{t('tools.openHouseScheduler.today2', 'TODAY')}</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock className="w-4 h-4" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-4 h-4" />
                          {event.hostName}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Users className="w-4 h-4" />
                          {event.registeredVisitors.length} registered
                        </span>
                        <span className="font-medium text-rose-500">
                          ${event.listingPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedEvent(event); setShowVisitorModal(true); }}
                      className={`px-3 py-1.5 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} flex items-center gap-1`}
                    >
                      <Users className="w-4 h-4" />
                      {t('tools.openHouseScheduler.visitors', 'Visitors')}
                    </button>
                    {event.status === 'scheduled' && (
                      <button onClick={() => handleStatusChange(event.id, 'in_progress')} className="px-3 py-1.5 text-sm rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                        {t('tools.openHouseScheduler.start', 'Start')}
                      </button>
                    )}
                    {event.status === 'in_progress' && (
                      <button onClick={() => handleStatusChange(event.id, 'completed')} className="px-3 py-1.5 text-sm rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        {t('tools.openHouseScheduler.complete', 'Complete')}
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingEvent(event); setForm(event); setShowModal(true); }}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOpenHouses.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <CalendarDays className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.openHouseScheduler.noOpenHousesScheduled', 'No open houses scheduled')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.openHouseScheduler.scheduleYourFirstOpenHouse', 'Schedule your first open house event')}</p>
          </div>
        )}

        {/* Event Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingEvent ? t('tools.openHouseScheduler.editOpenHouse', 'Edit Open House') : t('tools.openHouseScheduler.scheduleOpenHouse2', 'Schedule Open House')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingEvent(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.openHouseScheduler.propertyAddress', 'Property Address *')}</label>
                  <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.listingPrice', 'Listing Price ($)')}</label>
                    <input type="number" value={form.listingPrice || ''} onChange={(e) => setForm({ ...form, listingPrice: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.propertyType', 'Property Type')}</label>
                    <select value={form.propertyType || 'house'} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className={inputClass}>
                      <option value="house">{t('tools.openHouseScheduler.house', 'House')}</option>
                      <option value="condo">{t('tools.openHouseScheduler.condo', 'Condo')}</option>
                      <option value="townhouse">{t('tools.openHouseScheduler.townhouse', 'Townhouse')}</option>
                      <option value="apartment">{t('tools.openHouseScheduler.apartment', 'Apartment')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.eventDate', 'Event Date *')}</label>
                    <input type="date" value={form.eventDate || ''} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.startTime', 'Start Time')}</label>
                    <input type="time" value={form.startTime || '10:00'} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.endTime', 'End Time')}</label>
                    <input type="time" value={form.endTime || '12:00'} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.hostName', 'Host Name *')}</label>
                    <input type="text" value={form.hostName || ''} onChange={(e) => setForm({ ...form, hostName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.hostPhone', 'Host Phone')}</label>
                    <input type="tel" value={form.hostPhone || ''} onChange={(e) => setForm({ ...form, hostPhone: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.hostEmail', 'Host Email')}</label>
                    <input type="email" value={form.hostEmail || ''} onChange={(e) => setForm({ ...form, hostEmail: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.maxCapacity', 'Max Capacity')}</label>
                    <input type="number" value={form.maxCapacity || ''} onChange={(e) => setForm({ ...form, maxCapacity: parseInt(e.target.value) || undefined })} min="1" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.openHouseScheduler.virtualTourLink', 'Virtual Tour Link')}</label>
                    <input type="url" value={form.virtualTourLink || ''} onChange={(e) => setForm({ ...form, virtualTourLink: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-6">
                  <label className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input type="checkbox" checked={form.refreshments || false} onChange={(e) => setForm({ ...form, refreshments: e.target.checked })} className="w-4 h-4 text-rose-500" />
                    <span className="text-sm">{t('tools.openHouseScheduler.refreshmentsProvided', 'Refreshments Provided')}</span>
                  </label>
                  <label className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input type="checkbox" checked={form.signageReady || false} onChange={(e) => setForm({ ...form, signageReady: e.target.checked })} className="w-4 h-4 text-rose-500" />
                    <span className="text-sm">{t('tools.openHouseScheduler.signageReady', 'Signage Ready')}</span>
                  </label>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.openHouseScheduler.notes', 'Notes')}</label>
                  <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingEvent(null); resetForm(); }} className={buttonSecondary}>{t('tools.openHouseScheduler.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.propertyAddress || !form.eventDate || !form.hostName} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingEvent ? t('tools.openHouseScheduler.update', 'Update') : t('tools.openHouseScheduler.schedule', 'Schedule')} Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visitor Modal */}
        {showVisitorModal && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.openHouseScheduler.registeredVisitors', 'Registered Visitors')}</h2>
                <button onClick={() => { setShowVisitorModal(false); setSelectedEvent(null); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Add Visitor Form */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.openHouseScheduler.addNewVisitor', 'Add New Visitor')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder={t('tools.openHouseScheduler.name', 'Name *')} value={visitorForm.name || ''} onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })} className={inputClass} />
                    <input type="email" placeholder={t('tools.openHouseScheduler.email', 'Email *')} value={visitorForm.email || ''} onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })} className={inputClass} />
                    <input type="tel" placeholder={t('tools.openHouseScheduler.phone', 'Phone')} value={visitorForm.phone || ''} onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })} className={inputClass} />
                    <select value={visitorForm.interestedLevel || 'medium'} onChange={(e) => setVisitorForm({ ...visitorForm, interestedLevel: e.target.value as Visitor['interestedLevel'] })} className={inputClass}>
                      <option value="high">{t('tools.openHouseScheduler.highInterest', 'High Interest')}</option>
                      <option value="medium">{t('tools.openHouseScheduler.mediumInterest', 'Medium Interest')}</option>
                      <option value="low">{t('tools.openHouseScheduler.lowInterest', 'Low Interest')}</option>
                    </select>
                  </div>
                  <button onClick={handleAddVisitor} disabled={!visitorForm.name || !visitorForm.email} className={`${buttonPrimary} w-full mt-3 justify-center disabled:opacity-50`}>
                    <Plus className="w-4 h-4" />
                    {t('tools.openHouseScheduler.addVisitor', 'Add Visitor')}
                  </button>
                </div>

                {/* Visitor List */}
                <div className="space-y-2">
                  {selectedEvent.registeredVisitors.map(visitor => (
                    <div key={visitor.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitor.name}</p>
                        <div className={`flex gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{visitor.email}</span>
                          {visitor.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{visitor.phone}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          visitor.interestedLevel === 'high' ? 'bg-green-500/10 text-green-500' :
                          visitor.interestedLevel === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {visitor.interestedLevel}
                        </span>
                        <button onClick={() => handleRemoveVisitor(visitor.id)} className="p-1.5 rounded hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedEvent.registeredVisitors.length === 0 && (
                    <p className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.openHouseScheduler.noVisitorsRegisteredYet', 'No visitors registered yet')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default OpenHouseSchedulerTool;
