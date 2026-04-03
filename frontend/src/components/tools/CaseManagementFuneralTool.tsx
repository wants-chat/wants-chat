'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
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
import {
  Folder,
  User,
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  Users,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

// Types
interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

interface DeceasedInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfDeath: string;
  socialSecurityNumber: string;
  veteranStatus: boolean;
  religion: string;
  occupation: string;
  birthplace: string;
  residence: string;
}

interface CaseTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface CaseNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface FuneralCase {
  id: string;
  caseNumber: string;
  status: 'intake' | 'arrangements' | 'pending_service' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  deceased: DeceasedInfo;
  nextOfKin: NextOfKin;
  serviceDate: string;
  serviceTime: string;
  serviceLocation: string;
  estimatedTotal: number;
  depositPaid: number;
  balanceDue: number;
  tasks: CaseTask[];
  notes: CaseNote[];
  assignedStaff: string[];
  documents: string[];
}

// Column configuration for export
const caseColumns: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'deceasedName', header: 'Deceased Name', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'serviceDate', header: 'Service Date', type: 'date' },
  { key: 'nextOfKinName', header: 'Next of Kin', type: 'string' },
  { key: 'nextOfKinPhone', header: 'Contact Phone', type: 'string' },
  { key: 'estimatedTotal', header: 'Estimated Total', type: 'currency' },
  { key: 'balanceDue', header: 'Balance Due', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const statusConfig = {
  intake: { label: 'Intake', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: ClipboardList },
  arrangements: { label: 'Arrangements', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: FileText },
  pending_service: { label: 'Pending Service', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', icon: Folder },
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-blue-500' },
  high: { label: 'High', color: 'text-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-500' },
};

const generateCaseNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `FH-${year}-${random}`;
};

const createEmptyCase = (): FuneralCase => ({
  id: crypto.randomUUID(),
  caseNumber: generateCaseNumber(),
  status: 'intake',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deceased: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    dateOfDeath: '',
    placeOfDeath: '',
    socialSecurityNumber: '',
    veteranStatus: false,
    religion: '',
    occupation: '',
    birthplace: '',
    residence: '',
  },
  nextOfKin: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
  },
  serviceDate: '',
  serviceTime: '',
  serviceLocation: '',
  estimatedTotal: 0,
  depositPaid: 0,
  balanceDue: 0,
  tasks: [],
  notes: [],
  assignedStaff: [],
  documents: [],
});

interface CaseManagementFuneralToolProps {
  uiConfig?: UIConfig;
}

