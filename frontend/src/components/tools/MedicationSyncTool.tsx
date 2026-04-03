'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw,
  User,
  Pill,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Phone,
  CalendarCheck,
  CalendarX,
  ArrowRight,
  Target,
  TrendingUp,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  syncDate: number; // Day of month (1-28) for med sync
  enrollmentDate: string;
  status: 'active' | 'pending' | 'inactive';
  notes: string;
}

interface Medication {
  id: string;
  patientId: string;
  rxNumber: string;
  drugName: string;
  strength: string;
  daysSupply: number;
  lastFillDate: string;
  nextDueDate: string;
  syncAdjustment: number; // Days to adjust for sync
  refillsRemaining: number;
  status: 'synced' | 'pending-sync' | 'needs-short-fill' | 'excluded';
}

interface SyncPlan {
  id: string;
  patientId: string;
  patientName: string;
  targetSyncDate: string;
  medications: {
    medicationId: string;
    drugName: string;
    currentDueDate: string;
    adjustedDueDate: string;
    shortFillDays: number;
    action: 'short-fill' | 'regular' | 'exclude';
  }[];
  status: 'draft' | 'approved' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface MedicationSyncToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'medication-sync';

// Column configuration for export
const PATIENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'syncDate', header: 'Sync Date', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'enrollmentDate', header: 'Enrolled', type: 'date' },
];

