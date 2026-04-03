'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Scale,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  FileText,
  Users,
  AlertTriangle,
  DollarSign,
  CheckSquare,
  ChevronRight,
  X,
  Edit,
  Trash2,
  Save,
  Building,
  User,
  Gavel,
  FileCheck,
  MessageSquare,
  Activity,
  ArrowLeft,
  CheckCircle,
  Circle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface LegalCaseManagerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface OpposingParty {
  name: string;
  attorney: string;
  attorneyContact: string;
}

interface ImportantDate {
  id: string;
  type: 'filing' | 'hearing' | 'trial' | 'deadline' | 'other';
  date: string;
  description: string;
  completed: boolean;
}

interface Document {
  id: string;
  name: string;
  required: boolean;
  received: boolean;
  dateReceived: string | null;
  notes: string;
}

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  rate: number;
}

interface CaseNote {
  id: string;
  date: string;
  author: string;
  content: string;
  type: 'note' | 'activity' | 'update';
}

interface FinancialSummary {
  totalFees: number;
  totalExpenses: number;
  paymentsReceived: number;
  outstanding: number;
}

interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  client: Client;
  opposingParty: OpposingParty;
  caseType: string;
  court: string;
  judge: string;
  status: 'intake' | 'discovery' | 'negotiation' | 'trial' | 'closed';
  openDate: string;
  closeDate: string | null;
  importantDates: ImportantDate[];
  documents: Document[];
  timeEntries: TimeEntry[];
  notes: CaseNote[];
  hourlyRate: number;
  retainerAmount: number;
  expenses: number;
  paymentsReceived: number;
  conflictChecked: boolean;
  conflictNotes: string;
}

type CaseStatus = 'intake' | 'discovery' | 'negotiation' | 'trial' | 'closed';
type FilterStatus = 'all' | 'open' | 'closed' | 'pending';
type ViewMode = 'list' | 'detail';
type DetailTab = 'overview' | 'dates' | 'documents' | 'time' | 'notes' | 'financial';

const CASE_TYPES = [
  'Civil Litigation',
  'Criminal Defense',
  'Family Law',
  'Corporate',
  'Real Estate',
  'Personal Injury',
  'Immigration',
  'Bankruptcy',
  'Employment',
  'Intellectual Property',
  'Estate Planning',
  'Other',
];

const STATUS_LABELS: Record<CaseStatus, string> = {
  intake: 'Intake',
  discovery: 'Discovery',
  negotiation: 'Negotiation',
  trial: 'Trial',
  closed: 'Closed',
};

const STATUS_COLORS: Record<CaseStatus, string> = {
  intake: 'bg-blue-500',
  discovery: 'bg-yellow-500',
  negotiation: 'bg-purple-500',
  trial: 'bg-orange-500',
  closed: 'bg-gray-500',
};

// Column configuration for exports and backend sync
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'caseNumber', header: 'Case Number', type: 'string' },
  { key: 'title', header: 'Case Title', type: 'string' },
  { key: 'caseType', header: 'Case Type', type: 'string' },
  { key: 'court', header: 'Court', type: 'string' },
  { key: 'judge', header: 'Judge', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'openDate', header: 'Open Date', type: 'date' },
  { key: 'closeDate', header: 'Close Date', type: 'date' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'retainerAmount', header: 'Retainer Amount', type: 'currency' },
  { key: 'expenses', header: 'Expenses', type: 'currency' },
  { key: 'paymentsReceived', header: 'Payments Received', type: 'currency' },
  { key: 'conflictChecked', header: 'Conflict Checked', type: 'boolean' },
];

// Export columns configuration (flattened for CSV/Excel export)
const EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case Number', type: 'string' },
  { key: 'title', header: 'Case Title', type: 'string' },
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'clientEmail', header: 'Client Email', type: 'string' },
  { key: 'clientPhone', header: 'Client Phone', type: 'string' },
  { key: 'opposingPartyName', header: 'Opposing Party', type: 'string' },
  { key: 'opposingAttorney', header: 'Opposing Attorney', type: 'string' },
  { key: 'caseType', header: 'Case Type', type: 'string' },
  { key: 'court', header: 'Court', type: 'string' },
  { key: 'judge', header: 'Judge', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'openDate', header: 'Open Date', type: 'date' },
  { key: 'closeDate', header: 'Close Date', type: 'date' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'retainerAmount', header: 'Retainer Amount', type: 'currency' },
  { key: 'expenses', header: 'Expenses', type: 'currency' },
  { key: 'paymentsReceived', header: 'Payments Received', type: 'currency' },
  { key: 'totalBillableHours', header: 'Total Billable Hours', type: 'number' },
  { key: 'conflictChecked', header: 'Conflict Checked', type: 'boolean' },
];

