'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Pill,
  User,
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Filter,
  Send,
  Settings,
  History,
  BellRing,
  BellOff,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: 'phone' | 'email' | 'sms' | 'all';
  doNotContact: boolean;
  notes: string;
}

interface Medication {
  id: string;
  patientId: string;
  rxNumber: string;
  drugName: string;
  strength: string;
  daysSupply: number;
  lastFillDate: string;
  refillsRemaining: number;
  autoRefill: boolean;
  status: 'active' | 'discontinued' | 'on-hold';
}

interface Reminder {
  id: string;
  medicationId: string;
  patientId: string;
  reminderType: 'refill-due' | 'refill-ready' | 'pickup' | 'expired' | 'custom';
  scheduledDate: string;
  scheduledTime: string;
  contactMethod: 'phone' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  message: string;
  sentAt?: string;
  response?: string;
  createdAt: string;
}

interface ReminderTemplate {
  id: string;
  name: string;
  type: 'refill-due' | 'refill-ready' | 'pickup' | 'expired' | 'custom';
  subject: string;
  message: string;
  daysBeforeDue: number;
}

interface RefillReminderToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'refill-reminder';

// Column configuration for export
const reminderColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'drugName', header: 'Medication', type: 'string' },
  { key: 'reminderType', header: 'Type', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'contactMethod', header: 'Contact Method', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'sentAt', header: 'Sent At', type: 'date' },
];

const patientColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'preferredContact', header: 'Preferred Contact', type: 'string' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'pending': { label: 'Pending', color: 'yellow', icon: <Clock className="w-4 h-4" /> },
  'sent': { label: 'Sent', color: 'blue', icon: <Send className="w-4 h-4" /> },
  'delivered': { label: 'Delivered', color: 'green', icon: <CheckCircle className="w-4 h-4" /> },
  'failed': { label: 'Failed', color: 'red', icon: <AlertCircle className="w-4 h-4" /> },
  'cancelled': { label: 'Cancelled', color: 'gray', icon: <X className="w-4 h-4" /> },
};

const REMINDER_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'refill-due': { label: 'Refill Due', color: 'orange', icon: <AlertTriangle className="w-4 h-4" /> },
  'refill-ready': { label: 'Refill Ready', color: 'green', icon: <CheckCircle className="w-4 h-4" /> },
  'pickup': { label: 'Pickup Reminder', color: 'blue', icon: <Bell className="w-4 h-4" /> },
  'expired': { label: 'Rx Expired', color: 'red', icon: <AlertCircle className="w-4 h-4" /> },
  'custom': { label: 'Custom', color: 'purple', icon: <MessageSquare className="w-4 h-4" /> },
};

const CONTACT_METHOD_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  'phone': { label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  'email': { label: 'Email', icon: <Mail className="w-4 h-4" /> },
  'sms': { label: 'SMS', icon: <MessageSquare className="w-4 h-4" /> },
};

const DEFAULT_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'template-1',
    name: 'Refill Due - 5 Days',
    type: 'refill-due',
    subject: 'Time to Refill Your Prescription',
    message: 'Hi {patientName}, your prescription for {drugName} is due for a refill in {daysUntilDue} days. Please contact us or visit our pharmacy to request a refill.',
    daysBeforeDue: 5,
  },
  {
    id: 'template-2',
    name: 'Refill Ready',
    type: 'refill-ready',
    subject: 'Your Prescription is Ready',
    message: 'Hi {patientName}, your prescription for {drugName} is ready for pickup at our pharmacy.',
    daysBeforeDue: 0,
  },
  {
    id: 'template-3',
    name: 'Pickup Reminder',
    type: 'pickup',
    subject: 'Prescription Pickup Reminder',
    message: 'Hi {patientName}, this is a reminder that your prescription for {drugName} is waiting for pickup. Prescriptions are returned to stock after 10 days.',
    daysBeforeDue: 0,
  },
  {
    id: 'template-4',
    name: 'Rx Expiring',
    type: 'expired',
    subject: 'Prescription Expiring Soon',
    message: 'Hi {patientName}, your prescription for {drugName} will expire on {expirationDate}. Please contact your doctor for a new prescription if you need to continue this medication.',
    daysBeforeDue: 30,
  },
];