const MedicationSyncTool: React.FC<MedicationSyncToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: patients,
    setData: setPatients,
    syncStatus,
    lastSynced,
    sync,
  } = useToolData<Patient>(TOOL_ID, [], PATIENT_COLUMNS);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [syncPlans, setSyncPlans] = useState<SyncPlan[]>([]);

  const [activeTab, setActiveTab] = useState<'patients' | 'plan' | 'upcoming' | 'analytics'>('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [patientForm, setPatientForm] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    syncDate: 1,
    status: 'pending',
    notes: '',
  });

  const [medForm, setMedForm] = useState<Partial<Medication>>({
    rxNumber: '',
    drugName: '',
    strength: '',
    daysSupply: 30,
    lastFillDate: '',
    refillsRemaining: 0,
    status: 'pending-sync',
  });

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !searchTerm ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);
      return matchesSearch;
    });
  }, [patients, searchTerm]);

  // Get medications for selected patient
  const patientMedications = useMemo(() => {
    if (!selectedPatient) return [];
    return medications.filter(m => m.patientId === selectedPatient.id);
  }, [medications, selectedPatient]);

  // Stats
  const stats = useMemo(() => {
    const activePatients = patients.filter(p => p.status === 'active').length;
    const pendingEnrollments = patients.filter(p => p.status === 'pending').length;
    const upcomingSyncs = patients.filter(p => {
      const today = new Date().getDate();
      const daysUntilSync = p.syncDate >= today ? p.syncDate - today : 30 - today + p.syncDate;
      return daysUntilSync <= 7 && p.status === 'active';
    }).length;
    const totalMeds = medications.length;

    return { activePatients, pendingEnrollments, upcomingSyncs, totalMeds };
  }, [patients, medications]);

  // Calculate sync plan for a patient
  const calculateSyncPlan = (patient: Patient) => {
    const patientMeds = medications.filter(m => m.patientId === patient.id && m.status !== 'excluded');

    // Get next sync date
    const today = new Date();
    let syncDay = patient.syncDate;
    let targetMonth = today.getMonth();
    let targetYear = today.getFullYear();

    if (today.getDate() > syncDay) {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
    }

    const targetSyncDate = new Date(targetYear, targetMonth, syncDay);

    const medicationPlans = patientMeds.map(med => {
      const currentDue = new Date(med.nextDueDate);
      const diffDays = Math.ceil((targetSyncDate.getTime() - currentDue.getTime()) / (1000 * 60 * 60 * 24));

      let action: 'short-fill' | 'regular' | 'exclude' = 'regular';
      let shortFillDays = 0;

      if (diffDays > 0) {
        // Need short fill to extend to sync date
        shortFillDays = diffDays;
        action = 'short-fill';
      } else if (diffDays < -7) {
        // More than a week early - adjust
        shortFillDays = med.daysSupply + diffDays;
        action = 'short-fill';
      }

      return {
        medicationId: med.id,
        drugName: `${med.drugName} ${med.strength}`,
        currentDueDate: med.nextDueDate,
        adjustedDueDate: targetSyncDate.toISOString().split('T')[0],
        shortFillDays,
        action,
      };
    });

    const plan: SyncPlan = {
      id: `SYNC-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      targetSyncDate: targetSyncDate.toISOString().split('T')[0],
      medications: medicationPlans,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    return plan;
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPatient) {
      setPatients(patients.map(p =>
        p.id === editingPatient.id ? { ...p, ...patientForm } : p
      ));
    } else {
      const newPatient: Patient = {
        ...patientForm as Patient,
        id: `PAT-${Date.now()}`,
        enrollmentDate: new Date().toISOString().split('T')[0],
      };
      setPatients([...patients, newPatient]);
    }

    resetPatientForm();
  };

  const resetPatientForm = () => {
    setPatientForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      syncDate: 1,
      status: 'pending',
      notes: '',
    });
    setEditingPatient(null);
    setShowPatientForm(false);
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) return;

    const lastFill = new Date(medForm.lastFillDate || new Date());
    const nextDue = new Date(lastFill);
    nextDue.setDate(nextDue.getDate() + (medForm.daysSupply || 30));

    const newMed: Medication = {
      ...medForm as Medication,
      id: `MED-${Date.now()}`,
      patientId: selectedPatient.id,
      nextDueDate: nextDue.toISOString().split('T')[0],
      syncAdjustment: 0,
    };

    setMedications([...medications, newMed]);
    setMedForm({
      rxNumber: '',
      drugName: '',
      strength: '',
      daysSupply: 30,
      lastFillDate: '',
      refillsRemaining: 0,
      status: 'pending-sync',
    });
    setShowMedForm(false);
  };

  const handleGeneratePlan = () => {
    if (!selectedPatient) return;
    const plan = calculateSyncPlan(selectedPatient);
    setSyncPlans([...syncPlans, plan]);
    setActiveTab('plan');
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
    setMedications(medications.filter(m => m.patientId !== id));
    if (selectedPatient?.id === id) setSelectedPatient(null);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setPatientForm(patient);
    setShowPatientForm(true);
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-indigo-500" />
            {t('tools.medicationSync.medicationSynchronization', 'Medication Synchronization')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.medicationSync.syncPatientMedicationsToA', 'Sync patient medications to a single monthly pickup date')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="medication-sync" toolName="Medication Sync" />

          <SyncStatus status={syncStatus} lastSynced={lastSynced} onSync={sync} />
          <ExportDropdown data={filteredPatients} columns={PATIENT_COLUMNS} filename="medication-sync" />
          <button
            onClick={() => setShowPatientForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.medicationSync.enrollPatient', 'Enroll Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-indigo-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.medicationSync.activePatients', 'Active Patients')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.activePatients}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.medicationSync.pendingEnrollment', 'Pending Enrollment')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.pendingEnrollments}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.medicationSync.syncsThisWeek', 'Syncs This Week')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.upcomingSyncs}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.medicationSync.totalMedications', 'Total Medications')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalMeds}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {[
          { id: 'patients', label: 'Patients', icon: User },
          { id: 'plan', label: 'Sync Plans', icon: Target },
          { id: 'upcoming', label: 'Upcoming', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('tools.medicationSync.searchPatients', 'Search patients...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div className="space-y-2">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? isDark ? 'bg-indigo-900/30 border-indigo-600' : 'bg-indigo-50 border-indigo-300'
                      : isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{patient.firstName} {patient.lastName}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sync Date: {patient.syncDate}th of month
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      patient.status === 'active' ? 'bg-green-100 text-green-700' :
                      patient.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              ))}

              {filteredPatients.length === 0 && (
                <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <User className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.medicationSync.noPatientsEnrolled', 'No patients enrolled')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Details */}
          <div className="md:col-span-2">
            {selectedPatient ? (
              <div className="space-y-4">
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPatient(selectedPatient)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(selectedPatient.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.phone', 'Phone')}</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.syncDate', 'Sync Date')}</p>
                      <p className="font-medium">{selectedPatient.syncDate}th of each month</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.enrolled', 'Enrolled')}</p>
                      <p className="font-medium">{new Date(selectedPatient.enrollmentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.status', 'Status')}</p>
                      <span className={`inline-flex px-2 py-0.5 text-sm rounded-full ${
                        selectedPatient.status === 'active' ? 'bg-green-100 text-green-700' :
                        selectedPatient.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Pill className="w-5 h-5 text-indigo-500" />
                      Medications ({patientMedications.length})
                    </h3>
                    <button
                      onClick={() => setShowMedForm(true)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.medicationSync.add', 'Add')}
                    </button>
                  </div>

                  {patientMedications.length > 0 ? (
                    <div className="space-y-3">
                      {patientMedications.map(med => (
                        <div
                          key={med.id}
                          className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{med.drugName} {med.strength}</p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Rx: {med.rxNumber} • {med.daysSupply} days supply
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  Last: {new Date(med.lastFillDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  Next: {new Date(med.nextDueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              med.status === 'synced' ? 'bg-green-100 text-green-700' :
                              med.status === 'needs-short-fill' ? 'bg-orange-100 text-orange-700' :
                              med.status === 'excluded' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {med.status.replace(/-/g, ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.medicationSync.noMedicationsAddedYet', 'No medications added yet')}
                    </p>
                  )}

                  {patientMedications.length > 0 && (
                    <button
                      onClick={handleGeneratePlan}
                      className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('tools.medicationSync.generateSyncPlan', 'Generate Sync Plan')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-12 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <User className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.selectAPatientToView', 'Select a patient to view details')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sync Plans Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          {syncPlans.map(plan => (
            <div
              key={plan.id}
              className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{plan.patientName}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Target Sync Date: {new Date(plan.targetSyncDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                  plan.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  plan.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {plan.status}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-3 py-2 text-left">{t('tools.medicationSync.medication', 'Medication')}</th>
                      <th className="px-3 py-2 text-left">{t('tools.medicationSync.currentDue', 'Current Due')}</th>
                      <th className="px-3 py-2 text-left">{t('tools.medicationSync.adjustedDue', 'Adjusted Due')}</th>
                      <th className="px-3 py-2 text-left">{t('tools.medicationSync.action', 'Action')}</th>
                      <th className="px-3 py-2 text-left">{t('tools.medicationSync.shortFill', 'Short Fill')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {plan.medications.map((med, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{med.drugName}</td>
                        <td className="px-3 py-2">{new Date(med.currentDueDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{new Date(med.adjustedDueDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            med.action === 'short-fill' ? 'bg-orange-100 text-orange-700' :
                            med.action === 'exclude' ? 'bg-gray-100 text-gray-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {med.action}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {med.shortFillDays > 0 ? `${med.shortFillDays} days` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {plan.status === 'draft' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setSyncPlans(syncPlans.map(p =>
                      p.id === plan.id ? { ...p, status: 'approved' } : p
                    ))}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {t('tools.medicationSync.approvePlan', 'Approve Plan')}
                  </button>
                  <button
                    onClick={() => setSyncPlans(syncPlans.filter(p => p.id !== plan.id))}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    {t('tools.medicationSync.discard', 'Discard')}
                  </button>
                </div>
              )}
            </div>
          ))}

          {syncPlans.length === 0 && (
            <div className={`p-12 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <Target className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.noSyncPlansGenerated', 'No sync plans generated')}</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.medicationSync.selectAPatientAndGenerate', 'Select a patient and generate a sync plan from the Patients tab')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold">{t('tools.medicationSync.upcomingSyncDatesNext30', 'Upcoming Sync Dates (Next 30 Days)')}</h3>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {patients
              .filter(p => p.status === 'active')
              .sort((a, b) => a.syncDate - b.syncDate)
              .map(patient => {
                const today = new Date();
                const syncDate = new Date(today.getFullYear(), today.getMonth(), patient.syncDate);
                if (syncDate < today) {
                  syncDate.setMonth(syncDate.getMonth() + 1);
                }

                return (
                  <div key={patient.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span className="text-xs text-gray-500">{syncDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-bold">{patient.syncDate}</span>
                      </div>
                      <div>
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {medications.filter(m => m.patientId === patient.id).length} medications
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setActiveTab('patients');
                      }}
                      className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    >
                      {t('tools.medicationSync.view', 'View')}
                    </button>
                  </div>
                );
              })}

            {patients.filter(p => p.status === 'active').length === 0 && (
              <div className="p-8 text-center">
                <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.medicationSync.noActivePatientsEnrolled', 'No active patients enrolled')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.medicationSync.programBenefits', 'Program Benefits')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('tools.medicationSync.improvedAdherence', 'Improved Adherence')}</span>
                  <span className="text-green-500">+23%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-full w-[73%] rounded-full bg-green-500"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('tools.medicationSync.tripReduction', 'Trip Reduction')}</span>
                  <span className="text-blue-500">-65%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-full w-[65%] rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('tools.medicationSync.patientSatisfaction', 'Patient Satisfaction')}</span>
                  <span className="text-purple-500">4.8/5</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-full w-[96%] rounded-full bg-purple-500"></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.medicationSync.monthlySummary', 'Monthly Summary')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.syncsCompleted', 'Syncs Completed')}</p>
                <p className="text-2xl font-bold">{syncPlans.filter(p => p.status === 'completed').length}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.shortFills', 'Short Fills')}</p>
                <p className="text-2xl font-bold">
                  {syncPlans.reduce((sum, p) => sum + p.medications.filter(m => m.action === 'short-fill').length, 0)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.avgMedsPatient', 'Avg Meds/Patient')}</p>
                <p className="text-2xl font-bold">
                  {patients.length > 0 ? (medications.length / patients.length).toFixed(1) : 0}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicationSync.newEnrollments', 'New Enrollments')}</p>
                <p className="text-2xl font-bold">{stats.pendingEnrollments}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold">
                {editingPatient ? t('tools.medicationSync.editPatient', 'Edit Patient') : t('tools.medicationSync.enrollPatientInMedSync', 'Enroll Patient in Med Sync')}
              </h2>
              <button onClick={resetPatientForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={patientForm.firstName}
                    onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={patientForm.lastName}
                    onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.phone2', 'Phone *')}</label>
                  <input
                    type="tel"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.dateOfBirth', 'Date of Birth')}</label>
                  <input
                    type="date"
                    value={patientForm.dateOfBirth}
                    onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.email', 'Email')}</label>
                <input
                  type="email"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.syncDateDayOfMonth', 'Sync Date (Day of Month) *')}</label>
                  <select
                    value={patientForm.syncDate}
                    onChange={(e) => setPatientForm({ ...patientForm, syncDate: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.status2', 'Status')}</label>
                  <select
                    value={patientForm.status}
                    onChange={(e) => setPatientForm({ ...patientForm, status: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="pending">{t('tools.medicationSync.pending', 'Pending')}</option>
                    <option value="active">{t('tools.medicationSync.active', 'Active')}</option>
                    <option value="inactive">{t('tools.medicationSync.inactive', 'Inactive')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.notes', 'Notes')}</label>
                <textarea
                  value={patientForm.notes}
                  onChange={(e) => setPatientForm({ ...patientForm, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetPatientForm}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {t('tools.medicationSync.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingPatient ? t('tools.medicationSync.update', 'Update') : t('tools.medicationSync.enrollPatient2', 'Enroll Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showMedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold">{t('tools.medicationSync.addMedication', 'Add Medication')}</h2>
              <button onClick={() => setShowMedForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.rxNumber', 'Rx Number *')}</label>
                <input
                  type="text"
                  value={medForm.rxNumber}
                  onChange={(e) => setMedForm({ ...medForm, rxNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.drugName', 'Drug Name *')}</label>
                  <input
                    type="text"
                    value={medForm.drugName}
                    onChange={(e) => setMedForm({ ...medForm, drugName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.strength', 'Strength')}</label>
                  <input
                    type="text"
                    value={medForm.strength}
                    onChange={(e) => setMedForm({ ...medForm, strength: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.daysSupply', 'Days Supply *')}</label>
                  <input
                    type="number"
                    value={medForm.daysSupply}
                    onChange={(e) => setMedForm({ ...medForm, daysSupply: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.lastFillDate', 'Last Fill Date *')}</label>
                  <input
                    type="date"
                    value={medForm.lastFillDate}
                    onChange={(e) => setMedForm({ ...medForm, lastFillDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.medicationSync.refillsRemaining', 'Refills Remaining')}</label>
                <input
                  type="number"
                  value={medForm.refillsRemaining}
                  onChange={(e) => setMedForm({ ...medForm, refillsRemaining: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMedForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {t('tools.medicationSync.cancel2', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {t('tools.medicationSync.addMedication2', 'Add Medication')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationSyncTool;
export { MedicationSyncTool };
