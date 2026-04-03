'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pill,
  Plus,
  Trash2,
  Search,
  Calendar,
  Clock,
  User,
  PawPrint,
  X,
  Edit2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Printer,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface VetPrescriptionToolProps {
  uiConfig?: UIConfig;
}

// Types
type PrescriptionStatus = 'active' | 'refill-needed' | 'expired' | 'discontinued' | 'completed';
type MedicationType = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'drops' | 'chewable' | 'other';
type FrequencyType = 'once-daily' | 'twice-daily' | 'three-times-daily' | 'every-other-day' | 'weekly' | 'as-needed' | 'other';

interface Prescription {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petWeight: number;
  petWeightUnit: 'kg' | 'lbs';
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  medicationName: string;
  medicationType: MedicationType;
  strength: string;
  dosage: string;
  frequency: FrequencyType;
  frequencyCustom: string;
  route: string;
  quantity: number;
  refillsAllowed: number;
  refillsRemaining: number;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  diagnosis: string;
  instructions: string;
  warnings: string;
  status: PrescriptionStatus;
  dispensedDate: string;
  pharmacy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RefillHistory {
  id: string;
  prescriptionId: string;
  refillDate: string;
  quantity: number;
  dispensedBy: string;
  notes: string;
}

// Constants
const MEDICATION_TYPES: { value: MedicationType; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid/Oral Solution' },
  { value: 'injection', label: 'Injection' },
  { value: 'topical', label: 'Topical/Ointment' },
  { value: 'drops', label: 'Drops (Eye/Ear)' },
  { value: 'chewable', label: 'Chewable' },
  { value: 'other', label: 'Other' },
];

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string; perDay: number }[] = [
  { value: 'once-daily', label: 'Once Daily (q24h)', perDay: 1 },
  { value: 'twice-daily', label: 'Twice Daily (q12h)', perDay: 2 },
  { value: 'three-times-daily', label: 'Three Times Daily (q8h)', perDay: 3 },
  { value: 'every-other-day', label: 'Every Other Day', perDay: 0.5 },
  { value: 'weekly', label: 'Weekly', perDay: 0.14 },
  { value: 'as-needed', label: 'As Needed (PRN)', perDay: 0 },
  { value: 'other', label: 'Custom Schedule', perDay: 0 },
];

