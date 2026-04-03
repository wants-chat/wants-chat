'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Pill,
  Clock,
  Home,
  Building,
  Heart,
  FileText,
  Truck,
  Shield,
  CheckCircle,
  ClipboardList,
  Stethoscope,
  Activity,
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
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  prescribedBy: string;
  isNewMedication: boolean;
  isContinued: boolean;
  isDiscontinued: boolean;
}

interface FollowUpAppointment {
  id: string;
  provider: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  phone: string;
  reason: string;
  isScheduled: boolean;
}

interface DischargeRecord {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  admitDate: string;
  dischargeDate: string;
  dischargingPhysician: string;
  attendingPhysician: string;
  diagnosis: string;
  secondaryDiagnoses: string[];
  dischargeDisposition: 'home' | 'skilled-nursing' | 'rehab' | 'acute-care' | 'hospice' | 'deceased' | 'home-health' | 'ama';
  medicationReconciliation: Medication[];
  followUpAppointments: FollowUpAppointment[];
  dischargeInstructions: string;
  dietaryRestrictions: string;
  activityRestrictions: string;
  woundCareInstructions: string;
  specialEquipment: string[];
  homeHealthReferral: boolean;
  homeHealthAgency: string;
  transportArranged: boolean;
  transportType: string;
  insuranceApproved: boolean;
  insuranceAuthNumber: string;
  patientEducationCompleted: boolean;
  caregiverEducationCompleted: boolean;
  emergencyContactNotified: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  delayReason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientDischargeToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'patient-discharge';

const dischargeColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'patientId', header: 'Patient ID', type: 'string' },
  { key: 'diagnosis', header: 'Diagnosis', type: 'string' },
  { key: 'admitDate', header: 'Admit Date', type: 'date' },
  { key: 'dischargeDate', header: 'Discharge Date', type: 'date' },
  { key: 'dischargeDisposition', header: 'Disposition', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'dischargingPhysician', header: 'Discharging Physician', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewDischargeRecord = (): DischargeRecord => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dateOfBirth: '',
  admitDate: '',
  dischargeDate: new Date().toISOString().split('T')[0],
  dischargingPhysician: '',
  attendingPhysician: '',
  diagnosis: '',
  secondaryDiagnoses: [],
  dischargeDisposition: 'home',
  medicationReconciliation: [],
  followUpAppointments: [],
  dischargeInstructions: '',
  dietaryRestrictions: '',
  activityRestrictions: '',
  woundCareInstructions: '',
  specialEquipment: [],
  homeHealthReferral: false,
  homeHealthAgency: '',
  transportArranged: false,
  transportType: '',
  insuranceApproved: false,
  insuranceAuthNumber: '',
  patientEducationCompleted: false,
  caregiverEducationCompleted: false,
  emergencyContactNotified: false,
  emergencyContactName: '',
  emergencyContactPhone: '',
  status: 'pending',
  delayReason: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewMedication = (): Medication => ({
  id: crypto.randomUUID(),
  name: '',
  dosage: '',
  frequency: '',
  route: 'oral',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  instructions: '',
  prescribedBy: '',
  isNewMedication: true,
  isContinued: false,
  isDiscontinued: false,
});

const createNewFollowUp = (): FollowUpAppointment => ({
  id: crypto.randomUUID(),
  provider: '',
  specialty: '',
  date: '',
  time: '',
  location: '',
  phone: '',
  reason: '',
  isScheduled: false,
});

const dispositionTypes = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'skilled-nursing', label: 'Skilled Nursing Facility', icon: Building },
  { value: 'rehab', label: 'Rehabilitation Facility', icon: Activity },
  { value: 'acute-care', label: 'Acute Care Transfer', icon: Stethoscope },
  { value: 'hospice', label: 'Hospice', icon: Heart },
  { value: 'home-health', label: 'Home with Home Health', icon: UserCheck },
  { value: 'ama', label: 'Against Medical Advice', icon: AlertCircle },
  { value: 'deceased', label: 'Deceased', icon: X },
];

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'delayed', label: 'Delayed', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const specialEquipmentOptions = [
  'Oxygen', 'Walker', 'Wheelchair', 'Hospital Bed', 'Commode', 'Shower Chair',
  'CPAP/BiPAP', 'Nebulizer', 'IV Pole', 'Wound VAC', 'Feeding Tube Supplies',
  'Ostomy Supplies', 'Glucose Monitor', 'Blood Pressure Monitor', 'Suction Equipment',
];

