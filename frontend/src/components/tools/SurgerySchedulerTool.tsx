'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scissors,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Clock,
  Building2,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Heart,
  Syringe,
  ClipboardList,
  Filter,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface StaffAssignment {
  id: string;
  name: string;
  role: 'surgeon' | 'anesthesiologist' | 'nurse' | 'surgical_tech' | 'circulator';
}

interface Equipment {
  id: string;
  name: string;
  quantity: number;
  notes: string;
}

interface Surgery {
  id: string;
  patientId: string;
  patientName: string;
  patientDOB: string;
  patientPhone: string;
  patientMRN: string;
  procedureType: string;
  procedureCode: string;
  diagnosis: string;
  primarySurgeon: string;
  assistingSurgeons: string[];
  orRoom: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number; // in minutes
  actualStartTime: string;
  actualEndTime: string;
  preOpRequirements: string[];
  anesthesiaType: 'general' | 'regional' | 'local' | 'sedation' | 'spinal' | 'epidural';
  anesthesiologist: string;
  equipmentNeeds: Equipment[];
  staffAssignments: StaffAssignment[];
  status: 'scheduled' | 'pre-op' | 'in-progress' | 'post-op' | 'completed' | 'cancelled' | 'postponed';
  priority: 'elective' | 'urgent' | 'emergency';
  specialInstructions: string;
  consentSigned: boolean;
  preOpChecklistComplete: boolean;
  postOpNotes: string;
  complications: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface SurgerySchedulerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'surgery-scheduler';

const surgeryColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'procedureType', header: 'Procedure', type: 'string' },
  { key: 'primarySurgeon', header: 'Surgeon', type: 'string' },
  { key: 'orRoom', header: 'OR Room', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
];

const createNewSurgery = (): Surgery => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  patientDOB: '',
  patientPhone: '',
  patientMRN: '',
  procedureType: '',
  procedureCode: '',
  diagnosis: '',
  primarySurgeon: '',
  assistingSurgeons: [],
  orRoom: '',
  scheduledDate: new Date().toISOString().split('T')[0],
  scheduledTime: '08:00',
  estimatedDuration: 60,
  actualStartTime: '',
  actualEndTime: '',
  preOpRequirements: [],
  anesthesiaType: 'general',
  anesthesiologist: '',
  equipmentNeeds: [],
  staffAssignments: [],
  status: 'scheduled',
  priority: 'elective',
  specialInstructions: '',
  consentSigned: false,
  preOpChecklistComplete: false,
  postOpNotes: '',
  complications: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const procedureTypes = [
  'Appendectomy',
  'Cholecystectomy',
  'Hernia Repair',
  'Coronary Artery Bypass',
  'Hip Replacement',
  'Knee Replacement',
  'Spinal Fusion',
  'Laminectomy',
  'Cataract Surgery',
  'Laparoscopic Surgery',
  'Mastectomy',
  'Hysterectomy',
  'Cesarean Section',
  'Colectomy',
  'Thyroidectomy',
  'Gastric Bypass',
  'Cardiac Catheterization',
  'Pacemaker Implantation',
  'Other',
];

const orRooms = ['OR-1', 'OR-2', 'OR-3', 'OR-4', 'OR-5', 'OR-6', 'OR-7', 'OR-8'];

const staffRoles = [
  { value: 'surgeon', label: 'Surgeon' },
  { value: 'anesthesiologist', label: 'Anesthesiologist' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'surgical_tech', label: 'Surgical Tech' },
  { value: 'circulator', label: 'Circulator' },
];

const commonPreOpRequirements = [
  'NPO after midnight',
  'Labs completed',
  'EKG completed',
  'Chest X-ray completed',
  'Blood type and crossmatch',
  'Bowel prep completed',
  'Antibiotics administered',
  'IV access established',
  'Shave prep completed',
  'Consent obtained',
  'Pre-anesthesia evaluation',
  'Medication reconciliation',
];

const commonEquipment = [
  'Laparoscopic tower',
  'Electrosurgical unit',
  'Suction machine',
  'C-arm fluoroscopy',
  'Cell saver',
  'Ultrasound machine',
  'Harmonic scalpel',
  'Laser unit',
  'Microscope',
  'Navigation system',
];

