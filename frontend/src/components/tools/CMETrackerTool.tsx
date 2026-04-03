'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  BookOpen,
  Monitor,
  Users,
  Mic,
  ClipboardList,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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
interface CMEActivity {
  id: string;
  title: string;
  provider: string;
  activityType: 'conference' | 'online' | 'journal' | 'grand-rounds' | 'self-study' | 'lecture' | 'simulation';
  category: string;
  credits: number;
  creditType: 'AMA PRA Category 1' | 'AMA PRA Category 2' | 'AOA 1-A' | 'AOA 1-B' | 'ANCC' | 'other';
  completionDate: string;
  expirationDate?: string;
  certificateNumber?: string;
  verified: boolean;
  attachmentUrl?: string;
  notes?: string;
}

interface ProviderCertification {
  id: string;
  name: string;
  issuingBody: string;
  certificationNumber: string;
  issueDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending-renewal';
  cmeRequired: number;
  cmeCompleted: number;
}

interface CMEProvider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  licenseState: string;
  npi?: string;
  email: string;
  cycleStartDate: string;
  cycleEndDate: string;
  requiredCredits: number;
  earnedCredits: number;
  activities: CMEActivity[];
  certifications: ProviderCertification[];
  status: 'compliant' | 'at-risk' | 'non-compliant';
  createdAt: string;
  updatedAt: string;
}

interface CMETrackerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'cme-tracker';

const cmeColumns: ColumnConfig[] = [
  { key: 'name', header: 'Provider Name', type: 'string' },
  { key: 'specialty', header: 'Specialty', type: 'string' },
  { key: 'licenseState', header: 'License State', type: 'string' },
  { key: 'earnedCredits', header: 'Earned Credits', type: 'number' },
  { key: 'requiredCredits', header: 'Required Credits', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'cycleEndDate', header: 'Cycle End', type: 'date' },
];