const STATUS_OPTIONS: { value: PrescriptionStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'refill-needed', label: 'Refill Needed', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
  { value: 'discontinued', label: 'Discontinued', color: 'bg-gray-100 text-gray-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
];

const COMMON_MEDICATIONS = [
  { name: 'Amoxicillin', type: 'capsule', common: true },
  { name: 'Carprofen (Rimadyl)', type: 'chewable', common: true },
  { name: 'Metronidazole', type: 'tablet', common: true },
  { name: 'Prednisone', type: 'tablet', common: true },
  { name: 'Apoquel', type: 'tablet', common: true },
  { name: 'Gabapentin', type: 'capsule', common: true },
  { name: 'Trazodone', type: 'tablet', common: true },
  { name: 'Cerenia', type: 'tablet', common: true },
  { name: 'Heartgard Plus', type: 'chewable', common: true },
  { name: 'Simparica Trio', type: 'chewable', common: true },
  { name: 'Revolution Plus', type: 'topical', common: true },
  { name: 'Frontline Plus', type: 'topical', common: true },
];

const VETERINARIANS = [
  'Dr. Smith',
  'Dr. Johnson',
  'Dr. Williams',
  'Dr. Brown',
  'Dr. Davis',
];

// Column configurations for exports
const PRESCRIPTION_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'ownerName', header: 'Owner', type: 'string' },
  { key: 'medicationName', header: 'Medication', type: 'string' },
  { key: 'strength', header: 'Strength', type: 'string' },
  { key: 'dosage', header: 'Dosage', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'refillsRemaining', header: 'Refills Left', type: 'number' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'prescribedBy', header: 'Prescriber', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateDaysRemaining = (endDate: string): number => {
  if (!endDate) return 999;
  const today = new Date();
  const end = new Date(endDate);
  return Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getPrescriptionStatus = (rx: Prescription): PrescriptionStatus => {
  const daysRemaining = calculateDaysRemaining(rx.endDate);
  if (rx.status === 'discontinued') return 'discontinued';
  if (daysRemaining < 0) return 'expired';
  if (rx.refillsRemaining > 0 && daysRemaining <= 7) return 'refill-needed';
  if (daysRemaining <= 0) return 'completed';
  return 'active';
};

// Main Component
export const VetPrescriptionTool: React.FC<VetPrescriptionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: prescriptions,
    addItem: addPrescriptionToBackend,
    updateItem: updatePrescriptionBackend,
    deleteItem: deletePrescriptionBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Prescription>('vet-prescriptions', [], PRESCRIPTION_COLUMNS);

  const {
    data: refillHistory,
    addItem: addRefillToBackend,
  } = useToolData<RefillHistory>('vet-refill-history', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'refills' | 'alerts'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showRefillForm, setShowRefillForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [newPrescription, setNewPrescription] = useState<Partial<Prescription>>({
    petName: '',
    petSpecies: 'dog',
    petWeight: 0,
    petWeightUnit: 'lbs',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    medicationName: '',
    medicationType: 'tablet',
    strength: '',
    dosage: '',
    frequency: 'twice-daily',
    frequencyCustom: '',
    route: 'oral',
    quantity: 30,
    refillsAllowed: 0,
    refillsRemaining: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    prescribedBy: VETERINARIANS[0],
    diagnosis: '',
    instructions: '',
    warnings: '',
    status: 'active',
    dispensedDate: new Date().toISOString().split('T')[0],
    pharmacy: '',
    notes: '',
  });

  const [newRefill, setNewRefill] = useState({
    quantity: 30,
    dispensedBy: '',
    notes: '',
  });

  // Add prescription
  const addPrescription = () => {
    if (!newPrescription.petName || !newPrescription.medicationName || !newPrescription.dosage) {
      setValidationMessage('Please fill in required fields (Pet Name, Medication, Dosage)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const prescription: Prescription = {
      id: editingPrescription?.id || generateId(),
      petId: newPrescription.petId || generateId(),
      petName: newPrescription.petName || '',
      petSpecies: newPrescription.petSpecies || 'dog',
      petWeight: newPrescription.petWeight || 0,
      petWeightUnit: newPrescription.petWeightUnit || 'lbs',
      ownerName: newPrescription.ownerName || '',
      ownerPhone: newPrescription.ownerPhone || '',
      ownerEmail: newPrescription.ownerEmail || '',
      medicationName: newPrescription.medicationName || '',
      medicationType: (newPrescription.medicationType as MedicationType) || 'tablet',
      strength: newPrescription.strength || '',
      dosage: newPrescription.dosage || '',
      frequency: (newPrescription.frequency as FrequencyType) || 'twice-daily',
      frequencyCustom: newPrescription.frequencyCustom || '',
      route: newPrescription.route || 'oral',
      quantity: newPrescription.quantity || 30,
      refillsAllowed: newPrescription.refillsAllowed || 0,
      refillsRemaining: newPrescription.refillsRemaining || newPrescription.refillsAllowed || 0,
      startDate: newPrescription.startDate || '',
      endDate: newPrescription.endDate || '',
      prescribedBy: newPrescription.prescribedBy || '',
      diagnosis: newPrescription.diagnosis || '',
      instructions: newPrescription.instructions || '',
      warnings: newPrescription.warnings || '',
      status: (newPrescription.status as PrescriptionStatus) || 'active',
      dispensedDate: newPrescription.dispensedDate || '',
      pharmacy: newPrescription.pharmacy || '',
      notes: newPrescription.notes || '',
      createdAt: editingPrescription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPrescription) {
      updatePrescriptionBackend(prescription.id, prescription);
    } else {
      addPrescriptionToBackend(prescription);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewPrescription({
      petName: '',
      petSpecies: 'dog',
      petWeight: 0,
      petWeightUnit: 'lbs',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      medicationName: '',
      medicationType: 'tablet',
      strength: '',
      dosage: '',
      frequency: 'twice-daily',
      frequencyCustom: '',
      route: 'oral',
      quantity: 30,
      refillsAllowed: 0,
      refillsRemaining: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      prescribedBy: VETERINARIANS[0],
      diagnosis: '',
      instructions: '',
      warnings: '',
      status: 'active',
      dispensedDate: new Date().toISOString().split('T')[0],
      pharmacy: '',
      notes: '',
    });
    setEditingPrescription(null);
    setShowForm(false);
  };

  // Process refill
  const processRefill = () => {
    const prescription = prescriptions.find(p => p.id === selectedPrescriptionId);
    if (!prescription || prescription.refillsRemaining <= 0) {
      setValidationMessage('No refills remaining for this prescription');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Add refill history
    const refill: RefillHistory = {
      id: generateId(),
      prescriptionId: selectedPrescriptionId,
      refillDate: new Date().toISOString(),
      quantity: newRefill.quantity,
      dispensedBy: newRefill.dispensedBy,
      notes: newRefill.notes,
    };
    addRefillToBackend(refill);

    // Update prescription
    updatePrescriptionBackend(selectedPrescriptionId, {
      refillsRemaining: prescription.refillsRemaining - 1,
      dispensedDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });

    setShowRefillForm(false);
    setNewRefill({ quantity: 30, dispensedBy: '', notes: '' });
    setSelectedPrescriptionId('');
  };

  // Edit prescription
  const editPrescription = (prescription: Prescription) => {
    setNewPrescription(prescription);
    setEditingPrescription(prescription);
    setShowForm(true);
  };

  // Discontinue prescription
  const discontinuePrescription = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to discontinue this prescription?');
    if (confirmed) {
      updatePrescriptionBackend(id, {
        status: 'discontinued',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Delete prescription
  const deletePrescription = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this prescription? This cannot be undone.');
    if (confirmed) {
      deletePrescriptionBackend(id);
    }
  };

  // Filtered prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(rx => {
      const matchesSearch =
        searchTerm === '' ||
        rx.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
      const currentStatus = getPrescriptionStatus(rx);
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [prescriptions, searchTerm, statusFilter]);

  // Prescriptions needing attention
  const alertPrescriptions = useMemo(() => {
    return prescriptions.filter(rx => {
      const status = getPrescriptionStatus(rx);
      return status === 'refill-needed' || status === 'expired';
    });
  }, [prescriptions]);

  // Stats
  const stats = useMemo(() => {
    const active = prescriptions.filter(rx => getPrescriptionStatus(rx) === 'active').length;
    const refillNeeded = prescriptions.filter(rx => getPrescriptionStatus(rx) === 'refill-needed').length;
    const expired = prescriptions.filter(rx => getPrescriptionStatus(rx) === 'expired').length;
    const totalRefills = refillHistory.length;
    return { active, refillNeeded, expired, totalRefills };
  }, [prescriptions, refillHistory]);

  // Get status color
  const getStatusColor = (status: PrescriptionStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  // Get prescription refill history
  const getPrescriptionRefills = (prescriptionId: string) => {
    return refillHistory
      .filter(r => r.prescriptionId === prescriptionId)
      .sort((a, b) => new Date(b.refillDate).getTime() - new Date(a.refillDate).getTime());
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.vetPrescription.veterinaryPrescriptions', 'Veterinary Prescriptions')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.vetPrescription.managePetPrescriptionsAndRefills', 'Manage pet prescriptions and refills')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="vet-prescription" toolName="Vet Prescription" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(prescriptions, PRESCRIPTION_COLUMNS, { filename: 'vet-prescriptions' })}
                onExportExcel={() => exportToExcel(prescriptions, PRESCRIPTION_COLUMNS, { filename: 'vet-prescriptions' })}
                onExportJSON={() => exportToJSON(prescriptions, { filename: 'vet-prescriptions' })}
                onExportPDF={async () => {
                  await exportToPDF(prescriptions, PRESCRIPTION_COLUMNS, {
                    filename: 'vet-prescriptions',
                    title: 'Veterinary Prescriptions',
                    subtitle: `${prescriptions.length} prescriptions`,
                  });
                }}
                onPrint={() => printData(prescriptions, PRESCRIPTION_COLUMNS, { title: 'Veterinary Prescriptions' })}
                onCopyToClipboard={async () => await copyUtil(prescriptions, PRESCRIPTION_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'prescriptions', label: 'All Prescriptions', icon: <FileText className="w-4 h-4" /> },
              { id: 'refills', label: 'Refill History', icon: <RefreshCw className="w-4 h-4" /> },
              { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'alerts' && alertPrescriptions.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {alertPrescriptions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.vetPrescription.searchPrescriptions', 'Search prescriptions...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.vetPrescription.allStatuses', 'All Statuses')}</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.vetPrescription.newPrescription', 'New Prescription')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.active}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.active', 'Active')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.refillNeeded}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.refillNeeded', 'Refill Needed')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.expired}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.expired', 'Expired')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalRefills}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.totalRefills', 'Total Refills')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-3">
            {filteredPrescriptions.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <Pill className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.noPrescriptionsFound', 'No prescriptions found')}</p>
              </div>
            ) : (
              filteredPrescriptions.map(rx => {
                const status = getPrescriptionStatus(rx);
                const daysRemaining = calculateDaysRemaining(rx.endDate);
                const rxRefills = getPrescriptionRefills(rx.id);

                return (
                  <div key={rx.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            status === 'active' ? 'bg-green-100' :
                            status === 'refill-needed' ? 'bg-yellow-100' :
                            status === 'expired' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            <Pill className={`w-6 h-6 ${
                              status === 'active' ? 'text-green-600' :
                              status === 'refill-needed' ? 'text-yellow-600' :
                              status === 'expired' ? 'text-red-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {rx.medicationName}
                              </h3>
                              <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(status)}`}>
                                {status.replace('-', ' ')}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {rx.strength} - {rx.dosage} {FREQUENCY_OPTIONS.find(f => f.value === rx.frequency)?.label}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              <PawPrint className="w-3 h-3 inline mr-1" />
                              {rx.petName} ({rx.petSpecies}) | Owner: {rx.ownerName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {rx.refillsRemaining}/{rx.refillsAllowed} refills
                            </p>
                            <p className={`text-xs ${daysRemaining <= 7 ? 'text-red-600' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </p>
                          </div>
                          {expandedId === rx.id ? (
                            <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedId === rx.id && (
                      <div className={`px-4 pb-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.vetPrescription.prescriptionDetails', 'Prescription Details')}</h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p><strong>{t('tools.vetPrescription.type', 'Type:')}</strong> {MEDICATION_TYPES.find(t => t.value === rx.medicationType)?.label}</p>
                              <p><strong>{t('tools.vetPrescription.route', 'Route:')}</strong> {rx.route}</p>
                              <p><strong>{t('tools.vetPrescription.quantity', 'Quantity:')}</strong> {rx.quantity}</p>
                              <p><strong>{t('tools.vetPrescription.prescribedBy', 'Prescribed By:')}</strong> {rx.prescribedBy}</p>
                              <p><strong>{t('tools.vetPrescription.startDate', 'Start Date:')}</strong> {formatDate(rx.startDate)}</p>
                              <p><strong>{t('tools.vetPrescription.endDate', 'End Date:')}</strong> {formatDate(rx.endDate)}</p>
                              {rx.diagnosis && <p><strong>{t('tools.vetPrescription.diagnosis', 'Diagnosis:')}</strong> {rx.diagnosis}</p>}
                            </div>
                          </div>
                          <div>
                            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.vetPrescription.instructions', 'Instructions')}</h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {rx.instructions && <p>{rx.instructions}</p>}
                              {rx.warnings && (
                                <p className="text-red-600">
                                  <AlertCircle className="w-3 h-3 inline mr-1" />
                                  {rx.warnings}
                                </p>
                              )}
                              {rx.notes && <p><strong>{t('tools.vetPrescription.notes', 'Notes:')}</strong> {rx.notes}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Refill History */}
                        {rxRefills.length > 0 && (
                          <div className="mt-4">
                            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.vetPrescription.refillHistory', 'Refill History')}</h4>
                            <div className="space-y-2">
                              {rxRefills.slice(0, 3).map(refill => (
                                <div key={refill.id} className={`p-2 rounded text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                    {formatDate(refill.refillDate)} - Qty: {refill.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          {rx.refillsRemaining > 0 && status !== 'discontinued' && status !== 'expired' && (
                            <button
                              onClick={() => {
                                setSelectedPrescriptionId(rx.id);
                                setNewRefill({ ...newRefill, quantity: rx.quantity });
                                setShowRefillForm(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0B8478]"
                            >
                              <RefreshCw className="w-4 h-4" /> Refill
                            </button>
                          )}
                          <button
                            onClick={() => editPrescription(rx)}
                            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          {status === 'active' && (
                            <button
                              onClick={() => discontinuePrescription(rx.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                            >
                              {t('tools.vetPrescription.discontinue', 'Discontinue')}
                            </button>
                          )}
                          <button
                            onClick={() => deletePrescription(rx.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Refill History Tab */}
        {activeTab === 'refills' && (
          <div className="space-y-3">
            {refillHistory.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <RefreshCw className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.noRefillHistoryYet', 'No refill history yet')}</p>
              </div>
            ) : (
              refillHistory
                .sort((a, b) => new Date(b.refillDate).getTime() - new Date(a.refillDate).getTime())
                .map(refill => {
                  const prescription = prescriptions.find(p => p.id === refill.prescriptionId);
                  return (
                    <div key={refill.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {prescription?.medicationName || 'Unknown'}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {prescription?.petName} - Qty: {refill.quantity}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatDate(refill.refillDate)} | Dispensed by: {refill.dispensedBy || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alertPrescriptions.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.noAlertsAllPrescriptionsAre', 'No alerts - all prescriptions are up to date!')}</p>
              </div>
            ) : (
              alertPrescriptions.map(rx => {
                const status = getPrescriptionStatus(rx);
                return (
                  <div
                    key={rx.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 border-l-4 ${
                      status === 'expired' ? 'border-red-500' : 'border-yellow-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {status === 'expired' ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          )}
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {rx.medicationName} - {rx.petName}
                          </h3>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {status === 'expired'
                            ? 'Prescription has expired'
                            : `Refill needed - ${rx.refillsRemaining} refills remaining`
                          }
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Owner: {rx.ownerName} | Phone: {rx.ownerPhone || 'N/A'}
                        </p>
                      </div>
                      {status !== 'expired' && rx.refillsRemaining > 0 && (
                        <button
                          onClick={() => {
                            setSelectedPrescriptionId(rx.id);
                            setShowRefillForm(true);
                          }}
                          className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors text-sm"
                        >
                          {t('tools.vetPrescription.processRefill', 'Process Refill')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Add/Edit Prescription Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingPrescription ? t('tools.vetPrescription.editPrescription', 'Edit Prescription') : t('tools.vetPrescription.newPrescription2', 'New Prescription')}
                  </h2>
                  <button onClick={resetForm} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Pet Info */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.vetPrescription.patientInformation', 'Patient Information')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t('tools.vetPrescription.petName', 'Pet Name *')}
                        value={newPrescription.petName}
                        onChange={(e) => setNewPrescription({ ...newPrescription, petName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <select
                        value={newPrescription.petSpecies}
                        onChange={(e) => setNewPrescription({ ...newPrescription, petSpecies: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="dog">{t('tools.vetPrescription.dog', 'Dog')}</option>
                        <option value="cat">{t('tools.vetPrescription.cat', 'Cat')}</option>
                        <option value="other">{t('tools.vetPrescription.other', 'Other')}</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder={t('tools.vetPrescription.weight', 'Weight')}
                          value={newPrescription.petWeight || ''}
                          onChange={(e) => setNewPrescription({ ...newPrescription, petWeight: parseFloat(e.target.value) || 0 })}
                          className={`flex-1 px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                        <select
                          value={newPrescription.petWeightUnit}
                          onChange={(e) => setNewPrescription({ ...newPrescription, petWeightUnit: e.target.value as 'kg' | 'lbs' })}
                          className={`w-20 px-2 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder={t('tools.vetPrescription.ownerName', 'Owner Name')}
                        value={newPrescription.ownerName}
                        onChange={(e) => setNewPrescription({ ...newPrescription, ownerName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  {/* Medication Info */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.vetPrescription.medicationDetails', 'Medication Details')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t('tools.vetPrescription.medicationName', 'Medication Name *')}
                        value={newPrescription.medicationName}
                        onChange={(e) => setNewPrescription({ ...newPrescription, medicationName: e.target.value })}
                        list="common-meds"
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <datalist id="common-meds">
                        {COMMON_MEDICATIONS.map(med => (
                          <option key={med.name} value={med.name} />
                        ))}
                      </datalist>
                      <select
                        value={newPrescription.medicationType}
                        onChange={(e) => setNewPrescription({ ...newPrescription, medicationType: e.target.value as MedicationType })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        {MEDICATION_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder={t('tools.vetPrescription.strengthEG500mg', 'Strength (e.g., 500mg)')}
                        value={newPrescription.strength}
                        onChange={(e) => setNewPrescription({ ...newPrescription, strength: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.vetPrescription.dosageEG1Tablet', 'Dosage (e.g., 1 tablet) *')}
                        value={newPrescription.dosage}
                        onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <select
                        value={newPrescription.frequency}
                        onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value as FrequencyType })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        {FREQUENCY_OPTIONS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder={t('tools.vetPrescription.quantity2', 'Quantity')}
                        value={newPrescription.quantity || ''}
                        onChange={(e) => setNewPrescription({ ...newPrescription, quantity: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  {/* Dates and Refills */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.vetPrescription.durationRefills', 'Duration & Refills')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.startDate2', 'Start Date')}</label>
                        <input
                          type="date"
                          value={newPrescription.startDate}
                          onChange={(e) => setNewPrescription({ ...newPrescription, startDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetPrescription.endDate2', 'End Date')}</label>
                        <input
                          type="date"
                          value={newPrescription.endDate}
                          onChange={(e) => setNewPrescription({ ...newPrescription, endDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <input
                        type="number"
                        placeholder={t('tools.vetPrescription.refillsAllowed', 'Refills Allowed')}
                        value={newPrescription.refillsAllowed || ''}
                        onChange={(e) => {
                          const refills = parseInt(e.target.value) || 0;
                          setNewPrescription({
                            ...newPrescription,
                            refillsAllowed: refills,
                            refillsRemaining: refills,
                          });
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <select
                        value={newPrescription.prescribedBy}
                        onChange={(e) => setNewPrescription({ ...newPrescription, prescribedBy: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        {VETERINARIANS.map(vet => (
                          <option key={vet} value={vet}>{vet}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.vetPrescription.additionalInformation', 'Additional Information')}</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder={t('tools.vetPrescription.diagnosis2', 'Diagnosis')}
                        value={newPrescription.diagnosis}
                        onChange={(e) => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <textarea
                        placeholder={t('tools.vetPrescription.instructionsForPetOwner', 'Instructions for pet owner')}
                        value={newPrescription.instructions}
                        onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <textarea
                        placeholder={t('tools.vetPrescription.warningsSideEffects', 'Warnings/Side Effects')}
                        value={newPrescription.warnings}
                        onChange={(e) => setNewPrescription({ ...newPrescription, warnings: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={addPrescription}
                    className="w-full py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors font-medium"
                  >
                    {editingPrescription ? t('tools.vetPrescription.updatePrescription', 'Update Prescription') : t('tools.vetPrescription.createPrescription', 'Create Prescription')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refill Modal */}
        {showRefillForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.vetPrescription.processRefill2', 'Process Refill')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRefillForm(false);
                      setSelectedPrescriptionId('');
                    }}
                    className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder={t('tools.vetPrescription.quantity3', 'Quantity')}
                    value={newRefill.quantity}
                    onChange={(e) => setNewRefill({ ...newRefill, quantity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.vetPrescription.dispensedBy', 'Dispensed By')}
                    value={newRefill.dispensedBy}
                    onChange={(e) => setNewRefill({ ...newRefill, dispensedBy: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <textarea
                    placeholder={t('tools.vetPrescription.notes2', 'Notes')}
                    value={newRefill.notes}
                    onChange={(e) => setNewRefill({ ...newRefill, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <button
                    onClick={processRefill}
                    className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
                  >
                    {t('tools.vetPrescription.processRefill3', 'Process Refill')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetPrescriptionTool;
