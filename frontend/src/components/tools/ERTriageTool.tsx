'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Save,
  AlertCircle,
  Activity,
  Heart,
  ThermometerSun,
  Clock,
  Droplets,
  Wind,
  Users,
  ArrowRight,
  CheckCircle2,
  Timer,
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
interface VitalSigns {
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  oxygenSaturation: number | null;
}

interface TriagePatient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  chiefComplaint: string;
  painLevel: number; // 0-10
  triageLevel: 1 | 2 | 3 | 4 | 5;
  vitalSigns: VitalSigns;
  allergies: string;
  medications: string;
  medicalHistory: string;
  arrivalTime: string;
  triageTime: string | null;
  treatmentStartTime: string | null;
  dischargeTime: string | null;
  status: 'arrived' | 'triaged' | 'waiting' | 'in-treatment' | 'discharged';
  assignedArea: string;
  assignedProvider: string;
  notes: string;
  estimatedWaitMinutes: number;
  createdAt: string;
  updatedAt: string;
}

interface ERTriageToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'er-triage';

const triageColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'chiefComplaint', header: 'Chief Complaint', type: 'string' },
  { key: 'triageLevel', header: 'Triage Level', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'arrivalTime', header: 'Arrival Time', type: 'date' },
  { key: 'painLevel', header: 'Pain Level', type: 'number' },
];

// Triage level definitions
const triageLevels = [
  { level: 1, name: 'Resuscitation', color: 'red', waitTime: 0, description: 'Immediate life-threatening' },
  { level: 2, name: 'Emergent', color: 'orange', waitTime: 15, description: 'High risk, time-sensitive' },
  { level: 3, name: 'Urgent', color: 'yellow', waitTime: 30, description: 'Significant but stable' },
  { level: 4, name: 'Less Urgent', color: 'green', waitTime: 60, description: 'Non-urgent care needed' },
  { level: 5, name: 'Non-Urgent', color: 'blue', waitTime: 120, description: 'May be seen elsewhere' },
];

const patientStatuses = [
  { value: 'arrived', label: 'Arrived', icon: User },
  { value: 'triaged', label: 'Triaged', icon: ClipboardList },
  { value: 'waiting', label: 'Waiting', icon: Clock },
  { value: 'in-treatment', label: 'In Treatment', icon: Activity },
  { value: 'discharged', label: 'Discharged', icon: CheckCircle2 },
];