const medicationRoutes = ['oral', 'IV', 'IM', 'subcutaneous', 'topical', 'inhaled', 'rectal', 'sublingual', 'transdermal'];
const medicationFrequencies = ['once daily', 'twice daily', 'three times daily', 'four times daily', 'every 4 hours', 'every 6 hours', 'every 8 hours', 'every 12 hours', 'as needed', 'at bedtime', 'with meals'];

export const PatientDischargeTool: React.FC<PatientDischargeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: dischargeRecords,
    addItem: addDischargeRecord,
    updateItem: updateDischargeRecord,
    deleteItem: deleteDischargeRecord,
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
  } = useToolData<DischargeRecord>(TOOL_ID, [], dischargeColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDisposition, setFilterDisposition] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DischargeRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<DischargeRecord | null>(null);
  const [formData, setFormData] = useState<DischargeRecord>(createNewDischargeRecord());
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'followups' | 'instructions'>('overview');

  const [newMedication, setNewMedication] = useState<Medication>(createNewMedication());
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [newFollowUp, setNewFollowUp] = useState<FollowUpAppointment>(createNewFollowUp());
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpAppointment | null>(null);
  const [newEquipment, setNewEquipment] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');

  // Statistics
  const stats = useMemo(() => {
    const pending = dischargeRecords.filter(r => r.status === 'pending');
    const inProgress = dischargeRecords.filter(r => r.status === 'in-progress');
    const completed = dischargeRecords.filter(r => r.status === 'completed');
    const delayed = dischargeRecords.filter(r => r.status === 'delayed');
    const homeDischarges = dischargeRecords.filter(r => r.dischargeDisposition === 'home' || r.dischargeDisposition === 'home-health');

    return {
      total: dischargeRecords.length,
      pending: pending.length,
      inProgress: inProgress.length,
      completed: completed.length,
      delayed: delayed.length,
      homeDischarges: homeDischarges.length,
    };
  }, [dischargeRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return dischargeRecords.filter(record => {
      const matchesSearch = searchQuery === '' ||
        record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || record.status === filterStatus;
      const matchesDisposition = filterDisposition === '' || record.dischargeDisposition === filterDisposition;
      return matchesSearch && matchesStatus && matchesDisposition;
    });
  }, [dischargeRecords, searchQuery, filterStatus, filterDisposition]);

  const handleSave = () => {
    if (editingRecord) {
      updateDischargeRecord(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addDischargeRecord({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingRecord(null);
    setFormData(createNewDischargeRecord());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Discharge Record',
      message: 'Are you sure you want to delete this discharge record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteDischargeRecord(id);
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };

  const openEditModal = (record: DischargeRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowModal(true);
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.specialEquipment.includes(newEquipment.trim())) {
      setFormData({ ...formData, specialEquipment: [...formData.specialEquipment, newEquipment.trim()] });
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData({ ...formData, specialEquipment: formData.specialEquipment.filter(e => e !== equipment) });
  };

  const addSecondaryDiagnosis = () => {
    if (newDiagnosis.trim() && !formData.secondaryDiagnoses.includes(newDiagnosis.trim())) {
      setFormData({ ...formData, secondaryDiagnoses: [...formData.secondaryDiagnoses, newDiagnosis.trim()] });
      setNewDiagnosis('');
    }
  };

  const removeSecondaryDiagnosis = (diagnosis: string) => {
    setFormData({ ...formData, secondaryDiagnoses: formData.secondaryDiagnoses.filter(d => d !== diagnosis) });
  };

  const saveMedication = () => {
    if (selectedRecord) {
      const medications = editingMedication
        ? selectedRecord.medicationReconciliation.map(m => m.id === editingMedication.id ? newMedication : m)
        : [...selectedRecord.medicationReconciliation, { ...newMedication, id: crypto.randomUUID() }];

      const updated = { ...selectedRecord, medicationReconciliation: medications, updatedAt: new Date().toISOString() };
      updateDischargeRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
      setShowMedicationModal(false);
      setNewMedication(createNewMedication());
      setEditingMedication(null);
    }
  };

  const deleteMedication = async (medicationId: string) => {
    if (!selectedRecord) return;
    const confirmed = await confirm({
      title: 'Delete Medication',
      message: 'Delete this medication?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const medications = selectedRecord.medicationReconciliation.filter(m => m.id !== medicationId);
      const updated = { ...selectedRecord, medicationReconciliation: medications, updatedAt: new Date().toISOString() };
      updateDischargeRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
    }
  };

  const saveFollowUp = () => {
    if (selectedRecord) {
      const followUps = editingFollowUp
        ? selectedRecord.followUpAppointments.map(f => f.id === editingFollowUp.id ? newFollowUp : f)
        : [...selectedRecord.followUpAppointments, { ...newFollowUp, id: crypto.randomUUID() }];

      const updated = { ...selectedRecord, followUpAppointments: followUps, updatedAt: new Date().toISOString() };
      updateDischargeRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
      setShowFollowUpModal(false);
      setNewFollowUp(createNewFollowUp());
      setEditingFollowUp(null);
    }
  };

  const deleteFollowUp = async (followUpId: string) => {
    if (!selectedRecord) return;
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: 'Delete this follow-up appointment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const followUps = selectedRecord.followUpAppointments.filter(f => f.id !== followUpId);
      const updated = { ...selectedRecord, followUpAppointments: followUps, updatedAt: new Date().toISOString() };
      updateDischargeRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
    }
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getDispositionIcon = (disposition: string) => {
    const typeConfig = dispositionTypes.find(t => t.value === disposition);
    return typeConfig?.icon || Home;
  };

  const getDispositionLabel = (disposition: string) => {
    return dispositionTypes.find(t => t.value === disposition)?.label || disposition;
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

  const tabClass = (active: boolean) => `px-4 py-2 font-medium rounded-lg transition-colors ${
    active
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      : theme === 'dark'
        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl">
            <UserCheck className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.patientDischarge.patientDischarge', 'Patient Discharge')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.patientDischarge.manageDischargePlanningAndDocumentation', 'Manage discharge planning and documentation')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="patient-discharge" toolName="Patient Discharge" />

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
            onExportCSV={() => exportCSV({ filename: 'patient-discharge' })}
            onExportExcel={() => exportExcel({ filename: 'patient-discharge' })}
            onExportJSON={() => exportJSON({ filename: 'patient-discharge' })}
            onExportPDF={() => exportPDF({ filename: 'patient-discharge', title: 'Discharge Records' })}
            onPrint={() => print('Discharge Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={dischargeRecords.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewDischargeRecord()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.patientDischarge.newDischarge', 'New Discharge')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.total', 'Total')}</p>
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.inProgress', 'In Progress')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.completed', 'Completed')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.delayed', 'Delayed')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.delayed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-lg">
              <Home className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.homeDC', 'Home D/C')}</p>
              <p className="text-2xl font-bold text-teal-500">{stats.homeDischarges}</p>
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
              placeholder={t('tools.patientDischarge.searchPatientNameIdOr', 'Search patient name, ID, or diagnosis...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.patientDischarge.allStatus', 'All Status')}</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterDisposition} onChange={(e) => setFilterDisposition(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.patientDischarge.allDispositions', 'All Dispositions')}</option>
            {dispositionTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discharge Records List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.patientDischarge.dischargeRecords', 'Discharge Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.patientDischarge.noDischargeRecordsFound', 'No discharge records found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredRecords.map(record => {
                  const DispositionIcon = getDispositionIcon(record.dischargeDisposition);
                  return (
                    <div
                      key={record.id}
                      onClick={() => { setSelectedRecord(record); setActiveTab('overview'); }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedRecord?.id === record.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <DispositionIcon className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium">{record.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ID: {record.patientId}
                            </p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              D/C: {record.dischargeDate || 'Not set'}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(record.status)}`}>
                              {statusOptions.find(s => s.value === record.status)?.label}
                            </span>
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
                        {statusOptions.find(s => s.value === selectedRecord.status)?.label}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Patient ID: {selectedRecord.patientId} | DOB: {selectedRecord.dateOfBirth || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(selectedRecord)} className={buttonSecondary}>
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button onClick={() => setActiveTab('overview')} className={tabClass(activeTab === 'overview')}>
                    {t('tools.patientDischarge.overview', 'Overview')}
                  </button>
                  <button onClick={() => setActiveTab('medications')} className={tabClass(activeTab === 'medications')}>
                    Medications ({selectedRecord.medicationReconciliation.length})
                  </button>
                  <button onClick={() => setActiveTab('followups')} className={tabClass(activeTab === 'followups')}>
                    Follow-ups ({selectedRecord.followUpAppointments.length})
                  </button>
                  <button onClick={() => setActiveTab('instructions')} className={tabClass(activeTab === 'instructions')}>
                    {t('tools.patientDischarge.instructions2', 'Instructions')}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.patientDischarge.admitDate', 'Admit Date')}</p>
                        <p className="font-medium">{selectedRecord.admitDate || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.patientDischarge.dischargeDate', 'Discharge Date')}</p>
                        <p className="font-medium">{selectedRecord.dischargeDate || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.patientDischarge.disposition', 'Disposition')}</p>
                        <p className="font-medium">{getDispositionLabel(selectedRecord.dischargeDisposition)}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.patientDischarge.dischargingPhysician', 'Discharging Physician')}</p>
                        <p className="font-medium">{selectedRecord.dischargingPhysician || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-cyan-500" />
                        {t('tools.patientDischarge.primaryDiagnosis2', 'Primary Diagnosis')}
                      </h3>
                      <p>{selectedRecord.diagnosis || 'Not specified'}</p>
                      {selectedRecord.secondaryDiagnoses.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">{t('tools.patientDischarge.secondaryDiagnoses', 'Secondary Diagnoses:')}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedRecord.secondaryDiagnoses.map((d, i) => (
                              <span key={i} className={`px-2 py-1 text-sm rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-3">{t('tools.patientDischarge.dischargeChecklist', 'Discharge Checklist')}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${selectedRecord.patientEducationCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={selectedRecord.patientEducationCompleted ? '' : 'text-gray-400'}>{t('tools.patientDischarge.patientEducation', 'Patient Education')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${selectedRecord.caregiverEducationCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={selectedRecord.caregiverEducationCompleted ? '' : 'text-gray-400'}>{t('tools.patientDischarge.caregiverEducation', 'Caregiver Education')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${selectedRecord.emergencyContactNotified ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={selectedRecord.emergencyContactNotified ? '' : 'text-gray-400'}>{t('tools.patientDischarge.emergencyContactNotified', 'Emergency Contact Notified')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${selectedRecord.insuranceApproved ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={selectedRecord.insuranceApproved ? '' : 'text-gray-400'}>{t('tools.patientDischarge.insuranceApproved', 'Insurance Approved')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${selectedRecord.transportArranged ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={selectedRecord.transportArranged ? '' : 'text-gray-400'}>{t('tools.patientDischarge.transportArranged', 'Transport Arranged')}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-3">{t('tools.patientDischarge.servicesReferrals', 'Services & Referrals')}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Heart className={`w-4 h-4 ${selectedRecord.homeHealthReferral ? 'text-cyan-500' : 'text-gray-400'}`} />
                            <span>Home Health: {selectedRecord.homeHealthReferral ? selectedRecord.homeHealthAgency || 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className={`w-4 h-4 ${selectedRecord.transportArranged ? 'text-cyan-500' : 'text-gray-400'}`} />
                            <span>Transport: {selectedRecord.transportArranged ? selectedRecord.transportType || 'Arranged' : 'Not arranged'}</span>
                          </div>
                          {selectedRecord.insuranceAuthNumber && (
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-cyan-500" />
                              <span>Auth #: {selectedRecord.insuranceAuthNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Special Equipment */}
                    {selectedRecord.specialEquipment.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('tools.patientDischarge.specialEquipment', 'Special Equipment')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecord.specialEquipment.map((eq, i) => (
                            <span key={i} className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedRecord.notes && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.patientDischarge.notes', 'Notes')}</h3>
                        <p className="text-sm">{selectedRecord.notes}</p>
                      </div>
                    )}

                    {/* Delay Reason */}
                    {selectedRecord.status === 'delayed' && selectedRecord.delayReason && (
                      <div className={`p-4 rounded-lg border border-orange-500/30 ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-400">
                          <AlertCircle className="w-4 h-4" />
                          {t('tools.patientDischarge.delayReason2', 'Delay Reason')}
                        </h3>
                        <p className="text-sm">{selectedRecord.delayReason}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'medications' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Pill className="w-4 h-4 text-cyan-500" />
                        {t('tools.patientDischarge.medicationReconciliation', 'Medication Reconciliation')}
                      </h3>
                      <button
                        onClick={() => { setNewMedication(createNewMedication()); setEditingMedication(null); setShowMedicationModal(true); }}
                        className={buttonPrimary}
                      >
                        <Plus className="w-4 h-4" /> Add Medication
                      </button>
                    </div>

                    {selectedRecord.medicationReconciliation.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.noMedicationsRecorded', 'No medications recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedRecord.medicationReconciliation.map(med => (
                          <div key={med.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{med.name}</p>
                                  {med.isNewMedication && (
                                    <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">{t('tools.patientDischarge.new', 'New')}</span>
                                  )}
                                  {med.isContinued && (
                                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">{t('tools.patientDischarge.continued', 'Continued')}</span>
                                  )}
                                  {med.isDiscontinued && (
                                    <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">{t('tools.patientDischarge.discontinued', 'Discontinued')}</span>
                                  )}
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {med.dosage} - {med.frequency} - {med.route}
                                </p>
                                {med.instructions && (
                                  <p className="text-sm mt-1">{med.instructions}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => { setNewMedication(med); setEditingMedication(med); setShowMedicationModal(true); }}
                                  className="p-1.5 hover:bg-gray-600 rounded"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-400" />
                                </button>
                                <button onClick={() => deleteMedication(med.id)} className="p-1.5 hover:bg-red-500/20 rounded">
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

                {activeTab === 'followups' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-500" />
                        {t('tools.patientDischarge.followUpAppointments', 'Follow-up Appointments')}
                      </h3>
                      <button
                        onClick={() => { setNewFollowUp(createNewFollowUp()); setEditingFollowUp(null); setShowFollowUpModal(true); }}
                        className={buttonPrimary}
                      >
                        <Plus className="w-4 h-4" /> Add Appointment
                      </button>
                    </div>

                    {selectedRecord.followUpAppointments.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.noFollowUpAppointmentsScheduled', 'No follow-up appointments scheduled')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedRecord.followUpAppointments.map(appt => (
                          <div key={appt.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{appt.provider}</p>
                                  <span className={`px-2 py-0.5 text-xs rounded ${appt.isScheduled ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {appt.isScheduled ? t('tools.patientDischarge.scheduled', 'Scheduled') : t('tools.patientDischarge.pending2', 'Pending')}
                                  </span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {appt.specialty} | {appt.date} {appt.time && `at ${appt.time}`}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {appt.location} {appt.phone && `| ${appt.phone}`}
                                </p>
                                {appt.reason && <p className="text-sm mt-1">{appt.reason}</p>}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => { setNewFollowUp(appt); setEditingFollowUp(appt); setShowFollowUpModal(true); }}
                                  className="p-1.5 hover:bg-gray-600 rounded"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-400" />
                                </button>
                                <button onClick={() => deleteFollowUp(appt.id)} className="p-1.5 hover:bg-red-500/20 rounded">
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

                {activeTab === 'instructions' && (
                  <div className="space-y-6">
                    {selectedRecord.dischargeInstructions && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-500" />
                          {t('tools.patientDischarge.dischargeInstructions2', 'Discharge Instructions')}
                        </h3>
                        <p className="text-sm whitespace-pre-wrap">{selectedRecord.dischargeInstructions}</p>
                      </div>
                    )}

                    {selectedRecord.dietaryRestrictions && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.patientDischarge.dietaryRestrictions', 'Dietary Restrictions')}</h3>
                        <p className="text-sm">{selectedRecord.dietaryRestrictions}</p>
                      </div>
                    )}

                    {selectedRecord.activityRestrictions && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.patientDischarge.activityRestrictions', 'Activity Restrictions')}</h3>
                        <p className="text-sm">{selectedRecord.activityRestrictions}</p>
                      </div>
                    )}

                    {selectedRecord.woundCareInstructions && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.patientDischarge.woundCareInstructions', 'Wound Care Instructions')}</h3>
                        <p className="text-sm">{selectedRecord.woundCareInstructions}</p>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {selectedRecord.emergencyContactName && (
                      <div className={`p-4 rounded-lg border border-cyan-500/30 ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.patientDischarge.emergencyContact', 'Emergency Contact')}</h3>
                        <p className="text-sm">{selectedRecord.emergencyContactName} - {selectedRecord.emergencyContactPhone}</p>
                      </div>
                    )}

                    {!selectedRecord.dischargeInstructions && !selectedRecord.dietaryRestrictions && !selectedRecord.activityRestrictions && !selectedRecord.woundCareInstructions && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientDischarge.noInstructionsRecorded', 'No instructions recorded')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <UserCheck className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.patientDischarge.selectADischargeRecord', 'Select a discharge record')}</p>
              <p className="text-sm">{t('tools.patientDischarge.chooseARecordToView', 'Choose a record to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Discharge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingRecord ? t('tools.patientDischarge.editDischargeRecord', 'Edit Discharge Record') : t('tools.patientDischarge.newDischargeRecord', 'New Discharge Record')}</h2>
              <button onClick={() => { setShowModal(false); setEditingRecord(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.patientInformation', 'Patient Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.patientName', 'Patient Name *')}</label>
                    <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.patientId', 'Patient ID *')}</label>
                    <input type="text" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.dateOfBirth', 'Date of Birth')}</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Admission & Discharge */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.admissionDischarge', 'Admission & Discharge')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.admitDate2', 'Admit Date *')}</label>
                    <input type="date" value={formData.admitDate} onChange={(e) => setFormData({ ...formData, admitDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.dischargeDate2', 'Discharge Date')}</label>
                    <input type="date" value={formData.dischargeDate} onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.disposition2', 'Disposition *')}</label>
                    <select value={formData.dischargeDisposition} onChange={(e) => setFormData({ ...formData, dischargeDisposition: e.target.value as any })} className={inputClass}>
                      {dispositionTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.status', 'Status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                      {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Physicians */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.physicians', 'Physicians')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.dischargingPhysician2', 'Discharging Physician *')}</label>
                    <input type="text" value={formData.dischargingPhysician} onChange={(e) => setFormData({ ...formData, dischargingPhysician: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.attendingPhysician', 'Attending Physician')}</label>
                    <input type="text" value={formData.attendingPhysician} onChange={(e) => setFormData({ ...formData, attendingPhysician: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.diagnosis', 'Diagnosis')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.primaryDiagnosis', 'Primary Diagnosis *')}</label>
                    <input type="text" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} className={inputClass} placeholder={t('tools.patientDischarge.primaryDiagnosis3', 'Primary diagnosis')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.secondaryDiagnoses2', 'Secondary Diagnoses')}</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newDiagnosis} onChange={(e) => setNewDiagnosis(e.target.value)} placeholder={t('tools.patientDischarge.addDiagnosis', 'Add diagnosis')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryDiagnosis())} />
                      <button type="button" onClick={addSecondaryDiagnosis} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.secondaryDiagnoses.map((d, i) => (
                        <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                          {d} <button onClick={() => removeSecondaryDiagnosis(d)}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.instructionsRestrictions', 'Instructions & Restrictions')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.dischargeInstructions', 'Discharge Instructions')}</label>
                    <textarea value={formData.dischargeInstructions} onChange={(e) => setFormData({ ...formData, dischargeInstructions: e.target.value })} className={inputClass} rows={3} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.patientDischarge.dietaryRestrictions2', 'Dietary Restrictions')}</label>
                      <textarea value={formData.dietaryRestrictions} onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })} className={inputClass} rows={2} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientDischarge.activityRestrictions2', 'Activity Restrictions')}</label>
                      <textarea value={formData.activityRestrictions} onChange={(e) => setFormData({ ...formData, activityRestrictions: e.target.value })} className={inputClass} rows={2} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.woundCareInstructions2', 'Wound Care Instructions')}</label>
                    <textarea value={formData.woundCareInstructions} onChange={(e) => setFormData({ ...formData, woundCareInstructions: e.target.value })} className={inputClass} rows={2} />
                  </div>
                </div>
              </div>

              {/* Special Equipment */}
              <div>
                <label className={labelClass}>{t('tools.patientDischarge.specialEquipment2', 'Special Equipment')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newEquipment} onChange={(e) => setNewEquipment(e.target.value)} placeholder={t('tools.patientDischarge.addEquipment', 'Add equipment')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())} />
                  <button type="button" onClick={addEquipment} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {specialEquipmentOptions.filter(e => !formData.specialEquipment.includes(e)).slice(0, 8).map(e => (
                    <button key={e} type="button" onClick={() => setFormData({ ...formData, specialEquipment: [...formData.specialEquipment, e] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {e}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialEquipment.map((e, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {e} <button onClick={() => removeEquipment(e)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Services & Referrals */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.servicesReferrals2', 'Services & Referrals')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="homeHealthReferral" checked={formData.homeHealthReferral} onChange={(e) => setFormData({ ...formData, homeHealthReferral: e.target.checked })} className="w-4 h-4" />
                      <label htmlFor="homeHealthReferral" className={labelClass}>{t('tools.patientDischarge.homeHealthReferral', 'Home Health Referral')}</label>
                    </div>
                    {formData.homeHealthReferral && (
                      <input type="text" value={formData.homeHealthAgency} onChange={(e) => setFormData({ ...formData, homeHealthAgency: e.target.value })} placeholder={t('tools.patientDischarge.homeHealthAgency', 'Home Health Agency')} className={inputClass} />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="transportArranged" checked={formData.transportArranged} onChange={(e) => setFormData({ ...formData, transportArranged: e.target.checked })} className="w-4 h-4" />
                      <label htmlFor="transportArranged" className={labelClass}>{t('tools.patientDischarge.transportArranged2', 'Transport Arranged')}</label>
                    </div>
                    {formData.transportArranged && (
                      <input type="text" value={formData.transportType} onChange={(e) => setFormData({ ...formData, transportType: e.target.value })} placeholder={t('tools.patientDischarge.transportTypeAmbulanceWheelchairVan', 'Transport Type (ambulance, wheelchair van, etc.)')} className={inputClass} />
                    )}
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.insurance', 'Insurance')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="insuranceApproved" checked={formData.insuranceApproved} onChange={(e) => setFormData({ ...formData, insuranceApproved: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="insuranceApproved" className={labelClass}>{t('tools.patientDischarge.insuranceApproved2', 'Insurance Approved')}</label>
                  </div>
                  {formData.insuranceApproved && (
                    <div>
                      <label className={labelClass}>{t('tools.patientDischarge.authorizationNumber', 'Authorization Number')}</label>
                      <input type="text" value={formData.insuranceAuthNumber} onChange={(e) => setFormData({ ...formData, insuranceAuthNumber: e.target.value })} className={inputClass} />
                    </div>
                  )}
                </div>
              </div>

              {/* Education & Notification */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.educationNotification', 'Education & Notification')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="patientEducationCompleted" checked={formData.patientEducationCompleted} onChange={(e) => setFormData({ ...formData, patientEducationCompleted: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="patientEducationCompleted" className={labelClass}>{t('tools.patientDischarge.patientEducationCompleted', 'Patient Education Completed')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="caregiverEducationCompleted" checked={formData.caregiverEducationCompleted} onChange={(e) => setFormData({ ...formData, caregiverEducationCompleted: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="caregiverEducationCompleted" className={labelClass}>{t('tools.patientDischarge.caregiverEducationCompleted', 'Caregiver Education Completed')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="emergencyContactNotified" checked={formData.emergencyContactNotified} onChange={(e) => setFormData({ ...formData, emergencyContactNotified: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="emergencyContactNotified" className={labelClass}>{t('tools.patientDischarge.emergencyContactNotified2', 'Emergency Contact Notified')}</label>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('tools.patientDischarge.emergencyContact2', 'Emergency Contact')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.name', 'Name')}</label>
                    <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientDischarge.phone', 'Phone')}</label>
                    <input type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Delay Reason (if delayed status) */}
              {formData.status === 'delayed' && (
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.delayReason', 'Delay Reason')}</label>
                  <textarea value={formData.delayReason} onChange={(e) => setFormData({ ...formData, delayReason: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.patientDischarge.explainReasonForDelay', 'Explain reason for delay')} />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.patientDischarge.notes2', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingRecord(null); }} className={buttonSecondary}>{t('tools.patientDischarge.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.patientName || !formData.patientId || !formData.diagnosis} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medication Modal */}
      {showMedicationModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingMedication ? t('tools.patientDischarge.editMedication', 'Edit Medication') : t('tools.patientDischarge.addMedication', 'Add Medication')}</h2>
              <button onClick={() => setShowMedicationModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.patientDischarge.medicationName', 'Medication Name *')}</label>
                <input type="text" value={newMedication.name} onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.dosage', 'Dosage *')}</label>
                  <input type="text" value={newMedication.dosage} onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })} className={inputClass} placeholder={t('tools.patientDischarge.eG500mg', 'e.g., 500mg')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.frequency', 'Frequency *')}</label>
                  <select value={newMedication.frequency} onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.patientDischarge.selectFrequency', 'Select frequency')}</option>
                    {medicationFrequencies.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.route', 'Route')}</label>
                  <select value={newMedication.route} onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value })} className={inputClass}>
                    {medicationRoutes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.prescribedBy', 'Prescribed By')}</label>
                  <input type="text" value={newMedication.prescribedBy} onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.startDate', 'Start Date')}</label>
                  <input type="date" value={newMedication.startDate} onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.endDate', 'End Date')}</label>
                  <input type="date" value={newMedication.endDate} onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientDischarge.instructions', 'Instructions')}</label>
                <textarea value={newMedication.instructions} onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.patientDischarge.specialInstructions', 'Special instructions')} />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isNewMedication" checked={newMedication.isNewMedication} onChange={(e) => setNewMedication({ ...newMedication, isNewMedication: e.target.checked, isContinued: false, isDiscontinued: false })} className="w-4 h-4" />
                  <label htmlFor="isNewMedication" className="text-sm">{t('tools.patientDischarge.new2', 'New')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isContinued" checked={newMedication.isContinued} onChange={(e) => setNewMedication({ ...newMedication, isContinued: e.target.checked, isNewMedication: false, isDiscontinued: false })} className="w-4 h-4" />
                  <label htmlFor="isContinued" className="text-sm">{t('tools.patientDischarge.continued2', 'Continued')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isDiscontinued" checked={newMedication.isDiscontinued} onChange={(e) => setNewMedication({ ...newMedication, isDiscontinued: e.target.checked, isNewMedication: false, isContinued: false })} className="w-4 h-4" />
                  <label htmlFor="isDiscontinued" className="text-sm">{t('tools.patientDischarge.discontinued2', 'Discontinued')}</label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowMedicationModal(false)} className={buttonSecondary}>{t('tools.patientDischarge.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveMedication} disabled={!newMedication.name || !newMedication.dosage} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.patientDischarge.save', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowUpModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingFollowUp ? t('tools.patientDischarge.editAppointment', 'Edit Appointment') : t('tools.patientDischarge.addAppointment', 'Add Appointment')}</h2>
              <button onClick={() => setShowFollowUpModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.provider', 'Provider *')}</label>
                  <input type="text" value={newFollowUp.provider} onChange={(e) => setNewFollowUp({ ...newFollowUp, provider: e.target.value })} className={inputClass} placeholder={t('tools.patientDischarge.drSmith', 'Dr. Smith')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.specialty', 'Specialty')}</label>
                  <input type="text" value={newFollowUp.specialty} onChange={(e) => setNewFollowUp({ ...newFollowUp, specialty: e.target.value })} className={inputClass} placeholder={t('tools.patientDischarge.cardiology', 'Cardiology')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.date', 'Date *')}</label>
                  <input type="date" value={newFollowUp.date} onChange={(e) => setNewFollowUp({ ...newFollowUp, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientDischarge.time', 'Time')}</label>
                  <input type="time" value={newFollowUp.time} onChange={(e) => setNewFollowUp({ ...newFollowUp, time: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientDischarge.location', 'Location')}</label>
                <input type="text" value={newFollowUp.location} onChange={(e) => setNewFollowUp({ ...newFollowUp, location: e.target.value })} className={inputClass} placeholder={t('tools.patientDischarge.clinicNameAddress', 'Clinic name/address')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientDischarge.phone2', 'Phone')}</label>
                <input type="tel" value={newFollowUp.phone} onChange={(e) => setNewFollowUp({ ...newFollowUp, phone: e.target.value })} className={inputClass} placeholder={t('tools.patientDischarge.contactNumber', 'Contact number')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientDischarge.reasonForVisit', 'Reason for Visit')}</label>
                <textarea value={newFollowUp.reason} onChange={(e) => setNewFollowUp({ ...newFollowUp, reason: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isScheduled" checked={newFollowUp.isScheduled} onChange={(e) => setNewFollowUp({ ...newFollowUp, isScheduled: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="isScheduled" className="text-sm">{t('tools.patientDischarge.appointmentScheduled', 'Appointment Scheduled')}</label>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowFollowUpModal(false)} className={buttonSecondary}>{t('tools.patientDischarge.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveFollowUp} disabled={!newFollowUp.provider || !newFollowUp.date} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.patientDischarge.save2', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.patientDischarge.aboutPatientDischargeTool', 'About Patient Discharge Tool')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive patient discharge planning and documentation tool. Track discharge status, medication reconciliation,
          follow-up appointments, discharge instructions, equipment needs, referrals, and insurance approvals. Ensure complete
          discharge planning with built-in checklists for patient education, transport, and care coordination.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default PatientDischargeTool;
