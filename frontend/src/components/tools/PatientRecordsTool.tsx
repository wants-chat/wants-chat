'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Heart,
  Activity,
  Pill,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  Thermometer,
  Weight,
  Clock,
  Users,
  Stethoscope,
  Shield,
  ChevronDown,
  ChevronUp,
  Save,
  Filter,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

// Types
interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  expiryDate: string;
}

interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate: string;
  status: 'active' | 'resolved' | 'chronic';
  notes: string;
}

interface Surgery {
  id: string;
  name: string;
  date: string;
  hospital: string;
  notes: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: 'active' | 'discontinued';
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  doctor: string;
  department: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
}

interface VitalRecord {
  id: string;
  date: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  notes: string;
}

interface PatientNote {
  id: string;
  date: string;
  author: string;
  category: 'general' | 'clinical' | 'follow-up' | 'urgent';
  content: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
  allergies: string[];
  emergencyContact: EmergencyContact;
  insurance: InsuranceInfo;
  medicalConditions: MedicalCondition[];
  surgeries: Surgery[];
  medications: Medication[];
  appointments: Appointment[];
  vitals: VitalRecord[];
  notes: PatientNote[];
  createdAt: string;
  updatedAt: string;
}

interface PatientRecordsToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'patient-records';

// Column configuration for export
const patientColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'gender', header: 'Gender', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'bloodType', header: 'Blood Type', type: 'string' },
  { key: 'allergies', header: 'Allergies', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : '' },
  { key: 'emergencyContactName', header: 'Emergency Contact', type: 'string' },
  { key: 'emergencyContactPhone', header: 'Emergency Phone', type: 'string' },
  { key: 'insuranceProvider', header: 'Insurance Provider', type: 'string' },
  { key: 'insurancePolicyNumber', header: 'Policy Number', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const defaultEmergencyContact: EmergencyContact = {
  name: '',
  relationship: '',
  phone: '',
};

const defaultInsurance: InsuranceInfo = {
  provider: '',
  policyNumber: '',
  groupNumber: '',
  expiryDate: '',
};

const createNewPatient = (): Patient => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
  email: '',
  phone: '',
  address: '',
  bloodType: '',
  allergies: [],
  emergencyContact: { ...defaultEmergencyContact },
  insurance: { ...defaultInsurance },
  medicalConditions: [],
  surgeries: [],
  medications: [],
  appointments: [],
  vitals: [],
  notes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PatientRecordsTool: React.FC<PatientRecordsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use hook for data management
  const {
    data: patients,
    setData: setPatients,
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
  } = useToolData<Patient>(TOOL_ID, [], patientColumns);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterBloodType, setFilterBloodType] = useState<string>('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'appointments' | 'vitals' | 'notes'>('overview');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    conditions: true,
    surgeries: true,
    medications: true,
  });

  // New vital record form
  const [newVital, setNewVital] = useState<Omit<VitalRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 72,
    temperature: 98.6,
    weight: 0,
    notes: '',
  });

  // New note form
  const [newNote, setNewNote] = useState<Omit<PatientNote, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    author: '',
    category: 'general',
    content: '',
  });

  // New appointment form
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id'>>({
    date: '',
    time: '',
    type: '',
    doctor: '',
    department: '',
    status: 'scheduled',
    notes: '',
  });

  // Appointment validation errors
  const [appointmentErrors, setAppointmentErrors] = useState<Record<string, string>>({});

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const appointmentsToday = patients.reduce((count, p) => {
      return count + p.appointments.filter(a => a.date === today && a.status === 'scheduled').length;
    }, 0);

    const activePatients = patients.filter(p => {
      const lastAppointment = p.appointments[p.appointments.length - 1];
      if (!lastAppointment) return false;
      const appointmentDate = new Date(lastAppointment.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return appointmentDate >= threeMonthsAgo;
    }).length;

    const criticalPatients = patients.filter(p => {
      const latestVital = p.vitals[p.vitals.length - 1];
      if (!latestVital) return false;
      return latestVital.bloodPressureSystolic > 140 ||
             latestVital.bloodPressureDiastolic > 90 ||
             latestVital.heartRate > 100 ||
             latestVital.temperature > 100.4;
    }).length;

    return {
      totalPatients: patients.length,
      appointmentsToday,
      activePatients,
      criticalPatients,
    };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = searchQuery === '' ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery);

      const matchesGender = filterGender === '' || p.gender === filterGender;
      const matchesBloodType = filterBloodType === '' || p.bloodType === filterBloodType;

      return matchesSearch && matchesGender && matchesBloodType;
    });
  }, [patients, searchQuery, filterGender, filterBloodType]);

  // Export handlers using hook methods
  const handleExportCSV = () => {
    exportCSV({ filename: 'patient-records' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'patient-records' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'patient-records' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'patient-records',
      title: 'Patient Records',
      subtitle: `Total: ${filteredPatients.length} patients`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print('Patient Records');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // CRUD Operations using hook methods
  const savePatient = async (patient: Patient) => {
    if (editingPatient) {
      // Update existing patient
      updatePatient(patient.id, {
        ...patient,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Add new patient with timestamps
      addPatient({
        ...patient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setShowPatientModal(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Patient Record',
      message: 'Are you sure you want to delete this patient record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deletePatient(id);
    if (selectedPatient?.id === id) {
      setSelectedPatient(null);
    }
  };

  const addVitalRecord = async () => {
    if (!selectedPatient) return;

    const vitalRecord: VitalRecord = {
      id: crypto.randomUUID(),
      ...newVital,
    };

    const updatedPatient = {
      ...selectedPatient,
      vitals: [...selectedPatient.vitals, vitalRecord],
      updatedAt: new Date().toISOString(),
    };

    updatePatient(selectedPatient.id, updatedPatient);
    setSelectedPatient(updatedPatient);
    setShowVitalModal(false);
    setNewVital({
      date: new Date().toISOString().split('T')[0],
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      temperature: 98.6,
      weight: 0,
      notes: '',
    });
  };

  const addNote = async () => {
    if (!selectedPatient) return;

    const note: PatientNote = {
      id: crypto.randomUUID(),
      ...newNote,
    };

    const updatedPatient = {
      ...selectedPatient,
      notes: [...selectedPatient.notes, note],
      updatedAt: new Date().toISOString(),
    };

    updatePatient(selectedPatient.id, updatedPatient);
    setSelectedPatient(updatedPatient);
    setShowNoteModal(false);
    setNewNote({
      date: new Date().toISOString().split('T')[0],
      author: '',
      category: 'general',
      content: '',
    });
  };

  const validateAppointment = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newAppointment.date) errors.date = 'Date is required';
    if (!newAppointment.type) errors.type = 'Appointment type is required';
    setAppointmentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addAppointment = () => {
    if (!selectedPatient) return;
    if (!validateAppointment()) return;

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      ...newAppointment,
    };

    const updatedPatient = {
      ...selectedPatient,
      appointments: [...selectedPatient.appointments, appointment],
      updatedAt: new Date().toISOString(),
    };

    updatePatient(selectedPatient.id, updatedPatient);
    setSelectedPatient(updatedPatient);
    setShowAppointmentModal(false);
    setAppointmentErrors({});
    setNewAppointment({
      date: '',
      time: '',
      type: '',
      doctor: '',
      department: '',
      status: 'scheduled',
      notes: '',
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  const buttonDanger = `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500`;

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500 text-white'
      : theme === 'dark'
      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <Stethoscope className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.patientRecords.patientRecords', 'Patient Records')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.patientRecords.healthcarePatientManagementSystem', 'Healthcare patient management system')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="patient-records" toolName="Patient Records" />

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
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            disabled={patients.length === 0}
            showImport={false}
            theme={theme as 'light' | 'dark'}
          />
          <button
            onClick={() => {
              setEditingPatient(null);
              setShowPatientModal(true);
            }}
            className={buttonPrimary}
          >
            <Plus className="w-4 h-4" />
            {t('tools.patientRecords.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span className="text-sm text-cyan-500 font-medium">{t('tools.patientRecords.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientRecords.totalPatients', 'Total Patients')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientRecords.todaySAppointments', 'Today\'s Appointments')}</p>
              <p className="text-2xl font-bold text-teal-500">{stats.appointmentsToday}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientRecords.activePatients', 'Active Patients')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.activePatients}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientRecords.criticalVitals', 'Critical Vitals')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.criticalPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-500" />
              {t('tools.patientRecords.patients', 'Patients')}
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools.patientRecords.searchPatients', 'Search patients...')}
                className={`${inputClass} pl-10`}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className={`${inputClass} text-sm`}
              >
                <option value="">{t('tools.patientRecords.allGenders', 'All Genders')}</option>
                <option value="male">{t('tools.patientRecords.male', 'Male')}</option>
                <option value="female">{t('tools.patientRecords.female', 'Female')}</option>
                <option value="other">{t('tools.patientRecords.other', 'Other')}</option>
              </select>
              <select
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
                className={`${inputClass} text-sm`}
              >
                <option value="">{t('tools.patientRecords.allBloodTypes', 'All Blood Types')}</option>
                {bloodTypes.map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Patient List Items */}
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.patientRecords.loadingPatients', 'Loading patients...')}</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.patientRecords.noPatientsFound', 'No patients found')}</p>
                <p className="text-sm mt-1">{t('tools.patientRecords.addANewPatientTo', 'Add a new patient to get started')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setActiveTab('overview');
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark'
                        ? 'hover:bg-gray-700/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          patient.gender === 'male' ? 'bg-blue-500/20 text-blue-500' :
                          patient.gender === 'female' ? 'bg-pink-500/20 text-pink-500' :
                          'bg-purple-500/20 text-purple-500'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {calculateAge(patient.dateOfBirth)} yrs {patient.bloodType && `| ${patient.bloodType}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPatient(patient);
                            setShowPatientModal(true);
                          }}
                          className="p-1.5 rounded hover:bg-gray-600 text-gray-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePatient(patient.id);
                          }}
                          className="p-1.5 rounded hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient Details */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedPatient ? (
            <div>
              {/* Patient Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                      selectedPatient.gender === 'male' ? 'bg-blue-500/20 text-blue-500' :
                      selectedPatient.gender === 'female' ? 'bg-pink-500/20 text-pink-500' :
                      'bg-purple-500/20 text-purple-500'
                    }`}>
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {calculateAge(selectedPatient.dateOfBirth)} years old
                        </span>
                        {selectedPatient.bloodType && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded">
                            {selectedPatient.bloodType}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          selectedPatient.gender === 'male' ? 'bg-blue-500/20 text-blue-400' :
                          selectedPatient.gender === 'female' ? 'bg-pink-500/20 text-pink-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedPatient.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm truncate">{selectedPatient.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedPatient.dateOfBirth || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedPatient.insurance.provider || 'No Insurance'}</span>
                  </div>
                </div>

                {/* Allergies */}
                {selectedPatient.allergies.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('tools.patientRecords.allergies', 'Allergies:')}</span>
                      <span className="text-sm">{selectedPatient.allergies.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="px-6 py-3 border-b border-gray-700 flex gap-2 overflow-x-auto">
                <button onClick={() => setActiveTab('overview')} className={tabClass(activeTab === 'overview')}>
                  {t('tools.patientRecords.overview', 'Overview')}
                </button>
                <button onClick={() => setActiveTab('history')} className={tabClass(activeTab === 'history')}>
                  {t('tools.patientRecords.medicalHistory', 'Medical History')}
                </button>
                <button onClick={() => setActiveTab('appointments')} className={tabClass(activeTab === 'appointments')}>
                  {t('tools.patientRecords.appointments', 'Appointments')}
                </button>
                <button onClick={() => setActiveTab('vitals')} className={tabClass(activeTab === 'vitals')}>
                  {t('tools.patientRecords.vitals', 'Vitals')}
                </button>
                <button onClick={() => setActiveTab('notes')} className={tabClass(activeTab === 'notes')}>
                  {t('tools.patientRecords.notes4', 'Notes')}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Contact & Insurance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-cyan-500" />
                          {t('tools.patientRecords.emergencyContact', 'Emergency Contact')}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-400">{t('tools.patientRecords.name', 'Name:')}</span> {selectedPatient.emergencyContact.name || 'N/A'}</p>
                          <p><span className="text-gray-400">{t('tools.patientRecords.relationship', 'Relationship:')}</span> {selectedPatient.emergencyContact.relationship || 'N/A'}</p>
                          <p><span className="text-gray-400">{t('tools.patientRecords.phone', 'Phone:')}</span> {selectedPatient.emergencyContact.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-cyan-500" />
                          {t('tools.patientRecords.insuranceInformation', 'Insurance Information')}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-400">{t('tools.patientRecords.provider', 'Provider:')}</span> {selectedPatient.insurance.provider || 'N/A'}</p>
                          <p><span className="text-gray-400">{t('tools.patientRecords.policy', 'Policy #:')}</span> {selectedPatient.insurance.policyNumber || 'N/A'}</p>
                          <p><span className="text-gray-400">{t('tools.patientRecords.group', 'Group #:')}</span> {selectedPatient.insurance.groupNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Latest Vitals */}
                    {selectedPatient.vitals.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-500" />
                          {t('tools.patientRecords.latestVitals', 'Latest Vitals')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {(() => {
                            const latestVital = selectedPatient.vitals[selectedPatient.vitals.length - 1];
                            return (
                              <>
                                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                  <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                  <p className="text-lg font-bold">{latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}</p>
                                  <p className="text-xs text-gray-400">{t('tools.patientRecords.bloodPressure', 'Blood Pressure')}</p>
                                </div>
                                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                  <Activity className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                                  <p className="text-lg font-bold">{latestVital.heartRate}</p>
                                  <p className="text-xs text-gray-400">{t('tools.patientRecords.heartRate', 'Heart Rate')}</p>
                                </div>
                                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                  <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                  <p className="text-lg font-bold">{latestVital.temperature}F</p>
                                  <p className="text-xs text-gray-400">{t('tools.patientRecords.temperature', 'Temperature')}</p>
                                </div>
                                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                  <Weight className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                  <p className="text-lg font-bold">{latestVital.weight}</p>
                                  <p className="text-xs text-gray-400">{t('tools.patientRecords.weightLbs', 'Weight (lbs)')}</p>
                                </div>
                                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                  <p className="text-lg font-bold">{new Date(latestVital.date).toLocaleDateString()}</p>
                                  <p className="text-xs text-gray-400">{t('tools.patientRecords.recorded', 'Recorded')}</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical History Tab */}
                {activeTab === 'history' && (
                  <div className="space-y-6">
                    {/* Conditions */}
                    <div>
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection('conditions')}
                      >
                        <h3 className="font-semibold flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          Medical Conditions ({selectedPatient.medicalConditions.length})
                        </h3>
                        {expandedSections.conditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                      {expandedSections.conditions && (
                        selectedPatient.medicalConditions.length === 0 ? (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientRecords.noConditionsRecorded', 'No conditions recorded')}</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedPatient.medicalConditions.map(condition => (
                              <div key={condition.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{condition.name}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded ${
                                    condition.status === 'active' ? 'bg-red-500/20 text-red-400' :
                                    condition.status === 'chronic' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {condition.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">Diagnosed: {condition.diagnosedDate}</p>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>

                    {/* Surgeries */}
                    <div>
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection('surgeries')}
                      >
                        <h3 className="font-semibold flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-cyan-500" />
                          Surgeries ({selectedPatient.surgeries.length})
                        </h3>
                        {expandedSections.surgeries ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                      {expandedSections.surgeries && (
                        selectedPatient.surgeries.length === 0 ? (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientRecords.noSurgeriesRecorded', 'No surgeries recorded')}</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedPatient.surgeries.map(surgery => (
                              <div key={surgery.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <p className="font-medium">{surgery.name}</p>
                                <p className="text-sm text-gray-400">{surgery.date} - {surgery.hospital}</p>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>

                    {/* Medications */}
                    <div>
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection('medications')}
                      >
                        <h3 className="font-semibold flex items-center gap-2">
                          <Pill className="w-4 h-4 text-green-500" />
                          Medications ({selectedPatient.medications.length})
                        </h3>
                        {expandedSections.medications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                      {expandedSections.medications && (
                        selectedPatient.medications.length === 0 ? (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientRecords.noMedicationsRecorded', 'No medications recorded')}</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedPatient.medications.map(med => (
                              <div key={med.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{med.name}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded ${
                                    med.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {med.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400">{med.dosage} - {med.frequency}</p>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-500" />
                        {t('tools.patientRecords.appointmentHistory', 'Appointment History')}
                      </h3>
                      <button onClick={() => setShowAppointmentModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" />
                        {t('tools.patientRecords.addAppointment2', 'Add Appointment')}
                      </button>
                    </div>
                    {selectedPatient.appointments.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.patientRecords.noAppointmentsRecorded', 'No appointments recorded')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedPatient.appointments].reverse().map(apt => (
                          <div key={apt.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{apt.type}</p>
                                <p className="text-sm text-gray-400">Dr. {apt.doctor} - {apt.department}</p>
                                <p className="text-sm text-gray-400">{apt.date} at {apt.time}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                apt.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                apt.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                                apt.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                            {apt.notes && <p className="text-sm mt-2">{apt.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Vitals Tab */}
                {activeTab === 'vitals' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        {t('tools.patientRecords.vitalRecords', 'Vital Records')}
                      </h3>
                      <button onClick={() => setShowVitalModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" />
                        {t('tools.patientRecords.addVitals', 'Add Vitals')}
                      </button>
                    </div>
                    {selectedPatient.vitals.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.patientRecords.noVitalRecords', 'No vital records')}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              <th className="text-left py-2">{t('tools.patientRecords.date', 'Date')}</th>
                              <th className="text-left py-2">BP</th>
                              <th className="text-left py-2">HR</th>
                              <th className="text-left py-2">{t('tools.patientRecords.temp', 'Temp')}</th>
                              <th className="text-left py-2">{t('tools.patientRecords.weight', 'Weight')}</th>
                              <th className="text-left py-2">{t('tools.patientRecords.notes', 'Notes')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...selectedPatient.vitals].reverse().map(vital => (
                              <tr key={vital.id} className="border-t border-gray-700">
                                <td className="py-3">{vital.date}</td>
                                <td className="py-3">{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</td>
                                <td className="py-3">{vital.heartRate} bpm</td>
                                <td className="py-3">{vital.temperature}F</td>
                                <td className="py-3">{vital.weight} lbs</td>
                                <td className="py-3 text-gray-400">{vital.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-500" />
                        {t('tools.patientRecords.patientNotes', 'Patient Notes')}
                      </h3>
                      <button onClick={() => setShowNoteModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" />
                        {t('tools.patientRecords.addNote2', 'Add Note')}
                      </button>
                    </div>
                    {selectedPatient.notes.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('tools.patientRecords.noNotesRecorded', 'No notes recorded')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedPatient.notes].reverse().map(note => (
                          <div key={note.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  note.category === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                  note.category === 'clinical' ? 'bg-blue-500/20 text-blue-400' :
                                  note.category === 'follow-up' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {note.category}
                                </span>
                                <span className="text-sm text-gray-400">{note.date}</span>
                              </div>
                              <span className="text-sm text-gray-400">{note.author}</span>
                            </div>
                            <p className="text-sm">{note.content}</p>
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
              <User className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.patientRecords.selectAPatient', 'Select a patient')}</p>
              <p className="text-sm">{t('tools.patientRecords.chooseAPatientFromThe', 'Choose a patient from the list to view their records')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingPatient ? t('tools.patientRecords.editPatient', 'Edit Patient') : t('tools.patientRecords.addNewPatient', 'Add New Patient')}</h2>
              <button onClick={() => { setShowPatientModal(false); setEditingPatient(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <PatientForm
              patient={editingPatient || createNewPatient()}
              onSave={savePatient}
              onCancel={() => { setShowPatientModal(false); setEditingPatient(null); }}
              theme={theme}
              inputClass={inputClass}
              labelClass={labelClass}
              buttonPrimary={buttonPrimary}
              buttonSecondary={buttonSecondary}
            />
          </div>
        </div>
      )}

      {/* Add Vital Modal */}
      {showVitalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('tools.patientRecords.addVitalRecord', 'Add Vital Record')}</h2>
              <button onClick={() => setShowVitalModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.patientRecords.date2', 'Date')}</label>
                <input
                  type="date"
                  value={newVital.date}
                  onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.systolicBp', 'Systolic BP')}</label>
                  <input
                    type="number"
                    value={newVital.bloodPressureSystolic}
                    onChange={(e) => setNewVital({ ...newVital, bloodPressureSystolic: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.diastolicBp', 'Diastolic BP')}</label>
                  <input
                    type="number"
                    value={newVital.bloodPressureDiastolic}
                    onChange={(e) => setNewVital({ ...newVital, bloodPressureDiastolic: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.heartRate2', 'Heart Rate')}</label>
                  <input
                    type="number"
                    value={newVital.heartRate}
                    onChange={(e) => setNewVital({ ...newVital, heartRate: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.temperatureF', 'Temperature (F)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVital.temperature}
                    onChange={(e) => setNewVital({ ...newVital, temperature: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.weightLbs2', 'Weight (lbs)')}</label>
                  <input
                    type="number"
                    value={newVital.weight}
                    onChange={(e) => setNewVital({ ...newVital, weight: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientRecords.notes2', 'Notes')}</label>
                <textarea
                  value={newVital.notes}
                  onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowVitalModal(false)} className={buttonSecondary}>{t('tools.patientRecords.cancel', 'Cancel')}</button>
                <button onClick={addVitalRecord} className={buttonPrimary}>
                  <Save className="w-4 h-4" />
                  {t('tools.patientRecords.saveVitals', 'Save Vitals')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('tools.patientRecords.addNote', 'Add Note')}</h2>
              <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.date3', 'Date')}</label>
                  <input
                    type="date"
                    value={newNote.date}
                    onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.category', 'Category')}</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="general">{t('tools.patientRecords.general', 'General')}</option>
                    <option value="clinical">{t('tools.patientRecords.clinical', 'Clinical')}</option>
                    <option value="follow-up">{t('tools.patientRecords.followUp', 'Follow-up')}</option>
                    <option value="urgent">{t('tools.patientRecords.urgent', 'Urgent')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientRecords.author', 'Author')}</label>
                <input
                  type="text"
                  value={newNote.author}
                  onChange={(e) => setNewNote({ ...newNote, author: e.target.value })}
                  placeholder={t('tools.patientRecords.yourName', 'Your name')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientRecords.noteContent', 'Note Content')}</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={5}
                  placeholder={t('tools.patientRecords.enterYourNote', 'Enter your note...')}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowNoteModal(false)} className={buttonSecondary}>{t('tools.patientRecords.cancel2', 'Cancel')}</button>
                <button onClick={addNote} disabled={!newNote.content || !newNote.author} className={buttonPrimary}>
                  <Save className="w-4 h-4" />
                  {t('tools.patientRecords.saveNote', 'Save Note')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('tools.patientRecords.addAppointment', 'Add Appointment')}</h2>
              <button onClick={() => setShowAppointmentModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.date4', 'Date *')}</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => { setNewAppointment({ ...newAppointment, date: e.target.value }); setAppointmentErrors(prev => ({ ...prev, date: '' })); }}
                    className={`${inputClass} ${appointmentErrors.date ? 'border-red-500' : ''}`}
                  />
                  {appointmentErrors.date && <p className="text-red-500 text-xs mt-1">{appointmentErrors.date}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.time', 'Time')}</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientRecords.appointmentType', 'Appointment Type *')}</label>
                <input
                  type="text"
                  value={newAppointment.type}
                  onChange={(e) => { setNewAppointment({ ...newAppointment, type: e.target.value }); setAppointmentErrors(prev => ({ ...prev, type: '' })); }}
                  placeholder={t('tools.patientRecords.eGCheckUpFollow', 'e.g., Check-up, Follow-up, Consultation')}
                  className={`${inputClass} ${appointmentErrors.type ? 'border-red-500' : ''}`}
                />
                {appointmentErrors.type && <p className="text-red-500 text-xs mt-1">{appointmentErrors.type}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.doctor', 'Doctor')}</label>
                  <input
                    type="text"
                    value={newAppointment.doctor}
                    onChange={(e) => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                    placeholder={t('tools.patientRecords.doctorName', 'Doctor name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientRecords.department', 'Department')}</label>
                  <input
                    type="text"
                    value={newAppointment.department}
                    onChange={(e) => setNewAppointment({ ...newAppointment, department: e.target.value })}
                    placeholder={t('tools.patientRecords.eGCardiology', 'e.g., Cardiology')}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientRecords.status', 'Status')}</label>
                <select
                  value={newAppointment.status}
                  onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="scheduled">{t('tools.patientRecords.scheduled', 'Scheduled')}</option>
                  <option value="completed">{t('tools.patientRecords.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.patientRecords.cancelled', 'Cancelled')}</option>
                  <option value="no-show">{t('tools.patientRecords.noShow', 'No Show')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientRecords.notes3', 'Notes')}</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowAppointmentModal(false); setAppointmentErrors({}); }} className={buttonSecondary}>{t('tools.patientRecords.cancel3', 'Cancel')}</button>
                <button onClick={addAppointment} className={buttonPrimary}>
                  <Save className="w-4 h-4" />
                  {t('tools.patientRecords.saveAppointment', 'Save Appointment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.patientRecords.aboutPatientRecordsTool', 'About Patient Records Tool')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive healthcare patient management system. Track patient demographics, medical history,
          appointments, vital signs, and clinical notes. All data is securely stored and automatically synced.
          Use filters and search to quickly find patient records.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

// Patient Form Component
interface PatientFormProps {
  patient: Patient;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
  theme: string;
  inputClass: string;
  labelClass: string;
  buttonPrimary: string;
  buttonSecondary: string;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSave,
  onCancel,
  theme,
  inputClass,
  labelClass,
  buttonPrimary,
  buttonSecondary,
}) => {
  const [formData, setFormData] = useState<Patient>(patient);
  const [newAllergy, setNewAllergy] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-500" />
          {t('tools.patientRecords.basicInformation', 'Basic Information')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('tools.patientRecords.firstName', 'First Name *')}</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.lastName', 'Last Name *')}</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.dateOfBirth', 'Date of Birth *')}</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.gender', 'Gender *')}</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className={inputClass}
            >
              <option value="male">{t('tools.patientRecords.male2', 'Male')}</option>
              <option value="female">{t('tools.patientRecords.female2', 'Female')}</option>
              <option value="other">{t('tools.patientRecords.other2', 'Other')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.email', 'Email')}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.phone2', 'Phone')}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t('tools.patientRecords.address', 'Address')}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.bloodType', 'Blood Type')}</label>
            <select
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as any })}
              className={inputClass}
            >
              <option value="">{t('tools.patientRecords.selectBloodType', 'Select Blood Type')}</option>
              {bloodTypes.map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Allergies */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          {t('tools.patientRecords.allergies2', 'Allergies')}
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            placeholder={t('tools.patientRecords.addAllergy', 'Add allergy')}
            className={inputClass}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
          />
          <button type="button" onClick={addAllergy} className={buttonSecondary}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.allergies.map((allergy, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-2"
            >
              {allergy}
              <button type="button" onClick={() => removeAllergy(index)} className="hover:text-red-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-cyan-500" />
          {t('tools.patientRecords.emergencyContact2', 'Emergency Contact')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t('tools.patientRecords.name2', 'Name')}</label>
            <input
              type="text"
              value={formData.emergencyContact.name}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, name: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.relationship2', 'Relationship')}</label>
            <input
              type="text"
              value={formData.emergencyContact.relationship}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.phone3', 'Phone')}</label>
            <input
              type="tel"
              value={formData.emergencyContact.phone}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
              })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Insurance */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-500" />
          {t('tools.patientRecords.insuranceInformation2', 'Insurance Information')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('tools.patientRecords.provider2', 'Provider')}</label>
            <input
              type="text"
              value={formData.insurance.provider}
              onChange={(e) => setFormData({
                ...formData,
                insurance: { ...formData.insurance, provider: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.policyNumber', 'Policy Number')}</label>
            <input
              type="text"
              value={formData.insurance.policyNumber}
              onChange={(e) => setFormData({
                ...formData,
                insurance: { ...formData.insurance, policyNumber: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.groupNumber', 'Group Number')}</label>
            <input
              type="text"
              value={formData.insurance.groupNumber}
              onChange={(e) => setFormData({
                ...formData,
                insurance: { ...formData.insurance, groupNumber: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.patientRecords.expiryDate', 'Expiry Date')}</label>
            <input
              type="date"
              value={formData.insurance.expiryDate}
              onChange={(e) => setFormData({
                ...formData,
                insurance: { ...formData.insurance, expiryDate: e.target.value }
              })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          {t('tools.patientRecords.cancel4', 'Cancel')}
        </button>
        <button type="submit" className={buttonPrimary}>
          <Save className="w-4 h-4" />
          {t('tools.patientRecords.savePatient', 'Save Patient')}
        </button>
      </div>
    </form>
  );
};

export default PatientRecordsTool;
