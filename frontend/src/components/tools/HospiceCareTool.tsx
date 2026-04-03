'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Heart,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Phone,
  Users,
  Pill,
  FileText,
  Clock,
  Activity,
  Shield,
  Home,
  UserCheck,
  Cross,
  Stethoscope,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface TeamMember {
  id: string;
  role: string;
  name: string;
  phone: string;
}

interface FamilyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimaryContact: boolean;
}

interface VisitRecord {
  id: string;
  date: string;
  time: string;
  visitType: 'nursing' | 'aide' | 'social-work' | 'chaplain' | 'physician' | 'volunteer';
  provider: string;
  notes: string;
  duration: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  purpose: string;
  isComfortMeasure: boolean;
}

interface HospicePatient {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  admitDate: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  prognosis: string;
  levelOfCare: 'routine' | 'continuous' | 'respite' | 'inpatient';
  attendingPhysician: string;
  hospiceTeam: TeamMember[];
  dnrStatus: boolean;
  advanceDirectives: string;
  painManagement: string;
  comfortMeasures: string;
  familyContacts: FamilyContact[];
  spiritualSupport: string;
  bereavementPlan: string;
  medicationList: Medication[];
  equipmentNeeded: string[];
  visitSchedule: string;
  status: 'enrolled' | 'active' | 'revoked' | 'deceased';
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface HospiceCareToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'hospice-care';

const hospiceColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'patientId', header: 'Patient ID', type: 'string' },
  { key: 'primaryDiagnosis', header: 'Diagnosis', type: 'string' },
  { key: 'levelOfCare', header: 'Level of Care', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'admitDate', header: 'Admit Date', type: 'date' },
  { key: 'attendingPhysician', header: 'Physician', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewPatient = (): HospicePatient => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dateOfBirth: '',
  admitDate: new Date().toISOString().split('T')[0],
  primaryDiagnosis: '',
  secondaryDiagnoses: [],
  prognosis: '',
  levelOfCare: 'routine',
  attendingPhysician: '',
  hospiceTeam: [],
  dnrStatus: true,
  advanceDirectives: '',
  painManagement: '',
  comfortMeasures: '',
  familyContacts: [],
  spiritualSupport: '',
  bereavementPlan: '',
  medicationList: [],
  equipmentNeeded: [],
  visitSchedule: '',
  status: 'enrolled',
  location: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const levelOfCareOptions = [
  { value: 'routine', label: 'Routine Home Care', icon: Home, description: 'Standard home hospice care' },
  { value: 'continuous', label: 'Continuous Care', icon: Clock, description: 'Crisis care during brief periods' },
  { value: 'respite', label: 'Respite Care', icon: Shield, description: 'Short-term inpatient for caregiver relief' },
  { value: 'inpatient', label: 'Inpatient Care', icon: Stethoscope, description: 'Acute symptom management' },
];

const statusOptions = [
  { value: 'enrolled', label: 'Enrolled', color: 'blue' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'revoked', label: 'Revoked', color: 'yellow' },
  { value: 'deceased', label: 'Deceased', color: 'gray' },
];

const teamRoles = [
  'Physician',
  'Nurse',
  'Certified Nursing Assistant',
  'Social Worker',
  'Chaplain',
  'Volunteer Coordinator',
  'Bereavement Counselor',
  'Dietitian',
  'Physical Therapist',
  'Occupational Therapist',
  'Speech Therapist',
];

const commonEquipment = [
  'Hospital Bed',
  'Wheelchair',
  'Walker',
  'Bedside Commode',
  'Oxygen Concentrator',
  'Suction Machine',
  'Nebulizer',
  'CPAP/BiPAP',
  'Hoyer Lift',
  'Air Mattress',
  'Shower Chair',
  'Grab Bars',
  'Transfer Belt',
  'Wound Care Supplies',
  'IV Supplies',
];

export const HospiceCareTool: React.FC<HospiceCareToolProps> = ({ uiConfig }) => {
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
  } = useToolData<HospicePatient>(TOOL_ID, [], hospiceColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<HospicePatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<HospicePatient | null>(null);
  const [formData, setFormData] = useState<HospicePatient>(createNewPatient());
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'team' | 'family' | 'medications' | 'visits'>('info');

  // Team member form
  const [newTeamMember, setNewTeamMember] = useState<Omit<TeamMember, 'id'>>({
    role: '',
    name: '',
    phone: '',
  });

  // Family contact form
  const [newContact, setNewContact] = useState<Omit<FamilyContact, 'id'>>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimaryContact: false,
  });

  // Medication form
  const [newMedication, setNewMedication] = useState<Omit<Medication, 'id'>>({
    name: '',
    dosage: '',
    frequency: '',
    route: 'Oral',
    purpose: '',
    isComfortMeasure: false,
  });

  // Visit record form
  const [newVisit, setNewVisit] = useState<Omit<VisitRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    time: '',
    visitType: 'nursing',
    provider: '',
    notes: '',
    duration: 30,
  });

  // Statistics
  const stats = useMemo(() => {
    const active = patients.filter(p => p.status === 'active');
    const enrolled = patients.filter(p => p.status === 'enrolled');
    const routine = patients.filter(p => p.levelOfCare === 'routine');
    const inpatient = patients.filter(p => p.levelOfCare === 'inpatient' || p.levelOfCare === 'continuous');
    return {
      total: patients.length,
      active: active.length,
      enrolled: enrolled.length,
      routineCare: routine.length,
      acuteCare: inpatient.length,
    };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = searchQuery === '' ||
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || patient.status === filterStatus;
      const matchesLevel = filterLevel === '' || patient.levelOfCare === filterLevel;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [patients, searchQuery, filterStatus, filterLevel]);

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

  const openEditModal = (patient: HospicePatient) => {
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

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipmentNeeded.includes(newEquipment.trim())) {
      setFormData({ ...formData, equipmentNeeded: [...formData.equipmentNeeded, newEquipment.trim()] });
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData({ ...formData, equipmentNeeded: formData.equipmentNeeded.filter(e => e !== equipment) });
  };

  const saveTeamMember = () => {
    if (selectedPatient && newTeamMember.name && newTeamMember.role) {
      const member: TeamMember = { ...newTeamMember, id: crypto.randomUUID() };
      const updated = {
        ...selectedPatient,
        hospiceTeam: [...selectedPatient.hospiceTeam, member],
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowTeamModal(false);
      setNewTeamMember({ role: '', name: '', phone: '' });
    }
  };

  const removeTeamMember = (memberId: string) => {
    if (selectedPatient) {
      const updated = {
        ...selectedPatient,
        hospiceTeam: selectedPatient.hospiceTeam.filter(m => m.id !== memberId),
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const saveFamilyContact = () => {
    if (selectedPatient && newContact.name && newContact.relationship) {
      const contact: FamilyContact = { ...newContact, id: crypto.randomUUID() };
      const updated = {
        ...selectedPatient,
        familyContacts: [...selectedPatient.familyContacts, contact],
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowContactModal(false);
      setNewContact({ name: '', relationship: '', phone: '', email: '', isPrimaryContact: false });
    }
  };

  const removeFamilyContact = (contactId: string) => {
    if (selectedPatient) {
      const updated = {
        ...selectedPatient,
        familyContacts: selectedPatient.familyContacts.filter(c => c.id !== contactId),
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const saveMedication = () => {
    if (selectedPatient && newMedication.name && newMedication.dosage) {
      const medication: Medication = { ...newMedication, id: crypto.randomUUID() };
      const updated = {
        ...selectedPatient,
        medicationList: [...selectedPatient.medicationList, medication],
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowMedicationModal(false);
      setNewMedication({ name: '', dosage: '', frequency: '', route: 'Oral', purpose: '', isComfortMeasure: false });
    }
  };

  const removeMedication = (medId: string) => {
    if (selectedPatient) {
      const updated = {
        ...selectedPatient,
        medicationList: selectedPatient.medicationList.filter(m => m.id !== medId),
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'revoked': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'deceased': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLevelIcon = (level: string) => {
    const levelConfig = levelOfCareOptions.find(l => l.value === level);
    return levelConfig?.icon || Home;
  };

  const getLevelLabel = (level: string) => {
    const levelConfig = levelOfCareOptions.find(l => l.value === level);
    return levelConfig?.label || level;
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (active: boolean) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    active
      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      : theme === 'dark'
        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Heart className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.hospiceCare.hospiceCare', 'Hospice Care')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.hospiceCare.patientCareAndFamilySupport', 'Patient care and family support management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="hospice-care" toolName="Hospice Care" />

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
            onExportCSV={() => exportCSV({ filename: 'hospice-care' })}
            onExportExcel={() => exportExcel({ filename: 'hospice-care' })}
            onExportJSON={() => exportJSON({ filename: 'hospice-care' })}
            onExportPDF={() => exportPDF({ filename: 'hospice-care', title: 'Hospice Care Records' })}
            onPrint={() => print('Hospice Care Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={patients.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewPatient()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.hospiceCare.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.totalPatients', 'Total Patients')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.active', 'Active')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.enrolled', 'Enrolled')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.enrolled}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Home className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.routineCare', 'Routine Care')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.routineCare}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Stethoscope className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.acuteCare', 'Acute Care')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.acuteCare}</p>
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
              placeholder={t('tools.hospiceCare.searchPatientNameIdOr', 'Search patient name, ID, or diagnosis...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.hospiceCare.allStatus', 'All Status')}</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.hospiceCare.allLevelsOfCare', 'All Levels of Care')}</option>
            {levelOfCareOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.hospiceCare.patientRecords', 'Patient Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.hospiceCare.noPatientsFound', 'No patients found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPatients.map(patient => {
                  const LevelIcon = getLevelIcon(patient.levelOfCare);
                  return (
                    <div
                      key={patient.id}
                      onClick={() => { setSelectedPatient(patient); setActiveTab('info'); }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-purple-500/10 border-l-4 border-purple-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <LevelIcon className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium">{patient.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ID: {patient.patientId || 'N/A'}
                            </p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {patient.primaryDiagnosis}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(patient.status)}`}>
                                {patient.status}
                              </span>
                              <span className={`inline-block px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                {getLevelLabel(patient.levelOfCare)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(patient); }} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
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
                      {selectedPatient.dnrStatus && (
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded border border-red-500/30">{t('tools.hospiceCare.dnr', 'DNR')}</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Patient ID: {selectedPatient.patientId || 'N/A'} | Admitted: {selectedPatient.admitDate}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  <button onClick={() => setActiveTab('info')} className={tabClass(activeTab === 'info')}>
                    <FileText className="w-4 h-4 inline mr-1" /> Info
                  </button>
                  <button onClick={() => setActiveTab('team')} className={tabClass(activeTab === 'team')}>
                    <Users className="w-4 h-4 inline mr-1" /> Team ({selectedPatient.hospiceTeam.length})
                  </button>
                  <button onClick={() => setActiveTab('family')} className={tabClass(activeTab === 'family')}>
                    <Heart className="w-4 h-4 inline mr-1" /> Family ({selectedPatient.familyContacts.length})
                  </button>
                  <button onClick={() => setActiveTab('medications')} className={tabClass(activeTab === 'medications')}>
                    <Pill className="w-4 h-4 inline mr-1" /> Meds ({selectedPatient.medicationList.length})
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {/* Info Tab */}
                {activeTab === 'info' && (
                  <>
                    {/* Patient Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.hospiceCare.dateOfBirth', 'Date of Birth')}</p>
                        <p className="font-medium">{selectedPatient.dateOfBirth || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.hospiceCare.levelOfCare', 'Level of Care')}</p>
                        <p className="font-medium capitalize">{getLevelLabel(selectedPatient.levelOfCare)}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.hospiceCare.prognosis', 'Prognosis')}</p>
                        <p className="font-medium">{selectedPatient.prognosis || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.hospiceCare.attendingPhysician', 'Attending Physician')}</p>
                        <p className="font-medium">{selectedPatient.attendingPhysician || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <h3 className="font-semibold mb-2">{t('tools.hospiceCare.primaryDiagnosis', 'Primary Diagnosis')}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedPatient.primaryDiagnosis || 'Not specified'}
                      </p>
                      {selectedPatient.secondaryDiagnoses.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1">{t('tools.hospiceCare.secondaryDiagnoses', 'Secondary Diagnoses:')}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.secondaryDiagnoses.map((d, i) => (
                              <span key={i} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Care Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPatient.painManagement && (
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            {t('tools.hospiceCare.painManagement', 'Pain Management')}
                          </h3>
                          <p className="text-sm">{selectedPatient.painManagement}</p>
                        </div>
                      )}
                      {selectedPatient.comfortMeasures && (
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-500" />
                            {t('tools.hospiceCare.comfortMeasures2', 'Comfort Measures')}
                          </h3>
                          <p className="text-sm">{selectedPatient.comfortMeasures}</p>
                        </div>
                      )}
                    </div>

                    {/* Advance Directives */}
                    {selectedPatient.advanceDirectives && (
                      <div className={`p-4 rounded-lg border border-purple-500/30 ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-purple-400">
                          <Shield className="w-4 h-4" />
                          {t('tools.hospiceCare.advanceDirectives2', 'Advance Directives')}
                        </h3>
                        <p className="text-sm">{selectedPatient.advanceDirectives}</p>
                      </div>
                    )}

                    {/* Spiritual & Bereavement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPatient.spiritualSupport && (
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Cross className="w-4 h-4 text-blue-500" />
                            {t('tools.hospiceCare.spiritualSupport2', 'Spiritual Support')}
                          </h3>
                          <p className="text-sm">{selectedPatient.spiritualSupport}</p>
                        </div>
                      )}
                      {selectedPatient.bereavementPlan && (
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-purple-500" />
                            {t('tools.hospiceCare.bereavementPlan2', 'Bereavement Plan')}
                          </h3>
                          <p className="text-sm">{selectedPatient.bereavementPlan}</p>
                        </div>
                      )}
                    </div>

                    {/* Equipment */}
                    {selectedPatient.equipmentNeeded.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('tools.hospiceCare.equipmentNeeded', 'Equipment Needed')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.equipmentNeeded.map((eq, i) => (
                            <span key={i} className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visit Schedule */}
                    {selectedPatient.visitSchedule && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          {t('tools.hospiceCare.visitSchedule2', 'Visit Schedule')}
                        </h3>
                        <p className="text-sm">{selectedPatient.visitSchedule}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.hospiceCare.hospiceCareTeam', 'Hospice Care Team')}</h3>
                      <button onClick={() => setShowTeamModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Member
                      </button>
                    </div>
                    {selectedPatient.hospiceTeam.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.noTeamMembersAssigned', 'No team members assigned')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatient.hospiceTeam.map(member => (
                          <div key={member.id} className={`p-4 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                <User className="w-4 h-4 text-purple-500" />
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {member.phone && (
                                <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <Phone className="w-3 h-3" /> {member.phone}
                                </span>
                              )}
                              <button onClick={() => removeTeamMember(member.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Family Tab */}
                {activeTab === 'family' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.hospiceCare.familyContacts', 'Family Contacts')}</h3>
                      <button onClick={() => setShowContactModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Contact
                      </button>
                    </div>
                    {selectedPatient.familyContacts.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.noFamilyContactsAdded', 'No family contacts added')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatient.familyContacts.map(contact => (
                          <div key={contact.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{contact.name}</p>
                                  {contact.isPrimaryContact && (
                                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">{t('tools.hospiceCare.primary', 'Primary')}</span>
                                  )}
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{contact.relationship}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                  {contact.phone && (
                                    <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <Phone className="w-3 h-3" /> {contact.phone}
                                    </span>
                                  )}
                                  {contact.email && (
                                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {contact.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button onClick={() => removeFamilyContact(contact.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Medications Tab */}
                {activeTab === 'medications' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.hospiceCare.medicationList', 'Medication List')}</h3>
                      <button onClick={() => setShowMedicationModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Medication
                      </button>
                    </div>
                    {selectedPatient.medicationList.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hospiceCare.noMedicationsListed', 'No medications listed')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatient.medicationList.map(med => (
                          <div key={med.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{med.name}</p>
                                  {med.isComfortMeasure && (
                                    <span className="px-2 py-0.5 text-xs bg-pink-500/20 text-pink-400 rounded">{t('tools.hospiceCare.comfortMed', 'Comfort Med')}</span>
                                  )}
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {med.dosage} | {med.route} | {med.frequency}
                                </p>
                                {med.purpose && (
                                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Purpose: {med.purpose}
                                  </p>
                                )}
                              </div>
                              <button onClick={() => removeMedication(med.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
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
              <Heart className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.hospiceCare.selectAPatientRecord', 'Select a patient record')}</p>
              <p className="text-sm">{t('tools.hospiceCare.chooseAPatientToView', 'Choose a patient to view their care details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold">{editingPatient ? t('tools.hospiceCare.editPatient', 'Edit Patient') : t('tools.hospiceCare.addPatient2', 'Add Patient')}</h2>
              <button onClick={() => { setShowModal(false); setEditingPatient(null); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.hospiceCare.patientInformation', 'Patient Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.patientName', 'Patient Name *')}</label>
                    <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.fullName', 'Full name')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.patientId', 'Patient ID')}</label>
                    <input type="text" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.medicalRecordNumber', 'Medical record number')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.dateOfBirth2', 'Date of Birth')}</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.admitDate', 'Admit Date')}</label>
                    <input type="date" value={formData.admitDate} onChange={(e) => setFormData({ ...formData, admitDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.location', 'Location')}</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.homeAddressOrFacility', 'Home address or facility')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.attendingPhysician2', 'Attending Physician')}</label>
                    <input type="text" value={formData.attendingPhysician} onChange={(e) => setFormData({ ...formData, attendingPhysician: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.drName', 'Dr. name')} />
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.hospiceCare.medicalInformation', 'Medical Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.hospiceCare.primaryDiagnosis2', 'Primary Diagnosis *')}</label>
                    <input type="text" value={formData.primaryDiagnosis} onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.primaryDiagnosis3', 'Primary diagnosis')} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.hospiceCare.secondaryDiagnoses2', 'Secondary Diagnoses')}</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newDiagnosis} onChange={(e) => setNewDiagnosis(e.target.value)} placeholder={t('tools.hospiceCare.addDiagnosis', 'Add diagnosis')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryDiagnosis())} />
                      <button type="button" onClick={addSecondaryDiagnosis} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.secondaryDiagnoses.map((d, i) => (
                        <span key={i} className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          {d} <button onClick={() => removeDiagnosis(d)}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.prognosis2', 'Prognosis')}</label>
                    <input type="text" value={formData.prognosis} onChange={(e) => setFormData({ ...formData, prognosis: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.eG6MonthsOr', 'e.g., 6 months or less')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.levelOfCare2', 'Level of Care')}</label>
                    <select value={formData.levelOfCare} onChange={(e) => setFormData({ ...formData, levelOfCare: e.target.value as any })} className={inputClass}>
                      {levelOfCareOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.status', 'Status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                      {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="dnrStatus" checked={formData.dnrStatus} onChange={(e) => setFormData({ ...formData, dnrStatus: e.target.checked })} className="w-4 h-4 rounded" />
                    <label htmlFor="dnrStatus" className={labelClass}>{t('tools.hospiceCare.dnrStatus', 'DNR Status')}</label>
                  </div>
                </div>
              </div>

              {/* Care Plans */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.hospiceCare.carePlans', 'Care Plans')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.advanceDirectives', 'Advance Directives')}</label>
                    <textarea value={formData.advanceDirectives} onChange={(e) => setFormData({ ...formData, advanceDirectives: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.hospiceCare.documentAdvanceDirectiveWishes', 'Document advance directive wishes')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.painManagementPlan', 'Pain Management Plan')}</label>
                    <textarea value={formData.painManagement} onChange={(e) => setFormData({ ...formData, painManagement: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.hospiceCare.painManagementApproachAndMedications', 'Pain management approach and medications')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.comfortMeasures', 'Comfort Measures')}</label>
                    <textarea value={formData.comfortMeasures} onChange={(e) => setFormData({ ...formData, comfortMeasures: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.hospiceCare.comfortCareInterventions', 'Comfort care interventions')} />
                  </div>
                </div>
              </div>

              {/* Support Plans */}
              <div>
                <h3 className="font-semibold mb-3">{t('tools.hospiceCare.supportPlans', 'Support Plans')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.spiritualSupport', 'Spiritual Support')}</label>
                    <textarea value={formData.spiritualSupport} onChange={(e) => setFormData({ ...formData, spiritualSupport: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.hospiceCare.spiritualReligiousPreferencesAndSupport', 'Spiritual/religious preferences and support')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.bereavementPlan', 'Bereavement Plan')}</label>
                    <textarea value={formData.bereavementPlan} onChange={(e) => setFormData({ ...formData, bereavementPlan: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.hospiceCare.familyBereavementSupportPlan', 'Family bereavement support plan')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.hospiceCare.visitSchedule', 'Visit Schedule')}</label>
                    <textarea value={formData.visitSchedule} onChange={(e) => setFormData({ ...formData, visitSchedule: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.hospiceCare.regularVisitScheduleEG', 'Regular visit schedule (e.g., RN 2x/week, Aide 3x/week)')} />
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.equipmentNeeded2', 'Equipment Needed')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newEquipment} onChange={(e) => setNewEquipment(e.target.value)} placeholder={t('tools.hospiceCare.addEquipment', 'Add equipment')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())} />
                  <button type="button" onClick={addEquipment} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonEquipment.filter(e => !formData.equipmentNeeded.includes(e)).slice(0, 6).map(eq => (
                    <button key={eq} type="button" onClick={() => setFormData({ ...formData, equipmentNeeded: [...formData.equipmentNeeded, eq] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {eq}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.equipmentNeeded.map((eq, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {eq} <button onClick={() => removeEquipment(eq)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.additionalNotes', 'Additional Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.hospiceCare.anyAdditionalNotesOrSpecial', 'Any additional notes or special considerations')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); }} className={buttonSecondary}>{t('tools.hospiceCare.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.patientName || !formData.primaryDiagnosis} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {showTeamModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.hospiceCare.addTeamMember', 'Add Team Member')}</h2>
              <button onClick={() => setShowTeamModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.role', 'Role *')}</label>
                <select value={newTeamMember.role} onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.hospiceCare.selectRole', 'Select role')}</option>
                  {teamRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.name', 'Name *')}</label>
                <input type="text" value={newTeamMember.name} onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.fullName2', 'Full name')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.phone', 'Phone')}</label>
                <input type="tel" value={newTeamMember.phone} onChange={(e) => setNewTeamMember({ ...newTeamMember, phone: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.contactNumber', 'Contact number')} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowTeamModal(false)} className={buttonSecondary}>{t('tools.hospiceCare.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveTeamMember} disabled={!newTeamMember.name || !newTeamMember.role} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Contact Modal */}
      {showContactModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.hospiceCare.addFamilyContact', 'Add Family Contact')}</h2>
              <button onClick={() => setShowContactModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.name2', 'Name *')}</label>
                <input type="text" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.fullName3', 'Full name')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.relationship', 'Relationship *')}</label>
                <input type="text" value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.eGSpouseDaughterSon', 'e.g., Spouse, Daughter, Son')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.phone2', 'Phone')}</label>
                <input type="tel" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.contactNumber2', 'Contact number')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.email', 'Email')}</label>
                <input type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.emailAddress', 'Email address')} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isPrimary" checked={newContact.isPrimaryContact} onChange={(e) => setNewContact({ ...newContact, isPrimaryContact: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="isPrimary" className={labelClass}>{t('tools.hospiceCare.primaryContact', 'Primary Contact')}</label>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowContactModal(false)} className={buttonSecondary}>{t('tools.hospiceCare.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveFamilyContact} disabled={!newContact.name || !newContact.relationship} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medication Modal */}
      {showMedicationModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.hospiceCare.addMedication', 'Add Medication')}</h2>
              <button onClick={() => setShowMedicationModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.medicationName', 'Medication Name *')}</label>
                <input type="text" value={newMedication.name} onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.medicationName2', 'Medication name')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.hospiceCare.dosage', 'Dosage *')}</label>
                  <input type="text" value={newMedication.dosage} onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.eG10mg', 'e.g., 10mg')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.hospiceCare.route', 'Route')}</label>
                  <select value={newMedication.route} onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value })} className={inputClass}>
                    <option value="Oral">{t('tools.hospiceCare.oral', 'Oral')}</option>
                    <option value="IV">IV</option>
                    <option value="IM">IM</option>
                    <option value="Subcutaneous">{t('tools.hospiceCare.subcutaneous', 'Subcutaneous')}</option>
                    <option value="Topical">{t('tools.hospiceCare.topical', 'Topical')}</option>
                    <option value="Sublingual">{t('tools.hospiceCare.sublingual', 'Sublingual')}</option>
                    <option value="Rectal">{t('tools.hospiceCare.rectal', 'Rectal')}</option>
                    <option value="Transdermal">{t('tools.hospiceCare.transdermal', 'Transdermal')}</option>
                    <option value="Inhaled">{t('tools.hospiceCare.inhaled', 'Inhaled')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.frequency', 'Frequency')}</label>
                <input type="text" value={newMedication.frequency} onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.eGBidTidQ4h', 'e.g., BID, TID, Q4H PRN')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.hospiceCare.purpose', 'Purpose')}</label>
                <input type="text" value={newMedication.purpose} onChange={(e) => setNewMedication({ ...newMedication, purpose: e.target.value })} className={inputClass} placeholder={t('tools.hospiceCare.eGPainManagement', 'e.g., Pain management')} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isComfort" checked={newMedication.isComfortMeasure} onChange={(e) => setNewMedication({ ...newMedication, isComfortMeasure: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="isComfort" className={labelClass}>{t('tools.hospiceCare.comfortMeasureMedication', 'Comfort Measure Medication')}</label>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowMedicationModal(false)} className={buttonSecondary}>{t('tools.hospiceCare.cancel4', 'Cancel')}</button>
                <button type="button" onClick={saveMedication} disabled={!newMedication.name || !newMedication.dosage} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Add Medication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.hospiceCare.aboutHospiceCareTool', 'About Hospice Care Tool')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive hospice patient care management. Track patient information, care team, family contacts,
          medications, and support plans. Document advance directives, pain management protocols, comfort measures,
          and bereavement planning to ensure compassionate end-of-life care.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default HospiceCareTool;
