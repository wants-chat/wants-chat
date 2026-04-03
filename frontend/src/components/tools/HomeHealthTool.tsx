'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Home,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Heart,
  Activity,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  Pill,
  Thermometer,
  Droplets,
  Wind,
  Syringe,
  Shield,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  PauseCircle,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface VisitSchedule {
  id: string;
  date: string;
  time: string;
  type: 'nursing' | 'aide' | 'therapy' | 'wound-care' | 'infusion' | 'assessment';
  duration: number; // in minutes
  notes: string;
  completed: boolean;
}

interface CarePlanGoal {
  id: string;
  goal: string;
  targetDate: string;
  status: 'active' | 'achieved' | 'modified' | 'discontinued';
  progress: string;
}

interface HomeHealthPatient {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  careLevel: 'skilled' | 'custodial' | 'respite';
  assignedNurse: string;
  assignedAide: string;
  visitSchedule: VisitSchedule[];
  carePlan: CarePlanGoal[];
  medicationManagement: boolean;
  vitalSignsRequired: boolean;
  woundCare: boolean;
  physicalTherapy: boolean;
  oxygenTherapy: boolean;
  ivTherapy: boolean;
  insulinManagement: boolean;
  catheterCare: boolean;
  feedingTube: boolean;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  authorizationNumber: string;
  authorizedVisits: number;
  visitsUsed: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  physicianName: string;
  physicianPhone: string;
  status: 'active' | 'on-hold' | 'discharged';
  admissionDate: string;
  dischargeDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface HomeHealthToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'home-health';

const homeHealthColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'patientId', header: 'Patient ID', type: 'string' },
  { key: 'primaryDiagnosis', header: 'Primary Diagnosis', type: 'string' },
  { key: 'careLevel', header: 'Care Level', type: 'string' },
  { key: 'assignedNurse', header: 'Assigned Nurse', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'admissionDate', header: 'Admission Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewPatient = (): HomeHealthPatient => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  primaryDiagnosis: '',
  secondaryDiagnoses: [],
  careLevel: 'skilled',
  assignedNurse: '',
  assignedAide: '',
  visitSchedule: [],
  carePlan: [],
  medicationManagement: false,
  vitalSignsRequired: false,
  woundCare: false,
  physicalTherapy: false,
  oxygenTherapy: false,
  ivTherapy: false,
  insulinManagement: false,
  catheterCare: false,
  feedingTube: false,
  insuranceProvider: '',
  insurancePolicyNumber: '',
  insuranceGroupNumber: '',
  authorizationNumber: '',
  authorizedVisits: 0,
  visitsUsed: 0,
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  physicianName: '',
  physicianPhone: '',
  status: 'active',
  admissionDate: new Date().toISOString().split('T')[0],
  dischargeDate: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const careLevels = [
  { value: 'skilled', label: 'Skilled Nursing', icon: Stethoscope },
  { value: 'custodial', label: 'Custodial Care', icon: Heart },
  { value: 'respite', label: 'Respite Care', icon: Users },
];

const visitTypes = [
  { value: 'nursing', label: 'Nursing Visit' },
  { value: 'aide', label: 'Home Health Aide' },
  { value: 'therapy', label: 'Physical Therapy' },
  { value: 'wound-care', label: 'Wound Care' },
  { value: 'infusion', label: 'Infusion Therapy' },
  { value: 'assessment', label: 'Assessment' },
];

const commonDiagnoses = [
  'Congestive Heart Failure (CHF)',
  'COPD',
  'Diabetes Mellitus',
  'Hypertension',
  'Post-Surgical Recovery',
  'Stroke Recovery',
  'Hip/Knee Replacement',
  'Wound Care',
  'Parkinson\'s Disease',
  'Alzheimer\'s/Dementia',
  'Cancer Care',
  'Renal Disease',
];

export const HomeHealthTool: React.FC<HomeHealthToolProps> = ({ uiConfig }) => {
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
  } = useToolData<HomeHealthPatient>(TOOL_ID, [], homeHealthColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCareLevel, setFilterCareLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<HomeHealthPatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<HomeHealthPatient | null>(null);
  const [formData, setFormData] = useState<HomeHealthPatient>(createNewPatient());
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'care-plan' | 'services'>('info');

  const [newVisit, setNewVisit] = useState<Omit<VisitSchedule, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'nursing',
    duration: 60,
    notes: '',
    completed: false,
  });

  const [newGoal, setNewGoal] = useState<Omit<CarePlanGoal, 'id'>>({
    goal: '',
    targetDate: '',
    status: 'active',
    progress: '',
  });

  // Statistics
  const stats = useMemo(() => {
    const active = patients.filter(p => p.status === 'active');
    const onHold = patients.filter(p => p.status === 'on-hold');
    const skilled = patients.filter(p => p.careLevel === 'skilled' && p.status === 'active');
    const todaysVisits = patients.reduce((count, p) => {
      const today = new Date().toISOString().split('T')[0];
      return count + p.visitSchedule.filter(v => v.date === today && !v.completed).length;
    }, 0);
    const lowAuthorization = patients.filter(p =>
      p.status === 'active' && p.authorizedVisits > 0 &&
      (p.authorizedVisits - p.visitsUsed) <= 3
    );
    return {
      total: patients.length,
      active: active.length,
      onHold: onHold.length,
      skilled: skilled.length,
      todaysVisits,
      lowAuthorization: lowAuthorization.length,
    };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = searchQuery === '' ||
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCareLevel = filterCareLevel === '' || patient.careLevel === filterCareLevel;
      const matchesStatus = filterStatus === '' || patient.status === filterStatus;
      return matchesSearch && matchesCareLevel && matchesStatus;
    });
  }, [patients, searchQuery, filterCareLevel, filterStatus]);

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
      variant: 'danger'
    });
    if (confirmed) {
      deletePatient(id);
      if (selectedPatient?.id === id) setSelectedPatient(null);
    }
  };

  const openEditModal = (patient: HomeHealthPatient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setShowModal(true);
  };

  const addSecondaryDiagnosis = () => {
    if (newDiagnosis.trim() && !formData.secondaryDiagnoses.includes(newDiagnosis.trim())) {
      setFormData({ ...formData, secondaryDiagnoses: [...formData.secondaryDiagnoses, newDiagnosis.trim()] });
      setNewDiagnosis('');
    }
  };

  const removeDiagnosis = (diagnosis: string) => {
    setFormData({ ...formData, secondaryDiagnoses: formData.secondaryDiagnoses.filter(d => d !== diagnosis) });
  };

  const saveVisit = () => {
    if (selectedPatient) {
      const visit: VisitSchedule = { ...newVisit, id: crypto.randomUUID() };
      const updated = {
        ...selectedPatient,
        visitSchedule: [...selectedPatient.visitSchedule, visit],
        updatedAt: new Date().toISOString()
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowVisitModal(false);
      setNewVisit({
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'nursing',
        duration: 60,
        notes: '',
        completed: false,
      });
    }
  };

  const toggleVisitComplete = (visitId: string) => {
    if (selectedPatient) {
      const updatedSchedule = selectedPatient.visitSchedule.map(v =>
        v.id === visitId ? { ...v, completed: !v.completed } : v
      );
      const completedCount = updatedSchedule.filter(v => v.completed).length;
      const updated = {
        ...selectedPatient,
        visitSchedule: updatedSchedule,
        visitsUsed: completedCount,
        updatedAt: new Date().toISOString()
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const deleteVisit = async (visitId: string) => {
    const confirmed = await confirm({
      title: 'Delete Visit',
      message: 'Are you sure you want to delete this visit?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (selectedPatient && confirmed) {
      const updatedSchedule = selectedPatient.visitSchedule.filter(v => v.id !== visitId);
      const updated = {
        ...selectedPatient,
        visitSchedule: updatedSchedule,
        updatedAt: new Date().toISOString()
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const saveGoal = () => {
    if (selectedPatient && newGoal.goal.trim()) {
      const goal: CarePlanGoal = { ...newGoal, id: crypto.randomUUID() };
      const updated = {
        ...selectedPatient,
        carePlan: [...selectedPatient.carePlan, goal],
        updatedAt: new Date().toISOString()
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowGoalModal(false);
      setNewGoal({ goal: '', targetDate: '', status: 'active', progress: '' });
    }
  };

  const updateGoalStatus = (goalId: string, status: CarePlanGoal['status']) => {
    if (selectedPatient) {
      const updatedPlan = selectedPatient.carePlan.map(g =>
        g.id === goalId ? { ...g, status } : g
      );
      const updated = {
        ...selectedPatient,
        carePlan: updatedPlan,
        updatedAt: new Date().toISOString()
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const deleteGoal = async (goalId: string) => {
    const confirmed = await confirm({
      title: 'Delete Goal',
      message: 'Are you sure you want to delete this care plan goal?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (selectedPatient && confirmed) {
      const updatedPlan = selectedPatient.carePlan.filter(g => g.id !== goalId);
      const updated = {
        ...selectedPatient,
        carePlan: updatedPlan,
        updatedAt: new Date().toISOString()
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'discharged': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCareLevelIcon = (level: string) => {
    const levelConfig = careLevels.find(l => l.value === level);
    return levelConfig?.icon || Heart;
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-400';
      case 'achieved': return 'bg-green-500/20 text-green-400';
      case 'modified': return 'bg-yellow-500/20 text-yellow-400';
      case 'discontinued': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <Home className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.homeHealth.homeHealthCare', 'Home Health Care')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.homeHealth.trackHomeHealthVisitsAnd', 'Track home health visits and care plans')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="home-health" toolName="Home Health" />

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
            onExportCSV={() => exportCSV({ filename: 'home-health' })}
            onExportExcel={() => exportExcel({ filename: 'home-health' })}
            onExportJSON={() => exportJSON({ filename: 'home-health' })}
            onExportPDF={() => exportPDF({ filename: 'home-health', title: 'Home Health Records' })}
            onPrint={() => print('Home Health Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={patients.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewPatient()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.homeHealth.addPatient', 'Add Patient')}
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.totalPatients', 'Total Patients')}</p>
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.active', 'Active')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <PauseCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.onHold', 'On Hold')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.onHold}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Stethoscope className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.skilled', 'Skilled')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.skilled}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.todaySVisits', 'Today\'s Visits')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.todaysVisits}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.lowAuth', 'Low Auth')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.lowAuthorization}</p>
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
              placeholder={t('tools.homeHealth.searchPatientNameIdOr', 'Search patient name, ID, or diagnosis...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterCareLevel} onChange={(e) => setFilterCareLevel(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.homeHealth.allCareLevels', 'All Care Levels')}</option>
            {careLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.homeHealth.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.homeHealth.active2', 'Active')}</option>
            <option value="on-hold">{t('tools.homeHealth.onHold2', 'On Hold')}</option>
            <option value="discharged">{t('tools.homeHealth.discharged', 'Discharged')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.homeHealth.patientRecords', 'Patient Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.homeHealth.noPatientsFound', 'No patients found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPatients.map(patient => {
                  const CareLevelIcon = getCareLevelIcon(patient.careLevel);
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
                            <CareLevelIcon className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium">{patient.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ID: {patient.patientId || 'N/A'}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {patient.primaryDiagnosis || 'No diagnosis'}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(patient); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
                      ID: {selectedPatient.patientId || 'N/A'} | {selectedPatient.primaryDiagnosis || 'No primary diagnosis'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedPatient.authorizedVisits > 0 && (
                      <div className={`px-3 py-1 rounded-lg text-sm ${
                        (selectedPatient.authorizedVisits - selectedPatient.visitsUsed) <= 3
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {selectedPatient.authorizedVisits - selectedPatient.visitsUsed} visits remaining
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setActiveTab('info')} className={tabClass(activeTab === 'info')}>
                    <User className="w-4 h-4 inline mr-1" /> Info
                  </button>
                  <button onClick={() => setActiveTab('schedule')} className={tabClass(activeTab === 'schedule')}>
                    <Calendar className="w-4 h-4 inline mr-1" /> Schedule
                  </button>
                  <button onClick={() => setActiveTab('care-plan')} className={tabClass(activeTab === 'care-plan')}>
                    <FileText className="w-4 h-4 inline mr-1" /> Care Plan
                  </button>
                  <button onClick={() => setActiveTab('services')} className={tabClass(activeTab === 'services')}>
                    <Activity className="w-4 h-4 inline mr-1" /> Services
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Tab */}
                {activeTab === 'info' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.homeHealth.careLevel', 'Care Level')}</p>
                        <p className="font-medium capitalize">{selectedPatient.careLevel}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.homeHealth.admissionDate', 'Admission Date')}</p>
                        <p className="font-medium">{selectedPatient.admissionDate || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.homeHealth.assignedNurse', 'Assigned Nurse')}</p>
                        <p className="font-medium">{selectedPatient.assignedNurse || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.homeHealth.assignedAide', 'Assigned Aide')}</p>
                        <p className="font-medium">{selectedPatient.assignedAide || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-500" /> Address
                      </h3>
                      <p className="text-sm">
                        {selectedPatient.address || 'No address'}<br />
                        {selectedPatient.city && `${selectedPatient.city}, `}{selectedPatient.state} {selectedPatient.zipCode}
                      </p>
                      {selectedPatient.phone && (
                        <p className="text-sm mt-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" /> {selectedPatient.phone}
                        </p>
                      )}
                    </div>

                    {/* Emergency & Physician */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-400">
                          <Phone className="w-4 h-4" /> Emergency Contact
                        </h3>
                        <p className="text-sm font-medium">{selectedPatient.emergencyContactName || 'Not set'}</p>
                        <p className="text-sm">{selectedPatient.emergencyContactPhone}</p>
                        <p className="text-xs text-gray-400">{selectedPatient.emergencyContactRelation}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-cyan-500" /> Physician
                        </h3>
                        <p className="text-sm font-medium">{selectedPatient.physicianName || 'Not set'}</p>
                        <p className="text-sm">{selectedPatient.physicianPhone}</p>
                      </div>
                    </div>

                    {/* Insurance */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-500" /> Insurance Information
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">{t('tools.homeHealth.provider', 'Provider')}</p>
                          <p className="font-medium">{selectedPatient.insuranceProvider || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('tools.homeHealth.policy', 'Policy #')}</p>
                          <p className="font-medium">{selectedPatient.insurancePolicyNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('tools.homeHealth.group', 'Group #')}</p>
                          <p className="font-medium">{selectedPatient.insuranceGroupNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('tools.homeHealth.auth', 'Auth #')}</p>
                          <p className="font-medium">{selectedPatient.authorizationNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        Visit Schedule ({selectedPatient.visitSchedule.length})
                      </h3>
                      <button onClick={() => setShowVisitModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Visit
                      </button>
                    </div>
                    {selectedPatient.visitSchedule.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.noVisitsScheduled', 'No visits scheduled')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedPatient.visitSchedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(visit => (
                          <div key={visit.id} className={`p-4 rounded-lg ${
                            visit.completed
                              ? theme === 'dark' ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                              : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleVisitComplete(visit.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    visit.completed
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-400 hover:border-cyan-500'
                                  }`}
                                >
                                  {visit.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                </button>
                                <div>
                                  <p className={`font-medium ${visit.completed ? 'line-through text-gray-400' : ''}`}>
                                    {visit.date} at {visit.time}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {visitTypes.find(t => t.value === visit.type)?.label} - {visit.duration} min
                                  </p>
                                </div>
                              </div>
                              <button onClick={() => deleteVisit(visit.id)} className="p-1 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                            {visit.notes && <p className="text-sm mt-2 text-gray-400">{visit.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Care Plan Tab */}
                {activeTab === 'care-plan' && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-500" />
                        Care Plan Goals ({selectedPatient.carePlan.length})
                      </h3>
                      <button onClick={() => setShowGoalModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Goal
                      </button>
                    </div>
                    {selectedPatient.carePlan.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeHealth.noGoalsDefined', 'No goals defined')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatient.carePlan.map(goal => (
                          <div key={goal.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{goal.goal}</p>
                                {goal.targetDate && (
                                  <p className="text-sm text-gray-400">Target: {goal.targetDate}</p>
                                )}
                                {goal.progress && (
                                  <p className="text-sm mt-1">{goal.progress}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={goal.status}
                                  onChange={(e) => updateGoalStatus(goal.id, e.target.value as CarePlanGoal['status'])}
                                  className={`px-2 py-1 text-xs rounded ${getGoalStatusColor(goal.status)}`}
                                >
                                  <option value="active">{t('tools.homeHealth.active3', 'Active')}</option>
                                  <option value="achieved">{t('tools.homeHealth.achieved', 'Achieved')}</option>
                                  <option value="modified">{t('tools.homeHealth.modified', 'Modified')}</option>
                                  <option value="discontinued">{t('tools.homeHealth.discontinued', 'Discontinued')}</option>
                                </select>
                                <button onClick={() => deleteGoal(goal.id)} className="p-1 hover:bg-red-500/20 rounded">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <ServiceBadge active={selectedPatient.medicationManagement} label="Medication Management" icon={Pill} theme={theme} />
                    <ServiceBadge active={selectedPatient.vitalSignsRequired} label="Vital Signs" icon={Thermometer} theme={theme} />
                    <ServiceBadge active={selectedPatient.woundCare} label="Wound Care" icon={Activity} theme={theme} />
                    <ServiceBadge active={selectedPatient.physicalTherapy} label="Physical Therapy" icon={Activity} theme={theme} />
                    <ServiceBadge active={selectedPatient.oxygenTherapy} label="Oxygen Therapy" icon={Wind} theme={theme} />
                    <ServiceBadge active={selectedPatient.ivTherapy} label="IV Therapy" icon={Syringe} theme={theme} />
                    <ServiceBadge active={selectedPatient.insulinManagement} label="Insulin Management" icon={Droplets} theme={theme} />
                    <ServiceBadge active={selectedPatient.catheterCare} label="Catheter Care" icon={Activity} theme={theme} />
                    <ServiceBadge active={selectedPatient.feedingTube} label="Feeding Tube" icon={Activity} theme={theme} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Home className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.homeHealth.selectAPatientRecord', 'Select a patient record')}</p>
              <p className="text-sm">{t('tools.homeHealth.chooseAPatientToView', 'Choose a patient to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingPatient ? t('tools.homeHealth.editPatient', 'Edit Patient') : t('tools.homeHealth.addPatient2', 'Add Patient')}</h2>
              <button onClick={() => { setShowModal(false); setEditingPatient(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.homeHealth.patientInformation', 'Patient Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.patientName', 'Patient Name *')}</label>
                    <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.patientId', 'Patient ID')}</label>
                    <input type="text" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.dateOfBirth', 'Date of Birth')}</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.phone', 'Phone')}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.homeHealth.address', 'Address')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.homeHealth.streetAddress', 'Street Address')}</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.city', 'City')}</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.homeHealth.state', 'State')}</label>
                      <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeHealth.zip', 'ZIP')}</label>
                      <input type="text" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.homeHealth.medicalInformation', 'Medical Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.primaryDiagnosis', 'Primary Diagnosis')}</label>
                    <select value={formData.primaryDiagnosis} onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })} className={inputClass}>
                      <option value="">{t('tools.homeHealth.selectDiagnosis', 'Select diagnosis...')}</option>
                      {commonDiagnoses.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.careLevel2', 'Care Level')}</label>
                    <select value={formData.careLevel} onChange={(e) => setFormData({ ...formData, careLevel: e.target.value as any })} className={inputClass}>
                      {careLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.status', 'Status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                      <option value="active">{t('tools.homeHealth.active4', 'Active')}</option>
                      <option value="on-hold">{t('tools.homeHealth.onHold3', 'On Hold')}</option>
                      <option value="discharged">{t('tools.homeHealth.discharged2', 'Discharged')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.admissionDate2', 'Admission Date')}</label>
                    <input type="date" value={formData.admissionDate} onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })} className={inputClass} />
                  </div>
                </div>

                {/* Secondary Diagnoses */}
                <div className="mt-4">
                  <label className={labelClass}>{t('tools.homeHealth.secondaryDiagnoses', 'Secondary Diagnoses')}</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newDiagnosis} onChange={(e) => setNewDiagnosis(e.target.value)} placeholder={t('tools.homeHealth.addDiagnosis', 'Add diagnosis')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryDiagnosis())} />
                    <button type="button" onClick={addSecondaryDiagnosis} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.secondaryDiagnoses.map((d, i) => (
                      <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                        {d} <button onClick={() => removeDiagnosis(d)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Care Team */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.homeHealth.careTeam', 'Care Team')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.assignedNurse2', 'Assigned Nurse')}</label>
                    <input type="text" value={formData.assignedNurse} onChange={(e) => setFormData({ ...formData, assignedNurse: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.assignedAide2', 'Assigned Aide')}</label>
                    <input type="text" value={formData.assignedAide} onChange={(e) => setFormData({ ...formData, assignedAide: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.physicianName', 'Physician Name')}</label>
                    <input type="text" value={formData.physicianName} onChange={(e) => setFormData({ ...formData, physicianName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.physicianPhone', 'Physician Phone')}</label>
                    <input type="tel" value={formData.physicianPhone} onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.homeHealth.requiredServices', 'Required Services')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.medicationManagement} onChange={(e) => setFormData({ ...formData, medicationManagement: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.medicationManagement', 'Medication Management')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.vitalSignsRequired} onChange={(e) => setFormData({ ...formData, vitalSignsRequired: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.vitalSigns', 'Vital Signs')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.woundCare} onChange={(e) => setFormData({ ...formData, woundCare: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.woundCare', 'Wound Care')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.physicalTherapy} onChange={(e) => setFormData({ ...formData, physicalTherapy: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.physicalTherapy', 'Physical Therapy')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.oxygenTherapy} onChange={(e) => setFormData({ ...formData, oxygenTherapy: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.oxygenTherapy', 'Oxygen Therapy')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.ivTherapy} onChange={(e) => setFormData({ ...formData, ivTherapy: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.ivTherapy', 'IV Therapy')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.insulinManagement} onChange={(e) => setFormData({ ...formData, insulinManagement: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.insulinManagement', 'Insulin Management')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.catheterCare} onChange={(e) => setFormData({ ...formData, catheterCare: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.catheterCare', 'Catheter Care')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.feedingTube} onChange={(e) => setFormData({ ...formData, feedingTube: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">{t('tools.homeHealth.feedingTube', 'Feeding Tube')}</span>
                  </label>
                </div>
              </div>

              {/* Insurance */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.homeHealth.insuranceInformation', 'Insurance Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.insuranceProvider', 'Insurance Provider')}</label>
                    <input type="text" value={formData.insuranceProvider} onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.policyNumber', 'Policy Number')}</label>
                    <input type="text" value={formData.insurancePolicyNumber} onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.groupNumber', 'Group Number')}</label>
                    <input type="text" value={formData.insuranceGroupNumber} onChange={(e) => setFormData({ ...formData, insuranceGroupNumber: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.authorizationNumber', 'Authorization Number')}</label>
                    <input type="text" value={formData.authorizationNumber} onChange={(e) => setFormData({ ...formData, authorizationNumber: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.authorizedVisits', 'Authorized Visits')}</label>
                    <input type="number" value={formData.authorizedVisits} onChange={(e) => setFormData({ ...formData, authorizedVisits: parseInt(e.target.value) || 0 })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.visitsUsed', 'Visits Used')}</label>
                    <input type="number" value={formData.visitsUsed} onChange={(e) => setFormData({ ...formData, visitsUsed: parseInt(e.target.value) || 0 })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.homeHealth.emergencyContact', 'Emergency Contact')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.name', 'Name')}</label>
                    <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.phone2', 'Phone')}</label>
                    <input type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.homeHealth.relationship', 'Relationship')}</label>
                    <input type="text" value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.homeHealth.notes', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); }} className={buttonSecondary}>{t('tools.homeHealth.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.patientName} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Modal */}
      {showVisitModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.homeHealth.scheduleVisit', 'Schedule Visit')}</h2>
              <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.homeHealth.date', 'Date')}</label>
                  <input type="date" value={newVisit.date} onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.homeHealth.time', 'Time')}</label>
                  <input type="time" value={newVisit.time} onChange={(e) => setNewVisit({ ...newVisit, time: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.homeHealth.visitType', 'Visit Type')}</label>
                  <select value={newVisit.type} onChange={(e) => setNewVisit({ ...newVisit, type: e.target.value as any })} className={inputClass}>
                    {visitTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.homeHealth.durationMin', 'Duration (min)')}</label>
                  <input type="number" value={newVisit.duration} onChange={(e) => setNewVisit({ ...newVisit, duration: parseInt(e.target.value) || 60 })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.homeHealth.notes2', 'Notes')}</label>
                <textarea value={newVisit.notes} onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowVisitModal(false)} className={buttonSecondary}>{t('tools.homeHealth.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveVisit} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.homeHealth.saveVisit', 'Save Visit')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.homeHealth.addCarePlanGoal', 'Add Care Plan Goal')}</h2>
              <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.homeHealth.goal', 'Goal *')}</label>
                <textarea value={newGoal.goal} onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.homeHealth.eGPatientWillAmbulate', 'e.g., Patient will ambulate 50 feet with walker independently')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.homeHealth.targetDate', 'Target Date')}</label>
                <input type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.homeHealth.progressNotes', 'Progress Notes')}</label>
                <textarea value={newGoal.progress} onChange={(e) => setNewGoal({ ...newGoal, progress: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowGoalModal(false)} className={buttonSecondary}>{t('tools.homeHealth.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveGoal} disabled={!newGoal.goal.trim()} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.homeHealth.saveGoal', 'Save Goal')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.homeHealth.aboutHomeHealthCare', 'About Home Health Care')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage home health patients with comprehensive care tracking. Schedule visits, track care plan goals,
          manage insurance authorizations, and monitor required services. Keep track of nursing, aide, and therapy visits
          with complete patient information including emergency contacts and physician details.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

// Service Badge Component
interface ServiceBadgeProps {
  active: boolean;
  label: string;
  icon: React.FC<{ className?: string }>;
  theme: string;
}

const ServiceBadge: React.FC<ServiceBadgeProps> = ({ active, label, icon: Icon, theme }) => (
  <div className={`p-3 rounded-lg flex items-center gap-3 ${
    active
      ? 'bg-cyan-500/20 border border-cyan-500/30'
      : theme === 'dark' ? 'bg-gray-700/30 border border-gray-700' : 'bg-gray-100 border border-gray-200'
  }`}>
    <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-gray-400'}`} />
    <span className={`text-sm ${active ? 'text-cyan-400' : 'text-gray-400'}`}>{label}</span>
    {active && <CheckCircle className="w-4 h-4 text-cyan-400 ml-auto" />}
  </div>
);

export default HomeHealthTool;
