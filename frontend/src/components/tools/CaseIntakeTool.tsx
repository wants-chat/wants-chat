'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  X,
  Briefcase,
  MessageSquare,
  Tag,
  DollarSign,
  Shield,
  Users,
  MapPin,
  Building,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  ClipboardList,
  Gavel,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface CaseIntakeToolProps {
  uiConfig?: UIConfig;
}

// Types as specified
interface ConflictCheck {
  checkedDate?: string;
  checkedBy?: string;
  result: 'pending' | 'clear' | 'potential' | 'conflict';
  conflictingMatters: string[];
  notes: string;
}

interface ConsultationRecord {
  scheduledDate?: string;
  completedDate?: string;
  duration?: number;
  attorney: string;
  outcome: 'pending' | 'retained' | 'declined' | 'referred';
  fee?: number;
  notes: string;
}

interface CaseIntake {
  id: string;
  intakeDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  caseType: 'litigation' | 'transactional' | 'criminal' | 'family' | 'estate' | 'corporate' | 'immigration' | 'other';
  practiceArea: string;
  opposingParty?: string;
  caseDescription: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  referralSource: string;
  conflictCheck: ConflictCheck;
  consultation: ConsultationRecord;
  status: 'pending' | 'screening' | 'conflict-check' | 'approved' | 'declined' | 'converted';
  assignedAttorney?: string;
  estimatedValue?: number;
  retainerRequired?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TOOL_ID = 'case-intake';

const CASE_TYPES: { value: CaseIntake['caseType']; label: string; icon: React.ElementType }[] = [
  { value: 'litigation', label: 'Litigation', icon: Gavel },
  { value: 'transactional', label: 'Transactional', icon: FileText },
  { value: 'criminal', label: 'Criminal Defense', icon: Shield },
  { value: 'family', label: 'Family Law', icon: Users },
  { value: 'estate', label: 'Estate Planning', icon: Building },
  { value: 'corporate', label: 'Corporate', icon: Briefcase },
  { value: 'immigration', label: 'Immigration', icon: MapPin },
  { value: 'other', label: 'Other', icon: ClipboardList },
];

const STATUS_OPTIONS: { value: CaseIntake['status']; label: string }[] = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'screening', label: 'Screening' },
  { value: 'conflict-check', label: 'Conflict Check' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'converted', label: 'Converted to Case' },
];

const URGENCY_OPTIONS: { value: CaseIntake['urgency']; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const CONFLICT_RESULTS: { value: ConflictCheck['result']; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'clear', label: 'Clear' },
  { value: 'potential', label: 'Potential Conflict' },
  { value: 'conflict', label: 'Conflict Found' },
];

const CONSULTATION_OUTCOMES: { value: ConsultationRecord['outcome']; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'retained', label: 'Retained' },
  { value: 'declined', label: 'Declined' },
  { value: 'referred', label: 'Referred Out' },
];

const REFERRAL_SOURCES = [
  'Website',
  'Client Referral',
  'Attorney Referral',
  'Bar Association',
  'Google/Search',
  'Social Media',
  'Advertisement',
  'Walk-in',
  'Repeat Client',
  'Other',
];

const PRACTICE_AREAS = [
  'Personal Injury',
  'Medical Malpractice',
  'Product Liability',
  'Workers Compensation',
  'Divorce/Dissolution',
  'Child Custody',
  'Child Support',
  'Adoption',
  'Wills & Trusts',
  'Probate',
  'Business Formation',
  'Contracts',
  'Mergers & Acquisitions',
  'Employment Law',
  'Real Estate',
  'Bankruptcy',
  'Criminal Defense',
  'DUI/DWI',
  'Immigration',
  'Intellectual Property',
  'Other',
];

