'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  FileText,
  Gavel,
  Clock,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  Building,
  AlertCircle,
  CheckCircle,
  Pause,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MessageSquare,
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
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { useToolData } from '../../hooks/useToolData';

// Types
interface Case {
  id: string;
  case_number: string;
  title: string;
  client_name: string;
  case_type: 'civil' | 'criminal' | 'family' | 'corporate';
  description: string;
  status: 'open' | 'pending' | 'closed' | 'on_hold';
  assigned_attorney: string;
  court: string;
  filing_date: string;
  next_hearing_date: string;
  opposing_counsel_name?: string;
  opposing_counsel_firm?: string;
  opposing_counsel_phone?: string;
  opposing_counsel_email?: string;
  created_at: string;
  updated_at: string;
}

interface CaseNote {
  id: string;
  case_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

interface CaseDocument {
  id: string;
  case_id: string;
  name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

interface CaseHours {
  id: string;
  case_id: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  billed: boolean;
  created_at: string;
}

interface UIConfig {
  prefillData?: {
    case_number?: string;
    title?: string;
    client_name?: string;
    case_type?: Case['case_type'];
    description?: string;
    status?: Case['status'];
    assigned_attorney?: string;
    court?: string;
  };
  params?: Record<string, any>;
}

interface CaseManagerToolProps {
  uiConfig?: UIConfig;
}

const caseTypeOptions: { value: Case['case_type']; label: string; color: string }[] = [
  { value: 'civil', label: 'Civil', color: 'bg-blue-500' },
  { value: 'criminal', label: 'Criminal', color: 'bg-red-500' },
  { value: 'family', label: 'Family', color: 'bg-purple-500' },
  { value: 'corporate', label: 'Corporate', color: 'bg-emerald-500' },
];

const statusOptions: { value: Case['status']; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'open', label: 'Open', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' },
  { value: 'closed', label: 'Closed', icon: X, color: 'text-gray-500 bg-gray-500/10' },
  { value: 'on_hold', label: 'On Hold', icon: Pause, color: 'text-orange-500 bg-orange-500/10' },
];

const STORAGE_KEY = 'case-manager-data';

const COLUMNS: ColumnConfig[] = [
  { key: 'case_number', header: 'Case Number', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'client_name', header: 'Client Name', type: 'string' },
  { key: 'case_type', header: 'Case Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'assigned_attorney', header: 'Assigned Attorney', type: 'string' },
  { key: 'court', header: 'Court', type: 'string' },
  { key: 'filing_date', header: 'Filing Date', type: 'date' },
  { key: 'next_hearing_date', header: 'Next Hearing Date', type: 'date' },
  { key: 'opposing_counsel_name', header: 'Opposing Counsel', type: 'string' },
  { key: 'opposing_counsel_firm', header: 'Opposing Firm', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'created_at', header: 'Created At', type: 'date' },
];

// Default cases
const defaultCases: Case[] = [];

const defaultCase: Omit<Case, 'id' | 'created_at' | 'updated_at'> = {
  case_number: '',
  title: '',
  client_name: '',
  case_type: 'civil',
  description: '',
  status: 'open',
  assigned_attorney: '',
  court: '',
  filing_date: '',
  next_hearing_date: '',
  opposing_counsel_name: '',
  opposing_counsel_firm: '',
  opposing_counsel_phone: '',
  opposing_counsel_email: '',
};

export const CaseManagerTool: React.FC<CaseManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Use useToolData hook for backend sync
  const {
    data: cases,
    addItem: addCase,
    updateItem: updateCase,
    deleteItem: deleteCase,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Case>('case-manager', defaultCases, COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([]);
  const [caseDocuments, setCaseDocuments] = useState<CaseDocument[]>([]);
  const [caseHours, setCaseHours] = useState<CaseHours[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<Case['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState(defaultCase);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'documents' | 'notes' | 'hours'>('details');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // New note/hours form state
  const [newNote, setNewNote] = useState('');
  const [newHours, setNewHours] = useState({
    description: '',
    hours: '',
    rate: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Load related data (notes, documents, hours)
  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        const [notesRes, docsRes, hoursRes] = await Promise.all([
          api.get('/business/case-notes').catch(() => null),
          api.get('/business/case-documents').catch(() => null),
          api.get('/business/case-hours').catch(() => null),
        ]);

        setCaseNotes(notesRes?.data || []);
        setCaseDocuments(docsRes?.data || []);
        setCaseHours(hoursRes?.data || []);
      } catch (err) {
        // Use fallback from localStorage if available
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setCaseNotes(data.notes || []);
          setCaseDocuments(data.documents || []);
          setCaseHours(data.hours || []);
        }
      }
    };

    loadRelatedData();
  }, []);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.prefillData || uiConfig?.params) {
      const prefill = uiConfig.prefillData || uiConfig.params;
      if (prefill && Object.keys(prefill).length > 0) {
        setFormData({
          ...defaultCase,
          ...prefill,
        });
        setShowCaseModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig]);

  // Save related data to localStorage as backup
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cases,
          notes: caseNotes,
          documents: caseDocuments,
          hours: caseHours,
        })
      );
    }
  }, [cases, caseNotes, caseDocuments, caseHours, isLoading]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [cases, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalCases = cases.length;
    const openCases = cases.filter((c) => c.status === 'open').length;
    const closedCases = cases.filter((c) => c.status === 'closed').length;
    const totalBillableHours = caseHours.reduce((sum, h) => sum + h.hours, 0);
    return { totalCases, openCases, closedCases, totalBillableHours };
  }, [cases, caseHours]);

  // Case CRUD operations
  const handleSaveCase = async () => {
    try {
      const now = new Date().toISOString();
      if (editingCase) {
        // Update existing case using hook
        const updated: Partial<Case> = {
          ...formData,
          updated_at: now,
        };
        updateCase(editingCase.id, updated);
      } else {
        // Create new case using hook
        const newCase: Case = {
          id: crypto.randomUUID(),
          ...formData,
          case_number: formData.case_number || `CASE-${Date.now().toString(36).toUpperCase()}`,
          created_at: now,
          updated_at: now,
        };
        addCase(newCase);
      }
      closeModal();
    } catch (err) {
      setError('Failed to save case');
    }
  };

  const handleDeleteCase = async (id: string) => {
    try {
      // Delete case using hook
      deleteCase(id);
      // Clean up related data
      setCaseNotes((prev) => prev.filter((n) => n.case_id !== id));
      setCaseDocuments((prev) => prev.filter((d) => d.case_id !== id));
      setCaseHours((prev) => prev.filter((h) => h.case_id !== id));
      setShowDeleteConfirm(null);
      if (selectedCase?.id === id) {
        setSelectedCase(null);
      }
    } catch (err) {
      setError('Failed to delete case');
    }
  };

  // Notes operations
  const handleAddNote = async () => {
    if (!selectedCase || !newNote.trim()) return;
    const note: CaseNote = {
      id: crypto.randomUUID(),
      case_id: selectedCase.id,
      content: newNote,
      created_by: 'Current User',
      created_at: new Date().toISOString(),
    };
    try {
      await api.post('/business/case-notes', note).catch(() => null);
    } catch {
      // Continue with local save
    }
    setCaseNotes((prev) => [note, ...prev]);
    setNewNote('');
  };

  // Hours operations
  const handleAddHours = async () => {
    if (!selectedCase || !newHours.description || !newHours.hours) return;
    const hours: CaseHours = {
      id: crypto.randomUUID(),
      case_id: selectedCase.id,
      description: newHours.description,
      hours: parseFloat(newHours.hours),
      rate: parseFloat(newHours.rate) || 0,
      date: newHours.date,
      billed: false,
      created_at: new Date().toISOString(),
    };
    try {
      await api.post('/business/case-hours', hours).catch(() => null);
    } catch {
      // Continue with local save
    }
    setCaseHours((prev) => [hours, ...prev]);
    setNewHours({
      description: '',
      hours: '',
      rate: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const closeModal = () => {
    setShowCaseModal(false);
    setEditingCase(null);
    setFormData(defaultCase);
    setIsPrefilled(false);
  };

  const openEditModal = (caseItem: Case) => {
    setEditingCase(caseItem);
    setFormData({
      case_number: caseItem.case_number,
      title: caseItem.title,
      client_name: caseItem.client_name,
      case_type: caseItem.case_type,
      description: caseItem.description,
      status: caseItem.status,
      assigned_attorney: caseItem.assigned_attorney,
      court: caseItem.court,
      filing_date: caseItem.filing_date,
      next_hearing_date: caseItem.next_hearing_date,
      opposing_counsel_name: caseItem.opposing_counsel_name || '',
      opposing_counsel_firm: caseItem.opposing_counsel_firm || '',
      opposing_counsel_phone: caseItem.opposing_counsel_phone || '',
      opposing_counsel_email: caseItem.opposing_counsel_email || '',
    });
    setShowCaseModal(true);
  };

  // Get cases for a specific day (for calendar)
  const getCasesForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cases.filter((c) => c.next_hearing_date === dateStr);
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Style classes
  const cardClass = `rounded-xl border ${
    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } shadow-sm`;

  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-amber-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-amber-500'
  } focus:outline-none focus:ring-2 focus:ring-amber-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg transition-all font-medium shadow-lg shadow-amber-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.caseManager.legalCaseManager', 'Legal Case Manager')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.caseManager.trackAndManageYourLegal', 'Track and manage your legal cases')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="case-manager" toolName="Case Manager" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme === 'dark' ? 'dark' : 'light'}
            showLabel={true}
          />
          <ExportDropdown
            onExportCSV={() => exportToCSV(filteredCases, COLUMNS, { filename: 'legal-cases' })}
            onExportExcel={() => exportToExcel(filteredCases, COLUMNS, { filename: 'legal-cases' })}
            onExportJSON={() => exportToJSON(filteredCases, { filename: 'legal-cases' })}
            onExportPDF={async () => {
              await exportToPDF(filteredCases, COLUMNS, {
                filename: 'legal-cases',
                title: 'Legal Cases',
              });
            }}
            onPrint={() => printData(filteredCases, COLUMNS, { title: 'Legal Cases' })}
            onCopyToClipboard={() => copyUtil(filteredCases, COLUMNS, 'tab')}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
          <button onClick={() => setShowCaseModal(true)} className={buttonPrimary}>
            <Plus className="w-5 h-5" />
            {t('tools.caseManager.newCase', 'New Case')}
          </button>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-500 font-medium">{t('tools.caseManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Briefcase className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.totalCases', 'Total Cases')}</p>
              <p className="text-xl font-bold">{stats.totalCases}</p>
            </div>
          </div>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.openCases', 'Open Cases')}</p>
              <p className="text-xl font-bold text-green-500">{stats.openCases}</p>
            </div>
          </div>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/10 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.closedCases', 'Closed Cases')}</p>
              <p className="text-xl font-bold">{stats.closedCases}</p>
            </div>
          </div>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.billableHours', 'Billable Hours')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.totalBillableHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-amber-500 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            {t('tools.caseManager.cases', 'Cases')}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('tools.caseManager.courtCalendar', 'Court Calendar')}
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools.caseManager.searchCases', 'Search cases...')}
                className={`${inputClass} pl-10`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Case['status'] | 'all')}
              className={inputClass + ' w-auto'}
            >
              <option value="all">{t('tools.caseManager.allStatus', 'All Status')}</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className={`flex-1 ${selectedCase ? 'hidden lg:block' : ''}`}>
          {activeTab === 'list' ? (
            <div className={cardClass}>
              <div className="p-4 border-b border-gray-700">
                <h2 className="font-semibold">Cases ({filteredCases.length})</h2>
              </div>
              {filteredCases.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.caseManager.noCasesFound', 'No cases found')}</p>
                  <button onClick={() => setShowCaseModal(true)} className={`${buttonPrimary} mt-4 mx-auto`}>
                    <Plus className="w-4 h-4" />
                    {t('tools.caseManager.addFirstCase', 'Add First Case')}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {filteredCases.map((caseItem) => {
                    const statusOpt = statusOptions.find((s) => s.value === caseItem.status);
                    const typeOpt = caseTypeOptions.find((t) => t.value === caseItem.case_type);
                    const StatusIcon = statusOpt?.icon || CheckCircle;

                    return (
                      <div
                        key={caseItem.id}
                        onClick={() => setSelectedCase(caseItem)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedCase?.id === caseItem.id
                            ? theme === 'dark'
                              ? 'bg-amber-500/10'
                              : 'bg-amber-50'
                            : theme === 'dark'
                            ? 'hover:bg-gray-700/50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {caseItem.case_number}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeOpt?.color} text-white`}>
                                {typeOpt?.label}
                              </span>
                            </div>
                            <h3 className="font-medium truncate">{caseItem.title}</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {caseItem.client_name}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusOpt?.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusOpt?.label}
                            </span>
                            {caseItem.next_hearing_date && (
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Gavel className="w-3 h-3 inline mr-1" />
                                {new Date(caseItem.next_hearing_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Calendar View
            <div className={cardClass}>
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold">
                  {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    className={buttonSecondary + ' p-2'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date())}
                    className={buttonSecondary + ' px-3 py-1 text-sm'}
                  >
                    {t('tools.caseManager.today', 'Today')}
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                    className={buttonSecondary + ' p-2'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className={`text-center text-sm font-medium py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }
                    const dayCases = getCasesForDay(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={date.toISOString()}
                        className={`aspect-square p-1 rounded-lg border transition-colors ${
                          isToday
                            ? 'border-amber-500 bg-amber-500/10'
                            : theme === 'dark'
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-amber-500' : ''}`}>
                          {date.getDate()}
                        </div>
                        {dayCases.slice(0, 2).map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCase(c)}
                            className="text-xs truncate px-1 py-0.5 rounded bg-amber-500/20 text-amber-500 cursor-pointer mt-0.5"
                          >
                            {c.title}
                          </div>
                        ))}
                        {dayCases.length > 2 && (
                          <div className="text-xs text-gray-500">+{dayCases.length - 2} more</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Case Details Panel */}
        {selectedCase && (
          <div className={`${cardClass} w-full lg:w-96 flex-shrink-0`}>
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold truncate">{selectedCase.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedCase)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(selectedCase.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex border-b border-gray-700 overflow-x-auto">
              {(['details', 'documents', 'notes', 'hours'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDetailTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    activeDetailTab === tab
                      ? 'border-b-2 border-amber-500 text-amber-500'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {activeDetailTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.caseNumber', 'Case Number')}</label>
                    <p className="font-mono">{selectedCase.case_number}</p>
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.client', 'Client')}</label>
                    <p>{selectedCase.client_name}</p>
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.type', 'Type')}</label>
                    <p className="capitalize">{selectedCase.case_type}</p>
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.assignedAttorney', 'Assigned Attorney')}</label>
                    <p>{selectedCase.assigned_attorney || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.court', 'Court')}</label>
                    <p>{selectedCase.court || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.filingDate', 'Filing Date')}</label>
                    <p>{selectedCase.filing_date ? new Date(selectedCase.filing_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.nextHearing', 'Next Hearing')}</label>
                    <p>{selectedCase.next_hearing_date ? new Date(selectedCase.next_hearing_date).toLocaleDateString() : '-'}</p>
                  </div>
                  {selectedCase.description && (
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.description', 'Description')}</label>
                      <p className="text-sm">{selectedCase.description}</p>
                    </div>
                  )}

                  {/* Opposing Counsel */}
                  {(selectedCase.opposing_counsel_name || selectedCase.opposing_counsel_firm) && (
                    <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t('tools.caseManager.opposingCounsel', 'Opposing Counsel')}
                      </h3>
                      {selectedCase.opposing_counsel_name && (
                        <p className="text-sm">{selectedCase.opposing_counsel_name}</p>
                      )}
                      {selectedCase.opposing_counsel_firm && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedCase.opposing_counsel_firm}
                        </p>
                      )}
                      {selectedCase.opposing_counsel_phone && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedCase.opposing_counsel_phone}
                        </p>
                      )}
                      {selectedCase.opposing_counsel_email && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedCase.opposing_counsel_email}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'documents' && (
                <div className="space-y-4">
                  <button className={`${buttonSecondary} w-full justify-center`}>
                    <Upload className="w-4 h-4" />
                    {t('tools.caseManager.uploadDocument', 'Upload Document')}
                  </button>
                  {caseDocuments.filter((d) => d.case_id === selectedCase.id).length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.caseManager.noDocumentsUploaded', 'No documents uploaded')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {caseDocuments
                        .filter((d) => d.case_id === selectedCase.id)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center gap-3`}
                          >
                            <FileText className="w-5 h-5 text-amber-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{doc.name}</p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {(doc.file_size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button className="p-2 hover:bg-gray-600 rounded-lg">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={t('tools.caseManager.addANote', 'Add a note...')}
                      className={inputClass}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button onClick={handleAddNote} className={buttonPrimary + ' px-3'}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {caseNotes.filter((n) => n.case_id === selectedCase.id).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseManager.noNotesYet', 'No notes yet')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {caseNotes
                        .filter((n) => n.case_id === selectedCase.id)
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((note) => (
                          <div
                            key={note.id}
                            className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                          >
                            <p className="text-sm">{note.content}</p>
                            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {note.created_by} - {new Date(note.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'hours' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newHours.description}
                      onChange={(e) => setNewHours({ ...newHours, description: e.target.value })}
                      placeholder={t('tools.caseManager.description3', 'Description')}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={newHours.hours}
                        onChange={(e) => setNewHours({ ...newHours, hours: e.target.value })}
                        placeholder={t('tools.caseManager.hours', 'Hours')}
                        className={inputClass}
                        step="0.25"
                      />
                      <input
                        type="number"
                        value={newHours.rate}
                        onChange={(e) => setNewHours({ ...newHours, rate: e.target.value })}
                        placeholder={t('tools.caseManager.rate', 'Rate')}
                        className={inputClass}
                      />
                      <input
                        type="date"
                        value={newHours.date}
                        onChange={(e) => setNewHours({ ...newHours, date: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <button onClick={handleAddHours} className={`${buttonPrimary} w-full justify-center`}>
                      <Plus className="w-4 h-4" />
                      {t('tools.caseManager.logHours', 'Log Hours')}
                    </button>
                  </div>

                  {caseHours.filter((h) => h.case_id === selectedCase.id).length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.caseManager.noHoursLogged', 'No hours logged')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {caseHours
                          .filter((h) => h.case_id === selectedCase.id)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((h) => (
                            <div
                              key={h.id}
                              className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-between`}
                            >
                              <div>
                                <p className="font-medium">{h.description}</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(h.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{h.hours}h</p>
                                {h.rate > 0 && (
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    ${(h.hours * h.rate).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{t('tools.caseManager.totalHours', 'Total Hours:')}</span>
                          <span className="font-bold text-amber-500">
                            {caseHours
                              .filter((h) => h.case_id === selectedCase.id)
                              .reduce((sum, h) => sum + h.hours, 0)
                              .toFixed(2)}
                            h
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-medium">{t('tools.caseManager.totalAmount', 'Total Amount:')}</span>
                          <span className="font-bold text-amber-500">
                            $
                            {caseHours
                              .filter((h) => h.case_id === selectedCase.id)
                              .reduce((sum, h) => sum + h.hours * h.rate, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Case Form Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-inherit">
              <h2 className="text-lg font-semibold">
                {editingCase ? t('tools.caseManager.editCase', 'Edit Case') : t('tools.caseManager.newCase2', 'New Case')}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.caseManager.caseNumber2', 'Case Number')}</label>
                  <input
                    type="text"
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    placeholder={t('tools.caseManager.autoGeneratedIfEmpty', 'Auto-generated if empty')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.caseTitle', 'Case Title *')}</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('tools.caseManager.caseTitle2', 'Case title')}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.clientName', 'Client Name *')}</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder={t('tools.caseManager.clientName2', 'Client name')}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.caseType', 'Case Type *')}</label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData({ ...formData, case_type: e.target.value as Case['case_type'] })}
                    className={inputClass}
                  >
                    {caseTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Case['status'] })}
                    className={inputClass}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.assignedAttorney2', 'Assigned Attorney')}</label>
                  <input
                    type="text"
                    value={formData.assigned_attorney}
                    onChange={(e) => setFormData({ ...formData, assigned_attorney: e.target.value })}
                    placeholder={t('tools.caseManager.attorneyName', 'Attorney name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.court2', 'Court')}</label>
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                    placeholder={t('tools.caseManager.courtName', 'Court name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.filingDate2', 'Filing Date')}</label>
                  <input
                    type="date"
                    value={formData.filing_date}
                    onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseManager.nextHearingDate', 'Next Hearing Date')}</label>
                  <input
                    type="date"
                    value={formData.next_hearing_date}
                    onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.caseManager.description2', 'Description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('tools.caseManager.caseDescription', 'Case description...')}
                  rows={3}
                  className={inputClass}
                />
              </div>

              {/* Opposing Counsel Section */}
              <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('tools.caseManager.opposingCounsel2', 'Opposing Counsel')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.caseManager.name', 'Name')}</label>
                    <input
                      type="text"
                      value={formData.opposing_counsel_name}
                      onChange={(e) => setFormData({ ...formData, opposing_counsel_name: e.target.value })}
                      placeholder={t('tools.caseManager.counselName', 'Counsel name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseManager.firm', 'Firm')}</label>
                    <input
                      type="text"
                      value={formData.opposing_counsel_firm}
                      onChange={(e) => setFormData({ ...formData, opposing_counsel_firm: e.target.value })}
                      placeholder={t('tools.caseManager.firmName', 'Firm name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseManager.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.opposing_counsel_phone}
                      onChange={(e) => setFormData({ ...formData, opposing_counsel_phone: e.target.value })}
                      placeholder={t('tools.caseManager.phoneNumber', 'Phone number')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseManager.email', 'Email')}</label>
                    <input
                      type="email"
                      value={formData.opposing_counsel_email}
                      onChange={(e) => setFormData({ ...formData, opposing_counsel_email: e.target.value })}
                      placeholder={t('tools.caseManager.emailAddress', 'Email address')}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-inherit">
              <button onClick={closeModal} className={buttonSecondary}>
                {t('tools.caseManager.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveCase}
                disabled={!formData.title || !formData.client_name}
                className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {editingCase ? t('tools.caseManager.updateCase', 'Update Case') : t('tools.caseManager.createCase', 'Create Case')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`${cardClass} w-full max-w-md p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t('tools.caseManager.deleteCase', 'Delete Case')}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.caseManager.thisActionCannotBeUndone', 'This action cannot be undone')}
                </p>
              </div>
            </div>
            <p className="mb-6">
              {t('tools.caseManager.areYouSureYouWant', 'Are you sure you want to delete this case? All associated notes, documents, and billable hours will also be deleted.')}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className={buttonSecondary}>
                {t('tools.caseManager.cancel2', 'Cancel')}
              </button>
              <button
                onClick={() => handleDeleteCase(showDeleteConfirm)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.caseManager.aboutLegalCaseManager', 'About Legal Case Manager')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your legal cases efficiently with this comprehensive case management tool.
          Track case details, court dates, billable hours, documents, and notes all in one place.
          Data is synchronized with your account and backed up locally for offline access.
        </p>
      </div>
    </div>
  );
};

export default CaseManagerTool;
