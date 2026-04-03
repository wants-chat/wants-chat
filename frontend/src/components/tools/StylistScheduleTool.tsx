'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Briefcase,
  Users,
  AlertCircle,
  RefreshCw,
  Star,
  Settings,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StylistScheduleToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Stylist {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  bio: string;
  isActive: boolean;
  hireDate: string;
  createdAt: string;
}

interface WorkSchedule {
  id: string;
  stylistId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TimeOff {
  id: string;
  stylistId: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'training' | 'other';
  reason: string;
  approved: boolean;
  createdAt: string;
}

interface BreakTime {
  id: string;
  stylistId: string;
  dayOfWeek: number;
  startTime: string;
  duration: number; // in minutes
  type: 'lunch' | 'break';
}

// Constants
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

const SPECIALTIES = [
  'Haircuts', 'Hair Coloring', 'Highlights', 'Balayage', 'Perms',
  'Hair Extensions', 'Nails', 'Manicure', 'Pedicure', 'Facials',
  'Makeup', 'Skincare', 'Waxing', 'Massage', 'Bridal',
];

// Column configurations
const STYLIST_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'specialties', header: 'Specialties', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'reviewCount', header: 'Reviews', type: 'number' },
  { key: 'isActive', header: 'Active', type: 'string' },
  { key: 'hireDate', header: 'Hire Date', type: 'date' },
];