const createNewPatient = (): Patient => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  preferredContact: 'phone',
  doNotContact: false,
  notes: '',
});

const createNewMedication = (): Medication => ({
  id: crypto.randomUUID(),
  patientId: '',
  rxNumber: '',
  drugName: '',
  strength: '',
  daysSupply: 30,
  lastFillDate: new Date().toISOString().split('T')[0],
  refillsRemaining: 0,
  autoRefill: false,
  status: 'active',
});

const createNewReminder = (): Reminder => ({
  id: crypto.randomUUID(),
  medicationId: '',
  patientId: '',
  reminderType: 'refill-due',
  scheduledDate: new Date().toISOString().split('T')[0],
  scheduledTime: '09:00',
  contactMethod: 'phone',
  status: 'pending',
  message: '',
  createdAt: new Date().toISOString(),
});

export const RefillReminderTool: React.FC<RefillReminderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // UI State
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use hooks for data management
  const {
    data: reminders,
    addItem: addReminder,
    updateItem: updateReminder,
    deleteItem: deleteReminder,
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
  } = useToolData<Reminder>(TOOL_ID, [], reminderColumns);

  const {
    data: patients,
    addItem: addPatient,
    updateItem: updatePatient,
    deleteItem: deletePatient,
  } = useToolData<Patient>(`${TOOL_ID}-patients`, [], patientColumns);

  const {
    data: medications,
    addItem: addMedication,
    updateItem: updateMedication,
    deleteItem: deleteMedication,
  } = useToolData<Medication>(`${TOOL_ID}-medications`, [], []);

  const {
    data: templates,
    addItem: addTemplate,
    updateItem: updateTemplate,
    deleteItem: deleteTemplate,
  } = useToolData<ReminderTemplate>(`${TOOL_ID}-templates`, DEFAULT_TEMPLATES, []);

  // UI State
  const [activeTab, setActiveTab] = useState<'reminders' | 'patients' | 'medications' | 'templates' | 'settings'>('reminders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ReminderTemplate | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [pendingDeleteReminder, setPendingDeleteReminder] = useState<string | null>(null);
  const [pendingDeletePatient, setPendingDeletePatient] = useState<string | null>(null);
  const [pendingDeleteMedication, setPendingDeleteMedication] = useState<string | null>(null);
  const [pendingDeleteTemplate, setPendingDeleteTemplate] = useState<string | null>(null);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patientName || params.drugName) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const pendingToday = reminders.filter(r =>
      r.status === 'pending' && r.scheduledDate === today
    ).length;
    const sentToday = reminders.filter(r =>
      r.status === 'sent' && r.sentAt?.startsWith(today)
    ).length;
    const failedRecent = reminders.filter(r =>
      r.status === 'failed'
    ).length;

    // Calculate medications due for refill
    const medicationsDue = medications.filter(med => {
      if (med.status !== 'active') return false;
      const lastFill = new Date(med.lastFillDate);
      const dueDate = new Date(lastFill);
      dueDate.setDate(dueDate.getDate() + med.daysSupply);
      const diffDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;

    return {
      totalReminders: reminders.length,
      pendingToday,
      sentToday,
      failedRecent,
      medicationsDue,
      totalPatients: patients.length,
      activeMedications: medications.filter(m => m.status === 'active').length,
    };
  }, [reminders, patients, medications]);

  // Filtered reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const patient = patients.find(p => p.id === r.patientId);
      const medication = medications.find(m => m.id === r.medicationId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
      const drugName = medication?.drugName || '';

      const matchesSearch = searchQuery === '' ||
        patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drugName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === '' || r.status === filterStatus;
      const matchesType = filterType === '' || r.reminderType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reminders, patients, medications, searchQuery, filterStatus, filterType]);

  // Helper functions
  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
  };

  const getMedicationName = (medicationId: string): string => {
    const medication = medications.find(m => m.id === medicationId);
    return medication ? `${medication.drugName} ${medication.strength}` : 'Unknown';
  };

  const getRefillDueDate = (medication: Medication): Date => {
    const lastFill = new Date(medication.lastFillDate);
    const dueDate = new Date(lastFill);
    dueDate.setDate(dueDate.getDate() + medication.daysSupply);
    return dueDate;
  };

  const getDaysUntilDue = (medication: Medication): number => {
    const dueDate = getRefillDueDate(medication);
    return Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  // Handlers
  const handleSaveReminder = () => {
    if (!editingReminder) return;
    if (!editingReminder.patientId || !editingReminder.medicationId) {
      setValidationMessage('Please select a patient and medication');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (reminders.find(r => r.id === editingReminder.id)) {
      updateReminder(editingReminder.id, editingReminder);
    } else {
      addReminder(editingReminder);
    }

    setShowReminderModal(false);
    setEditingReminder(null);
  };

  const handleSavePatient = () => {
    if (!editingPatient) return;
    if (!editingPatient.firstName || !editingPatient.lastName) {
      setValidationMessage('Please enter patient name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (patients.find(p => p.id === editingPatient.id)) {
      updatePatient(editingPatient.id, editingPatient);
    } else {
      addPatient(editingPatient);
    }

    setShowPatientModal(false);
    setEditingPatient(null);
  };

  const handleSaveMedication = () => {
    if (!editingMedication) return;
    if (!editingMedication.patientId || !editingMedication.drugName) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (medications.find(m => m.id === editingMedication.id)) {
      updateMedication(editingMedication.id, editingMedication);
    } else {
      addMedication(editingMedication);
    }

    setShowMedicationModal(false);
    setEditingMedication(null);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name || !editingTemplate.message) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (templates.find(t => t.id === editingTemplate.id)) {
      updateTemplate(editingTemplate.id, editingTemplate);
    } else {
      addTemplate(editingTemplate);
    }

    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleSendReminder = (reminder: Reminder) => {
    updateReminder(reminder.id, {
      status: 'sent',
      sentAt: new Date().toISOString(),
    });
  };

  const handleCancelReminder = (reminder: Reminder) => {
    updateReminder(reminder.id, {
      status: 'cancelled',
    });
  };

  const handleGenerateReminders = () => {
    // Auto-generate reminders for medications due soon
    medications
      .filter(med => med.status === 'active')
      .forEach(med => {
        const daysUntilDue = getDaysUntilDue(med);

        // Check if reminder already exists
        const existingReminder = reminders.find(r =>
          r.medicationId === med.id &&
          r.reminderType === 'refill-due' &&
          r.status === 'pending'
        );

        if (!existingReminder && daysUntilDue <= 7 && daysUntilDue > 0) {
          const patient = patients.find(p => p.id === med.patientId);
          if (patient && !patient.doNotContact) {
            const template = templates.find(t => t.type === 'refill-due');
            const newReminder = createNewReminder();
            newReminder.medicationId = med.id;
            newReminder.patientId = med.patientId;
            newReminder.reminderType = 'refill-due';
            newReminder.contactMethod = patient.preferredContact === 'all' ? 'phone' : patient.preferredContact;
            newReminder.message = template?.message
              .replace('{patientName}', `${patient.firstName}`)
              .replace('{drugName}', med.drugName)
              .replace('{daysUntilDue}', daysUntilDue.toString()) || '';

            addReminder(newReminder);
          }
        }
      });

    setValidationMessage('Reminders generated for medications due within 7 days');
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Export handlers
  const handleExportCSV = () => exportCSV({ filename: 'refill-reminders' });
  const handleExportExcel = () => exportExcel({ filename: 'refill-reminders' });
  const handleExportJSON = () => exportJSON({ filename: 'refill-reminders' });
  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'refill-reminders',
      title: 'Refill Reminders',
      subtitle: `Total: ${filteredReminders.length} reminders`,
    });
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.refillReminder.refillReminders', 'Refill Reminders')}</h1>
            <p className={textSecondary}>{t('tools.refillReminder.managePatientRefillNotifications', 'Manage patient refill notifications')}</p>
          </div>
          {isPrefilled && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Prefilled
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="refill-reminder" toolName="Refill Reminder" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onCopy={() => copyToClipboard('tab')}
            onPrint={() => print('Refill Reminders')}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-purple-500" />
            <span className={textSecondary}>{t('tools.refillReminder.total', 'Total')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalReminders}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={textSecondary}>{t('tools.refillReminder.pendingToday', 'Pending Today')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.pendingToday}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-blue-500" />
            <span className={textSecondary}>{t('tools.refillReminder.sentToday', 'Sent Today')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.sentToday}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={textSecondary}>{t('tools.refillReminder.failed', 'Failed')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.failedRecent}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className={textSecondary}>{t('tools.refillReminder.dueSoon', 'Due Soon')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.medicationsDue}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-green-500" />
            <span className={textSecondary}>{t('tools.refillReminder.patients', 'Patients')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalPatients}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-indigo-500" />
            <span className={textSecondary}>{t('tools.refillReminder.activeMeds', 'Active Meds')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.activeMedications}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${cardBg} ${borderColor} border rounded-lg mb-6`}>
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {(['reminders', 'patients', 'medications', 'templates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : `${textSecondary} hover:text-purple-500`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.refillReminder.search', 'Search...')}
              className={`w-full pl-10 pr-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
            />
          </div>
          {activeTab === 'reminders' && (
            <>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
              >
                <option value="">{t('tools.refillReminder.allStatuses', 'All Statuses')}</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
              >
                <option value="">{t('tools.refillReminder.allTypes', 'All Types')}</option>
                {Object.entries(REMINDER_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <button
                onClick={handleGenerateReminders}
                className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Auto-Generate
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (activeTab === 'patients') {
                setEditingPatient(createNewPatient());
                setShowPatientModal(true);
              } else if (activeTab === 'medications') {
                setEditingMedication(createNewMedication());
                setShowMedicationModal(true);
              } else if (activeTab === 'templates') {
                setEditingTemplate({
                  id: crypto.randomUUID(),
                  name: '',
                  type: 'custom',
                  subject: '',
                  message: '',
                  daysBeforeDue: 0,
                });
                setShowTemplateModal(true);
              } else {
                setEditingReminder(createNewReminder());
                setShowReminderModal(true);
              }
            }}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'patients' ? 'Patient' : activeTab === 'medications' ? 'Medication' : activeTab === 'templates' ? t('tools.refillReminder.template', 'Template') : t('tools.refillReminder.reminder', 'Reminder')}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : activeTab === 'reminders' ? (
            <div className="space-y-3">
              {filteredReminders.length === 0 ? (
                <div className={`text-center py-12 ${textSecondary}`}>
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.refillReminder.noRemindersFound', 'No reminders found')}</p>
                </div>
              ) : (
                filteredReminders
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`${cardBg} ${borderColor} border rounded-lg p-4`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            REMINDER_TYPE_CONFIG[reminder.reminderType].color === 'orange' ? 'bg-orange-100' :
                            REMINDER_TYPE_CONFIG[reminder.reminderType].color === 'green' ? 'bg-green-100' :
                            REMINDER_TYPE_CONFIG[reminder.reminderType].color === 'blue' ? 'bg-blue-100' :
                            REMINDER_TYPE_CONFIG[reminder.reminderType].color === 'red' ? 'bg-red-100' :
                            'bg-purple-100'
                          }`}>
                            {REMINDER_TYPE_CONFIG[reminder.reminderType].icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${textPrimary}`}>
                                {getPatientName(reminder.patientId)}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                STATUS_CONFIG[reminder.status].color === 'green' ? 'bg-green-100 text-green-700' :
                                STATUS_CONFIG[reminder.status].color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                STATUS_CONFIG[reminder.status].color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                STATUS_CONFIG[reminder.status].color === 'red' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {STATUS_CONFIG[reminder.status].label}
                              </span>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>
                              {getMedicationName(reminder.medicationId)}
                            </p>
                            <div className={`flex items-center gap-4 text-sm ${textSecondary} mt-1`}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {reminder.scheduledDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reminder.scheduledTime}
                              </span>
                              <span className="flex items-center gap-1">
                                {CONTACT_METHOD_CONFIG[reminder.contactMethod].icon}
                                {CONTACT_METHOD_CONFIG[reminder.contactMethod].label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {reminder.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleSendReminder(reminder)}
                                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded flex items-center gap-1 transition-colors"
                              >
                                <Send className="w-3 h-3" /> Send
                              </button>
                              <button
                                onClick={() => handleCancelReminder(reminder)}
                                className={`px-3 py-1 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded transition-colors`}
                              >
                                {t('tools.refillReminder.cancel', 'Cancel')}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setEditingReminder(reminder);
                              setShowReminderModal(true);
                            }}
                            className={`p-1 ${textSecondary} hover:text-purple-500`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const result = await confirm({
                                title: 'Delete Reminder',
                                message: 'Are you sure you want to delete this reminder? This action cannot be undone.',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                variant: 'danger',
                              });
                              if (result) {
                                deleteReminder(reminder.id);
                              }
                            }}
                            className={`p-1 ${textSecondary} hover:text-red-500`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          ) : activeTab === 'patients' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients
                .filter(p =>
                  searchQuery === '' ||
                  `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.phone.includes(searchQuery) ||
                  p.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((patient) => (
                  <div key={patient.id} className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          patient.doNotContact ? 'bg-red-100' : 'bg-purple-100'
                        }`}>
                          {patient.doNotContact ? (
                            <BellOff className="w-5 h-5 text-red-600" />
                          ) : (
                            <User className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${textPrimary}`}>
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className={`text-sm ${textSecondary}`}>
                            {CONTACT_METHOD_CONFIG[patient.preferredContact].label}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingPatient(patient);
                            setShowPatientModal(true);
                          }}
                          className={`p-1 ${textSecondary} hover:text-purple-500`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            const result = await confirm({
                              title: 'Delete Patient',
                              message: 'Are you sure you want to delete this patient? This action cannot be undone.',
                              confirmText: 'Delete',
                              cancelText: 'Cancel',
                              variant: 'danger',
                            });
                            if (result) {
                              deletePatient(patient.id);
                            }
                          }}
                          className={`p-1 ${textSecondary} hover:text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`space-y-1 text-sm ${textSecondary}`}>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {patient.phone || 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {patient.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : activeTab === 'medications' ? (
            <div className="space-y-3">
              {medications
                .filter(m =>
                  searchQuery === '' ||
                  m.drugName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.rxNumber.includes(searchQuery)
                )
                .map((medication) => {
                  const daysUntilDue = getDaysUntilDue(medication);
                  return (
                    <div key={medication.id} className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            medication.status === 'active' ? 'bg-green-100' :
                            medication.status === 'on-hold' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            <Pill className={`w-5 h-5 ${
                              medication.status === 'active' ? 'text-green-600' :
                              medication.status === 'on-hold' ? 'text-yellow-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${textPrimary}`}>
                              {medication.drugName} {medication.strength}
                            </h3>
                            <p className={`text-sm ${textSecondary}`}>
                              Rx#: {medication.rxNumber} | {getPatientName(medication.patientId)}
                            </p>
                            <div className={`flex items-center gap-4 text-sm ${textSecondary} mt-1`}>
                              <span>{medication.daysSupply} day supply</span>
                              <span>{medication.refillsRemaining} refills left</span>
                              {medication.autoRefill && (
                                <span className="text-green-600">{t('tools.refillReminder.autoRefill', 'Auto-refill')}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {medication.status === 'active' && daysUntilDue <= 7 && (
                            <span className={`px-2 py-1 rounded text-sm ${
                              daysUntilDue <= 0 ? 'bg-red-100 text-red-700' :
                              daysUntilDue <= 3 ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {daysUntilDue <= 0 ? 'Overdue' : `Due in ${daysUntilDue} days`}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setEditingMedication(medication);
                              setShowMedicationModal(true);
                            }}
                            className={`p-1 ${textSecondary} hover:text-purple-500`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const result = await confirm({
                                title: 'Delete Medication',
                                message: 'Are you sure you want to delete this medication? This action cannot be undone.',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                variant: 'danger',
                              });
                              if (result) {
                                deleteMedication(medication.id);
                              }
                            }}
                            className={`p-1 ${textSecondary} hover:text-red-500`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            /* Templates Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${textPrimary}`}>{template.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        REMINDER_TYPE_CONFIG[template.type].color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        REMINDER_TYPE_CONFIG[template.type].color === 'green' ? 'bg-green-100 text-green-700' :
                        REMINDER_TYPE_CONFIG[template.type].color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        REMINDER_TYPE_CONFIG[template.type].color === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {REMINDER_TYPE_CONFIG[template.type].label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateModal(true);
                        }}
                        className={`p-1 ${textSecondary} hover:text-purple-500`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const result = await confirm({
                            title: 'Delete Template',
                            message: 'Are you sure you want to delete this template? This action cannot be undone.',
                            confirmText: 'Delete',
                            cancelText: 'Cancel',
                            variant: 'danger',
                          });
                          if (result) {
                            deleteTemplate(template.id);
                          }
                        }}
                        className={`p-1 ${textSecondary} hover:text-red-500`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${textSecondary}`}>{template.message}</p>
                  {template.daysBeforeDue > 0 && (
                    <p className={`text-xs mt-2 ${textSecondary}`}>
                      Sends {template.daysBeforeDue} days before due
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && editingReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {reminders.find(r => r.id === editingReminder.id) ? t('tools.refillReminder.editReminder', 'Edit Reminder') : t('tools.refillReminder.newReminder', 'New Reminder')}
              </h2>
              <button onClick={() => { setShowReminderModal(false); setEditingReminder(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.patient', 'Patient *')}</label>
                <select
                  value={editingReminder.patientId}
                  onChange={(e) => setEditingReminder({ ...editingReminder, patientId: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                >
                  <option value="">{t('tools.refillReminder.selectPatient', 'Select Patient')}</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.medication', 'Medication *')}</label>
                <select
                  value={editingReminder.medicationId}
                  onChange={(e) => setEditingReminder({ ...editingReminder, medicationId: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                >
                  <option value="">{t('tools.refillReminder.selectMedication', 'Select Medication')}</option>
                  {medications
                    .filter(m => !editingReminder.patientId || m.patientId === editingReminder.patientId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>{m.drugName} {m.strength}</option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.type', 'Type')}</label>
                  <select
                    value={editingReminder.reminderType}
                    onChange={(e) => setEditingReminder({ ...editingReminder, reminderType: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    {Object.entries(REMINDER_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.contactMethod', 'Contact Method')}</label>
                  <select
                    value={editingReminder.contactMethod}
                    onChange={(e) => setEditingReminder({ ...editingReminder, contactMethod: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    {Object.entries(CONTACT_METHOD_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.date', 'Date')}</label>
                  <input
                    type="date"
                    value={editingReminder.scheduledDate}
                    onChange={(e) => setEditingReminder({ ...editingReminder, scheduledDate: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.time', 'Time')}</label>
                  <input
                    type="time"
                    value={editingReminder.scheduledTime}
                    onChange={(e) => setEditingReminder({ ...editingReminder, scheduledTime: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.message', 'Message')}</label>
                <textarea
                  value={editingReminder.message}
                  onChange={(e) => setEditingReminder({ ...editingReminder, message: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.refillReminder.enterReminderMessage', 'Enter reminder message...')}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowReminderModal(false); setEditingReminder(null); }}
                className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                {t('tools.refillReminder.cancel2', 'Cancel')}
              </button>
              <button onClick={handleSaveReminder} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Modal */}
      {showPatientModal && editingPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {patients.find(p => p.id === editingPatient.id) ? t('tools.refillReminder.editPatient', 'Edit Patient') : t('tools.refillReminder.newPatient', 'New Patient')}
              </h2>
              <button onClick={() => { setShowPatientModal(false); setEditingPatient(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={editingPatient.firstName}
                    onChange={(e) => setEditingPatient({ ...editingPatient, firstName: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={editingPatient.lastName}
                    onChange={(e) => setEditingPatient({ ...editingPatient, lastName: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.email', 'Email')}</label>
                  <input
                    type="email"
                    value={editingPatient.email}
                    onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.preferredContact', 'Preferred Contact')}</label>
                <select
                  value={editingPatient.preferredContact}
                  onChange={(e) => setEditingPatient({ ...editingPatient, preferredContact: e.target.value as any })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                >
                  <option value="phone">{t('tools.refillReminder.phone2', 'Phone')}</option>
                  <option value="email">{t('tools.refillReminder.email2', 'Email')}</option>
                  <option value="sms">{t('tools.refillReminder.sms', 'SMS')}</option>
                  <option value="all">{t('tools.refillReminder.allMethods', 'All Methods')}</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPatient.doNotContact}
                  onChange={(e) => setEditingPatient({ ...editingPatient, doNotContact: e.target.checked })}
                  className="w-4 h-4 text-purple-500"
                />
                <span className={textSecondary}>{t('tools.refillReminder.doNotContact', 'Do Not Contact')}</span>
              </label>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.notes', 'Notes')}</label>
                <textarea
                  value={editingPatient.notes}
                  onChange={(e) => setEditingPatient({ ...editingPatient, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setShowPatientModal(false); setEditingPatient(null); }} className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
                {t('tools.refillReminder.cancel3', 'Cancel')}
              </button>
              <button onClick={handleSavePatient} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medication Modal */}
      {showMedicationModal && editingMedication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {medications.find(m => m.id === editingMedication.id) ? t('tools.refillReminder.editMedication', 'Edit Medication') : t('tools.refillReminder.newMedication', 'New Medication')}
              </h2>
              <button onClick={() => { setShowMedicationModal(false); setEditingMedication(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.patient2', 'Patient *')}</label>
                <select
                  value={editingMedication.patientId}
                  onChange={(e) => setEditingMedication({ ...editingMedication, patientId: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                >
                  <option value="">{t('tools.refillReminder.selectPatient2', 'Select Patient')}</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.drugName', 'Drug Name *')}</label>
                  <input
                    type="text"
                    value={editingMedication.drugName}
                    onChange={(e) => setEditingMedication({ ...editingMedication, drugName: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.strength', 'Strength')}</label>
                  <input
                    type="text"
                    value={editingMedication.strength}
                    onChange={(e) => setEditingMedication({ ...editingMedication, strength: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.rxNumber', 'Rx Number')}</label>
                  <input
                    type="text"
                    value={editingMedication.rxNumber}
                    onChange={(e) => setEditingMedication({ ...editingMedication, rxNumber: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.daysSupply', 'Days Supply')}</label>
                  <input
                    type="number"
                    value={editingMedication.daysSupply}
                    onChange={(e) => setEditingMedication({ ...editingMedication, daysSupply: parseInt(e.target.value) || 30 })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.lastFillDate', 'Last Fill Date')}</label>
                  <input
                    type="date"
                    value={editingMedication.lastFillDate}
                    onChange={(e) => setEditingMedication({ ...editingMedication, lastFillDate: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.refillsRemaining', 'Refills Remaining')}</label>
                  <input
                    type="number"
                    value={editingMedication.refillsRemaining}
                    onChange={(e) => setEditingMedication({ ...editingMedication, refillsRemaining: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.status', 'Status')}</label>
                  <select
                    value={editingMedication.status}
                    onChange={(e) => setEditingMedication({ ...editingMedication, status: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="active">{t('tools.refillReminder.active', 'Active')}</option>
                    <option value="on-hold">{t('tools.refillReminder.onHold', 'On Hold')}</option>
                    <option value="discontinued">{t('tools.refillReminder.discontinued', 'Discontinued')}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      checked={editingMedication.autoRefill}
                      onChange={(e) => setEditingMedication({ ...editingMedication, autoRefill: e.target.checked })}
                      className="w-4 h-4 text-purple-500"
                    />
                    <span className={textSecondary}>{t('tools.refillReminder.autoRefill2', 'Auto-Refill')}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setShowMedicationModal(false); setEditingMedication(null); }} className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
                {t('tools.refillReminder.cancel4', 'Cancel')}
              </button>
              <button onClick={handleSaveMedication} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {templates.find(t => t.id === editingTemplate.id) ? t('tools.refillReminder.editTemplate', 'Edit Template') : t('tools.refillReminder.newTemplate', 'New Template')}
              </h2>
              <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.templateName', 'Template Name *')}</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.type2', 'Type')}</label>
                  <select
                    value={editingTemplate.type}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    {Object.entries(REMINDER_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.daysBeforeDue', 'Days Before Due')}</label>
                  <input
                    type="number"
                    value={editingTemplate.daysBeforeDue}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, daysBeforeDue: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.subject', 'Subject')}</label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.refillReminder.message2', 'Message *')}</label>
                <textarea
                  value={editingTemplate.message}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                  rows={4}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.refillReminder.usePatientnameDrugnameDaysuntildueAs', 'Use {patientName}, {drugName}, {daysUntilDue} as placeholders')}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
                {t('tools.refillReminder.cancel5', 'Cancel')}
              </button>
              <button onClick={handleSaveTemplate} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-[101]">
          <div className={`${isDark ? 'bg-yellow-900' : 'bg-yellow-100'} ${isDark ? 'text-yellow-100' : 'text-yellow-800'} px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">{validationMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefillReminderTool;