export const SurgerySchedulerTool: React.FC<SurgerySchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: surgeries,
    addItem: addSurgery,
    updateItem: updateSurgery,
    deleteItem: deleteSurgery,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Surgery>(TOOL_ID, [], surgeryColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  const [formData, setFormData] = useState<Surgery>(createNewSurgery());
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [newPreOpReq, setNewPreOpReq] = useState('');
  const [newEquipment, setNewEquipment] = useState({ name: '', quantity: 1, notes: '' });
  const [newStaff, setNewStaff] = useState({ name: '', role: 'nurse' as const });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySurgeries = surgeries.filter(s => s.scheduledDate === today);
    const scheduled = surgeries.filter(s => s.status === 'scheduled');
    const inProgress = surgeries.filter(s => s.status === 'in-progress');
    const completed = surgeries.filter(s => s.status === 'completed');
    const urgent = surgeries.filter(s => s.priority === 'urgent' || s.priority === 'emergency');
    return {
      total: surgeries.length,
      today: todaySurgeries.length,
      scheduled: scheduled.length,
      inProgress: inProgress.length,
      completed: completed.length,
      urgent: urgent.length,
    };
  }, [surgeries]);

  // Filtered surgeries
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(surgery => {
      const matchesSearch = searchQuery === '' ||
        surgery.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surgery.procedureType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surgery.primarySurgeon.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || surgery.status === filterStatus;
      const matchesPriority = filterPriority === '' || surgery.priority === filterPriority;
      const matchesRoom = filterRoom === '' || surgery.orRoom === filterRoom;
      return matchesSearch && matchesStatus && matchesPriority && matchesRoom;
    }).sort((a, b) => {
      const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCompare !== 0) return dateCompare;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [surgeries, searchQuery, filterStatus, filterPriority, filterRoom]);

  // Calendar surgeries
  const calendarSurgeries = useMemo(() => {
    const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const endOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
    return surgeries.filter(s => {
      const sDate = new Date(s.scheduledDate);
      return sDate >= startOfMonth && sDate <= endOfMonth;
    });
  }, [surgeries, calendarDate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.patientName) errors.patientName = 'Patient name is required';
    if (!formData.procedureType) errors.procedureType = 'Procedure type is required';
    if (!formData.scheduledDate) errors.scheduledDate = 'Scheduled date is required';
    if (!formData.orRoom) errors.orRoom = 'OR room is required';
    if (!formData.primarySurgeon) errors.primarySurgeon = 'Primary surgeon is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (editingSurgery) {
      updateSurgery(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addSurgery({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingSurgery(null);
    setFormData(createNewSurgery());
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this surgery record?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteSurgery(id);
      if (selectedSurgery?.id === id) setSelectedSurgery(null);
    }
  };

  const openEditModal = (surgery: Surgery) => {
    setEditingSurgery(surgery);
    setFormData(surgery);
    setShowModal(true);
  };

  const updateStatus = (surgery: Surgery, newStatus: Surgery['status']) => {
    const updates: Partial<Surgery> = { status: newStatus, updatedAt: new Date().toISOString() };
    if (newStatus === 'in-progress' && !surgery.actualStartTime) {
      updates.actualStartTime = new Date().toISOString();
    }
    if (newStatus === 'completed' && !surgery.actualEndTime) {
      updates.actualEndTime = new Date().toISOString();
    }
    updateSurgery(surgery.id, updates);
  };

  const addPreOpRequirement = () => {
    if (newPreOpReq.trim() && !formData.preOpRequirements.includes(newPreOpReq.trim())) {
      setFormData({ ...formData, preOpRequirements: [...formData.preOpRequirements, newPreOpReq.trim()] });
      setNewPreOpReq('');
    }
  };

  const removePreOpRequirement = (req: string) => {
    setFormData({ ...formData, preOpRequirements: formData.preOpRequirements.filter(r => r !== req) });
  };

  const addEquipmentItem = () => {
    if (newEquipment.name.trim()) {
      const equipment: Equipment = { id: crypto.randomUUID(), ...newEquipment };
      setFormData({ ...formData, equipmentNeeds: [...formData.equipmentNeeds, equipment] });
      setNewEquipment({ name: '', quantity: 1, notes: '' });
    }
  };

  const removeEquipmentItem = (id: string) => {
    setFormData({ ...formData, equipmentNeeds: formData.equipmentNeeds.filter(e => e.id !== id) });
  };

  const addStaffMember = () => {
    if (newStaff.name.trim()) {
      const staff: StaffAssignment = { id: crypto.randomUUID(), ...newStaff };
      setFormData({ ...formData, staffAssignments: [...formData.staffAssignments, staff] });
      setNewStaff({ name: '', role: 'nurse' });
    }
  };

  const removeStaffMember = (id: string) => {
    setFormData({ ...formData, staffAssignments: formData.staffAssignments.filter(s => s.id !== id) });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pre-op': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in-progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'post-op': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'postponed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'elective': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'urgent': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'emergency': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'pre-op': return ClipboardList;
      case 'in-progress': return PlayCircle;
      case 'post-op': return PauseCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return X;
      case 'postponed': return PauseCircle;
      default: return Clock;
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const navigateMonth = (direction: number) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + direction, 1));
  };

  const getSurgeriesForDay = (day: number) => {
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarSurgeries.filter(s => s.scheduledDate === dateStr);
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Scissors className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.surgeryScheduler.surgeryScheduler', 'Surgery Scheduler')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.surgeryScheduler.scheduleAndManageSurgicalProcedures', 'Schedule and manage surgical procedures')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="surgery-scheduler" toolName="Surgery Scheduler" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'surgery-scheduler' })}
            onExportExcel={() => exportExcel({ filename: 'surgery-scheduler' })}
            onExportJSON={() => exportJSON({ filename: 'surgery-scheduler' })}
            onExportPDF={() => exportPDF({ filename: 'surgery-scheduler', title: 'Surgery Schedule' })}
            onPrint={() => print('Surgery Schedule')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={surgeries.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewSurgery()); setEditingSurgery(null); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.surgeryScheduler.scheduleSurgery', 'Schedule Surgery')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Scissors className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.surgeryScheduler.total', 'Total')}</p>
              <p className="text-xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.surgeryScheduler.today', 'Today')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.today}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.surgeryScheduler.scheduled', 'Scheduled')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <PlayCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.surgeryScheduler.inProgress', 'In Progress')}</p>
              <p className="text-xl font-bold text-purple-500">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.surgeryScheduler.completed', 'Completed')}</p>
              <p className="text-xl font-bold text-green-500">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.surgeryScheduler.urgent', 'Urgent')}</p>
              <p className="text-xl font-bold text-red-500">{stats.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('list')} className={tabClass(activeTab === 'list')}>
          <ClipboardList className="w-4 h-4 inline mr-2" />
          {t('tools.surgeryScheduler.listView', 'List View')}
        </button>
        <button onClick={() => setActiveTab('calendar')} className={tabClass(activeTab === 'calendar')}>
          <Calendar className="w-4 h-4 inline mr-2" />
          {t('tools.surgeryScheduler.calendarView', 'Calendar View')}
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Filters */}
          <div className={`${cardClass} p-4 mb-6`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('tools.surgeryScheduler.searchPatientProcedureOrSurgeon', 'Search patient, procedure, or surgeon...')}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
                <option value="">{t('tools.surgeryScheduler.allStatus', 'All Status')}</option>
                <option value="scheduled">{t('tools.surgeryScheduler.scheduled2', 'Scheduled')}</option>
                <option value="pre-op">{t('tools.surgeryScheduler.preOp', 'Pre-Op')}</option>
                <option value="in-progress">{t('tools.surgeryScheduler.inProgress2', 'In Progress')}</option>
                <option value="post-op">{t('tools.surgeryScheduler.postOp', 'Post-Op')}</option>
                <option value="completed">{t('tools.surgeryScheduler.completed2', 'Completed')}</option>
                <option value="cancelled">{t('tools.surgeryScheduler.cancelled', 'Cancelled')}</option>
                <option value="postponed">{t('tools.surgeryScheduler.postponed', 'Postponed')}</option>
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
                <option value="">{t('tools.surgeryScheduler.allPriority', 'All Priority')}</option>
                <option value="elective">{t('tools.surgeryScheduler.elective', 'Elective')}</option>
                <option value="urgent">{t('tools.surgeryScheduler.urgent2', 'Urgent')}</option>
                <option value="emergency">{t('tools.surgeryScheduler.emergency', 'Emergency')}</option>
              </select>
              <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className={`${inputClass} w-full sm:w-32`}>
                <option value="">{t('tools.surgeryScheduler.allRooms', 'All Rooms')}</option>
                {orRooms.map(room => <option key={room} value={room}>{room}</option>)}
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Surgery List */}
            <div className={`${cardClass} lg:col-span-1`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-lg font-semibold">Surgeries ({filteredSurgeries.length})</h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : filteredSurgeries.length === 0 ? (
                  <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.surgeryScheduler.noSurgeriesScheduled', 'No surgeries scheduled')}</p>
                  </div>
                ) : (
                  <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredSurgeries.map(surgery => {
                      const StatusIcon = getStatusIcon(surgery.status);
                      return (
                        <div
                          key={surgery.id}
                          onClick={() => setSelectedSurgery(surgery)}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedSurgery?.id === surgery.id
                              ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                              : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <StatusIcon className="w-4 h-4 text-cyan-500" />
                              </div>
                              <div>
                                <p className="font-medium">{surgery.patientName}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {surgery.procedureType}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {surgery.scheduledDate} at {surgery.scheduledTime} | {surgery.orRoom}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(surgery.status)}`}>
                                    {surgery.status}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(surgery.priority)}`}>
                                    {surgery.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={(e) => { e.stopPropagation(); openEditModal(surgery); }} className="p-1.5 hover:bg-gray-600 rounded">
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(surgery.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Details Panel */}
            <div className={`${cardClass} lg:col-span-2`}>
              {selectedSurgery ? (
                <div>
                  <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold">{selectedSurgery.procedureType}</h2>
                          <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedSurgery.status)}`}>
                            {selectedSurgery.status}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(selectedSurgery.priority)}`}>
                            {selectedSurgery.priority}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Patient: {selectedSurgery.patientName} | MRN: {selectedSurgery.patientMRN}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedSurgery.status === 'scheduled' && (
                          <button onClick={() => updateStatus(selectedSurgery, 'pre-op')} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                            {t('tools.surgeryScheduler.startPreOp', 'Start Pre-Op')}
                          </button>
                        )}
                        {selectedSurgery.status === 'pre-op' && (
                          <button onClick={() => updateStatus(selectedSurgery, 'in-progress')} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                            {t('tools.surgeryScheduler.beginSurgery', 'Begin Surgery')}
                          </button>
                        )}
                        {selectedSurgery.status === 'in-progress' && (
                          <button onClick={() => updateStatus(selectedSurgery, 'post-op')} className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm">
                            {t('tools.surgeryScheduler.endSurgery', 'End Surgery')}
                          </button>
                        )}
                        {selectedSurgery.status === 'post-op' && (
                          <button onClick={() => updateStatus(selectedSurgery, 'completed')} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm">
                            {t('tools.surgeryScheduler.complete', 'Complete')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Schedule Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.surgeryScheduler.date', 'Date')}</p>
                        <p className="font-medium">{selectedSurgery.scheduledDate}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.surgeryScheduler.time', 'Time')}</p>
                        <p className="font-medium">{selectedSurgery.scheduledTime}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.surgeryScheduler.orRoom', 'OR Room')}</p>
                        <p className="font-medium">{selectedSurgery.orRoom}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.surgeryScheduler.duration', 'Duration')}</p>
                        <p className="font-medium">{selectedSurgery.estimatedDuration} min</p>
                      </div>
                    </div>

                    {/* Surgical Team */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-500" />
                        {t('tools.surgeryScheduler.surgicalTeam', 'Surgical Team')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.surgeryScheduler.primarySurgeon', 'Primary Surgeon')}</p>
                          <p className="font-medium">{selectedSurgery.primarySurgeon || 'Not assigned'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.surgeryScheduler.anesthesiologist', 'Anesthesiologist')}</p>
                          <p className="font-medium">{selectedSurgery.anesthesiologist || 'Not assigned'}</p>
                        </div>
                      </div>
                      {selectedSurgery.staffAssignments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedSurgery.staffAssignments.map(staff => (
                            <span key={staff.id} className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {staff.name} ({staff.role})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Anesthesia */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-cyan-500" />
                        {t('tools.surgeryScheduler.anesthesia', 'Anesthesia')}
                      </h3>
                      <p className="capitalize">{selectedSurgery.anesthesiaType.replace('_', ' ')}</p>
                    </div>

                    {/* Pre-Op Requirements */}
                    {selectedSurgery.preOpRequirements.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-cyan-500" />
                          {t('tools.surgeryScheduler.preOpRequirements2', 'Pre-Op Requirements')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSurgery.preOpRequirements.map((req, i) => (
                            <span key={i} className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {selectedSurgery.preOpChecklistComplete ? <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" /> : null}
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equipment Needs */}
                    {selectedSurgery.equipmentNeeds.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-500" />
                          {t('tools.surgeryScheduler.equipmentNeeds2', 'Equipment Needs')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedSurgery.equipmentNeeds.map(eq => (
                            <div key={eq.id} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <p className="font-medium">{eq.name} (x{eq.quantity})</p>
                              {eq.notes && <p className="text-xs text-gray-400">{eq.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Consent & Checklist */}
                    <div className="flex gap-4">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${selectedSurgery.consentSigned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {selectedSurgery.consentSigned ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span className="text-sm">Consent {selectedSurgery.consentSigned ? t('tools.surgeryScheduler.signed', 'Signed') : t('tools.surgeryScheduler.pending', 'Pending')}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${selectedSurgery.preOpChecklistComplete ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {selectedSurgery.preOpChecklistComplete ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        <span className="text-sm">Pre-Op Checklist {selectedSurgery.preOpChecklistComplete ? t('tools.surgeryScheduler.complete2', 'Complete') : t('tools.surgeryScheduler.pending2', 'Pending')}</span>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {selectedSurgery.specialInstructions && (
                      <div className={`p-4 rounded-lg border border-yellow-500/30 ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-yellow-400">
                          <AlertTriangle className="w-4 h-4" />
                          {t('tools.surgeryScheduler.specialInstructions2', 'Special Instructions')}
                        </h3>
                        <p className="text-sm">{selectedSurgery.specialInstructions}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedSurgery.notes && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.surgeryScheduler.notes', 'Notes')}</h3>
                        <p className="text-sm">{selectedSurgery.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Scissors className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('tools.surgeryScheduler.selectASurgery', 'Select a surgery')}</p>
                  <p className="text-sm">{t('tools.surgeryScheduler.chooseASurgeryToView', 'Choose a surgery to view details')}</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className={cardClass}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <button onClick={() => navigateMonth(-1)} className={buttonSecondary}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold">{formatDate(calendarDate)}</h2>
            <button onClick={() => navigateMonth(1)} className={buttonSecondary}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`text-center text-sm font-medium py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getFirstDayOfMonth(calendarDate) }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 min-h-[100px]" />
              ))}
              {Array.from({ length: getDaysInMonth(calendarDate) }).map((_, i) => {
                const day = i + 1;
                const daySurgeries = getSurgeriesForDay(day);
                const isToday = new Date().toISOString().split('T')[0] ===
                  `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return (
                  <div
                    key={day}
                    className={`p-2 min-h-[100px] rounded-lg border ${
                      isToday
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-cyan-400' : ''}`}>{day}</div>
                    <div className="space-y-1">
                      {daySurgeries.slice(0, 3).map(surgery => (
                        <div
                          key={surgery.id}
                          onClick={() => { setSelectedSurgery(surgery); setActiveTab('list'); }}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${getPriorityColor(surgery.priority)}`}
                        >
                          {surgery.scheduledTime} {surgery.patientName.split(' ')[0]}
                        </div>
                      ))}
                      {daySurgeries.length > 3 && (
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{daySurgeries.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingSurgery ? t('tools.surgeryScheduler.editSurgery', 'Edit Surgery') : t('tools.surgeryScheduler.scheduleSurgery2', 'Schedule Surgery')}</h2>
              <button onClick={() => { setShowModal(false); setEditingSurgery(null); setFormErrors({}); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  {t('tools.surgeryScheduler.patientInformation', 'Patient Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.patientName', 'Patient Name *')}</label>
                    <input type="text" value={formData.patientName} onChange={(e) => { setFormData({ ...formData, patientName: e.target.value }); setFormErrors(prev => ({ ...prev, patientName: '' })); }} className={`${inputClass} ${formErrors.patientName ? 'border-red-500' : ''}`} />
                    {formErrors.patientName && <p className="text-red-500 text-xs mt-1">{formErrors.patientName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.mrn', 'MRN')}</label>
                    <input type="text" value={formData.patientMRN} onChange={(e) => setFormData({ ...formData, patientMRN: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.dateOfBirth', 'Date of Birth')}</label>
                    <input type="date" value={formData.patientDOB} onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.phone', 'Phone')}</label>
                    <input type="tel" value={formData.patientPhone} onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Procedure Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-cyan-500" />
                  {t('tools.surgeryScheduler.procedureInformation', 'Procedure Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.procedureType', 'Procedure Type *')}</label>
                    <select value={formData.procedureType} onChange={(e) => { setFormData({ ...formData, procedureType: e.target.value }); setFormErrors(prev => ({ ...prev, procedureType: '' })); }} className={`${inputClass} ${formErrors.procedureType ? 'border-red-500' : ''}`}>
                      <option value="">{t('tools.surgeryScheduler.selectProcedure', 'Select procedure')}</option>
                      {procedureTypes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {formErrors.procedureType && <p className="text-red-500 text-xs mt-1">{formErrors.procedureType}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.procedureCode', 'Procedure Code')}</label>
                    <input type="text" value={formData.procedureCode} onChange={(e) => setFormData({ ...formData, procedureCode: e.target.value })} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.surgeryScheduler.diagnosis', 'Diagnosis')}</label>
                    <input type="text" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  {t('tools.surgeryScheduler.schedule', 'Schedule')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.date2', 'Date *')}</label>
                    <input type="date" value={formData.scheduledDate} onChange={(e) => { setFormData({ ...formData, scheduledDate: e.target.value }); setFormErrors(prev => ({ ...prev, scheduledDate: '' })); }} className={`${inputClass} ${formErrors.scheduledDate ? 'border-red-500' : ''}`} />
                    {formErrors.scheduledDate && <p className="text-red-500 text-xs mt-1">{formErrors.scheduledDate}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.time2', 'Time *')}</label>
                    <input type="time" value={formData.scheduledTime} onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.orRoom2', 'OR Room *')}</label>
                    <select value={formData.orRoom} onChange={(e) => { setFormData({ ...formData, orRoom: e.target.value }); setFormErrors(prev => ({ ...prev, orRoom: '' })); }} className={`${inputClass} ${formErrors.orRoom ? 'border-red-500' : ''}`}>
                      <option value="">{t('tools.surgeryScheduler.selectRoom', 'Select room')}</option>
                      {orRooms.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {formErrors.orRoom && <p className="text-red-500 text-xs mt-1">{formErrors.orRoom}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.durationMin', 'Duration (min)')}</label>
                    <input type="number" value={formData.estimatedDuration} onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 60 })} className={inputClass} min="15" step="15" />
                  </div>
                </div>
              </div>

              {/* Surgical Team */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-500" />
                  {t('tools.surgeryScheduler.surgicalTeam2', 'Surgical Team')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.primarySurgeon2', 'Primary Surgeon *')}</label>
                    <input type="text" value={formData.primarySurgeon} onChange={(e) => { setFormData({ ...formData, primarySurgeon: e.target.value }); setFormErrors(prev => ({ ...prev, primarySurgeon: '' })); }} className={`${inputClass} ${formErrors.primarySurgeon ? 'border-red-500' : ''}`} />
                    {formErrors.primarySurgeon && <p className="text-red-500 text-xs mt-1">{formErrors.primarySurgeon}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.anesthesiologist2', 'Anesthesiologist')}</label>
                    <input type="text" value={formData.anesthesiologist} onChange={(e) => setFormData({ ...formData, anesthesiologist: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>{t('tools.surgeryScheduler.staffAssignments', 'Staff Assignments')}</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} placeholder={t('tools.surgeryScheduler.staffName', 'Staff name')} className={`${inputClass} flex-1`} />
                    <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })} className={`${inputClass} w-40`}>
                      {staffRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button type="button" onClick={addStaffMember} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.staffAssignments.map(staff => (
                      <span key={staff.id} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                        {staff.name} ({staff.role}) <button onClick={() => removeStaffMember(staff.id)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Anesthesia */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-cyan-500" />
                  {t('tools.surgeryScheduler.anesthesia2', 'Anesthesia')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.anesthesiaType', 'Anesthesia Type')}</label>
                    <select value={formData.anesthesiaType} onChange={(e) => setFormData({ ...formData, anesthesiaType: e.target.value as any })} className={inputClass}>
                      <option value="general">{t('tools.surgeryScheduler.general', 'General')}</option>
                      <option value="regional">{t('tools.surgeryScheduler.regional', 'Regional')}</option>
                      <option value="local">{t('tools.surgeryScheduler.local', 'Local')}</option>
                      <option value="sedation">{t('tools.surgeryScheduler.sedation', 'Sedation')}</option>
                      <option value="spinal">{t('tools.surgeryScheduler.spinal', 'Spinal')}</option>
                      <option value="epidural">{t('tools.surgeryScheduler.epidural', 'Epidural')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.priority', 'Priority')}</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className={inputClass}>
                      <option value="elective">{t('tools.surgeryScheduler.elective2', 'Elective')}</option>
                      <option value="urgent">{t('tools.surgeryScheduler.urgent3', 'Urgent')}</option>
                      <option value="emergency">{t('tools.surgeryScheduler.emergency2', 'Emergency')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.surgeryScheduler.status', 'Status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                      <option value="scheduled">{t('tools.surgeryScheduler.scheduled3', 'Scheduled')}</option>
                      <option value="pre-op">{t('tools.surgeryScheduler.preOp2', 'Pre-Op')}</option>
                      <option value="in-progress">{t('tools.surgeryScheduler.inProgress3', 'In Progress')}</option>
                      <option value="post-op">{t('tools.surgeryScheduler.postOp2', 'Post-Op')}</option>
                      <option value="completed">{t('tools.surgeryScheduler.completed3', 'Completed')}</option>
                      <option value="cancelled">{t('tools.surgeryScheduler.cancelled2', 'Cancelled')}</option>
                      <option value="postponed">{t('tools.surgeryScheduler.postponed2', 'Postponed')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pre-Op Requirements */}
              <div>
                <label className={labelClass}>{t('tools.surgeryScheduler.preOpRequirements', 'Pre-Op Requirements')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newPreOpReq} onChange={(e) => setNewPreOpReq(e.target.value)} placeholder={t('tools.surgeryScheduler.addRequirement', 'Add requirement')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreOpRequirement())} />
                  <button type="button" onClick={addPreOpRequirement} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonPreOpRequirements.filter(r => !formData.preOpRequirements.includes(r)).slice(0, 6).map(r => (
                    <button key={r} type="button" onClick={() => setFormData({ ...formData, preOpRequirements: [...formData.preOpRequirements, r] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {r}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preOpRequirements.map((r, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {r} <button onClick={() => removePreOpRequirement(r)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipment Needs */}
              <div>
                <label className={labelClass}>{t('tools.surgeryScheduler.equipmentNeeds', 'Equipment Needs')}</label>
                <div className="flex gap-2 mb-2">
                  <select value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} className={`${inputClass} flex-1`}>
                    <option value="">{t('tools.surgeryScheduler.selectEquipment', 'Select equipment')}</option>
                    {commonEquipment.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input type="number" value={newEquipment.quantity} onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) || 1 })} className={`${inputClass} w-20`} min="1" />
                  <button type="button" onClick={addEquipmentItem} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.equipmentNeeds.map(eq => (
                    <span key={eq.id} className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                      {eq.name} (x{eq.quantity}) <button onClick={() => removeEquipmentItem(eq.id)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Consent & Checklist */}
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="consentSigned" checked={formData.consentSigned} onChange={(e) => setFormData({ ...formData, consentSigned: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="consentSigned" className={labelClass}>{t('tools.surgeryScheduler.consentSigned', 'Consent Signed')}</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="preOpComplete" checked={formData.preOpChecklistComplete} onChange={(e) => setFormData({ ...formData, preOpChecklistComplete: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="preOpComplete" className={labelClass}>{t('tools.surgeryScheduler.preOpChecklistComplete', 'Pre-Op Checklist Complete')}</label>
                </div>
              </div>

              {/* Special Instructions & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.surgeryScheduler.specialInstructions', 'Special Instructions')}</label>
                  <textarea value={formData.specialInstructions} onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} className={inputClass} rows={3} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.surgeryScheduler.notes2', 'Notes')}</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingSurgery(null); setFormErrors({}); }} className={buttonSecondary}>{t('tools.surgeryScheduler.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> {editingSurgery ? t('tools.surgeryScheduler.update', 'Update') : t('tools.surgeryScheduler.schedule2', 'Schedule')} Surgery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.surgeryScheduler.aboutSurgeryScheduler', 'About Surgery Scheduler')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive surgical scheduling tool for managing OR schedules, surgical teams, pre-operative requirements,
          equipment needs, and patient procedures. Track surgery status from scheduling through completion with
          detailed documentation and consent tracking.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default SurgerySchedulerTool;
