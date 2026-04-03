'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Pill,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  Building2,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Bell,
  History,
  RefreshCw,
  User,
  Package,
  Shield,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
  Loader2,
} from 'lucide-react';

// Types
interface Pharmacy {
  name: string;
  phone: string;
  address: string;
}

interface ReminderSchedule {
  times: string[];
  daysOfWeek: number[];
  enabled: boolean;
}

interface AdherenceRecord {
  id: string;
  date: string;
  time: string;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
}

interface HistoryLog {
  id: string;
  date: string;
  action: string;
  details: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribingDoctor: string;
  lastFilled: string;
  quantity: number;
  refillsRemaining: number;
  pharmacy: Pharmacy;
  sideEffects: string;
  interactions: string[];
  reminderSchedule: ReminderSchedule;
  costPerRefill: number;
  isGeneric: boolean;
  brandName?: string;
  genericName?: string;
  insuranceCoverage: string;
  adherenceRecords: AdherenceRecord[];
  historyLog: HistoryLog[];
  createdAt: string;
  notes: string;
  active: boolean;
}

// Common drug interactions database
const COMMON_INTERACTIONS: Record<string, string[]> = {
  'warfarin': ['aspirin', 'ibuprofen', 'naproxen', 'vitamin k', 'garlic supplements'],
  'aspirin': ['warfarin', 'ibuprofen', 'blood thinners', 'alcohol'],
  'metformin': ['alcohol', 'contrast dye', 'furosemide'],
  'lisinopril': ['potassium supplements', 'spironolactone', 'nsaids'],
  'atorvastatin': ['grapefruit', 'niacin', 'gemfibrozil', 'cyclosporine'],
  'amlodipine': ['simvastatin', 'grapefruit', 'cyclosporine'],
  'omeprazole': ['clopidogrel', 'methotrexate', 'digoxin'],
  'levothyroxine': ['calcium supplements', 'iron supplements', 'antacids'],
  'metoprolol': ['verapamil', 'clonidine', 'insulin'],
  'gabapentin': ['alcohol', 'opioids', 'antacids'],
  'sertraline': ['maois', 'tramadol', 'warfarin', 'nsaids'],
  'fluoxetine': ['maois', 'tramadol', 'warfarin', 'triptans'],
  'amoxicillin': ['warfarin', 'methotrexate', 'birth control pills'],
  'prednisone': ['nsaids', 'warfarin', 'diuretics', 'insulin'],
  'hydrochlorothiazide': ['lithium', 'digoxin', 'nsaids'],
};

const defaultMedication: Omit<Medication, 'id' | 'createdAt' | 'adherenceRecords' | 'historyLog'> = {
  name: '',
  dosage: '',
  frequency: 'Once daily',
  prescribingDoctor: '',
  lastFilled: '',
  quantity: 30,
  refillsRemaining: 0,
  pharmacy: { name: '', phone: '', address: '' },
  sideEffects: '',
  interactions: [],
  reminderSchedule: { times: ['08:00'], daysOfWeek: [0, 1, 2, 3, 4, 5, 6], enabled: false },
  costPerRefill: 0,
  isGeneric: true,
  brandName: '',
  genericName: '',
  insuranceCoverage: '',
  notes: '',
  active: true,
};

