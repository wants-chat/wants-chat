'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Activity,
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
  Droplets,
  Stethoscope,
  FileText,
  Car,
  Shield,
  Heart,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Pause,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface ScheduleEntry {
  id: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string;
  station: string;
  duration: number; // in minutes
}

interface LabResults {
  date: string;
  results: {
    name: string;
    value: string;
    unit: string;
    status: 'normal' | 'high' | 'low' | 'critical';
  }[];
}

interface VascularAccess {
  location: string;
  dateCreated: string;
  complications: string[];
}

interface DialysisPatient {
  id: string;
  patientId: string;
  patientName: string;
  dialysisType: 'hemodialysis' | 'peritoneal' | 'home-hemo';
  accessType: 'fistula' | 'graft' | 'catheter';
  schedule: ScheduleEntry[];
  nephrologist: string;
  dryWeight: number; // in kg
  fluidRemovalGoal: number; // in liters
  dialysateFormula: string;
  anticoagulation: string;
  lastLabWork: LabResults;
  vascularAccess: VascularAccess;
  transportation: string;
  insuranceAuth: string;
  status: 'active' | 'on-hold' | 'transferred' | 'deceased';
  contactPhone: string;
  emergencyContact: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DialysisSchedulerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'dialysis-scheduler';

const dialysisColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'patientId', header: 'Patient ID', type: 'string' },
  { key: 'dialysisType', header: 'Dialysis Type', type: 'string' },
  { key: 'accessType', header: 'Access Type', type: 'string' },
  { key: 'nephrologist', header: 'Nephrologist', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewPatient = (): DialysisPatient => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dialysisType: 'hemodialysis',
  accessType: 'fistula',
  schedule: [],
  nephrologist: '',
  dryWeight: 0,
  fluidRemovalGoal: 0,
  dialysateFormula: '',
  anticoagulation: 'Heparin',
  lastLabWork: {
    date: '',
    results: [],
  },
  vascularAccess: {
    location: '',
    dateCreated: '',
    complications: [],
  },
  transportation: '',
  insuranceAuth: '',
  status: 'active',
  contactPhone: '',
  emergencyContact: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const dialysisTypes = [
  { value: 'hemodialysis', label: 'Hemodialysis', icon: Droplets },
  { value: 'peritoneal', label: 'Peritoneal Dialysis', icon: Activity },
  { value: 'home-hemo', label: 'Home Hemodialysis', icon: Heart },
];

const accessTypes = [
  { value: 'fistula', label: 'AV Fistula' },
  { value: 'graft', label: 'AV Graft' },
  { value: 'catheter', label: 'Central Venous Catheter' },
];

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const commonAnticoagulants = [
  'Heparin',
  'Enoxaparin (Lovenox)',
  'Citrate',
  'Argatroban',
  'None (Heparin-free)',
];

const commonDialysateFormulas = [
  'Standard (K+ 2.0 mEq/L)',
  'Low Potassium (K+ 1.0 mEq/L)',
  'High Potassium (K+ 3.0 mEq/L)',
  'Low Calcium (Ca 2.5 mEq/L)',
  'High Calcium (Ca 3.5 mEq/L)',
  'Bicarbonate-based',
  'Acetate-based',
];

const commonLabTests = [
  { name: 'BUN', unit: 'mg/dL' },
  { name: 'Creatinine', unit: 'mg/dL' },
  { name: 'Potassium', unit: 'mEq/L' },
  { name: 'Phosphorus', unit: 'mg/dL' },
  { name: 'Calcium', unit: 'mg/dL' },
  { name: 'Hemoglobin', unit: 'g/dL' },
  { name: 'Albumin', unit: 'g/dL' },
  { name: 'PTH', unit: 'pg/mL' },
  { name: 'Ferritin', unit: 'ng/mL' },
  { name: 'TSAT', unit: '%' },
];

export const DialysisSchedulerTool: React.FC<DialysisSchedulerToolProps> = ({ uiConfig }) => {
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
  } = useToolData<DialysisPatient>(TOOL_ID, [], dialysisColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<DialysisPatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<DialysisPatient | null>(null);
  const [formData, setFormData] = useState<DialysisPatient>(createNewPatient());
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'treatment']);

  const [newScheduleEntry, setNewScheduleEntry] = useState<Omit<ScheduleEntry, 'id'>>({
    dayOfWeek: 'monday',
    time: '06:00',
    station: '',
    duration: 240,
  });

  const [newLabResult, setNewLabResult] = useState({
    name: '',
    value: '',
    unit: '',
    status: 'normal' as const,
  });

  const [newComplication, setNewComplication] = useState('');

  // Statistics
  const stats = useMemo(() => {
    const active = patients.filter(p => p.status === 'active');
    const hemodialysis = patients.filter(p => p.dialysisType === 'hemodialysis');
    const peritoneal = patients.filter(p => p.dialysisType === 'peritoneal');
    const homeHemo = patients.filter(p => p.dialysisType === 'home-hemo');
    const onHold = patients.filter(p => p.status === 'on-hold');
    return {
      total: patients.length,
      active: active.length,
      hemodialysis: hemodialysis.length,
      peritoneal: peritoneal.length,
      homeHemo: homeHemo.length,
      onHold: onHold.length,
    };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = searchQuery === '' ||
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.nephrologist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || patient.dialysisType === filterType;
      const matchesStatus = filterStatus === '' || patient.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [patients, searchQuery, filterType, filterStatus]);

  const handleSave = () => {
    if (editingPatient) {
      updatePatient(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addPatient({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingPatient(null);
    setFormData(createNewPatient());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Patient Record',
      message: 'Are you sure you want to delete this patient record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePatient(id);
      if (selectedPatient?.id === id) setSelectedPatient(null);
    }
  };

  const openEditModal = (patient: DialysisPatient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setShowModal(true);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const addScheduleEntry = () => {
    if (newScheduleEntry.station) {
      const entry: ScheduleEntry = { ...newScheduleEntry, id: crypto.randomUUID() };
      setFormData({ ...formData, schedule: [...formData.schedule, entry] });
      setNewScheduleEntry({ dayOfWeek: 'monday', time: '06:00', station: '', duration: 240 });
      setShowScheduleModal(false);
    }
  };

  const removeScheduleEntry = (id: string) => {
    setFormData({ ...formData, schedule: formData.schedule.filter(s => s.id !== id) });
  };

  const addLabResult = () => {
    if (newLabResult.name && newLabResult.value) {
      const result = { ...newLabResult };
      setFormData({
        ...formData,
        lastLabWork: {
          ...formData.lastLabWork,
          results: [...formData.lastLabWork.results, result],
        },
      });
      setNewLabResult({ name: '', value: '', unit: '', status: 'normal' });
    }
  };

  const removeLabResult = (index: number) => {
    setFormData({
      ...formData,
      lastLabWork: {
        ...formData.lastLabWork,
        results: formData.lastLabWork.results.filter((_, i) => i !== index),
      },
    });
  };

  const addComplication = () => {
    if (newComplication.trim() && !formData.vascularAccess.complications.includes(newComplication.trim())) {
      setFormData({
        ...formData,
        vascularAccess: {
          ...formData.vascularAccess,
          complications: [...formData.vascularAccess.complications, newComplication.trim()],
        },
      });
      setNewComplication('');
    }
  };

  const removeComplication = (complication: string) => {
    setFormData({
      ...formData,
      vascularAccess: {
        ...formData.vascularAccess,
        complications: formData.vascularAccess.complications.filter(c => c !== complication),
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'transferred': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'deceased': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-400';
      case 'high': return 'text-orange-400';
      case 'low': return 'text-blue-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = dialysisTypes.find(t => t.value === type);
    return typeConfig?.icon || Droplets;
  };

  const formatDuration = (minutes: number) => {
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

  const sectionHeaderClass = `flex items-center justify-between p-3 cursor-pointer rounded-lg ${
    theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
            <Droplets className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.dialysisScheduler.dialysisScheduler', 'Dialysis Scheduler')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.dialysisScheduler.scheduleAndTrackDialysisTreatments', 'Schedule and track dialysis treatments')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="dialysis-scheduler" toolName="Dialysis Scheduler" />

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
            onExportCSV={() => exportCSV({ filename: 'dialysis-scheduler' })}
            onExportExcel={() => exportExcel({ filename: 'dialysis-scheduler' })}
            onExportJSON={() => exportJSON({ filename: 'dialysis-scheduler' })}
            onExportPDF={() => exportPDF({ filename: 'dialysis-scheduler', title: 'Dialysis Patient Records' })}
            onPrint={() => print('Dialysis Patient Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={patients.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewPatient()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.dialysisScheduler.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <User className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dialysisScheduler.total', 'Total')}</p>
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dialysisScheduler.active', 'Active')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dialysisScheduler.hemodialysis', 'Hemodialysis')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.hemodialysis}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dialysisScheduler.peritoneal', 'Peritoneal')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.peritoneal}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 rounded-lg">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dialysisScheduler.homeHemo', 'Home Hemo')}</p>
              <p className="text-2xl font-bold text-pink-500">{stats.homeHemo}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Pause className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dialysisScheduler.onHold', 'On Hold')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.onHold}</p>
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
              placeholder={t('tools.dialysisScheduler.searchPatientIdOrNephrologist', 'Search patient, ID, or nephrologist...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.dialysisScheduler.allDialysisTypes', 'All Dialysis Types')}</option>
            {dialysisTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.dialysisScheduler.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.dialysisScheduler.active2', 'Active')}</option>
            <option value="on-hold">{t('tools.dialysisScheduler.onHold2', 'On Hold')}</option>
            <option value="transferred">{t('tools.dialysisScheduler.transferred', 'Transferred')}</option>
            <option value="deceased">{t('tools.dialysisScheduler.deceased', 'Deceased')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.dialysisScheduler.patientRecords', 'Patient Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Droplets className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.dialysisScheduler.noPatientsRecorded', 'No patients recorded')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPatients.map(patient => {
                  const TypeIcon = getTypeIcon(patient.dialysisType);
                  return (
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
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium">{patient.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ID: {patient.patientId}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(patient.status)}`}>
                                {patient.status}
                              </span>
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {patient.schedule.length} sessions/week
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(patient); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(patient.id).catch(() => {}); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
          {selectedPatient ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedPatient.patientName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedPatient.status)}`}>
                        {selectedPatient.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Patient ID: {selectedPatient.patientId} | Nephrologist: {selectedPatient.nephrologist || 'N/A'}
                    </p>
                  </div>
                  <button onClick={() => openEditModal(selectedPatient)} className={buttonSecondary}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                {/* Treatment Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.dialysisScheduler.dialysisType', 'Dialysis Type')}</p>
                    <p className="font-medium capitalize">{selectedPatient.dialysisType.replace('-', ' ')}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.dialysisScheduler.accessType', 'Access Type')}</p>
                    <p className="font-medium capitalize">{selectedPatient.accessType}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.dialysisScheduler.dryWeight', 'Dry Weight')}</p>
                    <p className="font-medium">{selectedPatient.dryWeight ? `${selectedPatient.dryWeight} kg` : 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.dialysisScheduler.fluidRemovalGoal', 'Fluid Removal Goal')}</p>
                    <p className="font-medium">{selectedPatient.fluidRemovalGoal ? `${selectedPatient.fluidRemovalGoal} L` : 'N/A'}</p>
                  </div>
                </div>

                {/* Treatment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      {t('tools.dialysisScheduler.dialysateFormula2', 'Dialysate Formula')}
                    </h3>
                    <p className="text-sm">{selectedPatient.dialysateFormula || 'Not specified'}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-500" />
                      {t('tools.dialysisScheduler.anticoagulation2', 'Anticoagulation')}
                    </h3>
                    <p className="text-sm">{selectedPatient.anticoagulation || 'Not specified'}</p>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    Weekly Schedule ({selectedPatient.schedule.length} sessions)
                  </h3>
                  {selectedPatient.schedule.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dialysisScheduler.noScheduleSet', 'No schedule set')}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedPatient.schedule.map(entry => (
                        <div key={entry.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="font-medium capitalize">{entry.dayOfWeek}</p>
                          <p className="text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {entry.time}
                          </p>
                          <p className="text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Station {entry.station}
                          </p>
                          <p className="text-sm text-gray-400">{formatDuration(entry.duration)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vascular Access */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    {t('tools.dialysisScheduler.vascularAccess2', 'Vascular Access')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">{t('tools.dialysisScheduler.location', 'Location')}</p>
                      <p className="text-sm">{selectedPatient.vascularAccess.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('tools.dialysisScheduler.dateCreated', 'Date Created')}</p>
                      <p className="text-sm">{selectedPatient.vascularAccess.dateCreated || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedPatient.vascularAccess.complications.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">{t('tools.dialysisScheduler.complications', 'Complications')}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.vascularAccess.complications.map((comp, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Last Lab Work */}
                {selectedPatient.lastLabWork.results.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-500" />
                      Last Lab Work
                      {selectedPatient.lastLabWork.date && (
                        <span className="text-sm font-normal text-gray-400">({selectedPatient.lastLabWork.date})</span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedPatient.lastLabWork.results.map((result, i) => (
                        <div key={i} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400">{result.name}</p>
                          <p className={`font-medium ${getLabStatusColor(result.status)}`}>
                            {result.value} {result.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Car className="w-4 h-4 text-yellow-500" />
                      {t('tools.dialysisScheduler.transportation2', 'Transportation')}
                    </h3>
                    <p className="text-sm">{selectedPatient.transportation || 'Not specified'}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      {t('tools.dialysisScheduler.insuranceAuth', 'Insurance Auth')}
                    </h3>
                    <p className="text-sm">{selectedPatient.insuranceAuth || 'Not specified'}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-500" />
                      {t('tools.dialysisScheduler.contactPhone2', 'Contact Phone')}
                    </h3>
                    <p className="text-sm">{selectedPatient.contactPhone || 'Not specified'}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      {t('tools.dialysisScheduler.emergencyContact2', 'Emergency Contact')}
                    </h3>
                    <p className="text-sm">{selectedPatient.emergencyContact || 'Not specified'}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedPatient.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.dialysisScheduler.notes', 'Notes')}</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Droplets className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.dialysisScheduler.selectAPatientRecord', 'Select a patient record')}</p>
              <p className="text-sm">{t('tools.dialysisScheduler.chooseAPatientToView', 'Choose a patient to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} z-10`}>
              <h2 className="text-xl font-bold">{editingPatient ? t('tools.dialysisScheduler.editPatient', 'Edit Patient') : t('tools.dialysisScheduler.addPatient2', 'Add Patient')}</h2>
              <button onClick={() => { setShowModal(false); setEditingPatient(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Basic Info Section */}
              <div>
                <div onClick={() => toggleSection('basic')} className={sectionHeaderClass}>
                  <span className="font-semibold">{t('tools.dialysisScheduler.basicInformation', 'Basic Information')}</span>
                  {expandedSections.includes('basic') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {expandedSections.includes('basic') && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.patientName', 'Patient Name *')}</label>
                        <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.patientId', 'Patient ID *')}</label>
                        <input type="text" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className={inputClass} placeholder={t('tools.dialysisScheduler.mrnOrIdNumber', 'MRN or ID number')} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.nephrologist', 'Nephrologist')}</label>
                        <input type="text" value={formData.nephrologist} onChange={(e) => setFormData({ ...formData, nephrologist: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.status', 'Status')}</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                          <option value="active">{t('tools.dialysisScheduler.active3', 'Active')}</option>
                          <option value="on-hold">{t('tools.dialysisScheduler.onHold3', 'On Hold')}</option>
                          <option value="transferred">{t('tools.dialysisScheduler.transferred2', 'Transferred')}</option>
                          <option value="deceased">{t('tools.dialysisScheduler.deceased2', 'Deceased')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.contactPhone', 'Contact Phone')}</label>
                        <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.emergencyContact', 'Emergency Contact')}</label>
                        <input type="text" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Treatment Section */}
              <div>
                <div onClick={() => toggleSection('treatment')} className={sectionHeaderClass}>
                  <span className="font-semibold">{t('tools.dialysisScheduler.treatmentInformation', 'Treatment Information')}</span>
                  {expandedSections.includes('treatment') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {expandedSections.includes('treatment') && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.dialysisType2', 'Dialysis Type')}</label>
                        <select value={formData.dialysisType} onChange={(e) => setFormData({ ...formData, dialysisType: e.target.value as any })} className={inputClass}>
                          {dialysisTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.accessType2', 'Access Type')}</label>
                        <select value={formData.accessType} onChange={(e) => setFormData({ ...formData, accessType: e.target.value as any })} className={inputClass}>
                          {accessTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.dryWeightKg', 'Dry Weight (kg)')}</label>
                        <input type="number" step="0.1" value={formData.dryWeight || ''} onChange={(e) => setFormData({ ...formData, dryWeight: parseFloat(e.target.value) || 0 })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.fluidRemovalGoalL', 'Fluid Removal Goal (L)')}</label>
                        <input type="number" step="0.1" value={formData.fluidRemovalGoal || ''} onChange={(e) => setFormData({ ...formData, fluidRemovalGoal: parseFloat(e.target.value) || 0 })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.dialysateFormula', 'Dialysate Formula')}</label>
                        <select value={formData.dialysateFormula} onChange={(e) => setFormData({ ...formData, dialysateFormula: e.target.value })} className={inputClass}>
                          <option value="">{t('tools.dialysisScheduler.selectFormula', 'Select formula...')}</option>
                          {commonDialysateFormulas.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.anticoagulation', 'Anticoagulation')}</label>
                        <select value={formData.anticoagulation} onChange={(e) => setFormData({ ...formData, anticoagulation: e.target.value })} className={inputClass}>
                          {commonAnticoagulants.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Section */}
              <div>
                <div onClick={() => toggleSection('schedule')} className={sectionHeaderClass}>
                  <span className="font-semibold">Weekly Schedule ({formData.schedule.length})</span>
                  {expandedSections.includes('schedule') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {expandedSections.includes('schedule') && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.day', 'Day')}</label>
                        <select value={newScheduleEntry.dayOfWeek} onChange={(e) => setNewScheduleEntry({ ...newScheduleEntry, dayOfWeek: e.target.value as any })} className={inputClass}>
                          {daysOfWeek.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.time', 'Time')}</label>
                        <input type="time" value={newScheduleEntry.time} onChange={(e) => setNewScheduleEntry({ ...newScheduleEntry, time: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.station', 'Station')}</label>
                        <input type="text" value={newScheduleEntry.station} onChange={(e) => setNewScheduleEntry({ ...newScheduleEntry, station: e.target.value })} className={inputClass} placeholder="e.g., 5A" />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.durationMin', 'Duration (min)')}</label>
                        <input type="number" value={newScheduleEntry.duration} onChange={(e) => setNewScheduleEntry({ ...newScheduleEntry, duration: parseInt(e.target.value) || 240 })} className={inputClass} />
                      </div>
                    </div>
                    <button type="button" onClick={addScheduleEntry} className={buttonSecondary}>
                      <Plus className="w-4 h-4" /> Add Session
                    </button>
                    {formData.schedule.length > 0 && (
                      <div className="space-y-2">
                        {formData.schedule.map(entry => (
                          <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <span className="capitalize">{entry.dayOfWeek} at {entry.time} - Station {entry.station} ({formatDuration(entry.duration)})</span>
                            <button onClick={() => removeScheduleEntry(entry.id)} className="p-1 hover:bg-red-500/20 rounded">
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vascular Access Section */}
              <div>
                <div onClick={() => toggleSection('access')} className={sectionHeaderClass}>
                  <span className="font-semibold">{t('tools.dialysisScheduler.vascularAccess', 'Vascular Access')}</span>
                  {expandedSections.includes('access') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {expandedSections.includes('access') && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.location2', 'Location')}</label>
                        <input type="text" value={formData.vascularAccess.location} onChange={(e) => setFormData({ ...formData, vascularAccess: { ...formData.vascularAccess, location: e.target.value } })} className={inputClass} placeholder={t('tools.dialysisScheduler.eGLeftForearm', 'e.g., Left forearm')} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.dateCreated2', 'Date Created')}</label>
                        <input type="date" value={formData.vascularAccess.dateCreated} onChange={(e) => setFormData({ ...formData, vascularAccess: { ...formData.vascularAccess, dateCreated: e.target.value } })} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.dialysisScheduler.complications2', 'Complications')}</label>
                      <div className="flex gap-2 mb-2">
                        <input type="text" value={newComplication} onChange={(e) => setNewComplication(e.target.value)} placeholder={t('tools.dialysisScheduler.addComplication', 'Add complication')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComplication())} />
                        <button type="button" onClick={addComplication} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.vascularAccess.complications.map((comp, i) => (
                          <span key={i} className="px-3 py-1 text-sm rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                            {comp} <button onClick={() => removeComplication(comp)}><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lab Work Section */}
              <div>
                <div onClick={() => toggleSection('labs')} className={sectionHeaderClass}>
                  <span className="font-semibold">Last Lab Work ({formData.lastLabWork.results.length})</span>
                  {expandedSections.includes('labs') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {expandedSections.includes('labs') && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className={labelClass}>{t('tools.dialysisScheduler.labDate', 'Lab Date')}</label>
                      <input type="date" value={formData.lastLabWork.date} onChange={(e) => setFormData({ ...formData, lastLabWork: { ...formData.lastLabWork, date: e.target.value } })} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.test', 'Test')}</label>
                        <select value={newLabResult.name} onChange={(e) => {
                          const test = commonLabTests.find(t => t.name === e.target.value);
                          setNewLabResult({ ...newLabResult, name: e.target.value, unit: test?.unit || '' });
                        }} className={inputClass}>
                          <option value="">{t('tools.dialysisScheduler.selectTest', 'Select test...')}</option>
                          {commonLabTests.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.value', 'Value')}</label>
                        <input type="text" value={newLabResult.value} onChange={(e) => setNewLabResult({ ...newLabResult, value: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.status2', 'Status')}</label>
                        <select value={newLabResult.status} onChange={(e) => setNewLabResult({ ...newLabResult, status: e.target.value as any })} className={inputClass}>
                          <option value="normal">{t('tools.dialysisScheduler.normal', 'Normal')}</option>
                          <option value="high">{t('tools.dialysisScheduler.high', 'High')}</option>
                          <option value="low">{t('tools.dialysisScheduler.low', 'Low')}</option>
                          <option value="critical">{t('tools.dialysisScheduler.critical', 'Critical')}</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button type="button" onClick={addLabResult} className={buttonSecondary}><Plus className="w-4 h-4" /> {t('tools.dialysisScheduler.add', 'Add')}</button>
                      </div>
                    </div>
                    {formData.lastLabWork.results.length > 0 && (
                      <div className="space-y-2">
                        {formData.lastLabWork.results.map((result, i) => (
                          <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <span>{result.name}: <span className={getLabStatusColor(result.status)}>{result.value} {result.unit}</span></span>
                            <button onClick={() => removeLabResult(i)} className="p-1 hover:bg-red-500/20 rounded">
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Info Section */}
              <div>
                <div onClick={() => toggleSection('additional')} className={sectionHeaderClass}>
                  <span className="font-semibold">{t('tools.dialysisScheduler.additionalInformation', 'Additional Information')}</span>
                  {expandedSections.includes('additional') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {expandedSections.includes('additional') && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.transportation', 'Transportation')}</label>
                        <input type="text" value={formData.transportation} onChange={(e) => setFormData({ ...formData, transportation: e.target.value })} className={inputClass} placeholder={t('tools.dialysisScheduler.eGMedicalTransportFamily', 'e.g., Medical transport, Family, Self')} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dialysisScheduler.insuranceAuthorization', 'Insurance Authorization')}</label>
                        <input type="text" value={formData.insuranceAuth} onChange={(e) => setFormData({ ...formData, insuranceAuth: e.target.value })} className={inputClass} placeholder={t('tools.dialysisScheduler.authorizationNumber', 'Authorization number')} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.dialysisScheduler.notes2', 'Notes')}</label>
                      <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); }} className={buttonSecondary}>{t('tools.dialysisScheduler.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.patientName || !formData.patientId} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.dialysisScheduler.aboutDialysisScheduler', 'About Dialysis Scheduler')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Schedule and track dialysis treatments for patients. Manage hemodialysis, peritoneal dialysis, and home hemodialysis
          schedules. Track vascular access information, lab results, anticoagulation protocols, and transportation arrangements.
          Maintain comprehensive patient records including dry weight, fluid removal goals, and dialysate formulas.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default DialysisSchedulerTool;
