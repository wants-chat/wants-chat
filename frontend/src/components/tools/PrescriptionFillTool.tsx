'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pill,
  User,
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Package,
  Phone,
  FileText,
  Filter,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Shield,
  DollarSign,
  Printer,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  allergies: string[];
  insuranceProvider: string;
  insuranceId: string;
}

interface Prescriber {
  id: string;
  name: string;
  npi: string;
  deaNumber: string;
  phone: string;
  fax: string;
  address: string;
}

interface Prescription {
  id: string;
  rxNumber: string;
  patientId: string;
  prescriberId: string;
  drugName: string;
  drugNdc: string;
  strength: string;
  dosageForm: string;
  quantity: number;
  daysSupply: number;
  refillsAuthorized: number;
  refillsRemaining: number;
  sig: string; // Directions
  dateWritten: string;
  dateExpires: string;
  status: 'new' | 'pending' | 'processing' | 'ready' | 'picked-up' | 'cancelled' | 'on-hold' | 'transferred';
  fillHistory: FillRecord[];
  priority: 'normal' | 'rush' | 'stat';
  notes: string;
  copay: number;
  insurancePaid: number;
  daw: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // Dispense as Written codes
  controlledSubstance: boolean;
  schedule: '' | 'II' | 'III' | 'IV' | 'V';
  createdAt: string;
  updatedAt: string;
}

interface FillRecord {
  id: string;
  fillDate: string;
  pharmacistId: string;
  pharmacistName: string;
  quantityDispensed: number;
  lotNumber: string;
  expirationDate: string;
  verifiedBy: string;
}

interface PrescriptionFillToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'prescription-fill';

// Column configuration for export
const prescriptionColumns: ColumnConfig[] = [
  { key: 'rxNumber', header: 'Rx Number', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'drugName', header: 'Drug Name', type: 'string' },
  { key: 'strength', header: 'Strength', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'daysSupply', header: 'Days Supply', type: 'number' },
  { key: 'sig', header: 'Directions', type: 'string' },
  { key: 'refillsRemaining', header: 'Refills Left', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'copay', header: 'Copay', type: 'currency' },
  { key: 'dateWritten', header: 'Date Written', type: 'date' },
  { key: 'dateExpires', header: 'Expires', type: 'date' },
];

const patientColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'dateOfBirth', header: 'DOB', type: 'date' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'insuranceProvider', header: 'Insurance', type: 'string' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'new': { label: 'New', color: 'blue', icon: <Plus className="w-4 h-4" /> },
  'pending': { label: 'Pending', color: 'yellow', icon: <Clock className="w-4 h-4" /> },
  'processing': { label: 'Processing', color: 'purple', icon: <RefreshCw className="w-4 h-4" /> },
  'ready': { label: 'Ready', color: 'green', icon: <CheckCircle className="w-4 h-4" /> },
  'picked-up': { label: 'Picked Up', color: 'gray', icon: <Package className="w-4 h-4" /> },
  'cancelled': { label: 'Cancelled', color: 'red', icon: <X className="w-4 h-4" /> },
  'on-hold': { label: 'On Hold', color: 'orange', icon: <AlertTriangle className="w-4 h-4" /> },
  'transferred': { label: 'Transferred', color: 'indigo', icon: <FileText className="w-4 h-4" /> },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  'normal': { label: 'Normal', color: 'gray' },
  'rush': { label: 'Rush', color: 'yellow' },
  'stat': { label: 'STAT', color: 'red' },
};