const intakeColumns: ColumnConfig[] = [
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'clientPhone', header: 'Phone', type: 'string' },
  { key: 'caseType', header: 'Case Type', type: 'string' },
  { key: 'practiceArea', header: 'Practice Area', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'urgency', header: 'Urgency', type: 'string' },
  { key: 'assignedAttorney', header: 'Assigned Attorney', type: 'string' },
  { key: 'intakeDate', header: 'Intake Date', type: 'date' },
  { key: 'estimatedValue', header: 'Estimated Value', type: 'currency' },
];

const createNewIntake = (): CaseIntake => ({
  id: crypto.randomUUID(),
  intakeDate: new Date().toISOString().split('T')[0],
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  caseType: 'litigation',
  practiceArea: '',
  opposingParty: '',
  caseDescription: '',
  urgency: 'medium',
  referralSource: 'Website',
  conflictCheck: {
    result: 'pending',
    conflictingMatters: [],
    notes: '',
  },
  consultation: {
    attorney: '',
    outcome: 'pending',
    notes: '',
  },
  status: 'pending',
  assignedAttorney: '',
  estimatedValue: undefined,
  retainerRequired: undefined,
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const CaseIntakeTool: React.FC<CaseIntakeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: intakes,
    addItem: addIntake,
    updateItem: updateIntake,
    deleteItem: deleteIntake,
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
  } = useToolData<CaseIntake>(TOOL_ID, [], intakeColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCaseType, setFilterCaseType] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState<CaseIntake | null>(null);
  const [editingIntake, setEditingIntake] = useState<CaseIntake | null>(null);
  const [formData, setFormData] = useState<CaseIntake>(createNewIntake());
  const [newConflictingMatter, setNewConflictingMatter] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthIntakes = intakes.filter(
      (i) => new Date(i.intakeDate) >= thisMonth
    );

    const converted = intakes.filter((i) => i.status === 'converted');
    const pending = intakes.filter((i) => i.status === 'pending');
    const urgent = intakes.filter((i) => i.urgency === 'urgent' || i.urgency === 'high');

    const conversionRate = intakes.length > 0
      ? Math.round((converted.length / intakes.length) * 100)
      : 0;

    const byPracticeArea: Record<string, number> = {};
    intakes.forEach((i) => {
      if (i.practiceArea) {
        byPracticeArea[i.practiceArea] = (byPracticeArea[i.practiceArea] || 0) + 1;
      }
    });

    const byCaseType: Record<string, number> = {};
    intakes.forEach((i) => {
      byCaseType[i.caseType] = (byCaseType[i.caseType] || 0) + 1;
    });

    const conflictsPending = intakes.filter(
      (i) => i.conflictCheck.result === 'pending'
    ).length;

    const totalEstimatedValue = intakes.reduce(
      (sum, i) => sum + (i.estimatedValue || 0),
      0
    );

    return {
      total: intakes.length,
      thisMonth: thisMonthIntakes.length,
      converted: converted.length,
      pending: pending.length,
      urgent: urgent.length,
      conversionRate,
      byPracticeArea,
      byCaseType,
      conflictsPending,
      totalEstimatedValue,
    };
  }, [intakes]);

  // Filtered intakes
  const filteredIntakes = useMemo(() => {
    return intakes.filter((intake) => {
      const matchesSearch =
        searchQuery === '' ||
        intake.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.clientPhone.includes(searchQuery) ||
        intake.practiceArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.caseDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === '' || intake.status === filterStatus;
      const matchesCaseType = filterCaseType === '' || intake.caseType === filterCaseType;
      const matchesUrgency = filterUrgency === '' || intake.urgency === filterUrgency;

      return matchesSearch && matchesStatus && matchesCaseType && matchesUrgency;
    });
  }, [intakes, searchQuery, filterStatus, filterCaseType, filterUrgency]);

  const handleSave = useCallback(() => {
    if (!formData.clientName || !formData.clientPhone) {
      setValidationMessage('Please fill in required fields (Client Name and Phone)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingIntake) {
      updateIntake(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addIntake({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingIntake(null);
    setFormData(createNewIntake());
  }, [formData, editingIntake, updateIntake, addIntake]);

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Intake Record',
      message: 'Are you sure you want to delete this intake record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteIntake(id);
      if (selectedIntake?.id === id) setSelectedIntake(null);
    }
  }, [confirm, deleteIntake, selectedIntake]);

  const openEditModal = (intake: CaseIntake) => {
    setEditingIntake(intake);
    setFormData(intake);
    setShowModal(true);
  };

  const addConflictingMatter = () => {
    if (newConflictingMatter.trim() && !formData.conflictCheck.conflictingMatters.includes(newConflictingMatter.trim())) {
      setFormData({
        ...formData,
        conflictCheck: {
          ...formData.conflictCheck,
          conflictingMatters: [...formData.conflictCheck.conflictingMatters, newConflictingMatter.trim()],
        },
      });
      setNewConflictingMatter('');
    }
  };

  const removeConflictingMatter = (matter: string) => {
    setFormData({
      ...formData,
      conflictCheck: {
        ...formData.conflictCheck,
        conflictingMatters: formData.conflictCheck.conflictingMatters.filter((m) => m !== matter),
      },
    });
  };

  const updateConflictCheck = () => {
    if (selectedIntake) {
      const updated = {
        ...selectedIntake,
        conflictCheck: formData.conflictCheck,
        updatedAt: new Date().toISOString(),
      };
      updateIntake(selectedIntake.id, updated);
      setSelectedIntake(updated);
      setShowConflictModal(false);
    }
  };

  const updateConsultation = () => {
    if (selectedIntake) {
      const updated = {
        ...selectedIntake,
        consultation: formData.consultation,
        updatedAt: new Date().toISOString(),
      };
      updateIntake(selectedIntake.id, updated);
      setSelectedIntake(updated);
      setShowConsultationModal(false);
    }
  };

  const getStatusColor = (status: CaseIntake['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'screening':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'conflict-check':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'declined':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'converted':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getUrgencyColor = (urgency: CaseIntake['urgency']) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConflictColor = (result: ConflictCheck['result']) => {
    switch (result) {
      case 'clear':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'potential':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'conflict':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getOutcomeColor = (outcome: ConsultationRecord['outcome']) => {
    switch (outcome) {
      case 'retained':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'declined':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'referred':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCaseTypeIcon = (type: CaseIntake['caseType']) => {
    const caseTypeConfig = CASE_TYPES.find((t) => t.value === type);
    return caseTypeConfig?.icon || ClipboardList;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500'
  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-teal-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl">
            <Scale className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.caseIntake.caseIntake', 'Case Intake')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.caseIntake.manageLegalCaseIntakeAnd', 'Manage legal case intake and client screening')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="case-intake" toolName="Case Intake" />

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
            onExportCSV={() => exportCSV({ filename: 'case-intake' })}
            onExportExcel={() => exportExcel({ filename: 'case-intake' })}
            onExportJSON={() => exportJSON({ filename: 'case-intake' })}
            onExportPDF={() => exportPDF({ filename: 'case-intake', title: 'Case Intake Records' })}
            onPrint={() => print('Case Intake Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={intakes.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button
            onClick={() => {
              setFormData(createNewIntake());
              setEditingIntake(null);
              setShowModal(true);
            }}
            className={buttonPrimary}
          >
            <Plus className="w-4 h-4" />
            {t('tools.caseIntake.newIntake', 'New Intake')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseIntake.totalIntakes', 'Total Intakes')}</p>
              <p className="text-2xl font-bold text-teal-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseIntake.thisMonth', 'This Month')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseIntake.conversion', 'Conversion')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseIntake.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseIntake.highPriority', 'High Priority')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.urgent}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caseIntake.conflictsCheck', 'Conflicts Check')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.conflictsPending}</p>
            </div>
          </div>
        </div>
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
              placeholder={t('tools.caseIntake.searchByClientNameEmail', 'Search by client name, email, phone, or description...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${inputClass} w-full lg:w-40`}
          >
            <option value="">{t('tools.caseIntake.allStatus', 'All Status')}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filterCaseType}
            onChange={(e) => setFilterCaseType(e.target.value)}
            className={`${inputClass} w-full lg:w-40`}
          >
            <option value="">{t('tools.caseIntake.allTypes', 'All Types')}</option>
            {CASE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className={`${inputClass} w-full lg:w-40`}
          >
            <option value="">{t('tools.caseIntake.allUrgency', 'All Urgency')}</option>
            {URGENCY_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intake List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.caseIntake.intakeRecords', 'Intake Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredIntakes.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.caseIntake.noIntakeRecordsFound', 'No intake records found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredIntakes.map((intake) => {
                  const TypeIcon = getCaseTypeIcon(intake.caseType);
                  return (
                    <div
                      key={intake.id}
                      onClick={() => setSelectedIntake(intake)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedIntake?.id === intake.id
                          ? 'bg-teal-500/10 border-l-4 border-teal-500'
                          : theme === 'dark'
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-teal-500" />
                          </div>
                          <div>
                            <p className="font-medium">{intake.clientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {intake.practiceArea || CASE_TYPES.find((t) => t.value === intake.caseType)?.label}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(
                                  intake.status
                                )}`}
                              >
                                {STATUS_OPTIONS.find((s) => s.value === intake.status)?.label}
                              </span>
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded border ${getUrgencyColor(
                                  intake.urgency
                                )}`}
                              >
                                {intake.urgency}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(intake);
                            }}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleDelete(intake.id);
                            }}
                            className="p-1.5 hover:bg-red-500/20 rounded"
                          >
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
          {selectedIntake ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedIntake.clientName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedIntake.status)}`}>
                        {STATUS_OPTIONS.find((s) => s.value === selectedIntake.status)?.label}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getUrgencyColor(selectedIntake.urgency)}`}>
                        {selectedIntake.urgency}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedIntake.practiceArea} | {CASE_TYPES.find((t) => t.value === selectedIntake.caseType)?.label}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(selectedIntake);
                        setShowConflictModal(true);
                      }}
                      className={buttonSecondary}
                    >
                      <Shield className="w-4 h-4" /> Conflict Check
                    </button>
                    <button
                      onClick={() => {
                        setFormData(selectedIntake);
                        setShowConsultationModal(true);
                      }}
                      className={buttonPrimary}
                    >
                      <Calendar className="w-4 h-4" /> Consultation
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </p>
                    <p className="font-medium text-sm truncate">{selectedIntake.clientEmail || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </p>
                    <p className="font-medium text-sm">{selectedIntake.clientPhone}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Intake Date
                    </p>
                    <p className="font-medium text-sm">{formatDate(selectedIntake.intakeDate)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Referral Source
                    </p>
                    <p className="font-medium text-sm">{selectedIntake.referralSource}</p>
                  </div>
                </div>

                {/* Case Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.caseIntake.assignedAttorney', 'Assigned Attorney')}</p>
                    <p className="font-medium text-sm">{selectedIntake.assignedAttorney || 'Unassigned'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.caseIntake.estimatedValue', 'Estimated Value')}</p>
                    <p className="font-medium text-sm">{formatCurrency(selectedIntake.estimatedValue)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.caseIntake.retainerRequired', 'Retainer Required')}</p>
                    <p className="font-medium text-sm">{formatCurrency(selectedIntake.retainerRequired)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.caseIntake.opposingParty', 'Opposing Party')}</p>
                    <p className="font-medium text-sm">{selectedIntake.opposingParty || 'N/A'}</p>
                  </div>
                </div>

                {/* Case Description */}
                {selectedIntake.caseDescription && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('tools.caseIntake.caseDescription', 'Case Description')}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedIntake.caseDescription}
                    </p>
                  </div>
                )}

                {/* Conflict Check Section */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    {t('tools.caseIntake.conflictCheck', 'Conflict Check')}
                  </h3>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 text-sm rounded-full border ${getConflictColor(
                          selectedIntake.conflictCheck.result
                        )}`}
                      >
                        {CONFLICT_RESULTS.find((c) => c.value === selectedIntake.conflictCheck.result)?.label}
                      </span>
                      {selectedIntake.conflictCheck.checkedDate && (
                        <span className="text-sm text-gray-400">
                          Checked: {formatDate(selectedIntake.conflictCheck.checkedDate)}
                          {selectedIntake.conflictCheck.checkedBy && ` by ${selectedIntake.conflictCheck.checkedBy}`}
                        </span>
                      )}
                    </div>
                    {selectedIntake.conflictCheck.conflictingMatters.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">{t('tools.caseIntake.conflictingMatters', 'Conflicting Matters:')}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedIntake.conflictCheck.conflictingMatters.map((matter, i) => (
                            <span
                              key={i}
                              className={`px-2 py-1 text-xs rounded ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                              }`}
                            >
                              {matter}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedIntake.conflictCheck.notes && (
                      <p className="text-sm text-gray-400">{selectedIntake.conflictCheck.notes}</p>
                    )}
                  </div>
                </div>

                {/* Consultation Section */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    {t('tools.caseIntake.consultation', 'Consultation')}
                  </h3>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 text-sm rounded-full border ${getOutcomeColor(
                          selectedIntake.consultation.outcome
                        )}`}
                      >
                        {CONSULTATION_OUTCOMES.find((c) => c.value === selectedIntake.consultation.outcome)?.label}
                      </span>
                      {selectedIntake.consultation.attorney && (
                        <span className="text-sm text-gray-400">
                          Attorney: {selectedIntake.consultation.attorney}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.caseIntake.scheduled', 'Scheduled')}</p>
                        <p className="text-sm">{formatDate(selectedIntake.consultation.scheduledDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.caseIntake.completed', 'Completed')}</p>
                        <p className="text-sm">{formatDate(selectedIntake.consultation.completedDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.caseIntake.duration', 'Duration')}</p>
                        <p className="text-sm">
                          {selectedIntake.consultation.duration
                            ? `${selectedIntake.consultation.duration} min`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.caseIntake.fee', 'Fee')}</p>
                        <p className="text-sm">{formatCurrency(selectedIntake.consultation.fee)}</p>
                      </div>
                    </div>
                    {selectedIntake.consultation.notes && (
                      <p className="text-sm text-gray-400">{selectedIntake.consultation.notes}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedIntake.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('tools.caseIntake.additionalNotes', 'Additional Notes')}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedIntake.notes}
                    </p>
                  </div>
                )}

                {/* Status Update Buttons */}
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className="text-sm font-medium mb-3">{t('tools.caseIntake.updateStatus', 'Update Status')}</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          updateIntake(selectedIntake.id, {
                            status: status.value,
                            updatedAt: new Date().toISOString(),
                          });
                          setSelectedIntake({ ...selectedIntake, status: status.value });
                        }}
                        className={`px-3 py-1 text-sm rounded-full border transition-all ${
                          selectedIntake.status === status.value
                            ? getStatusColor(status.value) + ' ring-2 ring-offset-2 ring-teal-500'
                            : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                            : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center py-20 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <Scale className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.caseIntake.selectAnIntakeRecord', 'Select an intake record')}</p>
              <p className="text-sm">{t('tools.caseIntake.chooseAnIntakeToView', 'Choose an intake to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div
              className={`p-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } flex items-center justify-between`}
            >
              <h2 className="text-xl font-bold">{editingIntake ? t('tools.caseIntake.editIntake', 'Edit Intake') : t('tools.caseIntake.newIntake2', 'New Intake')}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingIntake(null);
                }}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-500" />
                  {t('tools.caseIntake.clientInformation', 'Client Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.clientName', 'Client Name *')}</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.caseIntake.fullName', 'Full name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.phone', 'Phone *')}</label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className={inputClass}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.email', 'Email')}</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.caseIntake.emailExampleCom', 'email@example.com')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.intakeDate', 'Intake Date')}</label>
                    <input
                      type="date"
                      value={formData.intakeDate}
                      onChange={(e) => setFormData({ ...formData, intakeDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Case Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-500" />
                  {t('tools.caseIntake.caseInformation', 'Case Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.caseType', 'Case Type')}</label>
                    <select
                      value={formData.caseType}
                      onChange={(e) =>
                        setFormData({ ...formData, caseType: e.target.value as CaseIntake['caseType'] })
                      }
                      className={inputClass}
                    >
                      {CASE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.practiceArea', 'Practice Area')}</label>
                    <select
                      value={formData.practiceArea}
                      onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.caseIntake.selectPracticeArea', 'Select practice area...')}</option>
                      {PRACTICE_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.urgency', 'Urgency')}</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) =>
                        setFormData({ ...formData, urgency: e.target.value as CaseIntake['urgency'] })
                      }
                      className={inputClass}
                    >
                      {URGENCY_OPTIONS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.status', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as CaseIntake['status'] })
                      }
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.opposingParty2', 'Opposing Party')}</label>
                    <input
                      type="text"
                      value={formData.opposingParty || ''}
                      onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.caseIntake.nameOfOpposingParty', 'Name of opposing party')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.referralSource', 'Referral Source')}</label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                      className={inputClass}
                    >
                      {REFERRAL_SOURCES.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>{t('tools.caseIntake.caseDescription2', 'Case Description')}</label>
                  <textarea
                    value={formData.caseDescription}
                    onChange={(e) => setFormData({ ...formData, caseDescription: e.target.value })}
                    className={inputClass}
                    rows={3}
                    placeholder={t('tools.caseIntake.describeTheCaseDetails', 'Describe the case details...')}
                  />
                </div>
              </div>

              {/* Assignment & Financial */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                  {t('tools.caseIntake.assignmentFinancial', 'Assignment & Financial')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.assignedAttorney2', 'Assigned Attorney')}</label>
                    <input
                      type="text"
                      value={formData.assignedAttorney || ''}
                      onChange={(e) => setFormData({ ...formData, assignedAttorney: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.caseIntake.attorneyName', 'Attorney name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.estimatedValue2', 'Estimated Value')}</label>
                    <input
                      type="number"
                      value={formData.estimatedValue || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || undefined })
                      }
                      className={inputClass}
                      placeholder="$0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.caseIntake.retainerRequired2', 'Retainer Required')}</label>
                    <input
                      type="number"
                      value={formData.retainerRequired || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, retainerRequired: parseFloat(e.target.value) || undefined })
                      }
                      className={inputClass}
                      placeholder="$0"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.caseIntake.additionalNotes2', 'Additional Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder={t('tools.caseIntake.anyAdditionalNotes', 'Any additional notes...')}
                />
              </div>

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingIntake(null);
                  }}
                  className={buttonSecondary}
                >
                  {t('tools.caseIntake.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!formData.clientName || !formData.clientPhone}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> {editingIntake ? t('tools.caseIntake.update', 'Update') : t('tools.caseIntake.create', 'Create')} Intake
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Check Modal */}
      {showConflictModal && selectedIntake && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div
              className={`p-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } flex items-center justify-between`}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                {t('tools.caseIntake.conflictCheck2', 'Conflict Check')}
              </h2>
              <button
                onClick={() => setShowConflictModal(false)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.result', 'Result')}</label>
                  <select
                    value={formData.conflictCheck.result}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conflictCheck: {
                          ...formData.conflictCheck,
                          result: e.target.value as ConflictCheck['result'],
                        },
                      })
                    }
                    className={inputClass}
                  >
                    {CONFLICT_RESULTS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.checkedDate', 'Checked Date')}</label>
                  <input
                    type="date"
                    value={formData.conflictCheck.checkedDate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conflictCheck: { ...formData.conflictCheck, checkedDate: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.caseIntake.checkedBy', 'Checked By')}</label>
                <input
                  type="text"
                  value={formData.conflictCheck.checkedBy || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conflictCheck: { ...formData.conflictCheck, checkedBy: e.target.value },
                    })
                  }
                  className={inputClass}
                  placeholder={t('tools.caseIntake.attorneyOrStaffName', 'Attorney or staff name')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.caseIntake.conflictingMatters2', 'Conflicting Matters')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newConflictingMatter}
                    onChange={(e) => setNewConflictingMatter(e.target.value)}
                    placeholder={t('tools.caseIntake.addConflictingMatter', 'Add conflicting matter')}
                    className={inputClass}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConflictingMatter())}
                  />
                  <button type="button" onClick={addConflictingMatter} className={buttonSecondary}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.conflictCheck.conflictingMatters.map((matter, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      {matter}
                      <button onClick={() => removeConflictingMatter(matter)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.caseIntake.notes', 'Notes')}</label>
                <textarea
                  value={formData.conflictCheck.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conflictCheck: { ...formData.conflictCheck, notes: e.target.value },
                    })
                  }
                  className={inputClass}
                  rows={3}
                  placeholder={t('tools.caseIntake.conflictCheckNotes', 'Conflict check notes...')}
                />
              </div>
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <button type="button" onClick={() => setShowConflictModal(false)} className={buttonSecondary}>
                  {t('tools.caseIntake.cancel2', 'Cancel')}
                </button>
                <button type="button" onClick={updateConflictCheck} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Conflict Check
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {showConsultationModal && selectedIntake && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div
              className={`p-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } flex items-center justify-between`}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-500" />
                {t('tools.caseIntake.consultation2', 'Consultation')}
              </h2>
              <button
                onClick={() => setShowConsultationModal(false)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.scheduledDate', 'Scheduled Date')}</label>
                  <input
                    type="datetime-local"
                    value={formData.consultation.scheduledDate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation: { ...formData.consultation, scheduledDate: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.completedDate', 'Completed Date')}</label>
                  <input
                    type="datetime-local"
                    value={formData.consultation.completedDate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation: { ...formData.consultation, completedDate: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.attorney', 'Attorney')}</label>
                  <input
                    type="text"
                    value={formData.consultation.attorney}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation: { ...formData.consultation, attorney: e.target.value },
                      })
                    }
                    className={inputClass}
                    placeholder={t('tools.caseIntake.consultingAttorney', 'Consulting attorney')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.outcome', 'Outcome')}</label>
                  <select
                    value={formData.consultation.outcome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation: {
                          ...formData.consultation,
                          outcome: e.target.value as ConsultationRecord['outcome'],
                        },
                      })
                    }
                    className={inputClass}
                  >
                    {CONSULTATION_OUTCOMES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.durationMinutes', 'Duration (minutes)')}</label>
                  <input
                    type="number"
                    value={formData.consultation.duration || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation: {
                          ...formData.consultation,
                          duration: parseInt(e.target.value) || undefined,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="e.g., 60"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.caseIntake.consultationFee', 'Consultation Fee')}</label>
                  <input
                    type="number"
                    value={formData.consultation.fee || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation: {
                          ...formData.consultation,
                          fee: parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="$0"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.caseIntake.notes2', 'Notes')}</label>
                <textarea
                  value={formData.consultation.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultation: { ...formData.consultation, notes: e.target.value },
                    })
                  }
                  className={inputClass}
                  rows={3}
                  placeholder={t('tools.caseIntake.consultationNotes', 'Consultation notes...')}
                />
              </div>
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <button type="button" onClick={() => setShowConsultationModal(false)} className={buttonSecondary}>
                  {t('tools.caseIntake.cancel3', 'Cancel')}
                </button>
                <button type="button" onClick={updateConsultation} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.caseIntake.aboutCaseIntake', 'About Case Intake')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage legal case intake, client screening, and conflict checks. Track consultations, assess case urgency,
          monitor referral sources, and streamline the new client onboarding process. Export intake data for reporting
          and analysis.
        </p>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle className="w-4 h-4" />
          {validationMessage}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default CaseIntakeTool;