const createNewProvider = (): CMEProvider => ({
  id: crypto.randomUUID(),
  name: '',
  title: '',
  specialty: '',
  licenseState: '',
  npi: '',
  email: '',
  cycleStartDate: new Date().toISOString().split('T')[0],
  cycleEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
  requiredCredits: 50,
  earnedCredits: 0,
  activities: [],
  certifications: [],
  status: 'at-risk',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewActivity = (): Omit<CMEActivity, 'id'> => ({
  title: '',
  provider: '',
  activityType: 'online',
  category: 'General',
  credits: 0,
  creditType: 'AMA PRA Category 1',
  completionDate: new Date().toISOString().split('T')[0],
  verified: false,
  notes: '',
});

const createNewCertification = (): Omit<ProviderCertification, 'id'> => ({
  name: '',
  issuingBody: '',
  certificationNumber: '',
  issueDate: new Date().toISOString().split('T')[0],
  expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
  status: 'active',
  cmeRequired: 0,
  cmeCompleted: 0,
});

const specialties = [
  'Anesthesiology',
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Internal Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pathology',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Urology',
  'Other',
];

const activityTypes = [
  { value: 'conference', label: 'Conference', icon: Users },
  { value: 'online', label: 'Online Course', icon: Monitor },
  { value: 'journal', label: 'Journal Article', icon: BookOpen },
  { value: 'grand-rounds', label: 'Grand Rounds', icon: Mic },
  { value: 'self-study', label: 'Self-Study', icon: FileText },
  { value: 'lecture', label: 'Lecture/Presentation', icon: Users },
  { value: 'simulation', label: 'Simulation', icon: ClipboardList },
];

const creditTypes = [
  'AMA PRA Category 1',
  'AMA PRA Category 2',
  'AOA 1-A',
  'AOA 1-B',
  'ANCC',
  'other',
];

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const categories = [
  'General',
  'Patient Safety',
  'Ethics',
  'Opioid Education',
  'Infection Control',
  'Domestic Violence',
  'Cultural Competency',
  'Pain Management',
  'Child Abuse',
  'Risk Management',
  'End of Life Care',
  'Specialty Specific',
];

export const CMETrackerTool: React.FC<CMETrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    data: providers,
    addItem: addProvider,
    updateItem: updateProvider,
    deleteItem: deleteProvider,
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
  } = useToolData<CMEProvider>(TOOL_ID, [], cmeColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CMEProvider | null>(null);
  const [editingProvider, setEditingProvider] = useState<CMEProvider | null>(null);
  const [formData, setFormData] = useState<CMEProvider>(createNewProvider());
  const [activeTab, setActiveTab] = useState<'activities' | 'certifications'>('activities');
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const [newActivity, setNewActivity] = useState<Omit<CMEActivity, 'id'>>(createNewActivity());
  const [editingActivity, setEditingActivity] = useState<CMEActivity | null>(null);

  const [newCertification, setNewCertification] = useState<Omit<ProviderCertification, 'id'>>(createNewCertification());
  const [editingCertification, setEditingCertification] = useState<ProviderCertification | null>(null);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Statistics
  const stats = useMemo(() => {
    const compliant = providers.filter(p => p.status === 'compliant').length;
    const atRisk = providers.filter(p => p.status === 'at-risk').length;
    const nonCompliant = providers.filter(p => p.status === 'non-compliant').length;
    const totalCredits = providers.reduce((sum, p) => sum + p.earnedCredits, 0);
    const expiringSoon = providers.filter(p => {
      const endDate = new Date(p.cycleEndDate);
      const now = new Date();
      const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilEnd <= 90 && daysUntilEnd > 0;
    }).length;

    return {
      total: providers.length,
      compliant,
      atRisk,
      nonCompliant,
      totalCredits,
      expiringSoon,
      complianceRate: providers.length > 0 ? Math.round((compliant / providers.length) * 100) : 0,
    };
  }, [providers]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      const matchesSearch = searchQuery === '' ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || provider.status === filterStatus;
      const matchesSpecialty = filterSpecialty === '' || provider.specialty === filterSpecialty;
      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [providers, searchQuery, filterStatus, filterSpecialty]);

  const calculateProviderStatus = (provider: CMEProvider): 'compliant' | 'at-risk' | 'non-compliant' => {
    const percentComplete = (provider.earnedCredits / provider.requiredCredits) * 100;
    const endDate = new Date(provider.cycleEndDate);
    const now = new Date();
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (provider.earnedCredits >= provider.requiredCredits) return 'compliant';
    if (daysUntilEnd <= 0) return 'non-compliant';
    if (percentComplete < 50 && daysUntilEnd <= 180) return 'at-risk';
    if (percentComplete < 75 && daysUntilEnd <= 90) return 'at-risk';
    return 'at-risk';
  };

  const handleSave = () => {
    const updatedProvider = {
      ...formData,
      earnedCredits: formData.activities.reduce((sum, a) => sum + a.credits, 0),
      updatedAt: new Date().toISOString(),
    };
    updatedProvider.status = calculateProviderStatus(updatedProvider);

    if (editingProvider) {
      updateProvider(updatedProvider.id, updatedProvider);
    } else {
      addProvider({ ...updatedProvider, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingProvider(null);
    setFormData(createNewProvider());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Provider',
      message: 'Are you sure you want to delete this provider record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteProvider(id);
      if (selectedProvider?.id === id) setSelectedProvider(null);
    }
  };

  const openEditModal = (provider: CMEProvider) => {
    setEditingProvider(provider);
    setFormData(provider);
    setShowModal(true);
  };

  const handleSaveActivity = () => {
    if (!selectedProvider) return;

    let updatedActivities: CMEActivity[];
    if (editingActivity) {
      updatedActivities = selectedProvider.activities.map(a =>
        a.id === editingActivity.id ? { ...newActivity, id: editingActivity.id } : a
      );
    } else {
      const activity: CMEActivity = { ...newActivity, id: crypto.randomUUID() };
      updatedActivities = [...selectedProvider.activities, activity];
    }

    const updatedProvider = {
      ...selectedProvider,
      activities: updatedActivities,
      earnedCredits: updatedActivities.reduce((sum, a) => sum + a.credits, 0),
      updatedAt: new Date().toISOString(),
    };
    updatedProvider.status = calculateProviderStatus(updatedProvider);

    updateProvider(selectedProvider.id, updatedProvider);
    setSelectedProvider(updatedProvider);
    setShowActivityModal(false);
    setNewActivity(createNewActivity());
    setEditingActivity(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!selectedProvider) return;
    const confirmed = await confirm({
      title: 'Delete Activity',
      message: 'Are you sure you want to delete this activity?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    const updatedActivities = selectedProvider.activities.filter(a => a.id !== activityId);
    const updatedProvider = {
      ...selectedProvider,
      activities: updatedActivities,
      earnedCredits: updatedActivities.reduce((sum, a) => sum + a.credits, 0),
      updatedAt: new Date().toISOString(),
    };
    updatedProvider.status = calculateProviderStatus(updatedProvider);

    updateProvider(selectedProvider.id, updatedProvider);
    setSelectedProvider(updatedProvider);
  };

  const handleEditActivity = (activity: CMEActivity) => {
    setEditingActivity(activity);
    setNewActivity(activity);
    setShowActivityModal(true);
  };

  const handleSaveCertification = () => {
    if (!selectedProvider) return;

    let updatedCertifications: ProviderCertification[];
    if (editingCertification) {
      updatedCertifications = selectedProvider.certifications.map(c =>
        c.id === editingCertification.id ? { ...newCertification, id: editingCertification.id } : c
      );
    } else {
      const certification: ProviderCertification = { ...newCertification, id: crypto.randomUUID() };
      updatedCertifications = [...selectedProvider.certifications, certification];
    }

    const updatedProvider = {
      ...selectedProvider,
      certifications: updatedCertifications,
      updatedAt: new Date().toISOString(),
    };

    updateProvider(selectedProvider.id, updatedProvider);
    setSelectedProvider(updatedProvider);
    setShowCertModal(false);
    setNewCertification(createNewCertification());
    setEditingCertification(null);
  };

  const handleDeleteCertification = async (certId: string) => {
    if (!selectedProvider) return;
    const confirmed = await confirm({
      title: 'Delete Certification',
      message: 'Are you sure you want to delete this certification?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    const updatedCertifications = selectedProvider.certifications.filter(c => c.id !== certId);
    const updatedProvider = {
      ...selectedProvider,
      certifications: updatedCertifications,
      updatedAt: new Date().toISOString(),
    };

    updateProvider(selectedProvider.id, updatedProvider);
    setSelectedProvider(updatedProvider);
  };

  const handleEditCertification = (cert: ProviderCertification) => {
    setEditingCertification(cert);
    setNewCertification(cert);
    setShowCertModal(true);
  };

  const toggleActivityExpand = (id: string) => {
    const newSet = new Set(expandedActivities);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedActivities(newSet);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'at-risk': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'non-compliant': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending-renewal': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActivityIcon = (type: string) => {
    const typeConfig = activityTypes.find(t => t.value === type);
    return typeConfig?.icon || BookOpen;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiration = (dateString: string) => {
    const endDate = new Date(dateString);
    const now = new Date();
    return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getProgressPercentage = (earned: number, required: number) => {
    if (required === 0) return 0;
    return Math.min(100, Math.round((earned / required) * 100));
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

  const tabClass = (isActive: boolean) => `px-4 py-2 font-medium rounded-lg transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
  }`;

  return (
    <>
    <ConfirmDialog />
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <GraduationCap className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.cMETracker.cmeTracker', 'CME Tracker')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.cMETracker.trackContinuingMedicalEducationCredits', 'Track continuing medical education credits and certifications')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="c-m-e-tracker" toolName="C M E Tracker" />

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
            onExportCSV={() => exportCSV({ filename: 'cme-tracker' })}
            onExportExcel={() => exportExcel({ filename: 'cme-tracker' })}
            onExportJSON={() => exportJSON({ filename: 'cme-tracker' })}
            onExportPDF={() => exportPDF({ filename: 'cme-tracker', title: 'CME Tracker Records' })}
            onPrint={() => print('CME Tracker Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={providers.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewProvider()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.cMETracker.addProvider', 'Add Provider')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cMETracker.providers', 'Providers')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cMETracker.compliant', 'Compliant')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.compliant}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cMETracker.atRisk', 'At Risk')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.atRisk}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cMETracker.nonCompliant', 'Non-Compliant')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.nonCompliant}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cMETracker.totalCredits', 'Total Credits')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.totalCredits}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cMETracker.expiringSoon', 'Expiring Soon')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.expiringSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.cMETracker.searchProviderNameSpecialtyOr', 'Search provider name, specialty, or email...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.cMETracker.allStatus', 'All Status')}</option>
            <option value="compliant">{t('tools.cMETracker.compliant2', 'Compliant')}</option>
            <option value="at-risk">{t('tools.cMETracker.atRisk2', 'At Risk')}</option>
            <option value="non-compliant">{t('tools.cMETracker.nonCompliant2', 'Non-Compliant')}</option>
          </select>
          <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.cMETracker.allSpecialties', 'All Specialties')}</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.cMETracker.providerRoster', 'Provider Roster')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.cMETracker.noProvidersFound', 'No providers found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredProviders.map(provider => {
                  const progressPercent = getProgressPercentage(provider.earnedCredits, provider.requiredCredits);
                  return (
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
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <User className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{provider.name}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {provider.specialty}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(provider.status)}`}>
                                {provider.status.replace('-', ' ')}
                              </span>
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {provider.earnedCredits}/{provider.requiredCredits} credits
                              </span>
                            </div>
                            <div className={`mt-2 h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className={`h-full rounded-full transition-all ${
                                  progressPercent >= 100 ? 'bg-green-500' :
                                  progressPercent >= 75 ? 'bg-cyan-500' :
                                  progressPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(provider); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(provider.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
          {selectedProvider ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedProvider.name}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedProvider.status)}`}>
                        {selectedProvider.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedProvider.title} | {selectedProvider.specialty}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setActiveTab('activities'); setNewActivity(createNewActivity()); setEditingActivity(null); setShowActivityModal(true); }} className={buttonPrimary}>
                      <Plus className="w-4 h-4" /> Add Activity
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Provider Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.cMETracker.licenseState', 'License State')}</p>
                    <p className="font-medium">{selectedProvider.licenseState}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.cMETracker.npi', 'NPI')}</p>
                    <p className="font-medium">{selectedProvider.npi || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.cMETracker.cyclePeriod', 'Cycle Period')}</p>
                    <p className="font-medium text-sm">
                      {formatDate(selectedProvider.cycleStartDate)} - {formatDate(selectedProvider.cycleEndDate)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.cMETracker.daysRemaining', 'Days Remaining')}</p>
                    <p className={`font-medium ${getDaysUntilExpiration(selectedProvider.cycleEndDate) <= 90 ? 'text-orange-500' : ''}`}>
                      {getDaysUntilExpiration(selectedProvider.cycleEndDate)} days
                    </p>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{t('tools.cMETracker.creditProgress', 'Credit Progress')}</h3>
                    <span className="text-lg font-bold text-cyan-500">
                      {selectedProvider.earnedCredits} / {selectedProvider.requiredCredits} credits
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        getProgressPercentage(selectedProvider.earnedCredits, selectedProvider.requiredCredits) >= 100
                          ? 'bg-green-500'
                          : 'bg-gradient-to-r from-cyan-500 to-teal-500'
                      }`}
                      style={{ width: `${getProgressPercentage(selectedProvider.earnedCredits, selectedProvider.requiredCredits)}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getProgressPercentage(selectedProvider.earnedCredits, selectedProvider.requiredCredits)}% complete
                    {selectedProvider.earnedCredits < selectedProvider.requiredCredits && (
                      <> - {selectedProvider.requiredCredits - selectedProvider.earnedCredits} credits needed</>
                    )}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={tabClass(activeTab === 'activities')}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Activities ({selectedProvider.activities.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('certifications')}
                    className={tabClass(activeTab === 'certifications')}
                  >
                    <Award className="w-4 h-4 inline mr-2" />
                    Certifications ({selectedProvider.certifications.length})
                  </button>
                </div>

                {/* Activities Tab */}
                {activeTab === 'activities' && (
                  <div>
                    {selectedProvider.activities.length === 0 ? (
                      <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.cMETracker.noCmeActivitiesLogged', 'No CME activities logged')}</p>
                        <button
                          onClick={() => { setNewActivity(createNewActivity()); setEditingActivity(null); setShowActivityModal(true); }}
                          className={`${buttonSecondary} mt-3 mx-auto`}
                        >
                          <Plus className="w-4 h-4" /> Add First Activity
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedProvider.activities].reverse().map(activity => {
                          const ActivityIcon = getActivityIcon(activity.activityType);
                          const isExpanded = expandedActivities.has(activity.id);
                          return (
                            <div key={activity.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                                    <ActivityIcon className="w-4 h-4 text-cyan-500" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{activity.title}</p>
                                      {activity.verified && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      )}
                                    </div>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {activity.provider}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">
                                        {activity.credits} credits
                                      </span>
                                      <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                                        {activity.creditType}
                                      </span>
                                      <span className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                        {activity.category}
                                      </span>
                                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {formatDate(activity.completionDate)}
                                      </span>
                                    </div>
                                    {isExpanded && (
                                      <div className="mt-3 space-y-2">
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                          <strong>{t('tools.cMETracker.type', 'Type:')}</strong> {activityTypes.find(t => t.value === activity.activityType)?.label}
                                        </p>
                                        {activity.certificateNumber && (
                                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <strong>{t('tools.cMETracker.certificate', 'Certificate #:')}</strong> {activity.certificateNumber}
                                          </p>
                                        )}
                                        {activity.expirationDate && (
                                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <strong>{t('tools.cMETracker.expires', 'Expires:')}</strong> {formatDate(activity.expirationDate)}
                                          </p>
                                        )}
                                        {activity.notes && (
                                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <strong>{t('tools.cMETracker.notes', 'Notes:')}</strong> {activity.notes}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => toggleActivityExpand(activity.id)}
                                    className="p-1.5 hover:bg-gray-600 rounded"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                  </button>
                                  <button onClick={() => handleEditActivity(activity)} className="p-1.5 hover:bg-gray-600 rounded">
                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                  </button>
                                  <button onClick={() => handleDeleteActivity(activity.id)} className="p-1.5 hover:bg-red-500/20 rounded">
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
                )}

                {/* Certifications Tab */}
                {activeTab === 'certifications' && (
                  <div>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => { setNewCertification(createNewCertification()); setEditingCertification(null); setShowCertModal(true); }}
                        className={buttonSecondary}
                      >
                        <Plus className="w-4 h-4" /> Add Certification
                      </button>
                    </div>
                    {selectedProvider.certifications.length === 0 ? (
                      <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.cMETracker.noCertificationsRecorded', 'No certifications recorded')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedProvider.certifications.map(cert => (
                          <div key={cert.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                                  <Award className="w-4 h-4 text-purple-500" />
                                </div>
                                <div>
                                  <p className="font-medium">{cert.name}</p>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {cert.issuingBody}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(cert.status)}`}>
                                      {cert.status.replace('-', ' ')}
                                    </span>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      Expires: {formatDate(cert.expirationDate)}
                                    </span>
                                  </div>
                                  {cert.cmeRequired > 0 && (
                                    <div className="mt-2">
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        CME Required: {cert.cmeCompleted}/{cert.cmeRequired} credits
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => handleEditCertification(cert)} className="p-1.5 hover:bg-gray-600 rounded">
                                  <Edit2 className="w-4 h-4 text-gray-400" />
                                </button>
                                <button onClick={() => handleDeleteCertification(cert.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <GraduationCap className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.cMETracker.selectAProvider', 'Select a provider')}</p>
              <p className="text-sm">{t('tools.cMETracker.chooseAProviderToView', 'Choose a provider to view CME details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Provider Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingProvider ? t('tools.cMETracker.editProvider', 'Edit Provider') : t('tools.cMETracker.addProvider2', 'Add Provider')}</h2>
              <button onClick={() => { setShowModal(false); setEditingProvider(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.providerName', 'Provider Name *')}</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.drJaneSmith', 'Dr. Jane Smith')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.title', 'Title')}</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.mdFacp', 'MD, FACP')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.specialty', 'Specialty *')}</label>
                  <select value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.cMETracker.selectSpecialty', 'Select specialty')}</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.licenseState2', 'License State *')}</label>
                  <select value={formData.licenseState} onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.cMETracker.selectState', 'Select state')}</option>
                    {usStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.npi2', 'NPI')}</label>
                  <input type="text" value={formData.npi} onChange={(e) => setFormData({ ...formData, npi: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.10DigitNpiNumber', '10 digit NPI number')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.email', 'Email *')}</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.providerEmailCom', 'provider@email.com')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.cycleStartDate', 'Cycle Start Date')}</label>
                  <input type="date" value={formData.cycleStartDate} onChange={(e) => setFormData({ ...formData, cycleStartDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.cycleEndDate', 'Cycle End Date')}</label>
                  <input type="date" value={formData.cycleEndDate} onChange={(e) => setFormData({ ...formData, cycleEndDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.requiredCredits', 'Required Credits')}</label>
                  <input type="number" value={formData.requiredCredits} onChange={(e) => setFormData({ ...formData, requiredCredits: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowModal(false); setEditingProvider(null); }} className={buttonSecondary}>{t('tools.cMETracker.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.name || !formData.specialty || !formData.licenseState || !formData.email} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Activity Modal */}
      {showActivityModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingActivity ? t('tools.cMETracker.editCmeActivity', 'Edit CME Activity') : t('tools.cMETracker.addCmeActivity', 'Add CME Activity')}</h2>
              <button onClick={() => { setShowActivityModal(false); setEditingActivity(null); }} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.cMETracker.activityTitle', 'Activity Title *')}</label>
                  <input type="text" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.eGAnnualCmeConference', 'e.g., Annual CME Conference 2024')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.providerOrganization', 'Provider/Organization')}</label>
                  <input type="text" value={newActivity.provider} onChange={(e) => setNewActivity({ ...newActivity, provider: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.eGAmaAccme', 'e.g., AMA, ACCME')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.activityType', 'Activity Type')}</label>
                  <select value={newActivity.activityType} onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value as any })} className={inputClass}>
                    {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.category', 'Category')}</label>
                  <select value={newActivity.category} onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })} className={inputClass}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.credits', 'Credits *')}</label>
                  <input type="number" value={newActivity.credits} onChange={(e) => setNewActivity({ ...newActivity, credits: parseFloat(e.target.value) || 0 })} className={inputClass} step="0.25" min="0" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.creditType', 'Credit Type')}</label>
                  <select value={newActivity.creditType} onChange={(e) => setNewActivity({ ...newActivity, creditType: e.target.value as any })} className={inputClass}>
                    {creditTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.completionDate', 'Completion Date *')}</label>
                  <input type="date" value={newActivity.completionDate} onChange={(e) => setNewActivity({ ...newActivity, completionDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.expirationDate', 'Expiration Date')}</label>
                  <input type="date" value={newActivity.expirationDate || ''} onChange={(e) => setNewActivity({ ...newActivity, expirationDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.certificateNumber', 'Certificate Number')}</label>
                  <input type="text" value={newActivity.certificateNumber || ''} onChange={(e) => setNewActivity({ ...newActivity, certificateNumber: e.target.value })} className={inputClass} />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="verified" checked={newActivity.verified} onChange={(e) => setNewActivity({ ...newActivity, verified: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="verified" className={labelClass}>{t('tools.cMETracker.verified', 'Verified')}</label>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.cMETracker.notes2', 'Notes')}</label>
                <textarea value={newActivity.notes || ''} onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.cMETracker.additionalNotesAboutThisActivity', 'Additional notes about this activity...')} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowActivityModal(false); setEditingActivity(null); }} className={buttonSecondary}>{t('tools.cMETracker.cancel2', 'Cancel')}</button>
                <button type="button" onClick={handleSaveActivity} disabled={!newActivity.title || !newActivity.completionDate || newActivity.credits <= 0} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Certification Modal */}
      {showCertModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingCertification ? t('tools.cMETracker.editCertification', 'Edit Certification') : t('tools.cMETracker.addCertification', 'Add Certification')}</h2>
              <button onClick={() => { setShowCertModal(false); setEditingCertification(null); }} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.cMETracker.certificationName', 'Certification Name *')}</label>
                <input type="text" value={newCertification.name} onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.eGBoardCertificationIn', 'e.g., Board Certification in Internal Medicine')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.cMETracker.issuingBody', 'Issuing Body *')}</label>
                <input type="text" value={newCertification.issuingBody} onChange={(e) => setNewCertification({ ...newCertification, issuingBody: e.target.value })} className={inputClass} placeholder={t('tools.cMETracker.eGAmericanBoardOf', 'e.g., American Board of Internal Medicine')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.cMETracker.certificationNumber', 'Certification Number')}</label>
                <input type="text" value={newCertification.certificationNumber} onChange={(e) => setNewCertification({ ...newCertification, certificationNumber: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.issueDate', 'Issue Date')}</label>
                  <input type="date" value={newCertification.issueDate} onChange={(e) => setNewCertification({ ...newCertification, issueDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.expirationDate2', 'Expiration Date')}</label>
                  <input type="date" value={newCertification.expirationDate} onChange={(e) => setNewCertification({ ...newCertification, expirationDate: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.cMETracker.status', 'Status')}</label>
                <select value={newCertification.status} onChange={(e) => setNewCertification({ ...newCertification, status: e.target.value as any })} className={inputClass}>
                  <option value="active">{t('tools.cMETracker.active', 'Active')}</option>
                  <option value="pending-renewal">{t('tools.cMETracker.pendingRenewal', 'Pending Renewal')}</option>
                  <option value="expired">{t('tools.cMETracker.expired', 'Expired')}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.cmeRequired', 'CME Required')}</label>
                  <input type="number" value={newCertification.cmeRequired} onChange={(e) => setNewCertification({ ...newCertification, cmeRequired: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.cMETracker.cmeCompleted', 'CME Completed')}</label>
                  <input type="number" value={newCertification.cmeCompleted} onChange={(e) => setNewCertification({ ...newCertification, cmeCompleted: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowCertModal(false); setEditingCertification(null); }} className={buttonSecondary}>{t('tools.cMETracker.cancel3', 'Cancel')}</button>
                <button type="button" onClick={handleSaveCertification} disabled={!newCertification.name || !newCertification.issuingBody} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Certification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cMETracker.aboutCmeTracker', 'About CME Tracker')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Track Continuing Medical Education (CME) credits for healthcare providers. Monitor compliance status,
          log educational activities, manage certifications, and ensure providers meet state licensing requirements.
          Supports AMA PRA Category 1 & 2, AOA, ANCC, and other credit types. Export reports for compliance audits and license renewals.
        </p>
      </div>
    </div>
    </>
  );
};

export default CMETrackerTool;