const generateRxNumber = () => {
  const prefix = 'RX';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

const createNewPrescription = (): Prescription => ({
  id: crypto.randomUUID(),
  rxNumber: generateRxNumber(),
  patientId: '',
  prescriberId: '',
  drugName: '',
  drugNdc: '',
  strength: '',
  dosageForm: '',
  quantity: 30,
  daysSupply: 30,
  refillsAuthorized: 0,
  refillsRemaining: 0,
  sig: '',
  dateWritten: new Date().toISOString().split('T')[0],
  dateExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'new',
  fillHistory: [],
  priority: 'normal',
  notes: '',
  copay: 0,
  insurancePaid: 0,
  daw: 0,
  controlledSubstance: false,
  schedule: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewPatient = (): Patient => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  allergies: [],
  insuranceProvider: '',
  insuranceId: '',
});

const createNewPrescriber = (): Prescriber => ({
  id: crypto.randomUUID(),
  name: '',
  npi: '',
  deaNumber: '',
  phone: '',
  fax: '',
  address: '',
});

export const PrescriptionFillTool: React.FC<PrescriptionFillToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use hooks for data management
  const {
    data: prescriptions,
    addItem: addPrescription,
    updateItem: updatePrescription,
    deleteItem: deletePrescription,
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
  } = useToolData<Prescription>(TOOL_ID, [], prescriptionColumns);

  const {
    data: patients,
    addItem: addPatient,
    updateItem: updatePatient,
    deleteItem: deletePatient,
  } = useToolData<Patient>(`${TOOL_ID}-patients`, [], patientColumns);

  const {
    data: prescribers,
    addItem: addPrescriber,
  } = useToolData<Prescriber>(`${TOOL_ID}-prescribers`, [], []);

  // UI State
  const [activeTab, setActiveTab] = useState<'queue' | 'prescriptions' | 'patients' | 'prescribers'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showPrescriberModal, setShowPrescriberModal] = useState(false);
  const [showFillModal, setShowFillModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingPrescriber, setEditingPrescriber] = useState<Prescriber | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Fill form state
  const [fillForm, setFillForm] = useState({
    pharmacistName: '',
    quantityDispensed: 0,
    lotNumber: '',
    expirationDate: '',
    verifiedBy: '',
  });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.drugName || params.patientName) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const pendingCount = prescriptions.filter(p => ['new', 'pending', 'processing'].includes(p.status)).length;
    const readyCount = prescriptions.filter(p => p.status === 'ready').length;
    const statCount = prescriptions.filter(p => p.priority === 'stat' && p.status !== 'picked-up').length;
    const controlledCount = prescriptions.filter(p => p.controlledSubstance && p.status !== 'picked-up').length;
    const todayFilled = prescriptions.filter(p =>
      p.fillHistory.some(f => f.fillDate === today)
    ).length;

    return {
      pendingCount,
      readyCount,
      statCount,
      controlledCount,
      todayFilled,
      totalPatients: patients.length,
    };
  }, [prescriptions, patients]);

  // Filtered prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(rx => {
      const patient = patients.find(p => p.id === rx.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';

      const matchesSearch = searchQuery === '' ||
        rx.rxNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.drugName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patientName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === '' || rx.status === filterStatus;
      const matchesPriority = filterPriority === '' || rx.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [prescriptions, patients, searchQuery, filterStatus, filterPriority]);

  // Queue prescriptions (active ones)
  const queuePrescriptions = useMemo(() => {
    return filteredPrescriptions
      .filter(rx => !['picked-up', 'cancelled', 'transferred'].includes(rx.status))
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { stat: 0, rush: 1, normal: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        // Then by date
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [filteredPrescriptions]);

  // Helper functions
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getPrescriberName = (prescriberId: string) => {
    const prescriber = prescribers.find(p => p.id === prescriberId);
    return prescriber ? prescriber.name : 'Unknown Prescriber';
  };

  // Handlers
  const handleSavePrescription = () => {
    if (!editingPrescription) return;
    if (!editingPrescription.patientId || !editingPrescription.drugName) {
      setValidationMessage('Please fill in required fields (Patient and Drug Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const updatedRx = {
      ...editingPrescription,
      updatedAt: new Date().toISOString(),
    };

    if (prescriptions.find(p => p.id === editingPrescription.id)) {
      updatePrescription(editingPrescription.id, updatedRx);
    } else {
      addPrescription(updatedRx);
    }

    setShowPrescriptionModal(false);
    setEditingPrescription(null);
  };

  const handleSavePatient = () => {
    if (!editingPatient) return;
    if (!editingPatient.firstName || !editingPatient.lastName) {
      setValidationMessage('Please fill in required fields (First and Last Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (patients.find(p => p.id === editingPatient.id)) {
      updatePatient(editingPatient.id, editingPatient);
    } else {
      addPatient(editingPatient);
    }

    setShowPatientModal(false);
    setEditingPatient(null);
  };

  const handleSavePrescriber = () => {
    if (!editingPrescriber) return;
    if (!editingPrescriber.name || !editingPrescriber.npi) {
      setValidationMessage('Please fill in required fields (Name and NPI)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    addPrescriber(editingPrescriber);
    setShowPrescriberModal(false);
    setEditingPrescriber(null);
  };

  const handleFillPrescription = () => {
    if (!selectedPrescription || !fillForm.pharmacistName) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const fillRecord: FillRecord = {
      id: crypto.randomUUID(),
      fillDate: new Date().toISOString().split('T')[0],
      pharmacistId: crypto.randomUUID(),
      pharmacistName: fillForm.pharmacistName,
      quantityDispensed: fillForm.quantityDispensed || selectedPrescription.quantity,
      lotNumber: fillForm.lotNumber,
      expirationDate: fillForm.expirationDate,
      verifiedBy: fillForm.verifiedBy,
    };

    const updatedRx: Partial<Prescription> = {
      fillHistory: [...selectedPrescription.fillHistory, fillRecord],
      refillsRemaining: Math.max(0, selectedPrescription.refillsRemaining - 1),
      status: 'ready',
      updatedAt: new Date().toISOString(),
    };

    updatePrescription(selectedPrescription.id, updatedRx);
    setShowFillModal(false);
    setSelectedPrescription(null);
    setFillForm({
      pharmacistName: '',
      quantityDispensed: 0,
      lotNumber: '',
      expirationDate: '',
      verifiedBy: '',
    });
  };

  const handleStatusChange = (rx: Prescription, newStatus: Prescription['status']) => {
    updatePrescription(rx.id, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddAllergy = () => {
    if (!editingPatient || !newAllergyInput.trim()) return;
    setEditingPatient({
      ...editingPatient,
      allergies: [...editingPatient.allergies, newAllergyInput.trim()],
    });
    setNewAllergyInput('');
  };

  const handleRemoveAllergy = (index: number) => {
    if (!editingPatient) return;
    setEditingPatient({
      ...editingPatient,
      allergies: editingPatient.allergies.filter((_, i) => i !== index),
    });
  };

  // Export handlers
  const handleExportCSV = () => exportCSV({ filename: 'prescriptions' });
  const handleExportExcel = () => exportExcel({ filename: 'prescriptions' });
  const handleExportJSON = () => exportJSON({ filename: 'prescriptions' });
  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'prescriptions',
      title: 'Prescription Records',
      subtitle: `Total: ${filteredPrescriptions.length} prescriptions`,
    });
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.prescriptionFill.prescriptionFill', 'Prescription Fill')}</h1>
            <p className={textSecondary}>{t('tools.prescriptionFill.managePrescriptionsAndPatientFills', 'Manage prescriptions and patient fills')}</p>
          </div>
          {isPrefilled && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Prefilled
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="prescription-fill" toolName="Prescription Fill" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onCopy={() => copyToClipboard('tab')}
            onPrint={() => print('Prescriptions')}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={textSecondary}>{t('tools.prescriptionFill.pending', 'Pending')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.pendingCount}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={textSecondary}>{t('tools.prescriptionFill.ready', 'Ready')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.readyCount}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={textSecondary}>{t('tools.prescriptionFill.stat', 'STAT')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.statCount}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <span className={textSecondary}>{t('tools.prescriptionFill.controlled', 'Controlled')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.controlledCount}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className={textSecondary}>{t('tools.prescriptionFill.filledToday', 'Filled Today')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.todayFilled}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-indigo-500" />
            <span className={textSecondary}>{t('tools.prescriptionFill.patients', 'Patients')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalPatients}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${cardBg} ${borderColor} border rounded-lg mb-6`}>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['queue', 'prescriptions', 'patients', 'prescribers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-green-500 text-green-600'
                  : `${textSecondary} hover:text-green-500`
              }`}
            >
              {tab === 'queue' ? 'Fill Queue' : tab}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.prescriptionFill.searchRxDrugOrPatient', 'Search Rx#, drug, or patient...')}
              className={`w-full pl-10 pr-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
          </div>
          {(activeTab === 'queue' || activeTab === 'prescriptions') && (
            <>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
              >
                <option value="">{t('tools.prescriptionFill.allStatuses', 'All Statuses')}</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
              >
                <option value="">{t('tools.prescriptionFill.allPriorities', 'All Priorities')}</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </>
          )}
          <button
            onClick={() => {
              if (activeTab === 'patients') {
                setEditingPatient(createNewPatient());
                setShowPatientModal(true);
              } else if (activeTab === 'prescribers') {
                setEditingPrescriber(createNewPrescriber());
                setShowPrescriberModal(true);
              } else {
                setEditingPrescription(createNewPrescription());
                setShowPrescriptionModal(true);
              }
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'patients' ? 'Add Patient' : activeTab === 'prescribers' ? t('tools.prescriptionFill.addPrescriber', 'Add Prescriber') : t('tools.prescriptionFill.newRx', 'New Rx')}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : (activeTab === 'queue' || activeTab === 'prescriptions') ? (
            <div className="space-y-3">
              {(activeTab === 'queue' ? queuePrescriptions : filteredPrescriptions).length === 0 ? (
                <div className={`text-center py-12 ${textSecondary}`}>
                  <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.prescriptionFill.noPrescriptionsFound', 'No prescriptions found')}</p>
                </div>
              ) : (
                (activeTab === 'queue' ? queuePrescriptions : filteredPrescriptions).map((rx) => (
                  <div
                    key={rx.id}
                    className={`${cardBg} ${borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-mono text-sm ${textSecondary}`}>{rx.rxNumber}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            PRIORITY_CONFIG[rx.priority].color === 'red'
                              ? 'bg-red-100 text-red-700'
                              : PRIORITY_CONFIG[rx.priority].color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {PRIORITY_CONFIG[rx.priority].label}
                          </span>
                          {rx.controlledSubstance && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                              C-{rx.schedule}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-lg font-semibold ${textPrimary}`}>
                          {rx.drugName} {rx.strength}
                        </h3>
                        <p className={textSecondary}>{rx.dosageForm} - Qty: {rx.quantity} ({rx.daysSupply} days)</p>
                        <p className={`text-sm ${textSecondary}`}>
                          <span className="font-medium">{t('tools.prescriptionFill.patient', 'Patient:')}</span> {getPatientName(rx.patientId)}
                        </p>
                        <p className={`text-sm ${textSecondary}`}>Sig: {rx.sig}</p>
                        {rx.refillsRemaining > 0 && (
                          <p className="text-sm text-green-600">
                            {rx.refillsRemaining} refill(s) remaining
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                          STATUS_CONFIG[rx.status].color === 'green' ? 'bg-green-100 text-green-700' :
                          STATUS_CONFIG[rx.status].color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          STATUS_CONFIG[rx.status].color === 'red' ? 'bg-red-100 text-red-700' :
                          STATUS_CONFIG[rx.status].color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          STATUS_CONFIG[rx.status].color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          STATUS_CONFIG[rx.status].color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {STATUS_CONFIG[rx.status].icon}
                          <span className="text-sm font-medium">{STATUS_CONFIG[rx.status].label}</span>
                        </div>
                        {rx.copay > 0 && (
                          <span className={`text-sm ${textSecondary}`}>
                            Copay: ${rx.copay.toFixed(2)}
                          </span>
                        )}
                        <div className="flex gap-2">
                          {rx.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedPrescription(rx);
                                setFillForm({
                                  ...fillForm,
                                  quantityDispensed: rx.quantity,
                                });
                                setShowFillModal(true);
                              }}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                            >
                              {t('tools.prescriptionFill.fill', 'Fill')}
                            </button>
                          )}
                          {rx.status === 'ready' && (
                            <button
                              onClick={() => handleStatusChange(rx, 'picked-up')}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                            >
                              {t('tools.prescriptionFill.pickUp', 'Pick Up')}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingPrescription(rx);
                              setShowPrescriptionModal(true);
                            }}
                            className={`p-1 ${textSecondary} hover:text-green-500 transition-colors`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirm({
                                title: 'Delete Prescription',
                                message: 'Are you sure you want to delete this prescription? This action cannot be undone.',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                variant: 'danger',
                              });
                              if (confirmed) {
                                deletePrescription(rx.id);
                              }
                            }}
                            className={`p-1 ${textSecondary} hover:text-red-500 transition-colors`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'patients' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.length === 0 ? (
                <div className={`col-span-full text-center py-12 ${textSecondary}`}>
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.prescriptionFill.noPatientsFound', 'No patients found')}</p>
                </div>
              ) : (
                patients.filter(p =>
                  searchQuery === '' ||
                  `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.phone.includes(searchQuery)
                ).map((patient) => (
                  <div
                    key={patient.id}
                    className={`${cardBg} ${borderColor} border rounded-lg p-4`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${textPrimary}`}>
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className={`text-sm ${textSecondary}`}>
                            DOB: {patient.dateOfBirth}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingPatient(patient);
                            setShowPatientModal(true);
                          }}
                          className={`p-1 ${textSecondary} hover:text-green-500`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Delete Patient',
                              message: 'Are you sure you want to delete this patient? This action cannot be undone.',
                              confirmText: 'Delete',
                              cancelText: 'Cancel',
                              variant: 'danger',
                            });
                            if (confirmed) {
                              deletePatient(patient.id);
                            }
                          }}
                          className={`p-1 ${textSecondary} hover:text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`space-y-1 text-sm ${textSecondary}`}>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {patient.phone || 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield className="w-4 h-4" /> {patient.insuranceProvider || 'No Insurance'}
                      </p>
                      {patient.allergies.length > 0 && (
                        <p className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="w-4 h-4" />
                          {patient.allergies.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescribers.length === 0 ? (
                <div className={`col-span-full text-center py-12 ${textSecondary}`}>
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.prescriptionFill.noPrescribersFound', 'No prescribers found')}</p>
                </div>
              ) : (
                prescribers.filter(p =>
                  searchQuery === '' ||
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.npi.includes(searchQuery)
                ).map((prescriber) => (
                  <div
                    key={prescriber.id}
                    className={`${cardBg} ${borderColor} border rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${textPrimary}`}>{prescriber.name}</h3>
                        <p className={`text-sm ${textSecondary}`}>NPI: {prescriber.npi}</p>
                      </div>
                    </div>
                    <div className={`space-y-1 text-sm ${textSecondary}`}>
                      <p>DEA: {prescriber.deaNumber || 'N/A'}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {prescriber.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && editingPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {editingPrescription.rxNumber ? t('tools.prescriptionFill.editPrescription', 'Edit Prescription') : t('tools.prescriptionFill.newPrescription', 'New Prescription')}
              </h2>
              <button
                onClick={() => {
                  setShowPrescriptionModal(false);
                  setEditingPrescription(null);
                }}
                className={textSecondary}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.patient2', 'Patient *')}
                  </label>
                  <select
                    value={editingPrescription.patientId}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, patientId: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.prescriptionFill.selectPatient', 'Select Patient')}</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.prescriber', 'Prescriber')}
                  </label>
                  <select
                    value={editingPrescription.prescriberId}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, prescriberId: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.prescriptionFill.selectPrescriber', 'Select Prescriber')}</option>
                    {prescribers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.drugName', 'Drug Name *')}
                  </label>
                  <input
                    type="text"
                    value={editingPrescription.drugName}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, drugName: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    placeholder={t('tools.prescriptionFill.eGLisinopril', 'e.g., Lisinopril')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.ndc', 'NDC')}
                  </label>
                  <input
                    type="text"
                    value={editingPrescription.drugNdc}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, drugNdc: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    placeholder={t('tools.prescriptionFill.11DigitNdc', '11-digit NDC')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.strength', 'Strength')}
                  </label>
                  <input
                    type="text"
                    value={editingPrescription.strength}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, strength: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    placeholder={t('tools.prescriptionFill.eG10mg', 'e.g., 10mg')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.dosageForm', 'Dosage Form')}
                  </label>
                  <select
                    value={editingPrescription.dosageForm}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, dosageForm: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.prescriptionFill.selectForm', 'Select Form')}</option>
                    <option value="Tablet">{t('tools.prescriptionFill.tablet', 'Tablet')}</option>
                    <option value="Capsule">{t('tools.prescriptionFill.capsule', 'Capsule')}</option>
                    <option value="Solution">{t('tools.prescriptionFill.solution', 'Solution')}</option>
                    <option value="Suspension">{t('tools.prescriptionFill.suspension', 'Suspension')}</option>
                    <option value="Cream">{t('tools.prescriptionFill.cream', 'Cream')}</option>
                    <option value="Ointment">{t('tools.prescriptionFill.ointment', 'Ointment')}</option>
                    <option value="Injection">{t('tools.prescriptionFill.injection', 'Injection')}</option>
                    <option value="Patch">Patch</option>
                    <option value="Inhaler">{t('tools.prescriptionFill.inhaler', 'Inhaler')}</option>
                    <option value="Drops">{t('tools.prescriptionFill.drops', 'Drops')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.dawCode', 'DAW Code')}
                  </label>
                  <select
                    value={editingPrescription.daw}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, daw: parseInt(e.target.value) as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value={0}>0 - No product selection indicated</option>
                    <option value={1}>1 - Substitution not allowed by prescriber</option>
                    <option value={2}>2 - Substitution allowed - patient requested</option>
                    <option value={3}>3 - Substitution allowed - pharmacist selected</option>
                    <option value={4}>4 - Substitution allowed - generic not in stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.quantity', 'Quantity')}
                  </label>
                  <input
                    type="number"
                    value={editingPrescription.quantity}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, quantity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.daysSupply', 'Days Supply')}
                  </label>
                  <input
                    type="number"
                    value={editingPrescription.daysSupply}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, daysSupply: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.refills', 'Refills')}
                  </label>
                  <input
                    type="number"
                    value={editingPrescription.refillsAuthorized}
                    onChange={(e) => {
                      const refills = parseInt(e.target.value) || 0;
                      setEditingPrescription({
                        ...editingPrescription,
                        refillsAuthorized: refills,
                        refillsRemaining: refills,
                      });
                    }}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                  {t('tools.prescriptionFill.directionsSig', 'Directions (Sig)')}
                </label>
                <textarea
                  value={editingPrescription.sig}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, sig: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.prescriptionFill.eGTake1Tablet', 'e.g., Take 1 tablet by mouth once daily')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.priority', 'Priority')}
                  </label>
                  <select
                    value={editingPrescription.priority}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, priority: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="normal">{t('tools.prescriptionFill.normal', 'Normal')}</option>
                    <option value="rush">{t('tools.prescriptionFill.rush', 'Rush')}</option>
                    <option value="stat">{t('tools.prescriptionFill.stat2', 'STAT')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.status', 'Status')}
                  </label>
                  <select
                    value={editingPrescription.status}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, status: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    {t('tools.prescriptionFill.copay', 'Copay ($)')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPrescription.copay}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, copay: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingPrescription.controlledSubstance}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, controlledSubstance: e.target.checked })}
                    className="w-4 h-4 text-green-500"
                  />
                  <span className={textSecondary}>{t('tools.prescriptionFill.controlledSubstance', 'Controlled Substance')}</span>
                </label>
                {editingPrescription.controlledSubstance && (
                  <select
                    value={editingPrescription.schedule}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, schedule: e.target.value as any })}
                    className={`px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.prescriptionFill.selectSchedule', 'Select Schedule')}</option>
                    <option value="II">{t('tools.prescriptionFill.scheduleIi', 'Schedule II')}</option>
                    <option value="III">{t('tools.prescriptionFill.scheduleIii', 'Schedule III')}</option>
                    <option value="IV">{t('tools.prescriptionFill.scheduleIv', 'Schedule IV')}</option>
                    <option value="V">{t('tools.prescriptionFill.scheduleV', 'Schedule V')}</option>
                  </select>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                  {t('tools.prescriptionFill.notes', 'Notes')}
                </label>
                <textarea
                  value={editingPrescription.notes}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.prescriptionFill.internalNotes', 'Internal notes...')}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPrescriptionModal(false);
                  setEditingPrescription(null);
                }}
                className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                {t('tools.prescriptionFill.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSavePrescription}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Modal */}
      {showPatientModal && editingPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {patients.find(p => p.id === editingPatient.id) ? t('tools.prescriptionFill.editPatient', 'Edit Patient') : t('tools.prescriptionFill.newPatient', 'New Patient')}
              </h2>
              <button onClick={() => { setShowPatientModal(false); setEditingPatient(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={editingPatient.firstName}
                    onChange={(e) => setEditingPatient({ ...editingPatient, firstName: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={editingPatient.lastName}
                    onChange={(e) => setEditingPatient({ ...editingPatient, lastName: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.dateOfBirth', 'Date of Birth')}</label>
                <input
                  type="date"
                  value={editingPatient.dateOfBirth}
                  onChange={(e) => setEditingPatient({ ...editingPatient, dateOfBirth: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.email', 'Email')}</label>
                  <input
                    type="email"
                    value={editingPatient.email}
                    onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.address', 'Address')}</label>
                <input
                  type="text"
                  value={editingPatient.address}
                  onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.insuranceProvider', 'Insurance Provider')}</label>
                  <input
                    type="text"
                    value={editingPatient.insuranceProvider}
                    onChange={(e) => setEditingPatient({ ...editingPatient, insuranceProvider: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.insuranceId', 'Insurance ID')}</label>
                  <input
                    type="text"
                    value={editingPatient.insuranceId}
                    onChange={(e) => setEditingPatient({ ...editingPatient, insuranceId: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.allergies', 'Allergies')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAllergyInput}
                    onChange={(e) => setNewAllergyInput(e.target.value)}
                    placeholder={t('tools.prescriptionFill.addAllergy', 'Add allergy')}
                    className={`flex-1 px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                  />
                  <button
                    onClick={handleAddAllergy}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingPatient.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {allergy}
                      <button onClick={() => handleRemoveAllergy(index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowPatientModal(false); setEditingPatient(null); }}
                className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                {t('tools.prescriptionFill.cancel2', 'Cancel')}
              </button>
              <button onClick={handleSavePatient} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescriber Modal */}
      {showPrescriberModal && editingPrescriber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>{t('tools.prescriptionFill.newPrescriber', 'New Prescriber')}</h2>
              <button onClick={() => { setShowPrescriberModal(false); setEditingPrescriber(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.name', 'Name *')}</label>
                <input
                  type="text"
                  value={editingPrescriber.name}
                  onChange={(e) => setEditingPrescriber({ ...editingPrescriber, name: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.prescriptionFill.drJohnSmith', 'Dr. John Smith')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.npi', 'NPI *')}</label>
                  <input
                    type="text"
                    value={editingPrescriber.npi}
                    onChange={(e) => setEditingPrescriber({ ...editingPrescriber, npi: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    placeholder={t('tools.prescriptionFill.10DigitNpi', '10-digit NPI')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.deaNumber', 'DEA Number')}</label>
                  <input
                    type="text"
                    value={editingPrescriber.deaNumber}
                    onChange={(e) => setEditingPrescriber({ ...editingPrescriber, deaNumber: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={editingPrescriber.phone}
                    onChange={(e) => setEditingPrescriber({ ...editingPrescriber, phone: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.fax', 'Fax')}</label>
                  <input
                    type="tel"
                    value={editingPrescriber.fax}
                    onChange={(e) => setEditingPrescriber({ ...editingPrescriber, fax: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.address2', 'Address')}</label>
                <input
                  type="text"
                  value={editingPrescriber.address}
                  onChange={(e) => setEditingPrescriber({ ...editingPrescriber, address: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowPrescriberModal(false); setEditingPrescriber(null); }}
                className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                {t('tools.prescriptionFill.cancel3', 'Cancel')}
              </button>
              <button onClick={handleSavePrescriber} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fill Modal */}
      {showFillModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>{t('tools.prescriptionFill.fillPrescription', 'Fill Prescription')}</h2>
              <button onClick={() => { setShowFillModal(false); setSelectedPrescription(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <p className={`font-medium ${textPrimary}`}>
                  {selectedPrescription.drugName} {selectedPrescription.strength}
                </p>
                <p className={textSecondary}>Rx#: {selectedPrescription.rxNumber}</p>
                <p className={textSecondary}>Patient: {getPatientName(selectedPrescription.patientId)}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.pharmacistName', 'Pharmacist Name *')}</label>
                <input
                  type="text"
                  value={fillForm.pharmacistName}
                  onChange={(e) => setFillForm({ ...fillForm, pharmacistName: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.quantityDispensed', 'Quantity Dispensed')}</label>
                  <input
                    type="number"
                    value={fillForm.quantityDispensed}
                    onChange={(e) => setFillForm({ ...fillForm, quantityDispensed: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.lotNumber', 'Lot Number')}</label>
                  <input
                    type="text"
                    value={fillForm.lotNumber}
                    onChange={(e) => setFillForm({ ...fillForm, lotNumber: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.expirationDate', 'Expiration Date')}</label>
                  <input
                    type="date"
                    value={fillForm.expirationDate}
                    onChange={(e) => setFillForm({ ...fillForm, expirationDate: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.prescriptionFill.verifiedBy', 'Verified By')}</label>
                  <input
                    type="text"
                    value={fillForm.verifiedBy}
                    onChange={(e) => setFillForm({ ...fillForm, verifiedBy: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowFillModal(false); setSelectedPrescription(null); }}
                className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                {t('tools.prescriptionFill.cancel4', 'Cancel')}
              </button>
              <button
                onClick={handleFillPrescription}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Complete Fill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40">
          <AlertCircle className="w-5 h-5" />
          <span>{validationMessage}</span>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default PrescriptionFillTool;