const createNewPatient = (): TriagePatient => ({
  id: crypto.randomUUID(),
  patientId: `PT-${Date.now().toString(36).toUpperCase()}`,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'other',
  chiefComplaint: '',
  painLevel: 0,
  triageLevel: 3,
  vitalSigns: {
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    heartRate: null,
    respiratoryRate: null,
    temperature: null,
    oxygenSaturation: null,
  },
  allergies: '',
  medications: '',
  medicalHistory: '',
  arrivalTime: new Date().toISOString(),
  triageTime: null,
  treatmentStartTime: null,
  dischargeTime: null,
  status: 'arrived',
  assignedArea: '',
  assignedProvider: '',
  notes: '',
  estimatedWaitMinutes: 30,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const calculateWaitTime = (triageLevel: number): number => {
  const level = triageLevels.find(l => l.level === triageLevel);
  return level?.waitTime || 30;
};

export const ERTriageTool: React.FC<ERTriageToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: patients,
    addItem: addPatient,
    updateItem: updatePatient,
    deleteItem: deletePatient,
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
  } = useToolData<TriagePatient>(TOOL_ID, [], triageColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTriageLevel, setFilterTriageLevel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<TriagePatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<TriagePatient | null>(null);
  const [formData, setFormData] = useState<TriagePatient>(createNewPatient());
  const [activeTab, setActiveTab] = useState<'basic' | 'vitals' | 'history'>('basic');

  // Statistics
  const stats = useMemo(() => {
    const waiting = patients.filter(p => p.status === 'waiting' || p.status === 'triaged');
    const inTreatment = patients.filter(p => p.status === 'in-treatment');
    const critical = patients.filter(p => p.triageLevel <= 2 && p.status !== 'discharged');
    const avgWaitTime = waiting.length > 0
      ? Math.round(waiting.reduce((sum, p) => {
          const waitingSince = new Date(p.triageTime || p.arrivalTime);
          const now = new Date();
          return sum + (now.getTime() - waitingSince.getTime()) / 60000;
        }, 0) / waiting.length)
      : 0;

    const byLevel = triageLevels.map(level => ({
      ...level,
      count: patients.filter(p => p.triageLevel === level.level && p.status !== 'discharged').length,
    }));

    return {
      total: patients.filter(p => p.status !== 'discharged').length,
      waiting: waiting.length,
      inTreatment: inTreatment.length,
      critical: critical.length,
      avgWaitTime,
      byLevel,
    };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = searchQuery === '' ||
        patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || patient.status === filterStatus;
      const matchesTriageLevel = filterTriageLevel === '' || patient.triageLevel.toString() === filterTriageLevel;
      return matchesSearch && matchesStatus && matchesTriageLevel;
    }).sort((a, b) => {
      // Sort by triage level (most urgent first), then by arrival time
      if (a.triageLevel !== b.triageLevel) return a.triageLevel - b.triageLevel;
      return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
    });
  }, [patients, searchQuery, filterStatus, filterTriageLevel]);

  const handleSave = () => {
    const waitMinutes = calculateWaitTime(formData.triageLevel);
    const updatedData = {
      ...formData,
      estimatedWaitMinutes: waitMinutes,
      updatedAt: new Date().toISOString(),
    };

    if (editingPatient) {
      updatePatient(updatedData.id, updatedData);
    } else {
      addPatient({ ...updatedData, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingPatient(null);
    setFormData(createNewPatient());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this patient record?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePatient(id);
      if (selectedPatient?.id === id) setSelectedPatient(null);
    }
  };

  const openEditModal = (patient: TriagePatient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setActiveTab('basic');
    setShowModal(true);
  };

  const updatePatientStatus = (patient: TriagePatient, newStatus: TriagePatient['status']) => {
    const updates: Partial<TriagePatient> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus === 'triaged' && !patient.triageTime) {
      updates.triageTime = new Date().toISOString();
    } else if (newStatus === 'in-treatment' && !patient.treatmentStartTime) {
      updates.treatmentStartTime = new Date().toISOString();
    } else if (newStatus === 'discharged' && !patient.dischargeTime) {
      updates.dischargeTime = new Date().toISOString();
    }

    updatePatient(patient.id, updates);
    if (selectedPatient?.id === patient.id) {
      setSelectedPatient({ ...patient, ...updates } as TriagePatient);
    }
  };

  const getTriageLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 2: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 3: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 4: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 5: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'arrived': return 'bg-purple-500/20 text-purple-400';
      case 'triaged': return 'bg-cyan-500/20 text-cyan-400';
      case 'waiting': return 'bg-yellow-500/20 text-yellow-400';
      case 'in-treatment': return 'bg-green-500/20 text-green-400';
      case 'discharged': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getWaitingTime = (patient: TriagePatient) => {
    if (patient.status === 'discharged') return 'Discharged';
    const since = new Date(patient.triageTime || patient.arrivalTime);
    const now = new Date();
    const minutes = Math.round((now.getTime() - since.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl">
            <Stethoscope className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.eRTriage.erTriageSystem', 'ER Triage System')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.eRTriage.emergencyRoomPatientTriageAnd', 'Emergency room patient triage and tracking')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="e-r-triage" toolName="E R Triage" />

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
            onExportCSV={() => exportCSV({ filename: 'er-triage' })}
            onExportExcel={() => exportExcel({ filename: 'er-triage' })}
            onExportJSON={() => exportJSON({ filename: 'er-triage' })}
            onExportPDF={() => exportPDF({ filename: 'er-triage', title: 'ER Triage Records' })}
            onPrint={() => print('ER Triage Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={patients.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewPatient()); setActiveTab('basic'); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.eRTriage.newPatient', 'New Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eRTriage.total', 'Total')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eRTriage.waiting', 'Waiting')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.waiting}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eRTriage.inTreatment', 'In Treatment')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.inTreatment}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eRTriage.critical', 'Critical')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Timer className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eRTriage.avgWait', 'Avg Wait')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.avgWaitTime}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Triage Level Summary */}
      <div className={`${cardClass} p-4 mb-6`}>
        <h3 className="text-sm font-semibold mb-3">{t('tools.eRTriage.patientsByTriageLevel', 'Patients by Triage Level')}</h3>
        <div className="flex flex-wrap gap-3">
          {stats.byLevel.map(level => (
            <div
              key={level.level}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getTriageLevelColor(level.level)}`}
            >
              <span className="font-bold">{level.level}</span>
              <span className="text-sm">{level.name}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {level.count}
              </span>
            </div>
          ))}
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
              placeholder={t('tools.eRTriage.searchByNameIdOr', 'Search by name, ID, or complaint...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.eRTriage.allStatus', 'All Status')}</option>
            {patientStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterTriageLevel} onChange={(e) => setFilterTriageLevel(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.eRTriage.allLevels', 'All Levels')}</option>
            {triageLevels.map(l => <option key={l.level} value={l.level}>{l.level} - {l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.eRTriage.patientQueue', 'Patient Queue')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.eRTriage.noPatientsInQueue', 'No patients in queue')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg text-xs font-bold border ${getTriageLevelColor(patient.triageLevel)}`}>
                          {patient.triageLevel}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{patient.firstName} {patient.lastName}</p>
                          <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {patient.chiefComplaint}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(patient.status)}`}>
                              {patient.status.replace('-', ' ')}
                            </span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {getWaitingTime(patient)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(patient); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedPatient ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                      <span className={`px-3 py-1 text-sm rounded-lg font-medium border ${getTriageLevelColor(selectedPatient.triageLevel)}`}>
                        Level {selectedPatient.triageLevel} - {triageLevels.find(l => l.level === selectedPatient.triageLevel)?.name}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      ID: {selectedPatient.patientId} | DOB: {selectedPatient.dateOfBirth || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedPatient.status !== 'discharged' && (
                      <select
                        value={selectedPatient.status}
                        onChange={(e) => updatePatientStatus(selectedPatient, e.target.value as TriagePatient['status'])}
                        className={`${inputClass} w-auto text-sm`}
                      >
                        {patientStatuses.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Chief Complaint & Pain */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className="font-semibold text-red-400 mb-2">{t('tools.eRTriage.chiefComplaint', 'Chief Complaint')}</h3>
                  <p className="text-lg">{selectedPatient.chiefComplaint}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm">{t('tools.eRTriage.painLevel', 'Pain Level:')}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < selectedPatient.painLevel
                              ? selectedPatient.painLevel <= 3
                                ? 'bg-green-500'
                                : selectedPatient.painLevel <= 6
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-bold">{selectedPatient.painLevel}/10</span>
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    {t('tools.eRTriage.vitalSigns', 'Vital Signs')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-red-400" />
                        <p className="text-xs text-gray-400">{t('tools.eRTriage.bloodPressure', 'Blood Pressure')}</p>
                      </div>
                      <p className="font-medium text-lg">
                        {selectedPatient.vitalSigns.bloodPressureSystolic || '--'}/{selectedPatient.vitalSigns.bloodPressureDiastolic || '--'}
                        <span className="text-xs ml-1">{t('tools.eRTriage.mmhg', 'mmHg')}</span>
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <p className="text-xs text-gray-400">{t('tools.eRTriage.heartRate', 'Heart Rate')}</p>
                      </div>
                      <p className="font-medium text-lg">
                        {selectedPatient.vitalSigns.heartRate || '--'}
                        <span className="text-xs ml-1">bpm</span>
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Wind className="w-4 h-4 text-blue-400" />
                        <p className="text-xs text-gray-400">{t('tools.eRTriage.respiratoryRate', 'Respiratory Rate')}</p>
                      </div>
                      <p className="font-medium text-lg">
                        {selectedPatient.vitalSigns.respiratoryRate || '--'}
                        <span className="text-xs ml-1">/min</span>
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <ThermometerSun className="w-4 h-4 text-orange-400" />
                        <p className="text-xs text-gray-400">{t('tools.eRTriage.temperature', 'Temperature')}</p>
                      </div>
                      <p className="font-medium text-lg">
                        {selectedPatient.vitalSigns.temperature || '--'}
                        <span className="text-xs ml-1">°F</span>
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        <p className="text-xs text-gray-400">{t('tools.eRTriage.o2Saturation', 'O2 Saturation')}</p>
                      </div>
                      <p className="font-medium text-lg">
                        {selectedPatient.vitalSigns.oxygenSaturation || '--'}
                        <span className="text-xs ml-1">%</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    {t('tools.eRTriage.patientTimeline', 'Patient Timeline')}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <span className="text-xs text-gray-400">{t('tools.eRTriage.arrived', 'Arrived:')}</span>
                      <span className="font-medium">{formatTime(selectedPatient.arrivalTime)}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <span className="text-xs text-gray-400">{t('tools.eRTriage.triaged', 'Triaged:')}</span>
                      <span className="font-medium">{formatTime(selectedPatient.triageTime)}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <span className="text-xs text-gray-400">{t('tools.eRTriage.treatment', 'Treatment:')}</span>
                      <span className="font-medium">{formatTime(selectedPatient.treatmentStartTime)}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <span className="text-xs text-gray-400">{t('tools.eRTriage.discharged', 'Discharged:')}</span>
                      <span className="font-medium">{formatTime(selectedPatient.dischargeTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPatient.allergies && (
                    <div className={`p-4 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                      <h3 className="font-semibold mb-2 text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {t('tools.eRTriage.allergies2', 'Allergies')}
                      </h3>
                      <p className="text-sm">{selectedPatient.allergies}</p>
                    </div>
                  )}
                  {selectedPatient.medications && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2">{t('tools.eRTriage.currentMedications', 'Current Medications')}</h3>
                      <p className="text-sm">{selectedPatient.medications}</p>
                    </div>
                  )}
                  {selectedPatient.medicalHistory && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2">{t('tools.eRTriage.medicalHistory', 'Medical History')}</h3>
                      <p className="text-sm">{selectedPatient.medicalHistory}</p>
                    </div>
                  )}
                  {selectedPatient.notes && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2">{t('tools.eRTriage.notes', 'Notes')}</h3>
                      <p className="text-sm">{selectedPatient.notes}</p>
                    </div>
                  )}
                </div>

                {/* Assignment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.eRTriage.assignedArea', 'Assigned Area')}</p>
                    <p className="font-medium">{selectedPatient.assignedArea || 'Not assigned'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.eRTriage.assignedProvider', 'Assigned Provider')}</p>
                    <p className="font-medium">{selectedPatient.assignedProvider || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Stethoscope className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.eRTriage.selectAPatient', 'Select a patient')}</p>
              <p className="text-sm">{t('tools.eRTriage.chooseAPatientToView', 'Choose a patient to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingPatient ? t('tools.eRTriage.editPatient', 'Edit Patient') : t('tools.eRTriage.newPatientTriage', 'New Patient Triage')}</h2>
              <button onClick={() => { setShowModal(false); setEditingPatient(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              {(['basic', 'vitals', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-cyan-500 border-b-2 border-cyan-500'
                      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'basic' ? 'Basic Info' : tab === 'vitals' ? t('tools.eRTriage.vitalSigns2', 'Vital Signs') : t('tools.eRTriage.medicalHistory3', 'Medical History')}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.firstName', 'First Name *')}</label>
                      <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.lastName', 'Last Name *')}</label>
                      <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.dateOfBirth', 'Date of Birth')}</label>
                      <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.gender', 'Gender')}</label>
                      <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })} className={inputClass}>
                        <option value="male">{t('tools.eRTriage.male', 'Male')}</option>
                        <option value="female">{t('tools.eRTriage.female', 'Female')}</option>
                        <option value="other">{t('tools.eRTriage.other', 'Other')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{t('tools.eRTriage.chiefComplaint2', 'Chief Complaint *')}</label>
                    <textarea
                      value={formData.chiefComplaint}
                      onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                      className={inputClass}
                      rows={3}
                      placeholder={t('tools.eRTriage.describeTheMainReasonFor', 'Describe the main reason for the visit...')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.triageLevel', 'Triage Level *')}</label>
                      <select
                        value={formData.triageLevel}
                        onChange={(e) => setFormData({ ...formData, triageLevel: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                        className={inputClass}
                      >
                        {triageLevels.map(l => (
                          <option key={l.level} value={l.level}>{l.level} - {l.name} ({l.description})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.painLevel010', 'Pain Level (0-10)')}</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.painLevel}
                        onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                        className="w-full mt-2"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>None</span>
                        <span className="font-bold text-lg">{formData.painLevel}</span>
                        <span>{t('tools.eRTriage.severe', 'Severe')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.assignedArea2', 'Assigned Area')}</label>
                      <input
                        type="text"
                        value={formData.assignedArea}
                        onChange={(e) => setFormData({ ...formData, assignedArea: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.eRTriage.eGBay3Trauma', 'e.g., Bay 3, Trauma Room, etc.')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.assignedProvider2', 'Assigned Provider')}</label>
                      <input
                        type="text"
                        value={formData.assignedProvider}
                        onChange={(e) => setFormData({ ...formData, assignedProvider: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.eRTriage.doctorOrNurseName', 'Doctor or nurse name')}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'vitals' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.bloodPressureSystolicMmhg', 'Blood Pressure - Systolic (mmHg)')}</label>
                      <input
                        type="number"
                        value={formData.vitalSigns.bloodPressureSystolic || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, bloodPressureSystolic: e.target.value ? parseInt(e.target.value) : null }
                        })}
                        className={inputClass}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.bloodPressureDiastolicMmhg', 'Blood Pressure - Diastolic (mmHg)')}</label>
                      <input
                        type="number"
                        value={formData.vitalSigns.bloodPressureDiastolic || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, bloodPressureDiastolic: e.target.value ? parseInt(e.target.value) : null }
                        })}
                        className={inputClass}
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.heartRateBpm', 'Heart Rate (bpm)')}</label>
                      <input
                        type="number"
                        value={formData.vitalSigns.heartRate || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, heartRate: e.target.value ? parseInt(e.target.value) : null }
                        })}
                        className={inputClass}
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.respiratoryRateMin', 'Respiratory Rate (/min)')}</label>
                      <input
                        type="number"
                        value={formData.vitalSigns.respiratoryRate || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, respiratoryRate: e.target.value ? parseInt(e.target.value) : null }
                        })}
                        className={inputClass}
                        placeholder="16"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Temperature (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitalSigns.temperature || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, temperature: e.target.value ? parseFloat(e.target.value) : null }
                        })}
                        className={inputClass}
                        placeholder="98.6"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.eRTriage.oxygenSaturation', 'Oxygen Saturation (%)')}</label>
                      <input
                        type="number"
                        value={formData.vitalSigns.oxygenSaturation || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, oxygenSaturation: e.target.value ? parseInt(e.target.value) : null }
                        })}
                        className={inputClass}
                        placeholder="98"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'history' && (
                <>
                  <div>
                    <label className={labelClass}>{t('tools.eRTriage.allergies', 'Allergies')}</label>
                    <textarea
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className={inputClass}
                      rows={2}
                      placeholder={t('tools.eRTriage.listAnyKnownAllergies', 'List any known allergies...')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.eRTriage.currentMedications2', 'Current Medications')}</label>
                    <textarea
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                      className={inputClass}
                      rows={2}
                      placeholder={t('tools.eRTriage.listCurrentMedications', 'List current medications...')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.eRTriage.medicalHistory2', 'Medical History')}</label>
                    <textarea
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                      className={inputClass}
                      rows={3}
                      placeholder={t('tools.eRTriage.pastSurgeriesChronicConditionsEtc', 'Past surgeries, chronic conditions, etc...')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.eRTriage.additionalNotes', 'Additional Notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className={inputClass}
                      rows={3}
                      placeholder={t('tools.eRTriage.anyAdditionalNotesForThe', 'Any additional notes for the care team...')}
                    />
                  </div>
                </>
              )}

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); }} className={buttonSecondary}>{t('tools.eRTriage.cancel', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!formData.firstName || !formData.lastName || !formData.chiefComplaint}
                  className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Save className="w-4 h-4" /> Save Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.eRTriage.aboutErTriageSystem', 'About ER Triage System')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Track and prioritize emergency room patients using the 5-level Emergency Severity Index (ESI) triage system.
          Monitor vital signs, patient flow, and wait times. Level 1 (Resuscitation) requires immediate intervention,
          while Level 5 (Non-Urgent) patients may be directed to other care settings. The system automatically calculates
          estimated wait times based on acuity level and tracks patient progression through the ED.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {triageLevels.map(level => (
            <div key={level.level} className={`text-xs px-2 py-1 rounded border ${getTriageLevelColor(level.level)}`}>
              <span className="font-bold">{level.level}</span> - {level.name} (~{level.waitTime}min)
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ERTriageTool;