export const CaseManagementFuneralTool: React.FC<CaseManagementFuneralToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'notes' | 'documents'>('details');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Initialize useToolData hook for backend persistence
  const {
    data: cases,
    updateItem,
    addItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<FuneralCase>(
    'funeral-case-management',
    [],
    caseColumns,
    { autoSave: true }
  );

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.firstName || params.lastName || params.name) {
        const newCase = createEmptyCase();
        if (params.name) {
          const nameParts = params.name.split(' ');
          newCase.deceased.firstName = nameParts[0] || '';
          newCase.deceased.lastName = nameParts.slice(1).join(' ') || '';
        } else {
          newCase.deceased.firstName = params.firstName || '';
          newCase.deceased.lastName = params.lastName || '';
        }
        if (params.phone) newCase.nextOfKin.phone = params.phone;
        if (params.email) newCase.nextOfKin.email = params.email;
        addItem(newCase);
        setSelectedCaseId(newCase.id);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = searchTerm === '' ||
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${c.deceased.firstName} ${c.deceased.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nextOfKin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cases, searchTerm, statusFilter]);

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // Case CRUD operations
  const handleCreateCase = () => {
    const newCase = createEmptyCase();
    addItem(newCase);
    setSelectedCaseId(newCase.id);
    setShowNewCaseForm(false);
  };

  const handleUpdateCase = (updates: Partial<FuneralCase>) => {
    if (!selectedCase) return;
    updateItem(selectedCase.id, { ...selectedCase, ...updates, updatedAt: new Date().toISOString() });
  };

  const handleDeleteCase = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this case?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedCaseId === id) setSelectedCaseId(null);
    }
  };

  // Task operations
  const handleAddTask = (task: Omit<CaseTask, 'id'>) => {
    if (!selectedCase) return;
    const newTask: CaseTask = { ...task, id: crypto.randomUUID() };
    handleUpdateCase({ tasks: [...selectedCase.tasks, newTask] });
    setShowTaskForm(false);
  };

  const handleToggleTask = (taskId: string) => {
    if (!selectedCase) return;
    handleUpdateCase({
      tasks: selectedCase.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedCase) return;
    handleUpdateCase({ tasks: selectedCase.tasks.filter(t => t.id !== taskId) });
  };

  // Note operations
  const handleAddNote = (content: string) => {
    if (!selectedCase) return;
    const newNote: CaseNote = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
    };
    handleUpdateCase({ notes: [...selectedCase.notes, newNote] });
    setShowNoteForm(false);
  };

  // Export data preparation
  const getExportData = () => {
    return cases.map(c => ({
      caseNumber: c.caseNumber,
      deceasedName: `${c.deceased.firstName} ${c.deceased.lastName}`.trim(),
      status: statusConfig[c.status].label,
      serviceDate: c.serviceDate || 'TBD',
      nextOfKinName: c.nextOfKin.name,
      nextOfKinPhone: c.nextOfKin.phone,
      estimatedTotal: c.estimatedTotal,
      balanceDue: c.balanceDue,
      createdAt: c.createdAt,
    }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Folder className="w-7 h-7 text-purple-500" />
              Funeral Case Management
              {isPrefilled && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-filled
                </span>
              )}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.caseManagementFuneral.trackAndManageFuneralCases', 'Track and manage funeral cases from intake to completion')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="case-management-funeral" toolName="Case Management Funeral" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              data={getExportData()}
              columns={caseColumns}
              filename="funeral-cases"
              onExportCSV={() => exportToCSV(getExportData(), caseColumns, 'funeral-cases')}
              onExportExcel={() => exportToExcel(getExportData(), caseColumns, 'funeral-cases')}
              onExportJSON={() => exportToJSON(getExportData(), 'funeral-cases')}
              onExportPDF={() => exportToPDF(getExportData(), caseColumns, 'funeral-cases', 'Funeral Cases Report')}
              onCopy={() => copyUtil(getExportData(), caseColumns)}
              onPrint={() => printData(getExportData(), caseColumns, 'Funeral Cases Report')}
            />
            <button
              onClick={handleCreateCase}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.caseManagementFuneral.newCase', 'New Case')}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = cases.filter(c => c.status === status).length;
            const Icon = config.icon;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={`p-4 rounded-lg border transition-all ${
                  statusFilter === status
                    ? 'ring-2 ring-purple-500'
                    : ''
                } ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </button>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.caseManagementFuneral.searchCasesByNumberName', 'Search cases by number, name, or contact...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.caseManagementFuneral.allStatuses', 'All Statuses')}</option>
            {Object.entries(statusConfig).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className={`lg:col-span-1 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Cases ({filteredCases.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredCases.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.caseManagementFuneral.noCasesFound', 'No cases found')}</p>
                  <button
                    onClick={handleCreateCase}
                    className="mt-2 text-purple-600 hover:underline"
                  >
                    {t('tools.caseManagementFuneral.createYourFirstCase', 'Create your first case')}
                  </button>
                </div>
              ) : (
                filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedCaseId === c.id
                        ? theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{c.caseNumber}</p>
                        <p className="text-sm text-gray-500">
                          {c.deceased.firstName} {c.deceased.lastName || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[c.status].color}`}>
                        {statusConfig[c.status].label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(c.serviceDate) || 'TBD'}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" />
                        {c.tasks.filter(t => !t.completed).length} tasks
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Case Details */}
          <div className={`lg:col-span-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {selectedCase ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">{selectedCase.caseNumber}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedCase.deceased.firstName} {selectedCase.deceased.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCase.status}
                      onChange={(e) => handleUpdateCase({ status: e.target.value as FuneralCase['status'] })}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <option key={status} value={status}>{config.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteCase(selectedCase.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    {(['details', 'tasks', 'notes', 'documents'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Deceased Information */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> Deceased Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.firstName', 'First Name')}</label>
                            <input
                              type="text"
                              value={selectedCase.deceased.firstName}
                              onChange={(e) => handleUpdateCase({
                                deceased: { ...selectedCase.deceased, firstName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.lastName', 'Last Name')}</label>
                            <input
                              type="text"
                              value={selectedCase.deceased.lastName}
                              onChange={(e) => handleUpdateCase({
                                deceased: { ...selectedCase.deceased, lastName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.dateOfBirth', 'Date of Birth')}</label>
                            <input
                              type="date"
                              value={selectedCase.deceased.dateOfBirth}
                              onChange={(e) => handleUpdateCase({
                                deceased: { ...selectedCase.deceased, dateOfBirth: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.dateOfDeath', 'Date of Death')}</label>
                            <input
                              type="date"
                              value={selectedCase.deceased.dateOfDeath}
                              onChange={(e) => handleUpdateCase({
                                deceased: { ...selectedCase.deceased, dateOfDeath: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Next of Kin */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" /> Next of Kin
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.name', 'Name')}</label>
                            <input
                              type="text"
                              value={selectedCase.nextOfKin.name}
                              onChange={(e) => handleUpdateCase({
                                nextOfKin: { ...selectedCase.nextOfKin, name: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.relationship', 'Relationship')}</label>
                            <input
                              type="text"
                              value={selectedCase.nextOfKin.relationship}
                              onChange={(e) => handleUpdateCase({
                                nextOfKin: { ...selectedCase.nextOfKin, relationship: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.phone', 'Phone')}</label>
                            <input
                              type="tel"
                              value={selectedCase.nextOfKin.phone}
                              onChange={(e) => handleUpdateCase({
                                nextOfKin: { ...selectedCase.nextOfKin, phone: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.email', 'Email')}</label>
                            <input
                              type="email"
                              value={selectedCase.nextOfKin.email}
                              onChange={(e) => handleUpdateCase({
                                nextOfKin: { ...selectedCase.nextOfKin, email: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Service Information */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Service Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.serviceDate', 'Service Date')}</label>
                            <input
                              type="date"
                              value={selectedCase.serviceDate}
                              onChange={(e) => handleUpdateCase({ serviceDate: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.serviceTime', 'Service Time')}</label>
                            <input
                              type="time"
                              value={selectedCase.serviceTime}
                              onChange={(e) => handleUpdateCase({ serviceTime: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.serviceLocation', 'Service Location')}</label>
                            <input
                              type="text"
                              value={selectedCase.serviceLocation}
                              onChange={(e) => handleUpdateCase({ serviceLocation: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" /> Financial Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.estimatedTotal', 'Estimated Total')}</label>
                            <input
                              type="number"
                              value={selectedCase.estimatedTotal}
                              onChange={(e) => handleUpdateCase({
                                estimatedTotal: parseFloat(e.target.value) || 0,
                                balanceDue: (parseFloat(e.target.value) || 0) - selectedCase.depositPaid
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.depositPaid', 'Deposit Paid')}</label>
                            <input
                              type="number"
                              value={selectedCase.depositPaid}
                              onChange={(e) => handleUpdateCase({
                                depositPaid: parseFloat(e.target.value) || 0,
                                balanceDue: selectedCase.estimatedTotal - (parseFloat(e.target.value) || 0)
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.caseManagementFuneral.balanceDue', 'Balance Due')}</label>
                            <div className={`px-3 py-2 rounded-lg border font-medium ${
                              selectedCase.balanceDue > 0 ? 'text-red-500' : 'text-green-500'
                            } ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                              {formatCurrency(selectedCase.balanceDue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tasks' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Tasks ({selectedCase.tasks.length})</h3>
                        <button
                          onClick={() => setShowTaskForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          <Plus className="w-4 h-4" /> Add Task
                        </button>
                      </div>
                      {showTaskForm && (
                        <TaskForm
                          onSubmit={handleAddTask}
                          onCancel={() => setShowTaskForm(false)}
                          theme={theme}
                        />
                      )}
                      <div className="space-y-2">
                        {selectedCase.tasks.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.caseManagementFuneral.noTasksYet', 'No tasks yet')}</p>
                        ) : (
                          selectedCase.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => handleToggleTask(task.id)}
                                  className={`mt-0.5 ${task.completed ? 'text-green-500' : 'text-gray-400'}`}
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <div className="flex-1">
                                  <p className={task.completed ? 'line-through text-gray-500' : ''}>
                                    {task.title}
                                  </p>
                                  <p className="text-sm text-gray-500">{task.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs">
                                    <span className={priorityConfig[task.priority].color}>
                                      {priorityConfig[task.priority].label}
                                    </span>
                                    <span>Due: {formatDate(task.dueDate)}</span>
                                    {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Notes ({selectedCase.notes.length})</h3>
                        <button
                          onClick={() => setShowNoteForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          <Plus className="w-4 h-4" /> Add Note
                        </button>
                      </div>
                      {showNoteForm && (
                        <NoteForm
                          onSubmit={handleAddNote}
                          onCancel={() => setShowNoteForm(false)}
                          theme={theme}
                        />
                      )}
                      <div className="space-y-3">
                        {selectedCase.notes.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.caseManagementFuneral.noNotesYet', 'No notes yet')}</p>
                        ) : (
                          selectedCase.notes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-3 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{note.content}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>{note.createdBy}</span>
                                <span>-</span>
                                <span>{new Date(note.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('tools.caseManagementFuneral.documentManagementComingSoon', 'Document management coming soon')}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('tools.caseManagementFuneral.selectACaseToView', 'Select a case to view details')}</p>
                <p className="text-sm mt-1">{t('tools.caseManagementFuneral.orCreateANewCase', 'or create a new case to get started')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

// Task Form Component
const TaskForm: React.FC<{
  onSubmit: (task: Omit<CaseTask, 'id'>) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    completed: false,
    assignedTo: '',
    priority: 'medium' as CaseTask['priority'],
  });

  return (
    <div className={`p-4 mb-4 rounded-lg border ${
      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input
            type="text"
            placeholder={t('tools.caseManagementFuneral.taskTitle', 'Task title')}
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div className="col-span-2">
          <textarea
            placeholder={t('tools.caseManagementFuneral.description', 'Description')}
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border resize-none ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
            rows={2}
          />
        </div>
        <div>
          <input
            type="date"
            value={task.dueDate}
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <select
            value={task.priority}
            onChange={(e) => setTask({ ...task, priority: e.target.value as CaseTask['priority'] })}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            <option value="low">{t('tools.caseManagementFuneral.lowPriority', 'Low Priority')}</option>
            <option value="medium">{t('tools.caseManagementFuneral.mediumPriority', 'Medium Priority')}</option>
            <option value="high">{t('tools.caseManagementFuneral.highPriority', 'High Priority')}</option>
            <option value="urgent">{t('tools.caseManagementFuneral.urgent', 'Urgent')}</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          {t('tools.caseManagementFuneral.cancel', 'Cancel')}
        </button>
        <button
          onClick={() => task.title && onSubmit(task)}
          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {t('tools.caseManagementFuneral.addTask', 'Add Task')}
        </button>
      </div>
    </div>
  );
};

// Note Form Component
const NoteForm: React.FC<{
  onSubmit: (content: string) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const [content, setContent] = useState('');

  return (
    <div className={`p-4 mb-4 rounded-lg border ${
      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
    }`}>
      <textarea
        placeholder={t('tools.caseManagementFuneral.enterNote', 'Enter note...')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border resize-none ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}
        rows={4}
      />
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          {t('tools.caseManagementFuneral.cancel2', 'Cancel')}
        </button>
        <button
          onClick={() => content && onSubmit(content)}
          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {t('tools.caseManagementFuneral.addNote', 'Add Note')}
        </button>
      </div>
    </div>
  );
};

export default CaseManagementFuneralTool;
