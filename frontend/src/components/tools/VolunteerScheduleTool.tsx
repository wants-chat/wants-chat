'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  UserCheck,
  UserX,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface VolunteerScheduleToolProps {
  uiConfig?: UIConfig;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  availability: string[];
  skills: string[];
  notes: string;
  isActive: boolean;
  preferredService: string;
  blackoutDates: string[];
  createdAt: string;
}

interface Schedule {
  id: string;
  date: string;
  service: string;
  position: string;
  volunteerId: string;
  volunteerName: string;
  status: 'scheduled' | 'confirmed' | 'declined' | 'no-show' | 'completed';
  reminderSent: boolean;
  notes: string;
  createdAt: string;
}

interface Position {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredCount: number;
  isActive: boolean;
  createdAt: string;
}

type TabType = 'schedule' | 'volunteers' | 'positions' | 'availability';

const scheduleColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'service', header: 'Service', type: 'string' },
  { key: 'position', header: 'Position', type: 'string' },
  { key: 'volunteerName', header: 'Volunteer', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const defaultVolunteers: Volunteer[] = [];
const defaultSchedules: Schedule[] = [];
const defaultPositions: Position[] = [];

export const VolunteerScheduleTool: React.FC<VolunteerScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const volunteersToolData = useToolData<Volunteer>('church-volunteers', defaultVolunteers, []);
  const schedulesToolData = useToolData<Schedule>('volunteer-schedules', defaultSchedules, scheduleColumns);
  const positionsToolData = useToolData<Position>('volunteer-positions', defaultPositions, []);

  const volunteers = volunteersToolData.data;
  const schedules = schedulesToolData.data;
  const positions = positionsToolData.data;

  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState('all');

  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const [volunteerForm, setVolunteerForm] = useState<Partial<Volunteer>>({
    name: '',
    email: '',
    phone: '',
    roles: [],
    availability: [],
    skills: [],
    notes: '',
    isActive: true,
    preferredService: '',
    blackoutDates: [],
  });

  const [scheduleForm, setScheduleForm] = useState<Partial<Schedule>>({
    date: new Date().toISOString().split('T')[0],
    service: 'sunday-morning',
    position: '',
    volunteerId: '',
    volunteerName: '',
    status: 'scheduled',
    reminderSent: false,
    notes: '',
  });

  const [positionForm, setPositionForm] = useState<Partial<Position>>({
    name: '',
    description: '',
    category: 'general',
    requiredCount: 1,
    isActive: true,
  });

  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.name || params.email) {
        setVolunteerForm(prev => ({
          ...prev,
          name: params.name || prev.name,
          email: params.email || prev.email,
          phone: params.phone || prev.phone,
        }));
        setShowVolunteerModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchesDate = s.date === selectedDate;
      const matchesService = selectedService === 'all' || s.service === selectedService;
      const matchesSearch = searchQuery === '' ||
        s.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.position.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesService && matchesSearch;
    });
  }, [schedules, selectedDate, selectedService, searchQuery]);

  const stats = useMemo(() => {
    const activeVolunteers = volunteers.filter(v => v.isActive).length;
    const todaySchedules = schedules.filter(s => s.date === new Date().toISOString().split('T')[0]);
    const confirmed = todaySchedules.filter(s => s.status === 'confirmed').length;
    const pending = todaySchedules.filter(s => s.status === 'scheduled').length;
    const declined = todaySchedules.filter(s => s.status === 'declined').length;

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekSchedules = schedules.filter(s => new Date(s.date) >= thisWeekStart).length;

    return {
      activeVolunteers,
      todayTotal: todaySchedules.length,
      confirmed,
      pending,
      declined,
      thisWeekSchedules,
      totalPositions: positions.filter(p => p.isActive).length,
    };
  }, [volunteers, schedules, positions]);

  const handleSaveVolunteer = () => {
    if (!volunteerForm.name) return;

    if (editingVolunteer) {
      volunteersToolData.updateItem(editingVolunteer.id, volunteerForm);
    } else {
      const newVolunteer: Volunteer = {
        id: `vol-${Date.now()}`,
        name: volunteerForm.name || '',
        email: volunteerForm.email || '',
        phone: volunteerForm.phone || '',
        roles: volunteerForm.roles || [],
        availability: volunteerForm.availability || [],
        skills: volunteerForm.skills || [],
        notes: volunteerForm.notes || '',
        isActive: volunteerForm.isActive !== false,
        preferredService: volunteerForm.preferredService || '',
        blackoutDates: volunteerForm.blackoutDates || [],
        createdAt: new Date().toISOString(),
      };
      volunteersToolData.addItem(newVolunteer);
    }

    resetVolunteerForm();
    setShowVolunteerModal(false);
    setEditingVolunteer(null);
  };

  const handleDeleteVolunteer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Volunteer',
      message: 'Are you sure you want to delete this volunteer?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      volunteersToolData.deleteItem(id);
    }
  };

  const handleSaveSchedule = () => {
    if (!scheduleForm.position || !scheduleForm.volunteerId) return;

    const volunteer = volunteers.find(v => v.id === scheduleForm.volunteerId);

    if (editingSchedule) {
      schedulesToolData.updateItem(editingSchedule.id, {
        ...scheduleForm,
        volunteerName: volunteer?.name || scheduleForm.volunteerName,
      });
    } else {
      const newSchedule: Schedule = {
        id: `sched-${Date.now()}`,
        date: scheduleForm.date || new Date().toISOString().split('T')[0],
        service: scheduleForm.service || 'sunday-morning',
        position: scheduleForm.position || '',
        volunteerId: scheduleForm.volunteerId || '',
        volunteerName: volunteer?.name || '',
        status: 'scheduled',
        reminderSent: false,
        notes: scheduleForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      schedulesToolData.addItem(newSchedule);
    }

    resetScheduleForm();
    setShowScheduleModal(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Schedule Entry',
      message: 'Are you sure you want to delete this schedule entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      schedulesToolData.deleteItem(id);
    }
  };

  const handleUpdateStatus = (schedule: Schedule, status: Schedule['status']) => {
    schedulesToolData.updateItem(schedule.id, { status });
  };

  const handleSavePosition = () => {
    if (!positionForm.name) return;

    if (editingPosition) {
      positionsToolData.updateItem(editingPosition.id, positionForm);
    } else {
      const newPosition: Position = {
        id: `pos-${Date.now()}`,
        name: positionForm.name || '',
        description: positionForm.description || '',
        category: positionForm.category || 'general',
        requiredCount: positionForm.requiredCount || 1,
        isActive: positionForm.isActive !== false,
        createdAt: new Date().toISOString(),
      };
      positionsToolData.addItem(newPosition);
    }

    resetPositionForm();
    setShowPositionModal(false);
    setEditingPosition(null);
  };

  const handleDeletePosition = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Position',
      message: 'Are you sure you want to delete this position?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      positionsToolData.deleteItem(id);
    }
  };

  const handleAddRole = () => {
    if (!newRole || volunteerForm.roles?.includes(newRole)) return;
    setVolunteerForm({
      ...volunteerForm,
      roles: [...(volunteerForm.roles || []), newRole],
    });
    setNewRole('');
  };

  const handleRemoveRole = (role: string) => {
    setVolunteerForm({
      ...volunteerForm,
      roles: (volunteerForm.roles || []).filter(r => r !== role),
    });
  };

  const resetVolunteerForm = () => {
    setVolunteerForm({
      name: '',
      email: '',
      phone: '',
      roles: [],
      availability: [],
      skills: [],
      notes: '',
      isActive: true,
      preferredService: '',
      blackoutDates: [],
    });
    setNewRole('');
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      date: new Date().toISOString().split('T')[0],
      service: 'sunday-morning',
      position: '',
      volunteerId: '',
      volunteerName: '',
      status: 'scheduled',
      reminderSent: false,
      notes: '',
    });
  };

  const resetPositionForm = () => {
    setPositionForm({
      name: '',
      description: '',
      category: 'general',
      requiredCount: 1,
      isActive: true,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: Schedule['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'positions', label: 'Positions', icon: UserCheck },
  ];

  const services = [
    { value: 'sunday-morning', label: 'Sunday Morning' },
    { value: 'sunday-evening', label: 'Sunday Evening' },
    { value: 'wednesday', label: 'Wednesday Service' },
    { value: 'youth', label: 'Youth Service' },
    { value: 'special-event', label: 'Special Event' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.volunteerSchedule.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.volunteerSchedule.volunteerScheduler', 'Volunteer Scheduler')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.volunteerSchedule.scheduleAndManageVolunteersFor', 'Schedule and manage volunteers for church services and events')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="volunteer-schedule" toolName="Volunteer Schedule" />

              <SyncStatus
                isSynced={schedulesToolData.isSynced}
                isSaving={schedulesToolData.isSaving}
                lastSaved={schedulesToolData.lastSaved}
                syncError={schedulesToolData.syncError}
                onForceSync={schedulesToolData.forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(schedules, scheduleColumns, { filename: 'volunteer-schedule' })}
                onExportExcel={() => exportToExcel(schedules, scheduleColumns, { filename: 'volunteer-schedule' })}
                onExportJSON={() => exportToJSON(schedules, { filename: 'volunteer-schedule' })}
                onExportPDF={async () => {
                  await exportToPDF(schedules, scheduleColumns, {
                    filename: 'volunteer-schedule',
                    title: 'Volunteer Schedule',
                    subtitle: `${schedules.length} scheduled slots`,
                  });
                }}
                onPrint={() => printData(schedules, scheduleColumns, { title: 'Volunteer Schedule' })}
                onCopyToClipboard={async () => await copyUtil(schedules, scheduleColumns, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerSchedule.activeVolunteers', 'Active Volunteers')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeVolunteers}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerSchedule.todaySConfirmed', 'Today\'s Confirmed')}</p>
              <p className={`text-xl font-bold text-green-600`}>{stats.confirmed}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerSchedule.pendingResponse', 'Pending Response')}</p>
              <p className={`text-xl font-bold text-yellow-600`}>{stats.pending}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerSchedule.thisWeek', 'This Week')}</p>
              <p className={`text-xl font-bold text-blue-600`}>{stats.thisWeekSchedules}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">{t('tools.volunteerSchedule.allServices', 'All Services')}</option>
                  {services.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => { resetScheduleForm(); setEditingSchedule(null); setShowScheduleModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.volunteerSchedule.scheduleVolunteer', 'Schedule Volunteer')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.position', 'Position')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.volunteer', 'Volunteer')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.service', 'Service')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.status', 'Status')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {schedule.position}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {schedule.volunteerName}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {services.find(s => s.value === schedule.service)?.label || schedule.service}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {schedule.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(schedule, 'confirmed')}
                                className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900"
                                title={t('tools.volunteerSchedule.markConfirmed', 'Mark Confirmed')}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(schedule, 'declined')}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                                title={t('tools.volunteerSchedule.markDeclined', 'Mark Declined')}
                              >
                                <UserX className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setScheduleForm(schedule); setEditingSchedule(schedule); setShowScheduleModal(true); }}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSchedules.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.volunteerSchedule.noVolunteersScheduledForThis', 'No volunteers scheduled for this date')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.volunteerSchedule.searchVolunteers', 'Search volunteers...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <button
                onClick={() => { resetVolunteerForm(); setEditingVolunteer(null); setShowVolunteerModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.volunteerSchedule.addVolunteer', 'Add Volunteer')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteers
                .filter(v => searchQuery === '' || v.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((volunteer) => (
                <div key={volunteer.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${volunteer.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <Users className={`w-5 h-5 ${volunteer.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {volunteer.name}
                        </h3>
                        <span className={`text-xs ${volunteer.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {volunteer.isActive ? t('tools.volunteerSchedule.active', 'Active') : t('tools.volunteerSchedule.inactive', 'Inactive')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setVolunteerForm(volunteer); setEditingVolunteer(volunteer); setShowVolunteerModal(true); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteVolunteer(volunteer.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                    {volunteer.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {volunteer.email}
                      </div>
                    )}
                    {volunteer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {volunteer.phone}
                      </div>
                    )}
                  </div>
                  {volunteer.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {volunteer.roles.map(role => (
                        <span key={role} className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {volunteers.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.volunteerSchedule.noVolunteersAddedYet', 'No volunteers added yet')}
              </div>
            )}
          </div>
        )}

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Volunteer Positions ({positions.length})
              </h2>
              <button
                onClick={() => { resetPositionForm(); setEditingPosition(null); setShowPositionModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.volunteerSchedule.addPosition', 'Add Position')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((position) => (
                <div key={position.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {position.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                        {position.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setPositionForm(position); setEditingPosition(position); setShowPositionModal(true); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeletePosition(position.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {position.description || 'No description'}
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Required: {position.requiredCount} volunteer(s)
                  </p>
                </div>
              ))}
            </div>
            {positions.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.volunteerSchedule.noPositionsDefinedYet', 'No positions defined yet')}
              </div>
            )}
          </div>
        )}

        {/* Volunteer Modal */}
        {showVolunteerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingVolunteer ? t('tools.volunteerSchedule.editVolunteer', 'Edit Volunteer') : t('tools.volunteerSchedule.addVolunteer2', 'Add Volunteer')}
                </h3>
                <button onClick={() => { setShowVolunteerModal(false); setEditingVolunteer(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={volunteerForm.name || ''}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.email', 'Email')}</label>
                    <input
                      type="email"
                      value={volunteerForm.email || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={volunteerForm.phone || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.preferredService', 'Preferred Service')}</label>
                  <select
                    value={volunteerForm.preferredService || ''}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, preferredService: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.volunteerSchedule.noPreference', 'No preference')}</option>
                    {services.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.roles', 'Roles')}</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(volunteerForm.roles || []).map(role => (
                      <span key={role} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                        {role}
                        <button onClick={() => handleRemoveRole(role)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.volunteerSchedule.selectARole', 'Select a role...')}</option>
                      {positions.filter(p => p.isActive).map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddRole}
                      className="px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.notes', 'Notes')}</label>
                  <textarea
                    value={volunteerForm.notes || ''}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="volActive"
                    checked={volunteerForm.isActive !== false}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, isActive: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="volActive" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.volunteerSchedule.activeVolunteer', 'Active Volunteer')}
                  </label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowVolunteerModal(false); setEditingVolunteer(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.volunteerSchedule.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveVolunteer}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingVolunteer ? t('tools.volunteerSchedule.saveChanges', 'Save Changes') : t('tools.volunteerSchedule.addVolunteer3', 'Add Volunteer')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingSchedule ? t('tools.volunteerSchedule.editSchedule', 'Edit Schedule') : t('tools.volunteerSchedule.scheduleVolunteer2', 'Schedule Volunteer')}
                </h3>
                <button onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.date', 'Date *')}</label>
                    <input
                      type="date"
                      value={scheduleForm.date || ''}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.service2', 'Service *')}</label>
                    <select
                      value={scheduleForm.service || 'sunday-morning'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, service: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {services.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.position2', 'Position *')}</label>
                  <select
                    value={scheduleForm.position || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, position: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.volunteerSchedule.selectPosition', 'Select position...')}</option>
                    {positions.filter(p => p.isActive).map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.volunteer2', 'Volunteer *')}</label>
                  <select
                    value={scheduleForm.volunteerId || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, volunteerId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.volunteerSchedule.selectVolunteer', 'Select volunteer...')}</option>
                    {volunteers.filter(v => v.isActive).map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                {editingSchedule && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.status2', 'Status')}</label>
                    <select
                      value={scheduleForm.status || 'scheduled'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value as Schedule['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="scheduled">{t('tools.volunteerSchedule.scheduled', 'Scheduled')}</option>
                      <option value="confirmed">{t('tools.volunteerSchedule.confirmed', 'Confirmed')}</option>
                      <option value="declined">{t('tools.volunteerSchedule.declined', 'Declined')}</option>
                      <option value="no-show">{t('tools.volunteerSchedule.noShow', 'No Show')}</option>
                      <option value="completed">{t('tools.volunteerSchedule.completed', 'Completed')}</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.notes2', 'Notes')}</label>
                  <textarea
                    value={scheduleForm.notes || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.volunteerSchedule.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingSchedule ? t('tools.volunteerSchedule.saveChanges2', 'Save Changes') : t('tools.volunteerSchedule.schedule', 'Schedule')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Position Modal */}
        {showPositionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingPosition ? t('tools.volunteerSchedule.editPosition', 'Edit Position') : t('tools.volunteerSchedule.addPosition2', 'Add Position')}
                </h3>
                <button onClick={() => { setShowPositionModal(false); setEditingPosition(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.positionName', 'Position Name *')}</label>
                  <input
                    type="text"
                    value={positionForm.name || ''}
                    onChange={(e) => setPositionForm({ ...positionForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.volunteerSchedule.eGGreeterUsherSound', 'e.g., Greeter, Usher, Sound Tech')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.description', 'Description')}</label>
                  <textarea
                    value={positionForm.description || ''}
                    onChange={(e) => setPositionForm({ ...positionForm, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.category', 'Category')}</label>
                    <select
                      value={positionForm.category || 'general'}
                      onChange={(e) => setPositionForm({ ...positionForm, category: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="general">{t('tools.volunteerSchedule.general', 'General')}</option>
                      <option value="worship">{t('tools.volunteerSchedule.worship', 'Worship')}</option>
                      <option value="tech">{t('tools.volunteerSchedule.techAv', 'Tech/AV')}</option>
                      <option value="hospitality">{t('tools.volunteerSchedule.hospitality', 'Hospitality')}</option>
                      <option value="children">{t('tools.volunteerSchedule.childrenSMinistry', 'Children\'s Ministry')}</option>
                      <option value="youth">{t('tools.volunteerSchedule.youthMinistry', 'Youth Ministry')}</option>
                      <option value="security">{t('tools.volunteerSchedule.security', 'Security')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.volunteerSchedule.required', 'Required #')}</label>
                    <input
                      type="number"
                      min="1"
                      value={positionForm.requiredCount || 1}
                      onChange={(e) => setPositionForm({ ...positionForm, requiredCount: parseInt(e.target.value) || 1 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="posActive"
                    checked={positionForm.isActive !== false}
                    onChange={(e) => setPositionForm({ ...positionForm, isActive: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="posActive" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.volunteerSchedule.activePosition', 'Active Position')}
                  </label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowPositionModal(false); setEditingPosition(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.volunteerSchedule.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleSavePosition}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingPosition ? t('tools.volunteerSchedule.saveChanges3', 'Save Changes') : t('tools.volunteerSchedule.addPosition3', 'Add Position')}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default VolunteerScheduleTool;