// Transform case data for export (flatten nested objects)
const transformCaseForExport = (caseData: LegalCase) => {
  const totalBillableHours = caseData.timeEntries
    .filter((t) => t.billable)
    .reduce((sum, t) => sum + t.hours, 0);

  return {
    caseNumber: caseData.caseNumber,
    title: caseData.title,
    clientName: caseData.client.name,
    clientEmail: caseData.client.email,
    clientPhone: caseData.client.phone,
    opposingPartyName: caseData.opposingParty.name,
    opposingAttorney: caseData.opposingParty.attorney,
    caseType: caseData.caseType,
    court: caseData.court,
    judge: caseData.judge,
    status: STATUS_LABELS[caseData.status] || caseData.status,
    openDate: caseData.openDate,
    closeDate: caseData.closeDate || '',
    hourlyRate: caseData.hourlyRate,
    retainerAmount: caseData.retainerAmount,
    expenses: caseData.expenses,
    paymentsReceived: caseData.paymentsReceived,
    totalBillableHours,
    conflictChecked: caseData.conflictChecked,
  };
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const createEmptyCase = (): LegalCase => ({
  id: generateId(),
  caseNumber: '',
  title: '',
  client: {
    id: generateId(),
    name: '',
    email: '',
    phone: '',
    address: '',
  },
  opposingParty: {
    name: '',
    attorney: '',
    attorneyContact: '',
  },
  caseType: CASE_TYPES[0],
  court: '',
  judge: '',
  status: 'intake',
  openDate: new Date().toISOString().split('T')[0],
  closeDate: null,
  importantDates: [],
  documents: [],
  timeEntries: [],
  notes: [],
  hourlyRate: 250,
  retainerAmount: 0,
  expenses: 0,
  paymentsReceived: 0,
  conflictChecked: false,
  conflictNotes: '',
});

export const LegalCaseManagerTool: React.FC<LegalCaseManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: cases,
    setData: setCases,
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
  } = useToolData<LegalCase>('legal-case-manager', [], COLUMNS);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCaseType, setFilterCaseType] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');

  // Modal states
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showConflictCheckModal, setShowConflictCheckModal] = useState(false);
  const [conflictCheckName, setConflictCheckName] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.caseName || params.client || params.title) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          c.caseNumber.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.client.name.toLowerCase().includes(query) ||
          c.opposingParty.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'open' && c.status === 'closed') return false;
        if (filterStatus === 'closed' && c.status !== 'closed') return false;
        if (filterStatus === 'pending' && !['intake', 'discovery', 'negotiation'].includes(c.status)) return false;
      }

      // Case type filter
      if (filterCaseType !== 'all' && c.caseType !== filterCaseType) return false;

      // Date range filter
      if (dateRangeStart && new Date(c.openDate) < new Date(dateRangeStart)) return false;
      if (dateRangeEnd && new Date(c.openDate) > new Date(dateRangeEnd)) return false;

      return true;
    });
  }, [cases, searchQuery, filterStatus, filterCaseType, dateRangeStart, dateRangeEnd]);

  // Conflict check
  const checkConflict = useMemo(() => {
    if (!conflictCheckName.trim()) return { hasConflict: false, matches: [] };
    const query = conflictCheckName.toLowerCase();
    const matches = cases.filter(
      (c) =>
        c.client.name.toLowerCase().includes(query) ||
        c.opposingParty.name.toLowerCase().includes(query) ||
        c.opposingParty.attorney.toLowerCase().includes(query)
    );
    return { hasConflict: matches.length > 0, matches };
  }, [cases, conflictCheckName]);

  // Calculate financial summary
  const calculateFinancialSummary = (caseData: LegalCase): FinancialSummary => {
    const totalBillableHours = caseData.timeEntries
      .filter((t) => t.billable)
      .reduce((sum, t) => sum + t.hours * t.rate, 0);
    const totalFees = totalBillableHours;
    const totalExpenses = caseData.expenses;
    const outstanding = totalFees + totalExpenses - caseData.paymentsReceived;
    return {
      totalFees,
      totalExpenses,
      paymentsReceived: caseData.paymentsReceived,
      outstanding,
    };
  };

  // Handlers
  const handleCreateCase = () => {
    const newCase = createEmptyCase();
    setEditingCase(newCase);
    setIsEditing(true);
    setShowNewCaseModal(true);
  };

  const handleSaveCase = () => {
    if (!editingCase) return;
    const existingIndex = cases.findIndex((c) => c.id === editingCase.id);
    if (existingIndex >= 0) {
      // Update existing case
      updateItem(editingCase.id, editingCase);
    } else {
      // Add new case
      addItem(editingCase);
    }
    setShowNewCaseModal(false);
    setIsEditing(false);
    setEditingCase(null);
    if (selectedCase?.id === editingCase.id) {
      setSelectedCase(editingCase);
    }
  };

  const handleDeleteCase = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Case',
      message: 'Are you sure you want to delete this case? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedCase?.id === id) {
        setSelectedCase(null);
        setViewMode('list');
      }
    }
  };

  const handleViewCase = (caseData: LegalCase) => {
    setSelectedCase(caseData);
    setViewMode('detail');
    setActiveTab('overview');
  };

  const handleEditCase = (caseData: LegalCase) => {
    setEditingCase({ ...caseData });
    setIsEditing(true);
    setShowNewCaseModal(true);
  };

  const handleAddDate = () => {
    if (!selectedCase) return;
    const newDate: ImportantDate = {
      id: generateId(),
      type: 'deadline',
      date: new Date().toISOString().split('T')[0],
      description: '',
      completed: false,
    };
    const updated = {
      ...selectedCase,
      importantDates: [...selectedCase.importantDates, newDate],
    };
    updateItem(updated.id, { importantDates: updated.importantDates });
    setSelectedCase(updated);
  };

  const handleUpdateDate = (dateId: string, updates: Partial<ImportantDate>) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      importantDates: selectedCase.importantDates.map((d) =>
        d.id === dateId ? { ...d, ...updates } : d
      ),
    };
    updateItem(updated.id, { importantDates: updated.importantDates });
    setSelectedCase(updated);
  };

  const handleDeleteDate = (dateId: string) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      importantDates: selectedCase.importantDates.filter((d) => d.id !== dateId),
    };
    updateItem(updated.id, { importantDates: updated.importantDates });
    setSelectedCase(updated);
  };

  const handleAddDocument = () => {
    if (!selectedCase) return;
    const newDoc: Document = {
      id: generateId(),
      name: '',
      required: true,
      received: false,
      dateReceived: null,
      notes: '',
    };
    const updated = {
      ...selectedCase,
      documents: [...selectedCase.documents, newDoc],
    };
    updateItem(updated.id, { documents: updated.documents });
    setSelectedCase(updated);
  };

  const handleUpdateDocument = (docId: string, updates: Partial<Document>) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      documents: selectedCase.documents.map((d) =>
        d.id === docId ? { ...d, ...updates } : d
      ),
    };
    updateItem(updated.id, { documents: updated.documents });
    setSelectedCase(updated);
  };

  const handleDeleteDocument = (docId: string) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      documents: selectedCase.documents.filter((d) => d.id !== docId),
    };
    updateItem(updated.id, { documents: updated.documents });
    setSelectedCase(updated);
  };

  const handleAddTimeEntry = () => {
    if (!selectedCase) return;
    const newEntry: TimeEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      description: '',
      billable: true,
      rate: selectedCase.hourlyRate,
    };
    const updated = {
      ...selectedCase,
      timeEntries: [...selectedCase.timeEntries, newEntry],
    };
    updateItem(updated.id, { timeEntries: updated.timeEntries });
    setSelectedCase(updated);
  };

  const handleUpdateTimeEntry = (entryId: string, updates: Partial<TimeEntry>) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      timeEntries: selectedCase.timeEntries.map((t) =>
        t.id === entryId ? { ...t, ...updates } : t
      ),
    };
    updateItem(updated.id, { timeEntries: updated.timeEntries });
    setSelectedCase(updated);
  };

  const handleDeleteTimeEntry = (entryId: string) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      timeEntries: selectedCase.timeEntries.filter((t) => t.id !== entryId),
    };
    updateItem(updated.id, { timeEntries: updated.timeEntries });
    setSelectedCase(updated);
  };

  const handleAddNote = () => {
    if (!selectedCase) return;
    const newNote: CaseNote = {
      id: generateId(),
      date: new Date().toISOString(),
      author: 'Current User',
      content: '',
      type: 'note',
    };
    const updated = {
      ...selectedCase,
      notes: [newNote, ...selectedCase.notes],
    };
    updateItem(updated.id, { notes: updated.notes });
    setSelectedCase(updated);
  };

  const handleUpdateNote = (noteId: string, updates: Partial<CaseNote>) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      notes: selectedCase.notes.map((n) => (n.id === noteId ? { ...n, ...updates } : n)),
    };
    updateItem(updated.id, { notes: updated.notes });
    setSelectedCase(updated);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      notes: selectedCase.notes.filter((n) => n.id !== noteId),
    };
    updateItem(updated.id, { notes: updated.notes });
    setSelectedCase(updated);
  };

  const handleUpdateCaseStatus = (status: CaseStatus) => {
    if (!selectedCase) return;
    const closeDate = status === 'closed' ? new Date().toISOString().split('T')[0] : null;
    const updated = {
      ...selectedCase,
      status,
      closeDate,
    };
    updateItem(updated.id, { status, closeDate });
    setSelectedCase(updated);
  };

  const handleUpdateFinancials = (field: 'expenses' | 'paymentsReceived', value: number) => {
    if (!selectedCase) return;
    const updated = { ...selectedCase, [field]: value };
    updateItem(updated.id, { [field]: value });
    setSelectedCase(updated);
  };

  // Render helpers
  const renderStatusBadge = (status: CaseStatus) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );

  const renderCaseList = () => (
    <div className="space-y-4">
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">Data loaded from AI response</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Legal Case Manager
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your legal cases and client information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="legal-case-manager" toolName="Legal Case Manager" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme === 'dark' ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'legal-cases' })}
            onExportExcel={() => exportExcel({ filename: 'legal-cases' })}
            onExportJSON={() => exportJSON({ filename: 'legal-cases' })}
            onExportPDF={() => exportPDF({
              filename: 'legal-cases',
              title: 'Legal Cases Report',
              subtitle: `${cases.length} case${cases.length !== 1 ? 's' : ''} total`,
            })}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onPrint={() => print('Legal Cases Report')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            disabled={filteredCases.length === 0}
            theme={theme}
          />
          <button
            onClick={() => setShowConflictCheckModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Conflict Check
          </button>
          <button
            onClick={handleCreateCase}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Case
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Filters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterCaseType}
            onChange={(e) => setFilterCaseType(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="all">All Types</option>
            {CASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateRangeStart}
            onChange={(e) => setDateRangeStart(e.target.value)}
            placeholder="From"
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
          <input
            type="date"
            value={dateRangeEnd}
            onChange={(e) => setDateRangeEnd(e.target.value)}
            placeholder="To"
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>
      </div>

      {/* Case List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div
            className={`p-8 text-center rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow`}
          >
            <Scale
              className={`w-12 h-12 mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`}
            />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              No cases found. Create a new case to get started.
            </p>
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => handleViewCase(caseItem)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`font-mono text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {caseItem.caseNumber}
                    </span>
                    {renderStatusBadge(caseItem.status)}
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {caseItem.caseType}
                    </span>
                  </div>
                  <h3
                    className={`font-semibold text-lg ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {caseItem.title || 'Untitled Case'}
                  </h3>
                  <div
                    className={`flex items-center gap-4 mt-2 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {caseItem.client.name || 'No client'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {caseItem.court || 'No court'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(caseItem.openDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCase(caseItem);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCase(caseItem.id);
                    }}
                    className={`p-2 rounded-lg transition-colors hover:bg-red-100 text-red-500`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight
                    className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCaseDetail = () => {
    if (!selectedCase) return null;
    const financial = calculateFinancialSummary(selectedCase);

    return (
      <div className="space-y-4">
        {/* Back Button and Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedCase(null);
              }}
              className={`flex items-center gap-2 mb-3 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              {t('tools.legalCaseManager.backToCases', 'Back to Cases')}
            </button>
            <div className="flex items-center gap-3">
              <span
                className={`font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {selectedCase.caseNumber}
              </span>
              {renderStatusBadge(selectedCase.status)}
            </div>
            <h1
              className={`text-2xl font-bold mt-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {selectedCase.title || 'Untitled Case'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEditCase(selectedCase)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Edit className="w-4 h-4" />
              {t('tools.legalCaseManager.editCase', 'Edit Case')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`flex flex-wrap gap-2 p-1 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          {[
            { id: 'overview' as DetailTab, label: 'Overview', icon: FileText },
            { id: 'dates' as DetailTab, label: 'Dates', icon: Calendar },
            { id: 'documents' as DetailTab, label: 'Documents', icon: FileCheck },
            { id: 'time' as DetailTab, label: 'Time Entries', icon: Clock },
            { id: 'notes' as DetailTab, label: 'Notes', icon: MessageSquare },
            { id: 'financial' as DetailTab, label: 'Financial', icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Tracker */}
              <div>
                <h3
                  className={`font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t('tools.legalCaseManager.caseStatus', 'Case Status')}
                </h3>
                <div className="flex items-center gap-2">
                  {(['intake', 'discovery', 'negotiation', 'trial', 'closed'] as CaseStatus[]).map(
                    (status, idx) => (
                      <React.Fragment key={status}>
                        <button
                          onClick={() => handleUpdateCaseStatus(status)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            selectedCase.status === status
                              ? `${STATUS_COLORS[status]} text-white`
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {selectedCase.status === status ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                          {STATUS_LABELS[status]}
                        </button>
                        {idx < 4 && (
                          <ChevronRight
                            className={`w-4 h-4 ${
                              theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    )
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3
                    className={`font-semibold mb-4 flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    {t('tools.legalCaseManager.clientInformation', 'Client Information')}
                  </h3>
                  <div className="space-y-2">
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.name', 'Name:')}</span> {selectedCase.client.name || '-'}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.email', 'Email:')}</span> {selectedCase.client.email || '-'}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.phone', 'Phone:')}</span> {selectedCase.client.phone || '-'}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.address', 'Address:')}</span>{' '}
                      {selectedCase.client.address || '-'}
                    </div>
                  </div>
                </div>
                <div>
                  <h3
                    className={`font-semibold mb-4 flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    {t('tools.legalCaseManager.opposingParty', 'Opposing Party')}
                  </h3>
                  <div className="space-y-2">
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.name2', 'Name:')}</span>{' '}
                      {selectedCase.opposingParty.name || '-'}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.attorney', 'Attorney:')}</span>{' '}
                      {selectedCase.opposingParty.attorney || '-'}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.contact', 'Contact:')}</span>{' '}
                      {selectedCase.opposingParty.attorneyContact || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3
                    className={`font-semibold mb-4 flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    {t('tools.legalCaseManager.courtInformation', 'Court Information')}
                  </h3>
                  <div className="space-y-2">
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.court', 'Court:')}</span> {selectedCase.court || '-'}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.judge', 'Judge:')}</span> {selectedCase.judge || '-'}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">{t('tools.legalCaseManager.caseType', 'Case Type:')}</span> {selectedCase.caseType}
                    </div>
                  </div>
                </div>
                <div>
                  <h3
                    className={`font-semibold mb-4 flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    {t('tools.legalCaseManager.conflictCheck', 'Conflict Check')}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {selectedCase.conflictChecked ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedCase.conflictChecked
                          ? t('tools.legalCaseManager.conflictCheckCompleted2', 'Conflict check completed') : t('tools.legalCaseManager.conflictCheckPending', 'Conflict check pending')}
                      </span>
                    </div>
                    {selectedCase.conflictNotes && (
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedCase.conflictNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {t('tools.legalCaseManager.totalFees', 'Total Fees')}
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${financial.totalFees.toLocaleString()}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {t('tools.legalCaseManager.hoursLogged', 'Hours Logged')}
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {selectedCase.timeEntries.reduce((sum, t) => sum + t.hours, 0).toFixed(1)}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {t('tools.legalCaseManager.documents', 'Documents')}
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {selectedCase.documents.filter((d) => d.received).length}/
                    {selectedCase.documents.length}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {t('tools.legalCaseManager.outstanding', 'Outstanding')}
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      financial.outstanding > 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    ${financial.outstanding.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3
                  className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.legalCaseManager.importantDates', 'Important Dates')}
                </h3>
                <button
                  onClick={handleAddDate}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.legalCaseManager.addDate', 'Add Date')}
                </button>
              </div>
              {selectedCase.importantDates.length === 0 ? (
                <div
                  className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t('tools.legalCaseManager.noImportantDatesAddedYet', 'No important dates added yet.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCase.importantDates
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((date) => (
                      <div
                        key={date.id}
                        className={`p-4 rounded-lg border ${
                          date.completed
                            ? theme === 'dark'
                              ? 'border-green-900 bg-green-900/20'
                              : 'border-green-200 bg-green-50'
                            : theme === 'dark'
                            ? 'border-gray-700 bg-gray-700'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() =>
                              handleUpdateDate(date.id, { completed: !date.completed })
                            }
                            className={`mt-1 ${
                              date.completed ? 'text-green-500' : 'text-gray-400'
                            }`}
                          >
                            {date.completed ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                              value={date.type}
                              onChange={(e) =>
                                handleUpdateDate(date.id, {
                                  type: e.target.value as ImportantDate['type'],
                                })
                              }
                              className={`px-3 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            >
                              <option value="filing">{t('tools.legalCaseManager.filing', 'Filing')}</option>
                              <option value="hearing">{t('tools.legalCaseManager.hearing', 'Hearing')}</option>
                              <option value="trial">{t('tools.legalCaseManager.trial', 'Trial')}</option>
                              <option value="deadline">{t('tools.legalCaseManager.deadline', 'Deadline')}</option>
                              <option value="other">{t('tools.legalCaseManager.other', 'Other')}</option>
                            </select>
                            <input
                              type="date"
                              value={date.date}
                              onChange={(e) =>
                                handleUpdateDate(date.id, { date: e.target.value })
                              }
                              className={`px-3 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <input
                              type="text"
                              value={date.description}
                              onChange={(e) =>
                                handleUpdateDate(date.id, { description: e.target.value })
                              }
                              placeholder={t('tools.legalCaseManager.description', 'Description')}
                              className={`md:col-span-2 px-3 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteDate(date.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3
                  className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.legalCaseManager.documentChecklist', 'Document Checklist')}
                </h3>
                <button
                  onClick={handleAddDocument}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.legalCaseManager.addDocument', 'Add Document')}
                </button>
              </div>
              {selectedCase.documents.length === 0 ? (
                <div
                  className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t('tools.legalCaseManager.noDocumentsInChecklist', 'No documents in checklist.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCase.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-lg border ${
                        doc.received
                          ? theme === 'dark'
                            ? 'border-green-900 bg-green-900/20'
                            : 'border-green-200 bg-green-50'
                          : doc.required
                          ? theme === 'dark'
                            ? 'border-yellow-900 bg-yellow-900/20'
                            : 'border-yellow-200 bg-yellow-50'
                          : theme === 'dark'
                          ? 'border-gray-700 bg-gray-700'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() =>
                            handleUpdateDocument(doc.id, {
                              received: !doc.received,
                              dateReceived: !doc.received
                                ? new Date().toISOString().split('T')[0]
                                : null,
                            })
                          }
                          className={`mt-1 ${doc.received ? 'text-green-500' : 'text-gray-400'}`}
                        >
                          {doc.received ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={doc.name}
                            onChange={(e) =>
                              handleUpdateDocument(doc.id, { name: e.target.value })
                            }
                            placeholder={t('tools.legalCaseManager.documentName', 'Document name')}
                            className={`md:col-span-2 px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={doc.required}
                              onChange={(e) =>
                                handleUpdateDocument(doc.id, { required: e.target.checked })
                              }
                              className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <span
                              className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {t('tools.legalCaseManager.required', 'Required')}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={doc.notes}
                            onChange={(e) =>
                              handleUpdateDocument(doc.id, { notes: e.target.value })
                            }
                            placeholder={t('tools.legalCaseManager.notes', 'Notes')}
                            className={`px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'time' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3
                  className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.legalCaseManager.timeEntries', 'Time Entries')}
                </h3>
                <button
                  onClick={handleAddTimeEntry}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.legalCaseManager.addEntry', 'Add Entry')}
                </button>
              </div>
              {selectedCase.timeEntries.length === 0 ? (
                <div
                  className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t('tools.legalCaseManager.noTimeEntriesLogged', 'No time entries logged.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCase.timeEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-lg border ${
                          entry.billable
                            ? theme === 'dark'
                              ? 'border-green-900 bg-green-900/20'
                              : 'border-green-200 bg-green-50'
                            : theme === 'dark'
                            ? 'border-gray-700 bg-gray-700'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) =>
                              handleUpdateTimeEntry(entry.id, { date: e.target.value })
                            }
                            className={`px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="number"
                            value={entry.hours}
                            onChange={(e) =>
                              handleUpdateTimeEntry(entry.id, {
                                hours: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder={t('tools.legalCaseManager.hours', 'Hours')}
                            step="0.25"
                            min="0"
                            className={`px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="text"
                            value={entry.description}
                            onChange={(e) =>
                              handleUpdateTimeEntry(entry.id, { description: e.target.value })
                            }
                            placeholder={t('tools.legalCaseManager.description2', 'Description')}
                            className={`md:col-span-2 px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={entry.billable}
                              onChange={(e) =>
                                handleUpdateTimeEntry(entry.id, { billable: e.target.checked })
                              }
                              className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <span
                              className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {t('tools.legalCaseManager.billable', 'Billable')}
                            </span>
                          </label>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              ${(entry.hours * entry.rate).toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleDeleteTimeEntry(entry.id)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {/* Time Summary */}
              <div
                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {t('tools.legalCaseManager.totalHours', 'Total Hours')}
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {selectedCase.timeEntries.reduce((sum, t) => sum + t.hours, 0).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {t('tools.legalCaseManager.billableHours', 'Billable Hours')}
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {selectedCase.timeEntries
                        .filter((t) => t.billable)
                        .reduce((sum, t) => sum + t.hours, 0)
                        .toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {t('tools.legalCaseManager.nonBillable', 'Non-Billable')}
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {selectedCase.timeEntries
                        .filter((t) => !t.billable)
                        .reduce((sum, t) => sum + t.hours, 0)
                        .toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {t('tools.legalCaseManager.totalValue', 'Total Value')}
                    </div>
                    <div className="text-xl font-bold text-green-500">
                      $
                      {selectedCase.timeEntries
                        .filter((t) => t.billable)
                        .reduce((sum, t) => sum + t.hours * t.rate, 0)
                        .toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3
                  className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.legalCaseManager.notesActivityTimeline', 'Notes & Activity Timeline')}
                </h3>
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.legalCaseManager.addNote', 'Add Note')}
                </button>
              </div>
              {selectedCase.notes.length === 0 ? (
                <div
                  className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t('tools.legalCaseManager.noNotesAddedYet', 'No notes added yet.')}
                </div>
              ) : (
                <div className="relative">
                  <div
                    className={`absolute left-6 top-0 bottom-0 w-0.5 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  />
                  <div className="space-y-4">
                    {selectedCase.notes.map((note) => (
                      <div key={note.id} className="relative flex gap-4 pl-12">
                        <div
                          className={`absolute left-4 w-4 h-4 rounded-full border-2 ${
                            note.type === 'activity'
                              ? 'bg-blue-500 border-blue-500'
                              : note.type === 'update'
                              ? 'bg-yellow-500 border-yellow-500'
                              : theme === 'dark'
                              ? 'bg-gray-800 border-gray-600'
                              : 'bg-white border-gray-300'
                          }`}
                        />
                        <div
                          className={`flex-1 p-4 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span
                                className={`text-sm font-medium ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                {note.author}
                              </span>
                              <span
                                className={`text-sm ml-2 ${
                                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                }`}
                              >
                                {new Date(note.date).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={note.type}
                                onChange={(e) =>
                                  handleUpdateNote(note.id, {
                                    type: e.target.value as CaseNote['type'],
                                  })
                                }
                                className={`text-xs px-2 py-1 rounded border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="note">{t('tools.legalCaseManager.note', 'Note')}</option>
                                <option value="activity">{t('tools.legalCaseManager.activity', 'Activity')}</option>
                                <option value="update">{t('tools.legalCaseManager.update', 'Update')}</option>
                              </select>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-500 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={note.content}
                            onChange={(e) =>
                              handleUpdateNote(note.id, { content: e.target.value })
                            }
                            placeholder={t('tools.legalCaseManager.enterNote', 'Enter note...')}
                            rows={3}
                            className={`w-full px-3 py-2 rounded-lg border resize-none ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <h3
                className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                {t('tools.legalCaseManager.financialSummary', 'Financial Summary')}
              </h3>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('tools.legalCaseManager.totalFees2', 'Total Fees')}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${financial.totalFees.toLocaleString()}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('tools.legalCaseManager.expenses', 'Expenses')}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${financial.totalExpenses.toLocaleString()}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('tools.legalCaseManager.paymentsReceived', 'Payments Received')}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${financial.paymentsReceived.toLocaleString()}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    financial.outstanding > 0
                      ? 'bg-red-500/20'
                      : theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle
                      className={`w-5 h-5 ${
                        financial.outstanding > 0 ? 'text-red-500' : 'text-green-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('tools.legalCaseManager.outstanding2', 'Outstanding')}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      financial.outstanding > 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    ${financial.outstanding.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.legalCaseManager.expenses2', 'Expenses ($)')}
                  </label>
                  <input
                    type="number"
                    value={selectedCase.expenses}
                    onChange={(e) =>
                      handleUpdateFinancials('expenses', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.legalCaseManager.paymentsReceived2', 'Payments Received ($)')}
                  </label>
                  <input
                    type="number"
                    value={selectedCase.paymentsReceived}
                    onChange={(e) =>
                      handleUpdateFinancials('paymentsReceived', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Billing Rate */}
              <div
                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {t('tools.legalCaseManager.hourlyRate', 'Hourly Rate:')}
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${selectedCase.hourlyRate}/hr
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {t('tools.legalCaseManager.retainerAmount', 'Retainer Amount:')}
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${selectedCase.retainerAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // New Case Modal
  const renderNewCaseModal = () => {
    if (!showNewCaseModal || !editingCase) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div
            className={`sticky top-0 flex justify-between items-center p-4 border-b ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <h2
              className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {cases.find((c) => c.id === editingCase.id) ? t('tools.legalCaseManager.editCase2', 'Edit Case') : t('tools.legalCaseManager.newCase', 'New Case')}
            </h2>
            <button
              onClick={() => {
                setShowNewCaseModal(false);
                setEditingCase(null);
                setIsEditing(false);
              }}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.legalCaseManager.caseNumber', 'Case Number *')}
                </label>
                <input
                  type="text"
                  value={editingCase.caseNumber}
                  onChange={(e) => setEditingCase({ ...editingCase, caseNumber: e.target.value })}
                  placeholder={t('tools.legalCaseManager.eG2024Cv001', 'e.g., 2024-CV-001')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.legalCaseManager.caseTitle', 'Case Title *')}
                </label>
                <input
                  type="text"
                  value={editingCase.title}
                  onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                  placeholder={t('tools.legalCaseManager.caseTitle2', 'Case title')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.legalCaseManager.caseType2', 'Case Type')}
                </label>
                <select
                  value={editingCase.caseType}
                  onChange={(e) => setEditingCase({ ...editingCase, caseType: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {CASE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.legalCaseManager.openDate', 'Open Date')}
                </label>
                <input
                  type="date"
                  value={editingCase.openDate}
                  onChange={(e) => setEditingCase({ ...editingCase, openDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h3
                className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.legalCaseManager.clientInformation2', 'Client Information')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editingCase.client.name}
                  onChange={(e) =>
                    setEditingCase({
                      ...editingCase,
                      client: { ...editingCase.client, name: e.target.value },
                    })
                  }
                  placeholder={t('tools.legalCaseManager.clientName', 'Client name')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="email"
                  value={editingCase.client.email}
                  onChange={(e) =>
                    setEditingCase({
                      ...editingCase,
                      client: { ...editingCase.client, email: e.target.value },
                    })
                  }
                  placeholder={t('tools.legalCaseManager.clientEmail', 'Client email')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="tel"
                  value={editingCase.client.phone}
                  onChange={(e) =>
                    setEditingCase({
                      ...editingCase,
                      client: { ...editingCase.client, phone: e.target.value },
                    })
                  }
                  placeholder={t('tools.legalCaseManager.clientPhone', 'Client phone')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="text"
                  value={editingCase.client.address}
                  onChange={(e) =>
                    setEditingCase({
                      ...editingCase,
                      client: { ...editingCase.client, address: e.target.value },
                    })
                  }
                  placeholder={t('tools.legalCaseManager.clientAddress', 'Client address')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Opposing Party */}
            <div>
              <h3
                className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.legalCaseManager.opposingParty2', 'Opposing Party')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={editingCase.opposingParty.name}
                  onChange={(e) =>
                    setEditingCase({
                      ...editingCase,
                      opposingParty: { ...editingCase.opposingParty, name: e.target.value },
                    })
                  }
                  placeholder={t('tools.legalCaseManager.opposingPartyName', 'Opposing party name')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="text"
                  value={editingCase.opposingParty.attorney}
                  onChange={(e) =>
                    setEditingCase({
                      ...editingCase,
                      opposingParty: { ...editingCase.opposingParty, attorney: e.target.value },
                    })
                  }
                  placeholder={t('tools.legalCaseManager.opposingAttorney', 'Opposing attorney')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="text"
                  value={editingCase.opposingParty.attorneyContact}
                  onChange={(e) =>
                    setEditingCase({
                      ...editingCase,
                      opposingParty: {
                        ...editingCase.opposingParty,
                        attorneyContact: e.target.value,
                      },
                    })
                  }
                  placeholder={t('tools.legalCaseManager.attorneyContact', 'Attorney contact')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Court Info */}
            <div>
              <h3
                className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.legalCaseManager.courtInformation2', 'Court Information')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editingCase.court}
                  onChange={(e) => setEditingCase({ ...editingCase, court: e.target.value })}
                  placeholder={t('tools.legalCaseManager.courtName', 'Court name')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="text"
                  value={editingCase.judge}
                  onChange={(e) => setEditingCase({ ...editingCase, judge: e.target.value })}
                  placeholder={t('tools.legalCaseManager.judgeName', 'Judge name')}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Billing */}
            <div>
              <h3
                className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.legalCaseManager.billingInformation', 'Billing Information')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {t('tools.legalCaseManager.hourlyRate2', 'Hourly Rate ($)')}
                  </label>
                  <input
                    type="number"
                    value={editingCase.hourlyRate}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        hourlyRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="25"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {t('tools.legalCaseManager.retainerAmount2', 'Retainer Amount ($)')}
                  </label>
                  <input
                    type="number"
                    value={editingCase.retainerAmount}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        retainerAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="100"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
            </div>

            {/* Conflict Check */}
            <div>
              <h3
                className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.legalCaseManager.conflictCheck2', 'Conflict Check')}
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCase.conflictChecked}
                    onChange={(e) =>
                      setEditingCase({ ...editingCase, conflictChecked: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {t('tools.legalCaseManager.conflictCheckCompleted', 'Conflict check completed')}
                  </span>
                </label>
                <textarea
                  value={editingCase.conflictNotes}
                  onChange={(e) =>
                    setEditingCase({ ...editingCase, conflictNotes: e.target.value })
                  }
                  placeholder={t('tools.legalCaseManager.conflictCheckNotes', 'Conflict check notes...')}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`sticky bottom-0 flex justify-end gap-3 p-4 border-t ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <button
              onClick={() => {
                setShowNewCaseModal(false);
                setEditingCase(null);
                setIsEditing(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.legalCaseManager.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSaveCase}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {t('tools.legalCaseManager.saveCase', 'Save Case')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Conflict Check Modal
  const renderConflictCheckModal = () => {
    if (!showConflictCheckModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          className={`w-full max-w-lg rounded-lg shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div
            className={`flex justify-between items-center p-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h2
              className={`text-xl font-bold flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {t('tools.legalCaseManager.conflictOfInterestCheck', 'Conflict of Interest Check')}
            </h2>
            <button
              onClick={() => {
                setShowConflictCheckModal(false);
                setConflictCheckName('');
              }}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t('tools.legalCaseManager.searchForPotentialConflicts', 'Search for potential conflicts')}
              </label>
              <input
                type="text"
                value={conflictCheckName}
                onChange={(e) => setConflictCheckName(e.target.value)}
                placeholder={t('tools.legalCaseManager.enterNameToCheck', 'Enter name to check...')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {conflictCheckName && (
              <div
                className={`p-4 rounded-lg ${
                  checkConflict.hasConflict
                    ? 'bg-red-500/20 border border-red-500'
                    : 'bg-green-500/20 border border-green-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {checkConflict.hasConflict ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span
                    className={`font-medium ${
                      checkConflict.hasConflict ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {checkConflict.hasConflict
                      ? `Potential conflict found (${checkConflict.matches.length} match${
                          checkConflict.matches.length > 1 ? 'es' : ''
                        })`
                      : 'No conflicts found'}
                  </span>
                </div>
                {checkConflict.hasConflict && (
                  <div className="space-y-2 mt-3">
                    {checkConflict.matches.map((match) => (
                      <div
                        key={match.id}
                        className={`p-3 rounded ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        }`}
                      >
                        <div
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {match.caseNumber}: {match.title}
                        </div>
                        <div
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Client: {match.client.name} | Opposing: {match.opposingParty.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {viewMode === 'list' ? renderCaseList() : renderCaseDetail()}
        {renderNewCaseModal()}
        {renderConflictCheckModal()}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default LegalCaseManagerTool;
