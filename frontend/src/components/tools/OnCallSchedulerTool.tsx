'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Clock,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Filter,
  Mail,
  MapPin,
  Stethoscope,
  FileText,
  RefreshCw,
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
interface OnCallShift {
  id: string;
  providerId: string;
  providerName: string;
  specialty: string;
  shiftType: 'primary' | 'backup' | 'consult';
  startDateTime: string;
  endDateTime: string;
  department: string;
  location: string;
  phone: string;
  pager?: string;
  notes: string;
  status: 'scheduled' | 'active' | 'completed' | 'swapped';
  createdAt: string;
  updatedAt: string;
}

interface CoverageRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  originalShiftId: string;
  requestDate: string;
  reason: string;
  coveredById?: string;
  coveredByName?: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  approvedBy?: string;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface OnCallProvider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  department: string;
  phone: string;
  pager?: string;
  email: string;
  preferredContact: 'phone' | 'pager' | 'email';
  maxShiftsPerMonth: number;
  unavailableDates: string[];
  status: 'active' | 'inactive' | 'on-leave';
  createdAt: string;
  updatedAt: string;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  department: string;
  rotationType: 'weekly' | 'biweekly' | 'monthly';
  providers: string[];
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'calendar' | 'roster' | 'requests' | 'templates';

interface OnCallSchedulerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'on-call-scheduler';