const TIMEOFF_COLUMNS: ColumnConfig[] = [
  { key: 'stylistName', header: 'Stylist', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'reason', header: 'Reason', type: 'string' },
  { key: 'approved', header: 'Approved', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Sample data
const sampleStylists: Stylist[] = [
  {
    id: 'stylist-1',
    name: 'Sarah Johnson',
    email: 'sarah@salon.com',
    phone: '(555) 123-4567',
    avatar: 'SJ',
    specialties: ['Hair Coloring', 'Highlights', 'Balayage'],
    rating: 4.9,
    reviewCount: 156,
    bio: 'Master colorist with 10+ years experience',
    isActive: true,
    hireDate: '2019-03-15',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'stylist-2',
    name: 'Mike Chen',
    email: 'mike@salon.com',
    phone: '(555) 234-5678',
    avatar: 'MC',
    specialties: ['Haircuts', 'Fades', 'Beard Trimming'],
    rating: 4.8,
    reviewCount: 203,
    bio: 'Precision cutting specialist',
    isActive: true,
    hireDate: '2020-06-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'stylist-3',
    name: 'Emma Davis',
    email: 'emma@salon.com',
    phone: '(555) 345-6789',
    avatar: 'ED',
    specialties: ['Nails', 'Manicure', 'Pedicure'],
    rating: 4.7,
    reviewCount: 89,
    bio: 'Nail artist and spa specialist',
    isActive: true,
    hireDate: '2021-01-10',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'stylist-4',
    name: 'Lisa Park',
    email: 'lisa@salon.com',
    phone: '(555) 456-7890',
    avatar: 'LP',
    specialties: ['Skincare', 'Facials', 'Makeup'],
    rating: 4.9,
    reviewCount: 127,
    bio: 'Licensed esthetician and makeup artist',
    isActive: true,
    hireDate: '2020-09-20',
    createdAt: new Date().toISOString(),
  },
];

const sampleSchedules: WorkSchedule[] = [
  // Sarah Johnson - Mon-Fri
  { id: generateId(), stylistId: 'stylist-1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-1', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-1', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-1', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-1', dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isAvailable: true },
  // Mike Chen - Mon-Sat
  { id: generateId(), stylistId: 'stylist-2', dayOfWeek: 1, startTime: '10:00', endTime: '19:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-2', dayOfWeek: 2, startTime: '10:00', endTime: '19:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-2', dayOfWeek: 3, startTime: '10:00', endTime: '19:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-2', dayOfWeek: 4, startTime: '10:00', endTime: '19:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-2', dayOfWeek: 5, startTime: '10:00', endTime: '19:00', isAvailable: true },
  { id: generateId(), stylistId: 'stylist-2', dayOfWeek: 6, startTime: '10:00', endTime: '17:00', isAvailable: true },
];

const sampleTimeOffs: TimeOff[] = [
  {
    id: generateId(),
    stylistId: 'stylist-1',
    startDate: '2024-12-23',
    endDate: '2024-12-26',
    type: 'vacation',
    reason: 'Holiday vacation',
    approved: true,
    createdAt: new Date().toISOString(),
  },
];

// Main Component
export const StylistScheduleTool: React.FC<StylistScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: stylists,
    addItem: addStylist,
    updateItem: updateStylist,
    deleteItem: deleteStylist,
    isSynced: stylistsSynced,
    isSaving: stylistsSaving,
    lastSaved: stylistsLastSaved,
    syncError: stylistsSyncError,
    forceSync: forceStylistsSync,
  } = useToolData<Stylist>('salon-stylists', sampleStylists, STYLIST_COLUMNS);

  const {
    data: schedules,
    addItem: addSchedule,
    updateItem: updateSchedule,
    deleteItem: deleteSchedule,
  } = useToolData<WorkSchedule>('salon-schedules', sampleSchedules, []);

  const {
    data: timeOffs,
    addItem: addTimeOff,
    updateItem: updateTimeOff,
    deleteItem: deleteTimeOff,
  } = useToolData<TimeOff>('salon-timeoffs', sampleTimeOffs, TIMEOFF_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'team' | 'schedule' | 'timeoff'>('team');
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [showStylistForm, setShowStylistForm] = useState(false);
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOff | null>(null);

  // Stylist form state
  const [stylistForm, setStylistForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    bio: '',
  });

  // Time off form state
  const [timeOffForm, setTimeOffForm] = useState({
    stylistId: '',
    startDate: '',
    endDate: '',
    type: 'vacation' as TimeOff['type'],
    reason: '',
  });

  // Get stylist's schedule
  const getStylistSchedule = (stylistId: string) => {
    return schedules.filter(s => s.stylistId === stylistId);
  };

  // Get stylist's time off
  const getStylistTimeOffs = (stylistId: string) => {
    return timeOffs.filter(t => t.stylistId === stylistId);
  };

  // Handle stylist form submission
  const handleStylistSubmit = () => {
    const now = new Date().toISOString();
    const stylistData: Stylist = {
      id: editingStylist?.id || generateId(),
      name: stylistForm.name,
      email: stylistForm.email,
      phone: stylistForm.phone,
      avatar: stylistForm.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      specialties: stylistForm.specialties,
      rating: editingStylist?.rating || 5.0,
      reviewCount: editingStylist?.reviewCount || 0,
      bio: stylistForm.bio,
      isActive: true,
      hireDate: editingStylist?.hireDate || now.split('T')[0],
      createdAt: editingStylist?.createdAt || now,
    };

    if (editingStylist) {
      updateStylist(stylistData);
    } else {
      addStylist(stylistData);
      // Create default schedule for new stylist
      [1, 2, 3, 4, 5].forEach(day => {
        addSchedule({
          id: generateId(),
          stylistId: stylistData.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        });
      });
    }

    resetStylistForm();
  };

  const resetStylistForm = () => {
    setStylistForm({ name: '', email: '', phone: '', specialties: [], bio: '' });
    setShowStylistForm(false);
    setEditingStylist(null);
  };

  const handleEditStylist = (stylist: Stylist) => {
    setStylistForm({
      name: stylist.name,
      email: stylist.email,
      phone: stylist.phone,
      specialties: stylist.specialties,
      bio: stylist.bio,
    });
    setEditingStylist(stylist);
    setShowStylistForm(true);
  };

  // Handle time off form submission
  const handleTimeOffSubmit = () => {
    const timeOffData: TimeOff = {
      id: editingTimeOff?.id || generateId(),
      stylistId: timeOffForm.stylistId,
      startDate: timeOffForm.startDate,
      endDate: timeOffForm.endDate,
      type: timeOffForm.type,
      reason: timeOffForm.reason,
      approved: false,
      createdAt: editingTimeOff?.createdAt || new Date().toISOString(),
    };

    if (editingTimeOff) {
      updateTimeOff(timeOffData);
    } else {
      addTimeOff(timeOffData);
    }

    resetTimeOffForm();
  };

  const resetTimeOffForm = () => {
    setTimeOffForm({ stylistId: '', startDate: '', endDate: '', type: 'vacation', reason: '' });
    setShowTimeOffForm(false);
    setEditingTimeOff(null);
  };

  // Update schedule
  const handleScheduleUpdate = (schedule: WorkSchedule, updates: Partial<WorkSchedule>) => {
    updateSchedule({ ...schedule, ...updates });
  };

  const toggleScheduleDay = (stylistId: string, dayOfWeek: number) => {
    const existing = schedules.find(s => s.stylistId === stylistId && s.dayOfWeek === dayOfWeek);
    if (existing) {
      updateSchedule({ ...existing, isAvailable: !existing.isAvailable });
    } else {
      addSchedule({
        id: generateId(),
        stylistId,
        dayOfWeek,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      });
    }
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = stylists.map(s => ({
      ...s,
      specialties: s.specialties.join(', '),
      isActive: s.isActive ? 'Yes' : 'No',
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, STYLIST_COLUMNS, 'stylist-schedule');
        break;
      case 'excel':
        exportToExcel(exportData, STYLIST_COLUMNS, 'stylist-schedule');
        break;
      case 'json':
        exportToJSON(exportData, 'stylist-schedule');
        break;
      case 'pdf':
        exportToPDF(exportData, STYLIST_COLUMNS, 'Stylist Schedule');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              {t('tools.stylistSchedule.stylistSchedule', 'Stylist Schedule')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.stylistSchedule.manageTeamSchedulesAndTime', 'Manage team schedules and time off')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="stylist-schedule" toolName="Stylist Schedule" />

            <SyncStatus
              isSynced={stylistsSynced}
              isSaving={stylistsSaving}
              lastSaved={stylistsLastSaved}
              error={stylistsSyncError}
              onRetry={forceStylistsSync}
            />
            <ExportDropdown onExport={handleExport} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'team', label: 'Team', icon: Users },
            { id: 'schedule', label: 'Work Schedule', icon: Calendar },
            { id: 'timeoff', label: 'Time Off', icon: Coffee },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowStylistForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.stylistSchedule.addStylist', 'Add Stylist')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stylists.map(stylist => (
                <Card key={stylist.id} className={!stylist.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                        {stylist.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white">{stylist.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">{stylist.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stylist.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stylist.phone}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {stylist.specialties.slice(0, 3).map(specialty => (
                            <span
                              key={specialty}
                              className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded"
                            >
                              {specialty}
                            </span>
                          ))}
                          {stylist.specialties.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500">
                              +{stylist.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{stylist.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                      <span className="text-xs text-gray-500">
                        {stylist.reviewCount} reviews
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditStylist(stylist)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedStylist(stylist)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStylist(stylist.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.stylistSchedule.weeklySchedule', 'Weekly Schedule')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left p-3 text-gray-600 dark:text-gray-400">{t('tools.stylistSchedule.stylist', 'Stylist')}</th>
                      {DAYS_OF_WEEK.map(day => (
                        <th key={day} className="text-center p-3 text-gray-600 dark:text-gray-400 text-sm">
                          {day.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stylists.filter(s => s.isActive).map(stylist => {
                      const schedule = getStylistSchedule(stylist.id);
                      return (
                        <tr key={stylist.id} className="border-b dark:border-gray-700">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-sm font-bold">
                                {stylist.avatar}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{stylist.name}</span>
                            </div>
                          </td>
                          {DAYS_OF_WEEK.map((_, dayIndex) => {
                            const daySchedule = schedule.find(s => s.dayOfWeek === dayIndex);
                            const isAvailable = daySchedule?.isAvailable;
                            return (
                              <td key={dayIndex} className="p-3 text-center">
                                <button
                                  onClick={() => toggleScheduleDay(stylist.id, dayIndex)}
                                  className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                                    isAvailable
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                  }`}
                                >
                                  {isAvailable ? (
                                    <span>
                                      {formatTime(daySchedule.startTime).replace(' ', '')}-{formatTime(daySchedule.endTime).replace(' ', '')}
                                    </span>
                                  ) : (
                                    'Off'
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Off Tab */}
        {activeTab === 'timeoff' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowTimeOffForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.stylistSchedule.requestTimeOff2', 'Request Time Off')}
              </button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('tools.stylistSchedule.timeOffRequests', 'Time Off Requests')}</CardTitle>
              </CardHeader>
              <CardContent>
                {timeOffs.length === 0 ? (
                  <div className="text-center py-12">
                    <Coffee className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">{t('tools.stylistSchedule.noTimeOffRequests', 'No time off requests')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeOffs.map(timeOff => {
                      const stylist = stylists.find(s => s.id === timeOff.stylistId);
                      return (
                        <div
                          key={timeOff.id}
                          className="p-4 border rounded-lg dark:border-gray-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                              {stylist?.avatar || '?'}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {stylist?.name || 'Unknown'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {formatDate(timeOff.startDate)} - {formatDate(timeOff.endDate)}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">{timeOff.type}: {timeOff.reason}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                timeOff.approved
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                            >
                              {timeOff.approved ? t('tools.stylistSchedule.approved', 'Approved') : t('tools.stylistSchedule.pending', 'Pending')}
                            </span>
                            {!timeOff.approved && (
                              <button
                                onClick={() => updateTimeOff({ ...timeOff, approved: true })}
                                className="p-1.5 text-gray-500 hover:text-green-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteTimeOff(timeOff.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stylist Form Modal */}
        {showStylistForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingStylist ? t('tools.stylistSchedule.editStylist', 'Edit Stylist') : t('tools.stylistSchedule.addStylist2', 'Add Stylist')}</span>
                  <button onClick={resetStylistForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.stylistSchedule.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={stylistForm.name}
                    onChange={(e) => setStylistForm({ ...stylistForm, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('tools.stylistSchedule.fullName', 'Full name')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.stylistSchedule.email', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={stylistForm.email}
                      onChange={(e) => setStylistForm({ ...stylistForm, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('tools.stylistSchedule.emailExampleCom', 'email@example.com')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.stylistSchedule.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={stylistForm.phone}
                      onChange={(e) => setStylistForm({ ...stylistForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.stylistSchedule.specialties', 'Specialties')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(specialty => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => {
                          if (stylistForm.specialties.includes(specialty)) {
                            setStylistForm({
                              ...stylistForm,
                              specialties: stylistForm.specialties.filter(s => s !== specialty),
                            });
                          } else {
                            setStylistForm({
                              ...stylistForm,
                              specialties: [...stylistForm.specialties, specialty],
                            });
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          stylistForm.specialties.includes(specialty)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.stylistSchedule.bio', 'Bio')}
                  </label>
                  <textarea
                    value={stylistForm.bio}
                    onChange={(e) => setStylistForm({ ...stylistForm, bio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder={t('tools.stylistSchedule.briefDescription', 'Brief description...')}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetStylistForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.stylistSchedule.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleStylistSubmit}
                    disabled={!stylistForm.name || !stylistForm.email}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {editingStylist ? t('tools.stylistSchedule.updateStylist', 'Update Stylist') : t('tools.stylistSchedule.addStylist3', 'Add Stylist')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Time Off Form Modal */}
        {showTimeOffForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('tools.stylistSchedule.requestTimeOff', 'Request Time Off')}</span>
                  <button onClick={resetTimeOffForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.stylistSchedule.stylist2', 'Stylist *')}
                  </label>
                  <select
                    value={timeOffForm.stylistId}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, stylistId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('tools.stylistSchedule.selectStylist', 'Select stylist')}</option>
                    {stylists.filter(s => s.isActive).map(stylist => (
                      <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.stylistSchedule.startDate', 'Start Date *')}
                    </label>
                    <input
                      type="date"
                      value={timeOffForm.startDate}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.stylistSchedule.endDate', 'End Date *')}
                    </label>
                    <input
                      type="date"
                      value={timeOffForm.endDate}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.stylistSchedule.type', 'Type')}
                  </label>
                  <select
                    value={timeOffForm.type}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, type: e.target.value as TimeOff['type'] })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="vacation">{t('tools.stylistSchedule.vacation', 'Vacation')}</option>
                    <option value="sick">{t('tools.stylistSchedule.sickLeave', 'Sick Leave')}</option>
                    <option value="personal">{t('tools.stylistSchedule.personal', 'Personal')}</option>
                    <option value="training">{t('tools.stylistSchedule.training', 'Training')}</option>
                    <option value="other">{t('tools.stylistSchedule.other', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.stylistSchedule.reason', 'Reason')}
                  </label>
                  <textarea
                    value={timeOffForm.reason}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder={t('tools.stylistSchedule.optionalReason', 'Optional reason...')}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetTimeOffForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.stylistSchedule.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleTimeOffSubmit}
                    disabled={!timeOffForm.stylistId || !timeOffForm.startDate || !timeOffForm.endDate}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {t('tools.stylistSchedule.submitRequest', 'Submit Request')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StylistScheduleTool;
