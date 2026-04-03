'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  CalendarClock,
  User,
  Calendar,
  Phone,
  Mail,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  Filter,
  MessageSquare,
  PhoneCall,
  MailOpen,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToolData } from '../../hooks/useToolData';
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

// Types
type RecallType = 'prophy' | 'perio' | 'exam' | 'xray' | 'fluoride' | 'other';
type RecallStatus = 'due' | 'scheduled' | 'completed' | 'overdue' | 'cancelled';
type ContactMethod = 'email' | 'sms' | 'phone' | 'mail';
type ContactStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'responded';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: ContactMethod;
  lastVisit?: string;
}

interface RecallAppointment {
  id: string;
  patientId: string;
  patient: Patient;
  recallType: RecallType;
  intervalMonths: number;
  lastCompletedDate?: string;
  nextDueDate: string;
  status: RecallStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  provider?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RecallContact {
  id: string;
  recallId: string;
  patientId: string;
  method: ContactMethod;
  status: ContactStatus;
  sentAt: string;
  message: string;
  response?: string;
  responseAt?: string;
}

interface RecallTemplate {
  id: string;
  name: string;
  recallType: RecallType;
  method: ContactMethod;
  subject: string;
  message: string;
  daysBeforeDue: number;
}

type TabType = 'recalls' | 'schedule' | 'templates' | 'analytics';

const RECALL_TYPES: { value: RecallType; label: string; defaultInterval: number; color: string }[] = [
  { value: 'prophy', label: 'Prophylaxis (Cleaning)', defaultInterval: 6, color: '#10b981' },
  { value: 'perio', label: 'Periodontal Maintenance', defaultInterval: 3, color: '#3b82f6' },
  { value: 'exam', label: 'Comprehensive Exam', defaultInterval: 12, color: '#8b5cf6' },
  { value: 'xray', label: 'X-Rays (FMX/Pano)', defaultInterval: 60, color: '#f59e0b' },
  { value: 'fluoride', label: 'Fluoride Treatment', defaultInterval: 6, color: '#ec4899' },
  { value: 'other', label: 'Other', defaultInterval: 12, color: '#6b7280' },
];

const STATUS_COLORS: Record<RecallStatus, string> = {
  due: '#f59e0b',
  scheduled: '#3b82f6',
  completed: '#10b981',
  overdue: '#dc2626',
  cancelled: '#6b7280',
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configurations for export
const recallColumns: ColumnConfig[] = [
  { key: 'id', header: 'Recall ID', type: 'string' },
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'recallType', header: 'Type', type: 'string' },
  { key: 'intervalMonths', header: 'Interval (months)', type: 'number' },
  { key: 'nextDueDate', header: 'Due Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled', type: 'date' },
  { key: 'lastCompletedDate', header: 'Last Completed', type: 'date' },
];

const DEFAULT_TEMPLATES: RecallTemplate[] = [
  {
    id: generateId(),
    name: '2-Week Reminder',
    recallType: 'prophy',
    method: 'email',
    subject: 'Your dental cleaning is due soon!',
    message: 'Dear {patientName}, it\'s time to schedule your routine dental cleaning. Please call us at {officePhone} or reply to schedule your appointment.',
    daysBeforeDue: 14,
  },
  {
    id: generateId(),
    name: '1-Week Reminder',
    recallType: 'prophy',
    method: 'sms',
    subject: '',
    message: 'Hi {patientName}! Your dental cleaning is due in 1 week. Reply YES to confirm or call us to reschedule.',
    daysBeforeDue: 7,
  },
  {
    id: generateId(),
    name: 'Overdue Notice',
    recallType: 'prophy',
    method: 'email',
    subject: 'Your dental appointment is overdue',
    message: 'Dear {patientName}, our records show your dental cleaning is overdue. Please contact us to schedule your appointment as soon as possible.',
    daysBeforeDue: -7,
  },
];

interface RecallSchedulerToolProps {
  uiConfig?: UIConfig;
}

export const RecallSchedulerTool: React.FC<RecallSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('recalls');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<RecallStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<RecallType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecall, setSelectedRecall] = useState<RecallAppointment | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize useToolData hooks for backend persistence
  const {
    data: recalls,
    addItem: addRecall,
    updateItem: updateRecall,
    deleteItem: deleteRecall,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<RecallAppointment>(
    'dental-recalls',
    [],
    recallColumns,
    { autoSave: true }
  );

  const {
    data: contacts,
    addItem: addContact,
    updateItem: updateContact,
    deleteItem: deleteContact,
  } = useToolData<RecallContact>(
    'dental-recall-contacts',
    [],
    [],
    { autoSave: true }
  );

  const {
    data: templates,
    addItem: addTemplate,
    updateItem: updateTemplate,
    deleteItem: deleteTemplate,
  } = useToolData<RecallTemplate>(
    'dental-recall-templates',
    DEFAULT_TEMPLATES,
    [],
    { autoSave: true }
  );

  // Form state
  const [newRecall, setNewRecall] = useState<Partial<RecallAppointment>>({
    patient: {
      id: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      preferredContact: 'email',
    },
    recallType: 'prophy',
    intervalMonths: 6,
  });

  // Export handlers
  const handleExportCSV = () => {
    const exportData = recalls.map(recall => ({
      ...recall,
      patientName: `${recall.patient.firstName} ${recall.patient.lastName}`,
    }));
    exportToCSV(exportData, recallColumns, { filename: 'dental-recalls-export' });
  };

  const handleExportExcel = () => {
    const exportData = recalls.map(recall => ({
      ...recall,
      patientName: `${recall.patient.firstName} ${recall.patient.lastName}`,
    }));
    exportToExcel(exportData, recallColumns, { filename: 'dental-recalls-export' });
  };

  const handleExportJSON = () => {
    exportToJSON(recalls, { filename: 'dental-recalls-export' });
  };

  const handleExportPDF = async () => {
    const exportData = recalls.map(recall => ({
      ...recall,
      patientName: `${recall.patient.firstName} ${recall.patient.lastName}`,
    }));
    await exportToPDF(exportData, recallColumns, {
      filename: 'dental-recalls-export',
      title: 'Patient Recall List',
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const exportData = recalls.map(recall => ({
      ...recall,
      patientName: `${recall.patient.firstName} ${recall.patient.lastName}`,
    }));
    return copyUtil(exportData, recallColumns);
  };

  const handlePrint = () => {
    const exportData = recalls.map(recall => ({
      ...recall,
      patientName: `${recall.patient.firstName} ${recall.patient.lastName}`,
    }));
    printData(exportData, recallColumns, { title: 'Patient Recall List' });
  };

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patientName || params.firstName) {
        setNewRecall({
          ...newRecall,
          patient: {
            ...newRecall.patient!,
            firstName: params.firstName || '',
            lastName: params.lastName || '',
            phone: params.phone || '',
            email: params.email || '',
          },
        });
        setShowAddForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Update recall statuses based on dates
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    recalls.forEach(recall => {
      if (recall.status === 'completed' || recall.status === 'cancelled') return;

      const dueDate = new Date(recall.nextDueDate);
      dueDate.setHours(0, 0, 0, 0);

      let newStatus: RecallStatus = recall.status;
      if (recall.scheduledDate) {
        newStatus = 'scheduled';
      } else if (dueDate < today) {
        newStatus = 'overdue';
      } else {
        newStatus = 'due';
      }

      if (newStatus !== recall.status) {
        updateRecall(recall.id, { status: newStatus });
      }
    });
  }, [recalls]);

  // Filter recalls
  const filteredRecalls = recalls.filter(recall => {
    const matchesSearch =
      `${recall.patient.firstName} ${recall.patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recall.patient.phone.includes(searchQuery) ||
      recall.patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || recall.status === filterStatus;
    const matchesType = filterType === 'all' || recall.recallType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort recalls by due date
  const sortedRecalls = [...filteredRecalls].sort((a, b) => {
    const dateA = new Date(a.nextDueDate).getTime();
    const dateB = new Date(b.nextDueDate).getTime();
    return dateA - dateB;
  });

  // Add new recall
  const handleAddRecall = () => {
    if (!newRecall.patient?.firstName || !newRecall.patient?.lastName) {
      setValidationMessage('Please fill in patient name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const recallType = RECALL_TYPES.find(t => t.value === newRecall.recallType);
    const intervalMonths = newRecall.intervalMonths || recallType?.defaultInterval || 6;
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);

    const recall: RecallAppointment = {
      id: generateId(),
      patientId: newRecall.patient.id || generateId(),
      patient: {
        id: newRecall.patient.id || generateId(),
        firstName: newRecall.patient.firstName,
        lastName: newRecall.patient.lastName,
        phone: newRecall.patient.phone || '',
        email: newRecall.patient.email || '',
        preferredContact: newRecall.patient.preferredContact || 'email',
      },
      recallType: newRecall.recallType || 'prophy',
      intervalMonths,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      status: 'due',
      notes: newRecall.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRecall(recall);
    setNewRecall({
      patient: {
        id: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        preferredContact: 'email',
      },
      recallType: 'prophy',
      intervalMonths: 6,
    });
    setShowAddForm(false);
  };

  // Schedule recall
  const handleScheduleRecall = (recallId: string, date: string, time: string) => {
    updateRecall(recallId, {
      scheduledDate: date,
      scheduledTime: time,
      status: 'scheduled',
      updatedAt: new Date().toISOString(),
    });
  };

  // Mark recall as completed
  const handleCompleteRecall = (recallId: string) => {
    const recall = recalls.find(r => r.id === recallId);
    if (!recall) return;

    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + recall.intervalMonths);

    // Create new recall for next appointment
    const newRecallEntry: RecallAppointment = {
      ...recall,
      id: generateId(),
      lastCompletedDate: new Date().toISOString().split('T')[0],
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      status: 'due',
      scheduledDate: undefined,
      scheduledTime: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update current recall as completed
    updateRecall(recallId, {
      status: 'completed',
      lastCompletedDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });

    // Add new recall for next cycle
    addRecall(newRecallEntry);
  };

  // Send recall reminder
  const handleSendReminder = (recall: RecallAppointment, method: ContactMethod) => {
    const template = templates.find(
      t => t.recallType === recall.recallType && t.method === method
    );

    const contact: RecallContact = {
      id: generateId(),
      recallId: recall.id,
      patientId: recall.patientId,
      method,
      status: 'sent',
      sentAt: new Date().toISOString(),
      message: template?.message.replace('{patientName}', `${recall.patient.firstName} ${recall.patient.lastName}`) || '',
    };

    addContact(contact);
    setValidationMessage(`${method.toUpperCase()} reminder sent to ${recall.patient.firstName} ${recall.patient.lastName}`);
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Analytics
  const getAnalytics = () => {
    const today = new Date();
    const thisWeek = recalls.filter(r => {
      const dueDate = new Date(r.nextDueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7 && r.status !== 'completed';
    });

    const overdue = recalls.filter(r => r.status === 'overdue');
    const scheduled = recalls.filter(r => r.status === 'scheduled');
    const completed = recalls.filter(r => r.status === 'completed');

    const completionRate = recalls.length > 0
      ? (completed.length / recalls.length) * 100
      : 0;

    const recallsByType = RECALL_TYPES.map(type => ({
      ...type,
      count: recalls.filter(r => r.recallType === type.value && r.status !== 'completed').length,
    }));

    return {
      totalActive: recalls.filter(r => r.status !== 'completed').length,
      dueThisWeek: thisWeek.length,
      overdue: overdue.length,
      scheduled: scheduled.length,
      completed: completed.length,
      completionRate,
      recallsByType,
    };
  };

  const analytics = getAnalytics();

  const getRecallTypeInfo = (type: RecallType) => RECALL_TYPES.find(t => t.value === type);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top">
          {validationMessage}
        </div>
      )}
      {/* Header */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <CalendarClock className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.recallScheduler.patientRecallScheduler', 'Patient Recall Scheduler')}
              </CardTitle>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.recallScheduler.managePatientRecallAppointmentsAnd', 'Manage patient recall appointments and reminders')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="recall-scheduler" toolName="Recall Scheduler" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
                <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.dueThisWeek}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recallScheduler.dueThisWeek', 'Due This Week')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'}`}>
                <AlertCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.overdue}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recallScheduler.overdue2', 'Overdue')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.scheduled}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recallScheduler.scheduled2', 'Scheduled')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <CheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.completionRate.toFixed(0)}%
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recallScheduler.completionRate2', 'Completion Rate')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {(['recalls', 'schedule', 'templates', 'analytics'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'bg-gray-800 text-white border-b-2 border-purple-500'
                  : 'bg-white text-purple-600 border-b-2 border-purple-500'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Recalls Tab */}
      {activeTab === 'recalls' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.recallScheduler.searchPatients', 'Search patients...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                {t('tools.recallScheduler.filters', 'Filters')}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                {t('tools.recallScheduler.addPatient', 'Add Patient')}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.recallScheduler.status', 'Status')}
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as RecallStatus | 'all')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.recallScheduler.allStatuses', 'All Statuses')}</option>
                    <option value="due">{t('tools.recallScheduler.due', 'Due')}</option>
                    <option value="overdue">{t('tools.recallScheduler.overdue', 'Overdue')}</option>
                    <option value="scheduled">{t('tools.recallScheduler.scheduled', 'Scheduled')}</option>
                    <option value="completed">{t('tools.recallScheduler.completed', 'Completed')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.recallScheduler.recallType', 'Recall Type')}
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as RecallType | 'all')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.recallScheduler.allTypes', 'All Types')}</option>
                    {RECALL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Add Form */}
            {showAddForm && (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recallScheduler.addPatientRecall', 'Add Patient Recall')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recallScheduler.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newRecall.patient?.firstName || ''}
                      onChange={(e) => setNewRecall({
                        ...newRecall,
                        patient: { ...newRecall.patient!, firstName: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recallScheduler.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newRecall.patient?.lastName || ''}
                      onChange={(e) => setNewRecall({
                        ...newRecall,
                        patient: { ...newRecall.patient!, lastName: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recallScheduler.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newRecall.patient?.phone || ''}
                      onChange={(e) => setNewRecall({
                        ...newRecall,
                        patient: { ...newRecall.patient!, phone: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recallScheduler.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={newRecall.patient?.email || ''}
                      onChange={(e) => setNewRecall({
                        ...newRecall,
                        patient: { ...newRecall.patient!, email: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recallScheduler.recallType2', 'Recall Type')}
                    </label>
                    <select
                      value={newRecall.recallType || 'prophy'}
                      onChange={(e) => {
                        const type = RECALL_TYPES.find(t => t.value === e.target.value);
                        setNewRecall({
                          ...newRecall,
                          recallType: e.target.value as RecallType,
                          intervalMonths: type?.defaultInterval || 6,
                        });
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {RECALL_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recallScheduler.intervalMonths', 'Interval (months)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={newRecall.intervalMonths || 6}
                      onChange={(e) => setNewRecall({
                        ...newRecall,
                        intervalMonths: parseInt(e.target.value) || 6,
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.recallScheduler.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleAddRecall}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {t('tools.recallScheduler.addRecall', 'Add Recall')}
                  </button>
                </div>
              </div>
            )}

            {/* Recalls List */}
            <div className="space-y-4">
              {sortedRecalls.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarClock className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.recallScheduler.noRecallsFoundAddA', 'No recalls found. Add a patient to get started.')}
                  </p>
                </div>
              ) : (
                sortedRecalls.map((recall) => {
                  const typeInfo = getRecallTypeInfo(recall.recallType);
                  return (
                    <div
                      key={recall.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-3 h-3 rounded-full mt-1.5"
                            style={{ backgroundColor: typeInfo?.color }}
                          />
                          <div>
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {recall.patient.firstName} {recall.patient.lastName}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {typeInfo?.label} - Every {recall.intervalMonths} months
                            </p>
                            {recall.patient.phone && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {recall.patient.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-center">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recallScheduler.dueDate', 'Due Date')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {new Date(recall.nextDueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className="px-2 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: STATUS_COLORS[recall.status] }}
                          >
                            {recall.status}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSendReminder(recall, 'email')}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                              title={t('tools.recallScheduler.sendEmail', 'Send Email')}
                            >
                              <MailOpen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendReminder(recall, 'sms')}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg"
                              title={t('tools.recallScheduler.sendSms', 'Send SMS')}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendReminder(recall, 'phone')}
                              className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg"
                              title={t('tools.recallScheduler.logPhoneCall', 'Log Phone Call')}
                            >
                              <PhoneCall className="w-4 h-4" />
                            </button>
                          </div>
                          {recall.status !== 'completed' && (
                            <button
                              onClick={() => handleCompleteRecall(recall.id)}
                              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              {t('tools.recallScheduler.complete', 'Complete')}
                            </button>
                          )}
                          <button
                            onClick={() => deleteRecall(recall.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="text-center py-12">
              <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {t('tools.recallScheduler.calendarViewComingSoon', 'Calendar view coming soon.')}
              </p>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.recallScheduler.viewAndManageRecallSchedules', 'View and manage recall schedules in a calendar format.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.recallScheduler.reminderTemplates', 'Reminder Templates')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {template.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {template.method.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {template.daysBeforeDue > 0 ? `${template.daysBeforeDue} days before` : `${Math.abs(template.daysBeforeDue)} days after`}
                    </span>
                  </div>
                </div>
                {template.subject && (
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>{t('tools.recallScheduler.subject', 'Subject:')}</strong> {template.subject}
                  </p>
                )}
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {template.message}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.recallScheduler.recallAnalytics', 'Recall Analytics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recallScheduler.recallsByType', 'Recalls by Type')}
                </h4>
                <div className="space-y-3">
                  {analytics.recallsByType.map((type) => (
                    <div key={type.value} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {type.label}
                        </span>
                      </div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {type.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recallScheduler.summaryStatistics', 'Summary Statistics')}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.recallScheduler.totalActiveRecalls', 'Total Active Recalls')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.totalActive}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.recallScheduler.completedThisPeriod', 'Completed This Period')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.completed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.recallScheduler.completionRate', 'Completion Rate')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.completionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default RecallSchedulerTool;
