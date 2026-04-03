'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Radiation,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Activity,
  Clock,
  FileText,
  Target,
  Zap,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Settings,
  Users,
  Stethoscope,
  ClipboardList,
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
interface TreatmentSession {
  id: string;
  date: string;
  sessionNumber: number;
  actualDose: number;
  machineUsed: string;
  physicist: string;
  technologist: string;
  notes: string;
  completed: boolean;
  verificationImages: boolean;
}

interface SideEffect {
  id: string;
  name: string;
  grade: 1 | 2 | 3 | 4 | 5;
  onsetDate: string;
  resolvedDate: string;
  treatment: string;
  notes: string;
}

interface TreatmentPlan {
  totalDose: number;
  fractions: number;
  dosePerFraction: number;
  technique: string;
  modality: string;
  beamEnergy: string;
  fieldArrangement: string;
  targetVolume: string;
  prescriptionPoint: string;
}

interface QualityAssurance {
  planApproved: boolean;
  planApprovalDate: string;
  physicistSignoff: boolean;
  physicistSignoffDate: string;
  dailyQA: boolean;
  weeklyQA: boolean;
  lastQADate: string;
  igrtProtocol: string;
}

interface RadiationTherapyRecord {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  cancerDiagnosis: string;
  tumorLocation: string;
  stage: string;
  treatmentIntent: 'curative' | 'palliative' | 'adjuvant' | 'neoadjuvant';
  radiationOncologist: string;
  referringPhysician: string;
  treatmentPlan: TreatmentPlan;
  treatmentSessions: TreatmentSession[];
  sideEffects: SideEffect[];
  ctSimDate: string;
  planningStartDate: string;
  treatmentStartDate: string;
  treatmentEndDate: string;
  concurrentChemo: boolean;
  chemotherapyRegimen: string;
  followUpSchedule: string;
  qualityAssurance: QualityAssurance;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'discontinued';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RadiationTherapyToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'radiation-therapy';

const radiationColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'cancerDiagnosis', header: 'Diagnosis', type: 'string' },
  { key: 'tumorLocation', header: 'Location', type: 'string' },
  { key: 'treatmentIntent', header: 'Intent', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'treatmentStartDate', header: 'Start Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewRecord = (): RadiationTherapyRecord => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dateOfBirth: '',
  cancerDiagnosis: '',
  tumorLocation: '',
  stage: '',
  treatmentIntent: 'curative',
  radiationOncologist: '',
  referringPhysician: '',
  treatmentPlan: {
    totalDose: 0,
    fractions: 0,
    dosePerFraction: 0,
    technique: '',
    modality: '',
    beamEnergy: '',
    fieldArrangement: '',
    targetVolume: '',
    prescriptionPoint: '',
  },
  treatmentSessions: [],
  sideEffects: [],
  ctSimDate: '',
  planningStartDate: '',
  treatmentStartDate: '',
  treatmentEndDate: '',
  concurrentChemo: false,
  chemotherapyRegimen: '',
  followUpSchedule: '',
  qualityAssurance: {
    planApproved: false,
    planApprovalDate: '',
    physicistSignoff: false,
    physicistSignoffDate: '',
    dailyQA: false,
    weeklyQA: false,
    lastQADate: '',
    igrtProtocol: '',
  },
  status: 'planning',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const treatmentIntents = [
  { value: 'curative', label: 'Curative', icon: Target },
  { value: 'palliative', label: 'Palliative', icon: Activity },
  { value: 'adjuvant', label: 'Adjuvant', icon: Plus },
  { value: 'neoadjuvant', label: 'Neoadjuvant', icon: Zap },
];

const radiationModalities = [
  'External Beam (EBRT)',
  '3D Conformal (3D-CRT)',
  'IMRT',
  'VMAT',
  'SBRT/SRS',
  'Proton Therapy',
  'Brachytherapy',
  'Electron Beam',
  'Total Body Irradiation (TBI)',
];

const radiationTechniques = [
  'Conventional',
  'Hypofractionated',
  'Hyperfractionated',
  'Stereotactic',
  'Image-Guided (IGRT)',
  'Respiratory-Gated',
  'Adaptive',
];

const commonSideEffects = [
  'Fatigue',
  'Skin Erythema',
  'Skin Desquamation',
  'Mucositis',
  'Dysphagia',
  'Nausea',
  'Diarrhea',
  'Cystitis',
  'Proctitis',
  'Esophagitis',
  'Pneumonitis',
  'Alopecia',
  'Xerostomia',
  'Lymphedema',
];

export const RadiationTherapyTool: React.FC<RadiationTherapyToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: records,
    addItem: addRecord,
    updateItem: updateRecord,
    deleteItem: deleteRecord,
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
  } = useToolData<RadiationTherapyRecord>(TOOL_ID, [], radiationColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIntent, setFilterIntent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSideEffectModal, setShowSideEffectModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RadiationTherapyRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<RadiationTherapyRecord | null>(null);
  const [formData, setFormData] = useState<RadiationTherapyRecord>(createNewRecord());
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'sideEffects' | 'qa'>('overview');

  const [newSession, setNewSession] = useState<Omit<TreatmentSession, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    sessionNumber: 1,
    actualDose: 0,
    machineUsed: '',
    physicist: '',
    technologist: '',
    notes: '',
    completed: false,
    verificationImages: false,
  });

  const [newSideEffect, setNewSideEffect] = useState<Omit<SideEffect, 'id'>>({
    name: '',
    grade: 1,
    onsetDate: new Date().toISOString().split('T')[0],
    resolvedDate: '',
    treatment: '',
    notes: '',
  });

  // Statistics
  const stats = useMemo(() => {
    const active = records.filter(r => r.status === 'active');
    const planning = records.filter(r => r.status === 'planning');
    const completed = records.filter(r => r.status === 'completed');
    const curativeIntent = records.filter(r => r.treatmentIntent === 'curative');
    const totalSessions = records.reduce((sum, r) => sum + r.treatmentSessions.length, 0);
    return {
      total: records.length,
      active: active.length,
      planning: planning.length,
      completed: completed.length,
      curativeIntent: curativeIntent.length,
      totalSessions,
    };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchQuery === '' ||
        record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.cancerDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tumorLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || record.status === filterStatus;
      const matchesIntent = filterIntent === '' || record.treatmentIntent === filterIntent;
      return matchesSearch && matchesStatus && matchesIntent;
    });
  }, [records, searchQuery, filterStatus, filterIntent]);

  const handleSave = () => {
    if (editingRecord) {
      updateRecord(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addRecord({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingRecord(null);
    setFormData(createNewRecord());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this radiation therapy record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteRecord(id);
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };

  const openEditModal = (record: RadiationTherapyRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowModal(true);
  };

  const saveSession = () => {
    if (selectedRecord) {
      const session: TreatmentSession = { ...newSession, id: crypto.randomUUID() };
      const updated = {
        ...selectedRecord,
        treatmentSessions: [...selectedRecord.treatmentSessions, session],
        updatedAt: new Date().toISOString(),
      };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
      setShowSessionModal(false);
      setNewSession({
        date: new Date().toISOString().split('T')[0],
        sessionNumber: updated.treatmentSessions.length + 1,
        actualDose: selectedRecord.treatmentPlan.dosePerFraction,
        machineUsed: '',
        physicist: '',
        technologist: '',
        notes: '',
        completed: false,
        verificationImages: false,
      });
    }
  };

  const saveSideEffect = () => {
    if (selectedRecord) {
      const sideEffect: SideEffect = { ...newSideEffect, id: crypto.randomUUID() };
      const updated = {
        ...selectedRecord,
        sideEffects: [...selectedRecord.sideEffects, sideEffect],
        updatedAt: new Date().toISOString(),
      };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
      setShowSideEffectModal(false);
      setNewSideEffect({
        name: '',
        grade: 1,
        onsetDate: new Date().toISOString().split('T')[0],
        resolvedDate: '',
        treatment: '',
        notes: '',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'discontinued': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return Settings;
      case 'active': return PlayCircle;
      case 'on-hold': return PauseCircle;
      case 'completed': return CheckCircle;
      case 'discontinued': return XCircle;
      default: return Activity;
    }
  };

  const getGradeColor = (grade: number) => {
    switch (grade) {
      case 1: return 'bg-green-500/20 text-green-400';
      case 2: return 'bg-yellow-500/20 text-yellow-400';
      case 3: return 'bg-orange-500/20 text-orange-400';
      case 4: return 'bg-red-500/20 text-red-400';
      case 5: return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const calculateProgress = (record: RadiationTherapyRecord) => {
    if (!record.treatmentPlan.fractions) return 0;
    const completedSessions = record.treatmentSessions.filter(s => s.completed).length;
    return Math.round((completedSessions / record.treatmentPlan.fractions) * 100);
  };

  const calculateDeliveredDose = (record: RadiationTherapyRecord) => {
    return record.treatmentSessions.reduce((sum, s) => sum + (s.completed ? s.actualDose : 0), 0);
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

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Radiation className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.radiationTherapy.radiationTherapy', 'Radiation Therapy')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.radiationTherapy.trackRadiationTherapyTreatmentsAnd', 'Track radiation therapy treatments and planning')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="radiation-therapy" toolName="Radiation Therapy" />

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
            onExportCSV={() => exportCSV({ filename: 'radiation-therapy' })}
            onExportExcel={() => exportExcel({ filename: 'radiation-therapy' })}
            onExportJSON={() => exportJSON({ filename: 'radiation-therapy' })}
            onExportPDF={() => exportPDF({ filename: 'radiation-therapy', title: 'Radiation Therapy Records' })}
            onPrint={() => print('Radiation Therapy Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={records.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewRecord()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.radiationTherapy.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.radiationTherapy.total', 'Total')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <PlayCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.radiationTherapy.active', 'Active')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Settings className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.radiationTherapy.planning', 'Planning')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.planning}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.radiationTherapy.completed', 'Completed')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.radiationTherapy.curative', 'Curative')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.curativeIntent}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.radiationTherapy.sessions', 'Sessions')}</p>
              <p className="text-2xl font-bold text-pink-500">{stats.totalSessions}</p>
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
              placeholder={t('tools.radiationTherapy.searchPatientDiagnosisOrLocation', 'Search patient, diagnosis, or location...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.radiationTherapy.allStatus', 'All Status')}</option>
            <option value="planning">{t('tools.radiationTherapy.planning2', 'Planning')}</option>
            <option value="active">{t('tools.radiationTherapy.active2', 'Active')}</option>
            <option value="on-hold">{t('tools.radiationTherapy.onHold', 'On Hold')}</option>
            <option value="completed">{t('tools.radiationTherapy.completed2', 'Completed')}</option>
            <option value="discontinued">{t('tools.radiationTherapy.discontinued', 'Discontinued')}</option>
          </select>
          <select value={filterIntent} onChange={(e) => setFilterIntent(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.radiationTherapy.allIntents', 'All Intents')}</option>
            {treatmentIntents.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.radiationTherapy.patientRecords', 'Patient Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Radiation className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.radiationTherapy.noRadiationTherapyRecords', 'No radiation therapy records')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredRecords.map(record => {
                  const StatusIcon = getStatusIcon(record.status);
                  const progress = calculateProgress(record);
                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedRecord?.id === record.id
                          ? 'bg-purple-500/10 border-l-4 border-purple-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <User className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{record.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {record.cancerDiagnosis}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(record.status)}`}>
                                <StatusIcon className="w-3 h-3" />
                                {record.status}
                              </span>
                            </div>
                            {record.status === 'active' && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.radiationTherapy.progress', 'Progress')}</span>
                                  <span className="font-medium">{progress}%</span>
                                </div>
                                <div className={`h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(record); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
          {selectedRecord ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedRecord.patientName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedRecord.cancerDiagnosis} - {selectedRecord.tumorLocation}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowSessionModal(true)} className={buttonSecondary}>
                      <Plus className="w-4 h-4" /> Log Session
                    </button>
                    <button onClick={() => setShowSideEffectModal(true)} className={buttonPrimary}>
                      <AlertCircle className="w-4 h-4" /> Add Side Effect
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  {(['overview', 'sessions', 'sideEffects', 'qa'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-purple-500/20 text-purple-400'
                          : theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab === 'overview' && 'Overview'}
                      {tab === 'sessions' && `Sessions (${selectedRecord.treatmentSessions.length})`}
                      {tab === 'sideEffects' && `Side Effects (${selectedRecord.sideEffects.length})`}
                      {tab === 'qa' && 'QA'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Patient & Treatment Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.radiationTherapy.patientId', 'Patient ID')}</p>
                        <p className="font-medium">{selectedRecord.patientId || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.radiationTherapy.dob', 'DOB')}</p>
                        <p className="font-medium">{selectedRecord.dateOfBirth || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.radiationTherapy.stage', 'Stage')}</p>
                        <p className="font-medium">{selectedRecord.stage || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.radiationTherapy.intent', 'Intent')}</p>
                        <p className="font-medium capitalize">{selectedRecord.treatmentIntent}</p>
                      </div>
                    </div>

                    {/* Treatment Plan */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        {t('tools.radiationTherapy.treatmentPlan', 'Treatment Plan')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.totalDose', 'Total Dose')}</p>
                          <p className="font-medium">{selectedRecord.treatmentPlan.totalDose} Gy</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.fractions', 'Fractions')}</p>
                          <p className="font-medium">{selectedRecord.treatmentPlan.fractions}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.doseFraction', 'Dose/Fraction')}</p>
                          <p className="font-medium">{selectedRecord.treatmentPlan.dosePerFraction} Gy</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.modality', 'Modality')}</p>
                          <p className="font-medium">{selectedRecord.treatmentPlan.modality || 'N/A'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.technique', 'Technique')}</p>
                          <p className="font-medium">{selectedRecord.treatmentPlan.technique || 'N/A'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.deliveredDose', 'Delivered Dose')}</p>
                          <p className="font-medium">{calculateDeliveredDose(selectedRecord)} Gy</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        {t('tools.radiationTherapy.timeline', 'Timeline')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.ctSimDate', 'CT Sim Date')}</p>
                          <p className="font-medium">{selectedRecord.ctSimDate || 'Not scheduled'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.treatmentStart', 'Treatment Start')}</p>
                          <p className="font-medium">{selectedRecord.treatmentStartDate || 'Not started'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.treatmentEnd', 'Treatment End')}</p>
                          <p className="font-medium">{selectedRecord.treatmentEndDate || 'In progress'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{t('tools.radiationTherapy.followUp', 'Follow-up')}</p>
                          <p className="font-medium">{selectedRecord.followUpSchedule || 'TBD'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Concurrent Therapy */}
                    {selectedRecord.concurrentChemo && (
                      <div className={`p-4 rounded-lg border border-orange-500/30 ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-400">
                          <Stethoscope className="w-4 h-4" />
                          {t('tools.radiationTherapy.concurrentChemotherapy2', 'Concurrent Chemotherapy')}
                        </h3>
                        <p className="text-sm">{selectedRecord.chemotherapyRegimen || 'Regimen not specified'}</p>
                      </div>
                    )}

                    {/* Physicians */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.radiationTherapy.radiationOncologist', 'Radiation Oncologist')}</h3>
                        <p className="text-sm">{selectedRecord.radiationOncologist || 'Not assigned'}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.radiationTherapy.referringPhysician', 'Referring Physician')}</h3>
                        <p className="text-sm">{selectedRecord.referringPhysician || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sessions' && (
                  <div>
                    {selectedRecord.treatmentSessions.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.radiationTherapy.noTreatmentSessionsLogged', 'No treatment sessions logged')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedRecord.treatmentSessions].reverse().map(session => (
                          <div key={session.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 text-sm font-medium rounded ${session.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  Fx {session.sessionNumber}
                                </span>
                                <span className="font-medium">{session.date}</span>
                              </div>
                              <span className="text-lg font-bold text-purple-500">{session.actualDose} Gy</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-gray-400">{t('tools.radiationTherapy.machine', 'Machine:')}</span> {session.machineUsed || 'N/A'}
                              </div>
                              <div>
                                <span className="text-gray-400">{t('tools.radiationTherapy.physicist', 'Physicist:')}</span> {session.physicist || 'N/A'}
                              </div>
                              <div>
                                <span className="text-gray-400">{t('tools.radiationTherapy.tech', 'Tech:')}</span> {session.technologist || 'N/A'}
                              </div>
                              <div>
                                <span className="text-gray-400">{t('tools.radiationTherapy.igrt', 'IGRT:')}</span> {session.verificationImages ? 'Yes' : 'No'}
                              </div>
                            </div>
                            {session.notes && (
                              <p className="text-sm text-gray-400 mt-2">{session.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'sideEffects' && (
                  <div>
                    {selectedRecord.sideEffects.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.radiationTherapy.noSideEffectsDocumented', 'No side effects documented')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedRecord.sideEffects.map(effect => (
                          <div key={effect.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{effect.name}</span>
                                <span className={`px-2 py-0.5 text-xs rounded ${getGradeColor(effect.grade)}`}>
                                  Grade {effect.grade}
                                </span>
                              </div>
                              <span className={`text-sm ${effect.resolvedDate ? 'text-green-400' : 'text-yellow-400'}`}>
                                {effect.resolvedDate ? t('tools.radiationTherapy.resolved2', 'Resolved') : t('tools.radiationTherapy.active4', 'Active')}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-400">{t('tools.radiationTherapy.onset', 'Onset:')}</span> {effect.onsetDate}
                              </div>
                              {effect.resolvedDate && (
                                <div>
                                  <span className="text-gray-400">{t('tools.radiationTherapy.resolved', 'Resolved:')}</span> {effect.resolvedDate}
                                </div>
                              )}
                            </div>
                            {effect.treatment && (
                              <p className="text-sm mt-2"><span className="text-gray-400">{t('tools.radiationTherapy.treatment', 'Treatment:')}</span> {effect.treatment}</p>
                            )}
                            {effect.notes && (
                              <p className="text-sm text-gray-400 mt-1">{effect.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'qa' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {selectedRecord.qualityAssurance.planApproved ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-medium">{t('tools.radiationTherapy.planApproved', 'Plan Approved')}</span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {selectedRecord.qualityAssurance.planApprovalDate || 'Pending'}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {selectedRecord.qualityAssurance.physicistSignoff ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-medium">{t('tools.radiationTherapy.physicistSignOff', 'Physicist Sign-off')}</span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {selectedRecord.qualityAssurance.physicistSignoffDate || 'Pending'}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400 mb-1">{t('tools.radiationTherapy.igrtProtocol', 'IGRT Protocol')}</p>
                        <p className="font-medium">{selectedRecord.qualityAssurance.igrtProtocol || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        {selectedRecord.qualityAssurance.dailyQA ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500" />
                        )}
                        <span>{t('tools.radiationTherapy.dailyQaRequired', 'Daily QA Required')}</span>
                      </div>
                      <div className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        {selectedRecord.qualityAssurance.weeklyQA ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500" />
                        )}
                        <span>{t('tools.radiationTherapy.weeklyQaRequired', 'Weekly QA Required')}</span>
                      </div>
                    </div>
                    {selectedRecord.qualityAssurance.lastQADate && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-sm">
                          <span className="text-gray-400">{t('tools.radiationTherapy.lastQaDate', 'Last QA Date:')}</span> {selectedRecord.qualityAssurance.lastQADate}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Radiation className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.radiationTherapy.selectAPatientRecord', 'Select a patient record')}</p>
              <p className="text-sm">{t('tools.radiationTherapy.chooseAPatientToView', 'Choose a patient to view treatment details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingRecord ? t('tools.radiationTherapy.editPatientRecord', 'Edit Patient Record') : t('tools.radiationTherapy.addNewPatient', 'Add New Patient')}</h2>
              <button onClick={() => { setShowModal(false); setEditingRecord(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  {t('tools.radiationTherapy.patientInformation', 'Patient Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.patientName', 'Patient Name *')}</label>
                    <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.patientId2', 'Patient ID')}</label>
                    <input type="text" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.dateOfBirth', 'Date of Birth')}</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {t('tools.radiationTherapy.diagnosis', 'Diagnosis')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.cancerDiagnosis', 'Cancer Diagnosis *')}</label>
                    <input type="text" value={formData.cancerDiagnosis} onChange={(e) => setFormData({ ...formData, cancerDiagnosis: e.target.value })} className={inputClass} placeholder={t('tools.radiationTherapy.eGBreastCancer', 'e.g., Breast Cancer')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.tumorLocation', 'Tumor Location *')}</label>
                    <input type="text" value={formData.tumorLocation} onChange={(e) => setFormData({ ...formData, tumorLocation: e.target.value })} className={inputClass} placeholder={t('tools.radiationTherapy.eGLeftBreast', 'e.g., Left Breast')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.stage2', 'Stage')}</label>
                    <input type="text" value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })} className={inputClass} placeholder={t('tools.radiationTherapy.eGStageIi', 'e.g., Stage II')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.treatmentIntent', 'Treatment Intent')}</label>
                    <select value={formData.treatmentIntent} onChange={(e) => setFormData({ ...formData, treatmentIntent: e.target.value as any })} className={inputClass}>
                      {treatmentIntents.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.status', 'Status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                      <option value="planning">{t('tools.radiationTherapy.planning3', 'Planning')}</option>
                      <option value="active">{t('tools.radiationTherapy.active3', 'Active')}</option>
                      <option value="on-hold">{t('tools.radiationTherapy.onHold2', 'On Hold')}</option>
                      <option value="completed">{t('tools.radiationTherapy.completed3', 'Completed')}</option>
                      <option value="discontinued">{t('tools.radiationTherapy.discontinued2', 'Discontinued')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Treatment Plan */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  {t('tools.radiationTherapy.treatmentPlan2', 'Treatment Plan')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.totalDoseGy', 'Total Dose (Gy)')}</label>
                    <input type="number" step="0.1" value={formData.treatmentPlan.totalDose} onChange={(e) => setFormData({ ...formData, treatmentPlan: { ...formData.treatmentPlan, totalDose: parseFloat(e.target.value) || 0 } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.fractions2', 'Fractions')}</label>
                    <input type="number" value={formData.treatmentPlan.fractions} onChange={(e) => setFormData({ ...formData, treatmentPlan: { ...formData.treatmentPlan, fractions: parseInt(e.target.value) || 0 } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.doseFractionGy', 'Dose/Fraction (Gy)')}</label>
                    <input type="number" step="0.1" value={formData.treatmentPlan.dosePerFraction} onChange={(e) => setFormData({ ...formData, treatmentPlan: { ...formData.treatmentPlan, dosePerFraction: parseFloat(e.target.value) || 0 } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.modality2', 'Modality')}</label>
                    <select value={formData.treatmentPlan.modality} onChange={(e) => setFormData({ ...formData, treatmentPlan: { ...formData.treatmentPlan, modality: e.target.value } })} className={inputClass}>
                      <option value="">{t('tools.radiationTherapy.selectModality', 'Select Modality')}</option>
                      {radiationModalities.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.technique2', 'Technique')}</label>
                    <select value={formData.treatmentPlan.technique} onChange={(e) => setFormData({ ...formData, treatmentPlan: { ...formData.treatmentPlan, technique: e.target.value } })} className={inputClass}>
                      <option value="">{t('tools.radiationTherapy.selectTechnique', 'Select Technique')}</option>
                      {radiationTechniques.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.beamEnergy', 'Beam Energy')}</label>
                    <input type="text" value={formData.treatmentPlan.beamEnergy} onChange={(e) => setFormData({ ...formData, treatmentPlan: { ...formData.treatmentPlan, beamEnergy: e.target.value } })} className={inputClass} placeholder={t('tools.radiationTherapy.eG6Mv', 'e.g., 6 MV')} />
                  </div>
                </div>
              </div>

              {/* Physicians */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-500" />
                  {t('tools.radiationTherapy.physicians', 'Physicians')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.radiationOncologist2', 'Radiation Oncologist')}</label>
                    <input type="text" value={formData.radiationOncologist} onChange={(e) => setFormData({ ...formData, radiationOncologist: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.referringPhysician2', 'Referring Physician')}</label>
                    <input type="text" value={formData.referringPhysician} onChange={(e) => setFormData({ ...formData, referringPhysician: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  {t('tools.radiationTherapy.timeline2', 'Timeline')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.ctSimDate2', 'CT Sim Date')}</label>
                    <input type="date" value={formData.ctSimDate} onChange={(e) => setFormData({ ...formData, ctSimDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.planningStart', 'Planning Start')}</label>
                    <input type="date" value={formData.planningStartDate} onChange={(e) => setFormData({ ...formData, planningStartDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.treatmentStart2', 'Treatment Start')}</label>
                    <input type="date" value={formData.treatmentStartDate} onChange={(e) => setFormData({ ...formData, treatmentStartDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.treatmentEnd2', 'Treatment End')}</label>
                    <input type="date" value={formData.treatmentEndDate} onChange={(e) => setFormData({ ...formData, treatmentEndDate: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Concurrent Therapy */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.radiationTherapy.concurrentTherapy', 'Concurrent Therapy')}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <input type="checkbox" id="concurrentChemo" checked={formData.concurrentChemo} onChange={(e) => setFormData({ ...formData, concurrentChemo: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="concurrentChemo" className={labelClass}>{t('tools.radiationTherapy.concurrentChemotherapy', 'Concurrent Chemotherapy')}</label>
                </div>
                {formData.concurrentChemo && (
                  <div>
                    <label className={labelClass}>{t('tools.radiationTherapy.chemotherapyRegimen', 'Chemotherapy Regimen')}</label>
                    <input type="text" value={formData.chemotherapyRegimen} onChange={(e) => setFormData({ ...formData, chemotherapyRegimen: e.target.value })} className={inputClass} placeholder={t('tools.radiationTherapy.eGCisplatinWeekly', 'e.g., Cisplatin weekly')} />
                  </div>
                )}
              </div>

              {/* Follow-up & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.followUpSchedule', 'Follow-up Schedule')}</label>
                  <input type="text" value={formData.followUpSchedule} onChange={(e) => setFormData({ ...formData, followUpSchedule: e.target.value })} className={inputClass} placeholder={t('tools.radiationTherapy.eG6WeeksPost', 'e.g., 6 weeks post-treatment')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.notes', 'Notes')}</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={2} />
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingRecord(null); }} className={buttonSecondary}>{t('tools.radiationTherapy.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.patientName || !formData.cancerDiagnosis || !formData.tumorLocation} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {showSessionModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.radiationTherapy.logTreatmentSession', 'Log Treatment Session')}</h2>
              <button onClick={() => setShowSessionModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.date', 'Date')}</label>
                  <input type="date" value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.fraction', 'Fraction #')}</label>
                  <input type="number" value={newSession.sessionNumber} onChange={(e) => setNewSession({ ...newSession, sessionNumber: parseInt(e.target.value) || 1 })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.radiationTherapy.actualDoseGy', 'Actual Dose (Gy)')}</label>
                <input type="number" step="0.1" value={newSession.actualDose} onChange={(e) => setNewSession({ ...newSession, actualDose: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.radiationTherapy.machineUsed', 'Machine Used')}</label>
                <input type="text" value={newSession.machineUsed} onChange={(e) => setNewSession({ ...newSession, machineUsed: e.target.value })} className={inputClass} placeholder={t('tools.radiationTherapy.eGTruebeam1', 'e.g., TrueBeam 1')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.physicist2', 'Physicist')}</label>
                  <input type="text" value={newSession.physicist} onChange={(e) => setNewSession({ ...newSession, physicist: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.technologist', 'Technologist')}</label>
                  <input type="text" value={newSession.technologist} onChange={(e) => setNewSession({ ...newSession, technologist: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sessionCompleted" checked={newSession.completed} onChange={(e) => setNewSession({ ...newSession, completed: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="sessionCompleted" className={labelClass}>{t('tools.radiationTherapy.completed4', 'Completed')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="verificationImages" checked={newSession.verificationImages} onChange={(e) => setNewSession({ ...newSession, verificationImages: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="verificationImages" className={labelClass}>{t('tools.radiationTherapy.verificationImages', 'Verification Images')}</label>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.radiationTherapy.notes2', 'Notes')}</label>
                <textarea value={newSession.notes} onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowSessionModal(false)} className={buttonSecondary}>{t('tools.radiationTherapy.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveSession} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.radiationTherapy.saveSession', 'Save Session')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Effect Modal */}
      {showSideEffectModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.radiationTherapy.addSideEffect', 'Add Side Effect')}</h2>
              <button onClick={() => setShowSideEffectModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.radiationTherapy.sideEffect', 'Side Effect')}</label>
                <select value={newSideEffect.name} onChange={(e) => setNewSideEffect({ ...newSideEffect, name: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.radiationTherapy.selectOrTypeCustom', 'Select or type custom')}</option>
                  {commonSideEffects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {!commonSideEffects.includes(newSideEffect.name) && (
                  <input type="text" value={newSideEffect.name} onChange={(e) => setNewSideEffect({ ...newSideEffect, name: e.target.value })} className={`${inputClass} mt-2`} placeholder={t('tools.radiationTherapy.customSideEffect', 'Custom side effect')} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.gradeCtcae', 'Grade (CTCAE)')}</label>
                  <select value={newSideEffect.grade} onChange={(e) => setNewSideEffect({ ...newSideEffect, grade: parseInt(e.target.value) as any })} className={inputClass}>
                    <option value={1}>{t('tools.radiationTherapy.grade1Mild', 'Grade 1 - Mild')}</option>
                    <option value={2}>{t('tools.radiationTherapy.grade2Moderate', 'Grade 2 - Moderate')}</option>
                    <option value={3}>{t('tools.radiationTherapy.grade3Severe', 'Grade 3 - Severe')}</option>
                    <option value={4}>{t('tools.radiationTherapy.grade4LifeThreatening', 'Grade 4 - Life-threatening')}</option>
                    <option value={5}>{t('tools.radiationTherapy.grade5Death', 'Grade 5 - Death')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.radiationTherapy.onsetDate', 'Onset Date')}</label>
                  <input type="date" value={newSideEffect.onsetDate} onChange={(e) => setNewSideEffect({ ...newSideEffect, onsetDate: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.radiationTherapy.resolvedDateIfApplicable', 'Resolved Date (if applicable)')}</label>
                <input type="date" value={newSideEffect.resolvedDate} onChange={(e) => setNewSideEffect({ ...newSideEffect, resolvedDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.radiationTherapy.treatmentGiven', 'Treatment Given')}</label>
                <input type="text" value={newSideEffect.treatment} onChange={(e) => setNewSideEffect({ ...newSideEffect, treatment: e.target.value })} className={inputClass} placeholder={t('tools.radiationTherapy.eGTopicalSteroidCream', 'e.g., Topical steroid cream')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.radiationTherapy.notes3', 'Notes')}</label>
                <textarea value={newSideEffect.notes} onChange={(e) => setNewSideEffect({ ...newSideEffect, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowSideEffectModal(false)} className={buttonSecondary}>{t('tools.radiationTherapy.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveSideEffect} disabled={!newSideEffect.name} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.radiationTherapy.saveSideEffect', 'Save Side Effect')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.radiationTherapy.aboutRadiationTherapyTool', 'About Radiation Therapy Tool')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive radiation therapy treatment management system. Track patient treatments from CT simulation through treatment completion.
          Document treatment plans, log daily treatment sessions, record side effects with CTCAE grading, and manage quality assurance requirements.
          Supports concurrent chemotherapy documentation and follow-up scheduling.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default RadiationTherapyTool;