const shiftColumns: ColumnConfig[] = [
  { key: 'providerName', header: 'Provider', type: 'string' },
  { key: 'specialty', header: 'Specialty', type: 'string' },
  { key: 'shiftType', header: 'Shift Type', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'startDateTime', header: 'Start', type: 'date' },
  { key: 'endDateTime', header: 'End', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
];

const createNewShift = (): OnCallShift => ({
  id: crypto.randomUUID(),
  providerId: '',
  providerName: '',
  specialty: '',
  shiftType: 'primary',
  startDateTime: '',
  endDateTime: '',
  department: '',
  location: '',
  phone: '',
  pager: '',
  notes: '',
  status: 'scheduled',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewProvider = (): OnCallProvider => ({
  id: crypto.randomUUID(),
  name: '',
  title: '',
  specialty: '',
  department: '',
  phone: '',
  pager: '',
  email: '',
  preferredContact: 'phone',
  maxShiftsPerMonth: 8,
  unavailableDates: [],
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewCoverageRequest = (): CoverageRequest => ({
  id: crypto.randomUUID(),
  requesterId: '',
  requesterName: '',
  originalShiftId: '',
  requestDate: new Date().toISOString().split('T')[0],
  reason: '',
  coveredById: '',
  coveredByName: '',
  status: 'pending',
  approvedBy: '',
  approvalDate: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewTemplate = (): ScheduleTemplate => ({
  id: crypto.randomUUID(),
  name: '',
  department: '',
  rotationType: 'weekly',
  providers: [],
  startTime: '07:00',
  endTime: '19:00',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const specialties = [
  'Emergency Medicine',
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics/Gynecology',
  'Anesthesiology',
  'Radiology',
  'Cardiology',
  'Neurology',
  'Psychiatry',
  'Orthopedics',
  'Urology',
  'Oncology',
  'ICU/Critical Care',
  'Hospitalist',
];

const departments = [
  'Emergency Department',
  'ICU',
  'Medical Floor',
  'Surgical Floor',
  'Pediatric Unit',
  'Labor & Delivery',
  'Cardiac Care Unit',
  'Operating Room',
  'Outpatient Clinic',
  'Radiology',
];

const shiftTypes: { value: OnCallShift['shiftType']; label: string; color: string }[] = [
  { value: 'primary', label: 'Primary', color: 'bg-blue-500' },
  { value: 'backup', label: 'Backup', color: 'bg-yellow-500' },
  { value: 'consult', label: 'Consult', color: 'bg-purple-500' },
];

export const OnCallSchedulerTool: React.FC<OnCallSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Shifts data
  const {
    data: shifts,
    addItem: addShift,
    updateItem: updateShift,
    deleteItem: deleteShift,
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
  } = useToolData<OnCallShift>(TOOL_ID, [], shiftColumns);

  // Providers data (stored separately)
  const {
    data: providers,
    addItem: addProvider,
    updateItem: updateProvider,
    deleteItem: deleteProvider,
  } = useToolData<OnCallProvider>(`${TOOL_ID}-providers`, [], []);

  // Coverage requests data
  const {
    data: coverageRequests,
    addItem: addCoverageRequest,
    updateItem: updateCoverageRequest,
    deleteItem: deleteCoverageRequest,
  } = useToolData<CoverageRequest>(`${TOOL_ID}-requests`, [], []);

  // Templates data
  const {
    data: templates,
    addItem: addTemplate,
    updateItem: updateTemplate,
    deleteItem: deleteTemplate,
  } = useToolData<ScheduleTemplate>(`${TOOL_ID}-templates`, [], []);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modal states
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Editing states
  const [editingShift, setEditingShift] = useState<OnCallShift | null>(null);
  const [editingProvider, setEditingProvider] = useState<OnCallProvider | null>(null);
  const [editingRequest, setEditingRequest] = useState<CoverageRequest | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null);

  // Form data
  const [shiftFormData, setShiftFormData] = useState<OnCallShift>(createNewShift());
  const [providerFormData, setProviderFormData] = useState<OnCallProvider>(createNewProvider());
  const [requestFormData, setRequestFormData] = useState<CoverageRequest>(createNewCoverageRequest());
  const [templateFormData, setTemplateFormData] = useState<ScheduleTemplate>(createNewTemplate());

  // Selected provider for template
  const [selectedTemplateProviders, setSelectedTemplateProviders] = useState<string[]>([]);

  // Detail views
  const [selectedShift, setSelectedShift] = useState<OnCallShift | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<OnCallProvider | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthShifts = shifts.filter(s => {
      const startDate = new Date(s.startDateTime);
      return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
    });

    const activeShifts = shifts.filter(s => s.status === 'active');
    const pendingRequests = coverageRequests.filter(r => r.status === 'pending');
    const activeProviders = providers.filter(p => p.status === 'active');

    return {
      totalShifts: shifts.length,
      monthShifts: monthShifts.length,
      activeShifts: activeShifts.length,
      pendingRequests: pendingRequests.length,
      totalProviders: providers.length,
      activeProviders: activeProviders.length,
    };
  }, [shifts, providers, coverageRequests]);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean; shifts: OnCallShift[] }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      const dateStr = date.toISOString().split('T')[0];
      const dayShifts = shifts.filter(s => s.startDateTime.startsWith(dateStr));
      days.push({ date, isCurrentMonth: false, shifts: dayShifts });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const dayShifts = shifts.filter(s => s.startDateTime.startsWith(dateStr));
      days.push({ date, isCurrentMonth: true, shifts: dayShifts });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split('T')[0];
      const dayShifts = shifts.filter(s => s.startDateTime.startsWith(dateStr));
      days.push({ date, isCurrentMonth: false, shifts: dayShifts });
    }

    return days;
  }, [currentDate, shifts]);

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const matchesSearch = searchQuery === '' ||
        shift.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = filterDepartment === '' || shift.department === filterDepartment;
      const matchesSpecialty = filterSpecialty === '' || shift.specialty === filterSpecialty;
      const matchesStatus = filterStatus === '' || shift.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesSpecialty && matchesStatus;
    });
  }, [shifts, searchQuery, filterDepartment, filterSpecialty, filterStatus]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      const matchesSearch = searchQuery === '' ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = filterDepartment === '' || provider.department === filterDepartment;
      const matchesSpecialty = filterSpecialty === '' || provider.specialty === filterSpecialty;
      return matchesSearch && matchesDepartment && matchesSpecialty;
    });
  }, [providers, searchQuery, filterDepartment, filterSpecialty]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return coverageRequests.filter(request => {
      const matchesSearch = searchQuery === '' ||
        request.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || request.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [coverageRequests, searchQuery, filterStatus]);

  // Handlers
  const handleSaveShift = () => {
    if (editingShift) {
      updateShift(shiftFormData.id, { ...shiftFormData, updatedAt: new Date().toISOString() });
    } else {
      addShift({ ...shiftFormData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowShiftModal(false);
    setEditingShift(null);
    setShiftFormData(createNewShift());
  };

  const handleSaveProvider = () => {
    if (editingProvider) {
      updateProvider(providerFormData.id, { ...providerFormData, updatedAt: new Date().toISOString() });
    } else {
      addProvider({ ...providerFormData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowProviderModal(false);
    setEditingProvider(null);
    setProviderFormData(createNewProvider());
  };

  const handleSaveRequest = () => {
    if (editingRequest) {
      updateCoverageRequest(requestFormData.id, { ...requestFormData, updatedAt: new Date().toISOString() });
    } else {
      addCoverageRequest({ ...requestFormData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowRequestModal(false);
    setEditingRequest(null);
    setRequestFormData(createNewCoverageRequest());
  };

  const handleSaveTemplate = () => {
    const templateData = { ...templateFormData, providers: selectedTemplateProviders };
    if (editingTemplate) {
      updateTemplate(templateData.id, { ...templateData, updatedAt: new Date().toISOString() });
    } else {
      addTemplate({ ...templateData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateFormData(createNewTemplate());
    setSelectedTemplateProviders([]);
  };

  const handleDeleteShift = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Shift',
      message: 'Are you sure you want to delete this shift?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteShift(id);
      if (selectedShift?.id === id) setSelectedShift(null);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Provider',
      message: 'Are you sure you want to delete this provider?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteProvider(id);
      if (selectedProvider?.id === id) setSelectedProvider(null);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Coverage Request',
      message: 'Are you sure you want to delete this coverage request?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteCoverageRequest(id);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Template',
      message: 'Are you sure you want to delete this template?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteTemplate(id);
    }
  };

  const openEditShiftModal = (shift: OnCallShift) => {
    setEditingShift(shift);
    setShiftFormData(shift);
    setShowShiftModal(true);
  };

  const openEditProviderModal = (provider: OnCallProvider) => {
    setEditingProvider(provider);
    setProviderFormData(provider);
    setShowProviderModal(true);
  };

  const openEditRequestModal = (request: CoverageRequest) => {
    setEditingRequest(request);
    setRequestFormData(request);
    setShowRequestModal(true);
  };

  const openEditTemplateModal = (template: ScheduleTemplate) => {
    setEditingTemplate(template);
    setTemplateFormData(template);
    setSelectedTemplateProviders(template.providers);
    setShowTemplateModal(true);
  };

  const handleApproveRequest = (request: CoverageRequest) => {
    updateCoverageRequest(request.id, {
      status: 'approved',
      approvalDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeclineRequest = (request: CoverageRequest) => {
    updateCoverageRequest(request.id, {
      status: 'declined',
      approvalDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format helpers
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'swapped': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'declined': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'on-leave': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-500';
      case 'backup': return 'bg-yellow-500';
      case 'consult': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
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
      ? 'bg-cyan-500 text-white'
      : theme === 'dark'
        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <Phone className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.onCallScheduler.onCallScheduler', 'On-Call Scheduler')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.onCallScheduler.manageOnCallSchedulesAnd', 'Manage on-call schedules and physician coverage')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="on-call-scheduler" toolName="On Call Scheduler" />

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
            onExportCSV={() => exportCSV({ filename: 'on-call-scheduler' })}
            onExportExcel={() => exportExcel({ filename: 'on-call-scheduler' })}
            onExportJSON={() => exportJSON({ filename: 'on-call-scheduler' })}
            onExportPDF={() => exportPDF({ filename: 'on-call-scheduler', title: 'On-Call Schedule' })}
            onPrint={() => print('On-Call Schedule')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={shifts.length === 0}
            theme={theme as 'light' | 'dark'}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.onCallScheduler.thisMonth', 'This Month')}</p>
              <p className="text-xl font-bold text-cyan-500">{stats.monthShifts}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.onCallScheduler.activeNow', 'Active Now')}</p>
              <p className="text-xl font-bold text-green-500">{stats.activeShifts}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.onCallScheduler.pending', 'Pending')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.onCallScheduler.providers', 'Providers')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.activeProviders}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.onCallScheduler.templates', 'Templates')}</p>
              <p className="text-xl font-bold text-purple-500">{templates.length}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Stethoscope className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.onCallScheduler.totalShifts', 'Total Shifts')}</p>
              <p className="text-xl font-bold text-orange-500">{stats.totalShifts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveTab('calendar')} className={tabClass(activeTab === 'calendar')}>
          <Calendar className="w-4 h-4 inline mr-1" /> Calendar
        </button>
        <button onClick={() => setActiveTab('roster')} className={tabClass(activeTab === 'roster')}>
          <Users className="w-4 h-4 inline mr-1" /> Provider Roster
        </button>
        <button onClick={() => setActiveTab('requests')} className={tabClass(activeTab === 'requests')}>
          <ArrowRightLeft className="w-4 h-4 inline mr-1" /> Coverage Requests
          {stats.pendingRequests > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
              {stats.pendingRequests}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('templates')} className={tabClass(activeTab === 'templates')}>
          <FileText className="w-4 h-4 inline mr-1" /> Templates
        </button>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.onCallScheduler.searchByNameSpecialtyOr', 'Search by name, specialty, or department...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className={`${inputClass} w-full lg:w-48`}>
            <option value="">{t('tools.onCallScheduler.allDepartments', 'All Departments')}</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className={`${inputClass} w-full lg:w-48`}>
            <option value="">{t('tools.onCallScheduler.allSpecialties', 'All Specialties')}</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(activeTab === 'calendar' || activeTab === 'requests') && (
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full lg:w-40`}>
              <option value="">{t('tools.onCallScheduler.allStatus', 'All Status')}</option>
              {activeTab === 'calendar' ? (
                <>
                  <option value="scheduled">{t('tools.onCallScheduler.scheduled', 'Scheduled')}</option>
                  <option value="active">{t('tools.onCallScheduler.active', 'Active')}</option>
                  <option value="completed">{t('tools.onCallScheduler.completed', 'Completed')}</option>
                  <option value="swapped">{t('tools.onCallScheduler.swapped', 'Swapped')}</option>
                </>
              ) : (
                <>
                  <option value="pending">{t('tools.onCallScheduler.pending2', 'Pending')}</option>
                  <option value="approved">{t('tools.onCallScheduler.approved', 'Approved')}</option>
                  <option value="declined">{t('tools.onCallScheduler.declined', 'Declined')}</option>
                  <option value="cancelled">{t('tools.onCallScheduler.cancelled', 'Cancelled')}</option>
                </>
              )}
            </select>
          )}
          <button
            onClick={() => {
              if (activeTab === 'calendar') {
                setShiftFormData(createNewShift());
                setShowShiftModal(true);
              } else if (activeTab === 'roster') {
                setProviderFormData(createNewProvider());
                setShowProviderModal(true);
              } else if (activeTab === 'requests') {
                setRequestFormData(createNewCoverageRequest());
                setShowRequestModal(true);
              } else {
                setTemplateFormData(createNewTemplate());
                setSelectedTemplateProviders([]);
                setShowTemplateModal(true);
              }
            }}
            className={buttonPrimary}
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'calendar' ? 'Shift' : activeTab === 'roster' ? 'Provider' : activeTab === 'requests' ? t('tools.onCallScheduler.request', 'Request') : t('tools.onCallScheduler.template', 'Template')}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className={`${cardClass} lg:col-span-2`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className={buttonSecondary}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextMonth} className={buttonSecondary}>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={goToToday} className={buttonSecondary}>{t('tools.onCallScheduler.today', 'Today')}</button>
              </div>
              <h2 className="text-lg font-semibold">
                {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
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
                {calendarDays.map((day, idx) => {
                  const dateStr = day.date.toISOString().split('T')[0];
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-[80px] p-1 rounded-lg cursor-pointer transition-colors ${
                        !day.isCurrentMonth
                          ? theme === 'dark' ? 'bg-gray-800/50 text-gray-600' : 'bg-gray-50 text-gray-400'
                          : isSelected
                            ? 'bg-cyan-500/20 border border-cyan-500'
                            : isToday
                              ? theme === 'dark' ? 'bg-gray-700 border border-cyan-500/50' : 'bg-cyan-50 border border-cyan-200'
                              : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-cyan-500' : ''}`}>
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {day.shifts.slice(0, 3).map(shift => (
                          <div
                            key={shift.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getShiftTypeColor(shift.shiftType)} text-white`}
                            title={`${shift.providerName} - ${shift.specialty}`}
                          >
                            {shift.providerName.split(' ')[0]}
                          </div>
                        ))}
                        {day.shifts.length > 3 && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{day.shifts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Day Shifts / Shift Details */}
          <div className={cardClass}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-lg font-semibold">
                {selectedDate ? formatDate(selectedDate) : 'Select a Date'}
              </h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : selectedDate ? (
                (() => {
                  const dayShifts = shifts.filter(s => s.startDateTime.startsWith(selectedDate));
                  return dayShifts.length === 0 ? (
                    <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('tools.onCallScheduler.noShiftsScheduled', 'No shifts scheduled')}</p>
                      <button
                        onClick={() => {
                          setShiftFormData({ ...createNewShift(), startDateTime: `${selectedDate}T08:00` });
                          setShowShiftModal(true);
                        }}
                        className={`${buttonPrimary} mt-4 mx-auto`}
                      >
                        <Plus className="w-4 h-4" /> Add Shift
                      </button>
                    </div>
                  ) : (
                    <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {dayShifts.map(shift => (
                        <div
                          key={shift.id}
                          onClick={() => setSelectedShift(shift)}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedShift?.id === shift.id
                              ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                              : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getShiftTypeColor(shift.shiftType)}`}></span>
                                <p className="font-medium">{shift.providerName}</p>
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {shift.specialty} - {shift.department}
                              </p>
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {formatDateTime(shift.startDateTime)} - {formatDateTime(shift.endDateTime)}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={(e) => { e.stopPropagation(); openEditShiftModal(shift); }} className="p-1.5 hover:bg-gray-600 rounded">
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteShift(shift.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(shift.status)}`}>
                              {shift.status}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded ${getShiftTypeColor(shift.shiftType)} text-white`}>
                              {shift.shiftType}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.onCallScheduler.clickOnADateTo', 'Click on a date to view shifts')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider List */}
          <div className={`${cardClass} lg:col-span-1`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-lg font-semibold">Providers ({filteredProviders.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredProviders.length === 0 ? (
                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.onCallScheduler.noProvidersFound', 'No providers found')}</p>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredProviders.map(provider => (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedProvider?.id === provider.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <User className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {provider.title}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {provider.specialty}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(provider.status)}`}>
                          {provider.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Provider Details */}
          <div className={`${cardClass} lg:col-span-2`}>
            {selectedProvider ? (
              <div>
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <User className="w-8 h-8 text-cyan-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedProvider.name}</h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedProvider.title}
                        </p>
                        <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedProvider.status)}`}>
                          {selectedProvider.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditProviderModal(selectedProvider)} className={buttonSecondary}>
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDeleteProvider(selectedProvider.id)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-cyan-500" />
                        <p className="text-xs text-gray-400">{t('tools.onCallScheduler.phone', 'Phone')}</p>
                      </div>
                      <p className="font-medium">{selectedProvider.phone || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <p className="text-xs text-gray-400">{t('tools.onCallScheduler.pager', 'Pager')}</p>
                      </div>
                      <p className="font-medium">{selectedProvider.pager || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <p className="text-xs text-gray-400">{t('tools.onCallScheduler.email', 'Email')}</p>
                      </div>
                      <p className="font-medium truncate">{selectedProvider.email || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.onCallScheduler.specialty', 'Specialty')}</p>
                      <p className="font-medium">{selectedProvider.specialty}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.onCallScheduler.department', 'Department')}</p>
                      <p className="font-medium">{selectedProvider.department}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.onCallScheduler.preferredContact', 'Preferred Contact')}</p>
                      <p className="font-medium capitalize">{selectedProvider.preferredContact}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.onCallScheduler.maxShiftsMonth', 'Max Shifts/Month')}</p>
                      <p className="font-medium">{selectedProvider.maxShiftsPerMonth}</p>
                    </div>
                  </div>

                  {/* This Month's Shifts */}
                  <div>
                    <h3 className="font-semibold mb-3">{t('tools.onCallScheduler.upcomingShifts', 'Upcoming Shifts')}</h3>
                    {(() => {
                      const providerShifts = shifts.filter(s => s.providerId === selectedProvider.id && new Date(s.startDateTime) >= new Date());
                      return providerShifts.length === 0 ? (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.onCallScheduler.noUpcomingShifts', 'No upcoming shifts')}</p>
                      ) : (
                        <div className="space-y-2">
                          {providerShifts.slice(0, 5).map(shift => (
                            <div key={shift.id} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div>
                                <p className="font-medium">{formatDateTime(shift.startDateTime)}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {shift.department} - {shift.shiftType}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(shift.status)}`}>
                                {shift.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Users className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t('tools.onCallScheduler.selectAProvider', 'Select a Provider')}</p>
                <p className="text-sm">{t('tools.onCallScheduler.chooseAProviderToView', 'Choose a provider to view details')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className={cardClass}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">Coverage Requests ({filteredRequests.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.onCallScheduler.requester', 'Requester')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.onCallScheduler.requestDate', 'Request Date')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.onCallScheduler.reason', 'Reason')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.onCallScheduler.coverage', 'Coverage')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.onCallScheduler.status', 'Status')}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.onCallScheduler.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <ArrowRightLeft className={`w-12 h-12 mx-auto mb-3 opacity-50 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.onCallScheduler.noCoverageRequests', 'No coverage requests')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(request => (
                    <tr key={request.id} className={theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{request.requesterName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(request.requestDate)}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">{request.reason}</td>
                      <td className="px-4 py-3 text-sm">{request.coveredByName || 'Pending'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request)}
                                className="p-1.5 hover:bg-green-500/20 rounded text-green-500"
                                title={t('tools.onCallScheduler.approve', 'Approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(request)}
                                className="p-1.5 hover:bg-red-500/20 rounded text-red-500"
                                title={t('tools.onCallScheduler.decline', 'Decline')}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => openEditRequestModal(request)} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => handleDeleteRequest(request.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <div className={`${cardClass} col-span-full p-8 text-center`}>
              <FileText className={`w-12 h-12 mx-auto mb-3 opacity-50 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.onCallScheduler.noTemplatesCreated', 'No templates created')}</p>
              <button onClick={() => { setTemplateFormData(createNewTemplate()); setShowTemplateModal(true); }} className={`${buttonPrimary} mt-4 mx-auto`}>
                <Plus className="w-4 h-4" /> Create Template
              </button>
            </div>
          ) : (
            templates.map(template => (
              <div key={template.id} className={cardClass}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {template.department}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditTemplateModal(template)} className="p-1.5 hover:bg-gray-600 rounded">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => handleDeleteTemplate(template.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 text-cyan-500" />
                      <span className="capitalize">{template.rotationType} rotation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <span>{template.startTime} - {template.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-cyan-500" />
                      <span>{template.providers.length} providers</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingShift ? t('tools.onCallScheduler.editShift', 'Edit Shift') : t('tools.onCallScheduler.addShift', 'Add Shift')}</h2>
              <button onClick={() => { setShowShiftModal(false); setEditingShift(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.provider', 'Provider *')}</label>
                  <select
                    value={shiftFormData.providerId}
                    onChange={(e) => {
                      const provider = providers.find(p => p.id === e.target.value);
                      setShiftFormData({
                        ...shiftFormData,
                        providerId: e.target.value,
                        providerName: provider?.name || '',
                        specialty: provider?.specialty || shiftFormData.specialty,
                        department: provider?.department || shiftFormData.department,
                        phone: provider?.phone || '',
                        pager: provider?.pager || '',
                      });
                    }}
                    className={inputClass}
                  >
                    <option value="">{t('tools.onCallScheduler.selectProvider', 'Select Provider')}</option>
                    {providers.filter(p => p.status === 'active').map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.shiftType', 'Shift Type')}</label>
                  <select value={shiftFormData.shiftType} onChange={(e) => setShiftFormData({ ...shiftFormData, shiftType: e.target.value as any })} className={inputClass}>
                    {shiftTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.startDateTime', 'Start Date/Time *')}</label>
                  <input type="datetime-local" value={shiftFormData.startDateTime.slice(0, 16)} onChange={(e) => setShiftFormData({ ...shiftFormData, startDateTime: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.endDateTime', 'End Date/Time *')}</label>
                  <input type="datetime-local" value={shiftFormData.endDateTime.slice(0, 16)} onChange={(e) => setShiftFormData({ ...shiftFormData, endDateTime: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.department2', 'Department')}</label>
                  <select value={shiftFormData.department} onChange={(e) => setShiftFormData({ ...shiftFormData, department: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.onCallScheduler.selectDepartment', 'Select Department')}</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.location', 'Location')}</label>
                  <input type="text" value={shiftFormData.location} onChange={(e) => setShiftFormData({ ...shiftFormData, location: e.target.value })} className={inputClass} placeholder={t('tools.onCallScheduler.eGMainHospital', 'e.g., Main Hospital')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.phone2', 'Phone')}</label>
                  <input type="tel" value={shiftFormData.phone} onChange={(e) => setShiftFormData({ ...shiftFormData, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.pager2', 'Pager')}</label>
                  <input type="text" value={shiftFormData.pager} onChange={(e) => setShiftFormData({ ...shiftFormData, pager: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.status2', 'Status')}</label>
                  <select value={shiftFormData.status} onChange={(e) => setShiftFormData({ ...shiftFormData, status: e.target.value as any })} className={inputClass}>
                    <option value="scheduled">{t('tools.onCallScheduler.scheduled2', 'Scheduled')}</option>
                    <option value="active">{t('tools.onCallScheduler.active2', 'Active')}</option>
                    <option value="completed">{t('tools.onCallScheduler.completed2', 'Completed')}</option>
                    <option value="swapped">{t('tools.onCallScheduler.swapped2', 'Swapped')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.notes', 'Notes')}</label>
                <textarea value={shiftFormData.notes} onChange={(e) => setShiftFormData({ ...shiftFormData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowShiftModal(false); setEditingShift(null); }} className={buttonSecondary}>{t('tools.onCallScheduler.cancel', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={handleSaveShift}
                  disabled={!shiftFormData.providerId || !shiftFormData.startDateTime || !shiftFormData.endDateTime}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingProvider ? t('tools.onCallScheduler.editProvider', 'Edit Provider') : t('tools.onCallScheduler.addProvider', 'Add Provider')}</h2>
              <button onClick={() => { setShowProviderModal(false); setEditingProvider(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.name', 'Name *')}</label>
                  <input type="text" value={providerFormData.name} onChange={(e) => setProviderFormData({ ...providerFormData, name: e.target.value })} className={inputClass} placeholder={t('tools.onCallScheduler.drJohnSmith', 'Dr. John Smith')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.title', 'Title')}</label>
                  <input type="text" value={providerFormData.title} onChange={(e) => setProviderFormData({ ...providerFormData, title: e.target.value })} className={inputClass} placeholder={t('tools.onCallScheduler.attendingPhysician', 'Attending Physician')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.specialty2', 'Specialty *')}</label>
                  <select value={providerFormData.specialty} onChange={(e) => setProviderFormData({ ...providerFormData, specialty: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.onCallScheduler.selectSpecialty', 'Select Specialty')}</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.department3', 'Department *')}</label>
                  <select value={providerFormData.department} onChange={(e) => setProviderFormData({ ...providerFormData, department: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.onCallScheduler.selectDepartment2', 'Select Department')}</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.phone3', 'Phone *')}</label>
                  <input type="tel" value={providerFormData.phone} onChange={(e) => setProviderFormData({ ...providerFormData, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.pager3', 'Pager')}</label>
                  <input type="text" value={providerFormData.pager} onChange={(e) => setProviderFormData({ ...providerFormData, pager: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.email2', 'Email')}</label>
                  <input type="email" value={providerFormData.email} onChange={(e) => setProviderFormData({ ...providerFormData, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.preferredContact2', 'Preferred Contact')}</label>
                  <select value={providerFormData.preferredContact} onChange={(e) => setProviderFormData({ ...providerFormData, preferredContact: e.target.value as any })} className={inputClass}>
                    <option value="phone">{t('tools.onCallScheduler.phone4', 'Phone')}</option>
                    <option value="pager">{t('tools.onCallScheduler.pager4', 'Pager')}</option>
                    <option value="email">{t('tools.onCallScheduler.email3', 'Email')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.maxShiftsMonth2', 'Max Shifts/Month')}</label>
                  <input type="number" value={providerFormData.maxShiftsPerMonth} onChange={(e) => setProviderFormData({ ...providerFormData, maxShiftsPerMonth: parseInt(e.target.value) || 8 })} className={inputClass} min={1} max={31} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.status3', 'Status')}</label>
                  <select value={providerFormData.status} onChange={(e) => setProviderFormData({ ...providerFormData, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.onCallScheduler.active3', 'Active')}</option>
                    <option value="inactive">{t('tools.onCallScheduler.inactive', 'Inactive')}</option>
                    <option value="on-leave">{t('tools.onCallScheduler.onLeave', 'On Leave')}</option>
                  </select>
                </div>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowProviderModal(false); setEditingProvider(null); }} className={buttonSecondary}>{t('tools.onCallScheduler.cancel2', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={handleSaveProvider}
                  disabled={!providerFormData.name || !providerFormData.specialty || !providerFormData.department || !providerFormData.phone}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingRequest ? t('tools.onCallScheduler.editRequest', 'Edit Request') : t('tools.onCallScheduler.newCoverageRequest', 'New Coverage Request')}</h2>
              <button onClick={() => { setShowRequestModal(false); setEditingRequest(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.requester2', 'Requester *')}</label>
                <select
                  value={requestFormData.requesterId}
                  onChange={(e) => {
                    const provider = providers.find(p => p.id === e.target.value);
                    setRequestFormData({
                      ...requestFormData,
                      requesterId: e.target.value,
                      requesterName: provider?.name || '',
                    });
                  }}
                  className={inputClass}
                >
                  <option value="">{t('tools.onCallScheduler.selectRequester', 'Select Requester')}</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.originalShift', 'Original Shift')}</label>
                <select
                  value={requestFormData.originalShiftId}
                  onChange={(e) => setRequestFormData({ ...requestFormData, originalShiftId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">{t('tools.onCallScheduler.selectShift', 'Select Shift')}</option>
                  {shifts
                    .filter(s => s.providerId === requestFormData.requesterId && s.status === 'scheduled')
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {formatDateTime(s.startDateTime)} - {s.department}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.requestDate2', 'Request Date')}</label>
                <input type="date" value={requestFormData.requestDate} onChange={(e) => setRequestFormData({ ...requestFormData, requestDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.reason2', 'Reason *')}</label>
                <textarea value={requestFormData.reason} onChange={(e) => setRequestFormData({ ...requestFormData, reason: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.onCallScheduler.pleaseProvideAReasonFor', 'Please provide a reason for the coverage request...')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.coverageBy', 'Coverage By')}</label>
                <select
                  value={requestFormData.coveredById}
                  onChange={(e) => {
                    const provider = providers.find(p => p.id === e.target.value);
                    setRequestFormData({
                      ...requestFormData,
                      coveredById: e.target.value,
                      coveredByName: provider?.name || '',
                    });
                  }}
                  className={inputClass}
                >
                  <option value="">{t('tools.onCallScheduler.selectProviderOptional', 'Select Provider (optional)')}</option>
                  {providers.filter(p => p.id !== requestFormData.requesterId && p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.status4', 'Status')}</label>
                <select value={requestFormData.status} onChange={(e) => setRequestFormData({ ...requestFormData, status: e.target.value as any })} className={inputClass}>
                  <option value="pending">{t('tools.onCallScheduler.pending3', 'Pending')}</option>
                  <option value="approved">{t('tools.onCallScheduler.approved2', 'Approved')}</option>
                  <option value="declined">{t('tools.onCallScheduler.declined2', 'Declined')}</option>
                  <option value="cancelled">{t('tools.onCallScheduler.cancelled2', 'Cancelled')}</option>
                </select>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowRequestModal(false); setEditingRequest(null); }} className={buttonSecondary}>{t('tools.onCallScheduler.cancel3', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={handleSaveRequest}
                  disabled={!requestFormData.requesterId || !requestFormData.reason}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingTemplate ? t('tools.onCallScheduler.editTemplate', 'Edit Template') : t('tools.onCallScheduler.createTemplate', 'Create Template')}</h2>
              <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.templateName', 'Template Name *')}</label>
                <input type="text" value={templateFormData.name} onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })} className={inputClass} placeholder={t('tools.onCallScheduler.eGWeekendRotation', 'e.g., Weekend Rotation')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.department4', 'Department *')}</label>
                <select value={templateFormData.department} onChange={(e) => setTemplateFormData({ ...templateFormData, department: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.onCallScheduler.selectDepartment3', 'Select Department')}</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.rotationType', 'Rotation Type')}</label>
                <select value={templateFormData.rotationType} onChange={(e) => setTemplateFormData({ ...templateFormData, rotationType: e.target.value as any })} className={inputClass}>
                  <option value="weekly">{t('tools.onCallScheduler.weekly', 'Weekly')}</option>
                  <option value="biweekly">{t('tools.onCallScheduler.biweekly', 'Biweekly')}</option>
                  <option value="monthly">{t('tools.onCallScheduler.monthly', 'Monthly')}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.startTime', 'Start Time')}</label>
                  <input type="time" value={templateFormData.startTime} onChange={(e) => setTemplateFormData({ ...templateFormData, startTime: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.onCallScheduler.endTime', 'End Time')}</label>
                  <input type="time" value={templateFormData.endTime} onChange={(e) => setTemplateFormData({ ...templateFormData, endTime: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.onCallScheduler.providersInRotation', 'Providers in Rotation')}</label>
                <div className={`max-h-40 overflow-y-auto rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} p-2`}>
                  {providers.filter(p => p.status === 'active').map(provider => (
                    <label key={provider.id} className="flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTemplateProviders.includes(provider.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTemplateProviders([...selectedTemplateProviders, provider.id]);
                          } else {
                            setSelectedTemplateProviders(selectedTemplateProviders.filter(id => id !== provider.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span>{provider.name} - {provider.specialty}</span>
                    </label>
                  ))}
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedTemplateProviders.length} providers selected
                </p>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} className={buttonSecondary}>{t('tools.onCallScheduler.cancel4', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={!templateFormData.name || !templateFormData.department}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.onCallScheduler.aboutOnCallScheduler', 'About On-Call Scheduler')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage on-call schedules, physician coverage, and shift rotations for your healthcare facility.
          Track providers, handle coverage requests, and create schedule templates for efficient staffing.
          All data is synced to your account for access across devices.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default OnCallSchedulerTool;