const frequencyOptions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'Once weekly',
  'Twice weekly',
  'As needed',
  'Before meals',
  'After meals',
  'At bedtime',
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Column configuration for exports and sync
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Medication Name', type: 'string' },
  { key: 'dosage', header: 'Dosage', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'prescribingDoctor', header: 'Prescribing Doctor', type: 'string' },
  { key: 'lastFilled', header: 'Last Filled', type: 'date' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'refillsRemaining', header: 'Refills Remaining', type: 'number' },
  { key: 'pharmacyName', header: 'Pharmacy', type: 'string' },
  { key: 'pharmacyPhone', header: 'Pharmacy Phone', type: 'string' },
  { key: 'costPerRefill', header: 'Cost Per Refill', type: 'currency' },
  { key: 'insuranceCoverage', header: 'Insurance Coverage', type: 'string' },
  { key: 'isGeneric', header: 'Is Generic', type: 'boolean' },
  { key: 'brandName', header: 'Brand Name', type: 'string' },
  { key: 'genericName', header: 'Generic Name', type: 'string' },
  { key: 'sideEffects', header: 'Side Effects', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'active', header: 'Active', type: 'boolean' },
  { key: 'adherenceRate', header: 'Adherence Rate (%)', type: 'number' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

interface PrescriptionTrackerToolProps {
  uiConfig?: UIConfig;
}

export const PrescriptionTrackerTool = ({ uiConfig }: PrescriptionTrackerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: medications,
    setData: setMedications,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Medication>('prescription-tracker', [], COLUMNS);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultMedication);
  const [activeTab, setActiveTab] = useState<'list' | 'adherence' | 'history' | 'interactions'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedMedication, setExpandedMedication] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [logAdherenceModal, setLogAdherenceModal] = useState<{ medId: string; show: boolean } | null>(null);
  const [adherenceStatus, setAdherenceStatus] = useState<'taken' | 'missed' | 'skipped'>('taken');
  const [adherenceNotes, setAdherenceNotes] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Medication name can be prefilled
      if (params.texts && params.texts.length > 0) {
        setFormData(prev => ({ ...prev, name: params.texts![0] }));
        setShowForm(true);
        setIsPrefilled(true);
      }
      // Search query from notes
      if (params.notes) {
        setSearchQuery(params.notes);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Check for drug interactions
  const checkInteractions = useMemo(() => {
    const activeMeds = medications.filter(m => m.active);
    const warnings: { med1: string; med2: string; warning: string }[] = [];

    activeMeds.forEach((med1, i) => {
      activeMeds.slice(i + 1).forEach(med2 => {
        const med1Name = med1.name.toLowerCase();
        const med2Name = med2.name.toLowerCase();

        // Check if med1 has interactions with med2
        Object.entries(COMMON_INTERACTIONS).forEach(([drug, interactions]) => {
          if (med1Name.includes(drug) && interactions.some(int => med2Name.includes(int))) {
            warnings.push({
              med1: med1.name,
              med2: med2.name,
              warning: `${med1.name} may interact with ${med2.name}. Consult your doctor or pharmacist.`,
            });
          }
          if (med2Name.includes(drug) && interactions.some(int => med1Name.includes(int))) {
            warnings.push({
              med1: med2.name,
              med2: med1.name,
              warning: `${med2.name} may interact with ${med1.name}. Consult your doctor or pharmacist.`,
            });
          }
        });
      });
    });

    return warnings;
  }, [medications]);

  // Filter medications
  const filteredMedications = useMemo(() => {
    return medications.filter(med => {
      const matchesSearch =
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.prescribingDoctor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterActive === 'all' ||
        (filterActive === 'active' && med.active) ||
        (filterActive === 'inactive' && !med.active);
      return matchesSearch && matchesFilter;
    });
  }, [medications, searchQuery, filterActive]);

  // Calculate adherence rate
  const calculateAdherenceRate = (records: AdherenceRecord[]) => {
    if (records.length === 0) return 0;
    const taken = records.filter(r => r.status === 'taken').length;
    return Math.round((taken / records.length) * 100);
  };

  // Calculate total monthly cost
  const totalMonthlyCost = useMemo(() => {
    return medications
      .filter(m => m.active)
      .reduce((sum, med) => sum + (med.costPerRefill / (med.quantity / 30)), 0);
  }, [medications]);

  // Generate unique ID
  const generateId = () => `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setValidationMessage('Please enter medication name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      const existingMed = medications.find(m => m.id === editingId);
      if (existingMed) {
        updateItem(editingId, {
          ...formData,
          historyLog: [
            ...existingMed.historyLog,
            {
              id: generateId(),
              date: now,
              action: 'Updated',
              details: 'Medication details updated',
            },
          ],
        });
      }
    } else {
      const newMed: Medication = {
        ...formData,
        id: generateId(),
        createdAt: now,
        adherenceRecords: [],
        historyLog: [
          {
            id: generateId(),
            date: now,
            action: 'Created',
            details: 'Medication added to tracker',
          },
        ],
      };
      addItem(newMed);
    }

    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData(defaultMedication);
    setShowForm(false);
    setEditingId(null);
  };

  // Edit medication
  const handleEdit = (med: Medication) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      prescribingDoctor: med.prescribingDoctor,
      lastFilled: med.lastFilled,
      quantity: med.quantity,
      refillsRemaining: med.refillsRemaining,
      pharmacy: med.pharmacy,
      sideEffects: med.sideEffects,
      interactions: med.interactions,
      reminderSchedule: med.reminderSchedule,
      costPerRefill: med.costPerRefill,
      isGeneric: med.isGeneric,
      brandName: med.brandName,
      genericName: med.genericName,
      insuranceCoverage: med.insuranceCoverage,
      notes: med.notes,
      active: med.active,
    });
    setEditingId(med.id);
    setShowForm(true);
  };

  // Delete medication
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this medication?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteItem(id);
  };

  // Toggle medication active status
  const toggleActive = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
      updateItem(id, {
        active: !med.active,
        historyLog: [
          ...med.historyLog,
          {
            id: generateId(),
            date: new Date().toISOString(),
            action: med.active ? 'Deactivated' : 'Activated',
            details: med.active ? 'Medication marked as inactive' : 'Medication marked as active',
          },
        ],
      });
    }
  };

  // Log adherence
  const handleLogAdherence = () => {
    if (!logAdherenceModal) return;

    const record: AdherenceRecord = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      status: adherenceStatus,
      notes: adherenceNotes || undefined,
    };

    const med = medications.find(m => m.id === logAdherenceModal.medId);
    if (med) {
      updateItem(logAdherenceModal.medId, {
        adherenceRecords: [...med.adherenceRecords, record],
        historyLog: [
          ...med.historyLog,
          {
            id: generateId(),
            date: new Date().toISOString(),
            action: 'Dose logged',
            details: `Status: ${adherenceStatus}${adherenceNotes ? ` - ${adherenceNotes}` : ''}`,
          },
        ],
      });
    }

    setLogAdherenceModal(null);
    setAdherenceStatus('taken');
    setAdherenceNotes('');
  };

  // Record refill
  const handleRecordRefill = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
      updateItem(id, {
        lastFilled: new Date().toISOString().split('T')[0],
        refillsRemaining: Math.max(0, med.refillsRemaining - 1),
        historyLog: [
          ...med.historyLog,
          {
            id: generateId(),
            date: new Date().toISOString(),
            action: 'Refilled',
            details: `Refills remaining: ${Math.max(0, med.refillsRemaining - 1)}`,
          },
        ],
      });
    }
  };

  // Calculate days until refill needed
  const getDaysUntilRefill = (med: Medication) => {
    if (!med.lastFilled || !med.quantity) return null;
    const lastFilled = new Date(med.lastFilled);
    const daysSupply = med.quantity;
    const refillDate = new Date(lastFilled);
    refillDate.setDate(refillDate.getDate() + daysSupply);
    const today = new Date();
    const diff = Math.ceil((refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.prescriptionTracker.prescriptionTracker', 'Prescription Tracker')}
                  </CardTitle>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.prescriptionTracker.manageYourMedicationsAndTrack', 'Manage your medications and track adherence')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WidgetEmbedButton toolSlug="prescription-tracker" toolName="Prescription Tracker" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'prescriptions' })}
                  onExportExcel={() => exportExcel({ filename: 'prescriptions' })}
                  onExportJSON={() => exportJSON({ filename: 'prescriptions' })}
                  onExportPDF={() => exportPDF({
                    filename: 'prescriptions',
                    title: 'Prescription Tracker Report',
                    subtitle: `${medications.length} medications tracked`,
                    orientation: 'landscape',
                  })}
                  onPrint={() => print('Prescription Tracker Report')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  disabled={medications.length === 0}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.prescriptionTracker.addMedication', 'Add Medication')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionTracker.activeMedications', 'Active Medications')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {medications.filter(m => m.active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionTracker.avgAdherence', 'Avg Adherence')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {medications.length > 0
                      ? Math.round(
                          medications.reduce((sum, m) => sum + calculateAdherenceRate(m.adherenceRecords), 0) /
                            medications.length
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionTracker.interactions', 'Interactions')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {checkInteractions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionTracker.monthlyCost', 'Monthly Cost')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${totalMonthlyCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interaction Warnings */}
        {checkInteractions.length > 0 && (
          <Card className={`mb-6 border-yellow-500 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                    {t('tools.prescriptionTracker.drugInteractionWarnings', 'Drug Interaction Warnings')}
                  </h3>
                  <ul className="space-y-1">
                    {checkInteractions.map((warning, index) => (
                      <li key={index} className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        {warning.warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['list', 'adherence', 'history', 'interactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab === 'list' && 'Medications'}
              {tab === 'adherence' && 'Adherence'}
              {tab === 'history' && 'History'}
              {tab === 'interactions' && 'Interactions'}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        {activeTab === 'list' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('tools.prescriptionTracker.searchMedicationsOrDoctors', 'Search medications or doctors...')}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === 'all'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.prescriptionTracker.all', 'All')}
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === 'active'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.prescriptionTracker.active', 'Active')}
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.prescriptionTracker.inactive', 'Inactive')}
              </button>
            </div>
          </div>
        )}

        {/* Medication List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {filteredMedications.length === 0 ? (
              <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="py-12 text-center">
                  <Pill className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.prescriptionTracker.noMedicationsFound', 'No medications found')}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('tools.prescriptionTracker.addYourFirstMedicationTo', 'Add your first medication to start tracking')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMedications.map(med => {
                const daysUntilRefill = getDaysUntilRefill(med);
                const adherenceRate = calculateAdherenceRate(med.adherenceRecords);
                const isExpanded = expandedMedication === med.id;

                return (
                  <Card
                    key={med.id}
                    className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${
                      !med.active ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Main Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {med.name}
                            </h3>
                            {!med.active && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-500 text-white rounded-full">
                                {t('tools.prescriptionTracker.inactive2', 'Inactive')}
                              </span>
                            )}
                            {med.isGeneric && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                                {t('tools.prescriptionTracker.generic', 'Generic')}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Package className="w-4 h-4" />
                              {med.dosage}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Clock className="w-4 h-4" />
                              {med.frequency}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <User className="w-4 h-4" />
                              Dr. {med.prescribingDoctor}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4">
                          <div className="text-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionTracker.adherence', 'Adherence')}</p>
                            <p
                              className={`text-lg font-bold ${
                                adherenceRate >= 80
                                  ? 'text-green-500'
                                  : adherenceRate >= 50
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {adherenceRate}%
                            </p>
                          </div>
                          <div className="text-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionTracker.refillsLeft', 'Refills Left')}</p>
                            <p
                              className={`text-lg font-bold ${
                                med.refillsRemaining === 0
                                  ? 'text-red-500'
                                  : med.refillsRemaining <= 2
                                  ? 'text-yellow-500'
                                  : theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {med.refillsRemaining}
                            </p>
                          </div>
                          {daysUntilRefill !== null && (
                            <div className="text-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionTracker.daysToRefill', 'Days to Refill')}</p>
                              <p
                                className={`text-lg font-bold ${
                                  daysUntilRefill <= 7
                                    ? 'text-red-500'
                                    : daysUntilRefill <= 14
                                    ? 'text-yellow-500'
                                    : theme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                {daysUntilRefill}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setLogAdherenceModal({ medId: med.id, show: true })}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title={t('tools.prescriptionTracker.logDose3', 'Log dose')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRecordRefill(med.id)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title={t('tools.prescriptionTracker.recordRefill', 'Record refill')}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(med)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                            title={t('tools.prescriptionTracker.edit', 'Edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(med.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                            title={med.active ? t('tools.prescriptionTracker.deactivate', 'Deactivate') : t('tools.prescriptionTracker.activate', 'Activate')}
                          >
                            {med.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExpandedMedication(isExpanded ? null : med.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                            title={t('tools.prescriptionTracker.details', 'Details')}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Pharmacy Info */}
                            <div>
                              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Building2 className="w-4 h-4" />
                                {t('tools.prescriptionTracker.pharmacy', 'Pharmacy')}
                              </h4>
                              <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p>{med.pharmacy.name || 'Not specified'}</p>
                                <p>{med.pharmacy.phone || ''}</p>
                                <p>{med.pharmacy.address || ''}</p>
                              </div>
                            </div>

                            {/* Refill Info */}
                            <div>
                              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Calendar className="w-4 h-4" />
                                {t('tools.prescriptionTracker.refillDetails', 'Refill Details')}
                              </h4>
                              <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p>Last filled: {med.lastFilled || 'Not recorded'}</p>
                                <p>Quantity: {med.quantity} units</p>
                                <p>Cost per refill: ${med.costPerRefill.toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Brand/Generic Info */}
                            <div>
                              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Package className="w-4 h-4" />
                                {t('tools.prescriptionTracker.brandGeneric', 'Brand/Generic')}
                              </h4>
                              <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p>Type: {med.isGeneric ? t('tools.prescriptionTracker.generic2', 'Generic') : t('tools.prescriptionTracker.brandName2', 'Brand Name')}</p>
                                {med.brandName && <p>Brand: {med.brandName}</p>}
                                {med.genericName && <p>Generic: {med.genericName}</p>}
                              </div>
                            </div>

                            {/* Insurance */}
                            <div>
                              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Shield className="w-4 h-4" />
                                {t('tools.prescriptionTracker.insuranceCoverage', 'Insurance Coverage')}
                              </h4>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {med.insuranceCoverage || 'Not specified'}
                              </p>
                            </div>

                            {/* Side Effects */}
                            <div>
                              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <AlertTriangle className="w-4 h-4" />
                                {t('tools.prescriptionTracker.sideEffects', 'Side Effects')}
                              </h4>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {med.sideEffects || 'None recorded'}
                              </p>
                            </div>

                            {/* Notes */}
                            <div>
                              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <FileText className="w-4 h-4" />
                                {t('tools.prescriptionTracker.notes', 'Notes')}
                              </h4>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {med.notes || 'No notes'}
                              </p>
                            </div>

                            {/* Reminder Schedule */}
                            <div className="md:col-span-2 lg:col-span-3">
                              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Bell className="w-4 h-4" />
                                {t('tools.prescriptionTracker.reminderSchedule', 'Reminder Schedule')}
                              </h4>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p>
                                  Status: {med.reminderSchedule.enabled ? t('tools.prescriptionTracker.enabled', 'Enabled') : t('tools.prescriptionTracker.disabled', 'Disabled')}
                                </p>
                                <p>
                                  Times: {med.reminderSchedule.times.join(', ') || 'Not set'}
                                </p>
                                <p>
                                  Days:{' '}
                                  {med.reminderSchedule.daysOfWeek.map(d => daysOfWeek[d]).join(', ') || 'Not set'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Adherence Tab */}
        {activeTab === 'adherence' && (
          <div className="space-y-4">
            {medications.filter(m => m.active).length === 0 ? (
              <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.prescriptionTracker.noActiveMedications', 'No active medications')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              medications
                .filter(m => m.active)
                .map(med => {
                  const recentRecords = [...med.adherenceRecords].reverse().slice(0, 10);
                  const adherenceRate = calculateAdherenceRate(med.adherenceRecords);

                  return (
                    <Card
                      key={med.id}
                      className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {med.name}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {med.dosage} - {med.frequency}
                            </p>
                          </div>
                          <div className="text-center">
                            <p
                              className={`text-3xl font-bold ${
                                adherenceRate >= 80
                                  ? 'text-green-500'
                                  : adherenceRate >= 50
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {adherenceRate}%
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.prescriptionTracker.adherenceRate', 'Adherence Rate')}
                            </p>
                          </div>
                        </div>

                        {/* Adherence Progress Bar */}
                        <div className="mb-4">
                          <div className={`h-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className={`h-3 rounded-full transition-all ${
                                adherenceRate >= 80
                                  ? 'bg-green-500'
                                  : adherenceRate >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${adherenceRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Recent Records */}
                        <div>
                          <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.prescriptionTracker.recentHistory', 'Recent History')}
                          </h4>
                          {recentRecords.length === 0 ? (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {t('tools.prescriptionTracker.noRecordsYetStartLogging', 'No records yet. Start logging your doses.')}
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {recentRecords.map(record => (
                                <div
                                  key={record.id}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    record.status === 'taken'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : record.status === 'missed'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                  }`}
                                  title={`${record.date} ${record.time}${record.notes ? ` - ${record.notes}` : ''}`}
                                >
                                  {record.date}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <select
                    value={selectedMedication || ''}
                    onChange={e => setSelectedMedication(e.target.value || null)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.prescriptionTracker.allMedications', 'All Medications')}</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {medications
                    .filter(m => !selectedMedication || m.id === selectedMedication)
                    .flatMap(med =>
                      med.historyLog.map(log => ({
                        ...log,
                        medicationName: med.name,
                      }))
                    )
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 50)
                    .map(log => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <History className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {log.medicationName}
                            </span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(log.date).toLocaleString()}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-medium">{log.action}:</span> {log.details}
                          </p>
                        </div>
                      </div>
                    ))}

                  {medications.flatMap(m => m.historyLog).length === 0 && (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tools.prescriptionTracker.noHistoryRecordsYet', 'No history records yet')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interactions Tab */}
        {activeTab === 'interactions' && (
          <div className="space-y-4">
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="pt-6">
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.prescriptionTracker.drugInteractionAnalysis', 'Drug Interaction Analysis')}
                </h3>

                {checkInteractions.length > 0 ? (
                  <div className="space-y-3">
                    {checkInteractions.map((warning, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-yellow-900/20 border-yellow-700'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                              {warning.med1} + {warning.med2}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                              {warning.warning}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.prescriptionTracker.noKnownInteractionsDetected', 'No known interactions detected')}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.prescriptionTracker.basedOnCommonDrugInteraction', 'Based on common drug interaction database')}
                    </p>
                  </div>
                )}

                <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>{t('tools.prescriptionTracker.disclaimer', 'Disclaimer:')}</strong> This tool provides basic drug interaction warnings based on common
                    interactions. It is not comprehensive and should not replace professional medical advice. Always
                    consult your doctor or pharmacist about potential drug interactions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add/Edit Medication Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="sticky top-0 bg-inherit p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingId ? t('tools.prescriptionTracker.editMedication', 'Edit Medication') : t('tools.prescriptionTracker.addNewMedication', 'Add New Medication')}
                </h2>
                <button
                  onClick={resetForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.medicationName', 'Medication Name *')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('tools.prescriptionTracker.eGLisinopril', 'e.g., Lisinopril')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.dosage', 'Dosage')}
                    </label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder={t('tools.prescriptionTracker.eG10mg', 'e.g., 10mg')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.frequency', 'Frequency')}
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {frequencyOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.prescribingDoctor', 'Prescribing Doctor')}
                    </label>
                    <input
                      type="text"
                      value={formData.prescribingDoctor}
                      onChange={e => setFormData({ ...formData, prescribingDoctor: e.target.value })}
                      placeholder={t('tools.prescriptionTracker.eGSmith', 'e.g., Smith')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                {/* Refill Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.prescriptionTracker.refillInformation', 'Refill Information')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.lastFilled', 'Last Filled')}
                      </label>
                      <input
                        type="date"
                        value={formData.lastFilled}
                        onChange={e => setFormData({ ...formData, lastFilled: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.quantity', 'Quantity')}
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        placeholder="30"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.refillsRemaining', 'Refills Remaining')}
                      </label>
                      <input
                        type="number"
                        value={formData.refillsRemaining}
                        onChange={e => setFormData({ ...formData, refillsRemaining: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Pharmacy Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.prescriptionTracker.pharmacyInformation', 'Pharmacy Information')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.pharmacyName', 'Pharmacy Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.pharmacy.name}
                        onChange={e => setFormData({ ...formData, pharmacy: { ...formData.pharmacy, name: e.target.value } })}
                        placeholder={t('tools.prescriptionTracker.eGCvsPharmacy', 'e.g., CVS Pharmacy')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={formData.pharmacy.phone}
                        onChange={e => setFormData({ ...formData, pharmacy: { ...formData.pharmacy, phone: e.target.value } })}
                        placeholder="e.g., (555) 123-4567"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.address', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={formData.pharmacy.address}
                      onChange={e => setFormData({ ...formData, pharmacy: { ...formData.pharmacy, address: e.target.value } })}
                      placeholder={t('tools.prescriptionTracker.eG123MainSt', 'e.g., 123 Main St, City, State 12345')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                {/* Cost & Insurance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.costPerRefill', 'Cost Per Refill ($)')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPerRefill}
                      onChange={e => setFormData({ ...formData, costPerRefill: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.insuranceCoverage2', 'Insurance Coverage')}
                    </label>
                    <input
                      type="text"
                      value={formData.insuranceCoverage}
                      onChange={e => setFormData({ ...formData, insuranceCoverage: e.target.value })}
                      placeholder={t('tools.prescriptionTracker.eGCovered10Copay', 'e.g., Covered - $10 copay')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                {/* Generic vs Brand */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isGeneric}
                        onChange={e => setFormData({ ...formData, isGeneric: e.target.checked })}
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.thisIsAGenericMedication', 'This is a generic medication')}
                      </span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.brandName', 'Brand Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.brandName}
                        onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                        placeholder={t('tools.prescriptionTracker.eGZestril', 'e.g., Zestril')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.genericName', 'Generic Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.genericName}
                        onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                        placeholder={t('tools.prescriptionTracker.eGLisinopril2', 'e.g., Lisinopril')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Side Effects */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.prescriptionTracker.sideEffectsNotes', 'Side Effects Notes')}
                  </label>
                  <textarea
                    value={formData.sideEffects}
                    onChange={e => setFormData({ ...formData, sideEffects: e.target.value })}
                    placeholder={t('tools.prescriptionTracker.documentAnySideEffectsYou', 'Document any side effects you experience...')}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {/* Reminder Schedule */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.prescriptionTracker.reminderSchedule2', 'Reminder Schedule')}
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.reminderSchedule.enabled}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            reminderSchedule: { ...formData.reminderSchedule, enabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.prescriptionTracker.enableReminders', 'Enable reminders')}
                      </span>
                    </label>
                  </div>
                  <div className="mb-3">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.reminderTimesCommaSeparated', 'Reminder Times (comma-separated)')}
                    </label>
                    <input
                      type="text"
                      value={formData.reminderSchedule.times.join(', ')}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          reminderSchedule: {
                            ...formData.reminderSchedule,
                            times: e.target.value.split(',').map(t => t.trim()),
                          },
                        })
                      }
                      placeholder="e.g., 08:00, 20:00"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prescriptionTracker.daysOfWeek', 'Days of Week')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = formData.reminderSchedule.daysOfWeek;
                            const newDays = days.includes(index)
                              ? days.filter(d => d !== index)
                              : [...days, index].sort();
                            setFormData({
                              ...formData,
                              reminderSchedule: { ...formData.reminderSchedule, daysOfWeek: newDays },
                            });
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            formData.reminderSchedule.daysOfWeek.includes(index)
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark'
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.prescriptionTracker.additionalNotes', 'Additional Notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('tools.prescriptionTracker.anyAdditionalNotesAboutThis', 'Any additional notes about this medication...')}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#0D9488]"
                    id="active-status"
                  />
                  <label
                    htmlFor="active-status"
                    className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.prescriptionTracker.medicationIsCurrentlyActive', 'Medication is currently active')}
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-inherit p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {editingId ? t('tools.prescriptionTracker.updateMedication', 'Update Medication') : t('tools.prescriptionTracker.addMedication2', 'Add Medication')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.prescriptionTracker.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Log Adherence Modal */}
        {logAdherenceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`w-full max-w-md rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.prescriptionTracker.logDose', 'Log Dose')}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.prescriptionTracker.status', 'Status')}
                  </label>
                  <div className="flex gap-2">
                    {(['taken', 'missed', 'skipped'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setAdherenceStatus(status)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                          adherenceStatus === status
                            ? status === 'taken'
                              ? 'bg-green-500 text-white'
                              : status === 'missed'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.prescriptionTracker.notesOptional', 'Notes (optional)')}
                  </label>
                  <textarea
                    value={adherenceNotes}
                    onChange={e => setAdherenceNotes(e.target.value)}
                    placeholder={t('tools.prescriptionTracker.anyNotesAboutThisDose', 'Any notes about this dose...')}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleLogAdherence}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {t('tools.prescriptionTracker.logDose2', 'Log Dose')}
                </button>
                <button
                  onClick={() => {
                    setLogAdherenceModal(null);
                    setAdherenceStatus('taken');
                    setAdherenceNotes('');
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.prescriptionTracker.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default PrescriptionTrackerTool;
