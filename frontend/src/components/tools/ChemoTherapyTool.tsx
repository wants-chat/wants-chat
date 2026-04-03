'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Pill,
  Heart,
  TestTube,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Beaker,
  Syringe,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface ChemoDrug {
  name: string;
  dose: string;
  unit: string;
  route: 'IV' | 'oral' | 'subcutaneous' | 'intramuscular';
  schedule: string;
  infusionTime?: string;
}

interface ChemoCycle {
  id: string;
  cycleNumber: number;
  protocol: string;
  drugs: ChemoDrug[];
  startDate: string;
  endDate: string;
  premedications: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  doseModification?: string;
  notes: string;
}

interface SideEffect {
  id: string;
  type: string;
  grade: 1 | 2 | 3 | 4;
  startDate: string;
  endDate?: string;
  treatment: string;
  resolved: boolean;
}

interface LabResult {
  id: string;
  date: string;
  type: string;
  value: string;
  unit: string;
  normalRange: string;
  flag: 'normal' | 'low' | 'high' | 'critical';
}

interface ChemoPatient {
  id: string;
  patientName: string;
  mrn: string;
  diagnosis: string;
  cancerType: string;
  stage: string;
  protocol: string;
  oncologist: string;
  startDate: string;
  cycles: ChemoCycle[];
  sideEffects: SideEffect[];
  labResults: LabResult[];
  status: 'active' | 'completed' | 'on-hold' | 'discontinued';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ChemoTherapyToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'chemo-therapy';

const patientColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'mrn', header: 'MRN', type: 'string' },
  { key: 'cancerType', header: 'Cancer Type', type: 'string' },
  { key: 'protocol', header: 'Protocol', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewPatient = (): ChemoPatient => ({
  id: crypto.randomUUID(),
  patientName: '',
  mrn: '',
  diagnosis: '',
  cancerType: '',
  stage: '',
  protocol: '',
  oncologist: '',
  startDate: '',
  cycles: [],
  sideEffects: [],
  labResults: [],
  status: 'active',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewCycle = (cycleNumber: number, protocol: string): ChemoCycle => ({
  id: crypto.randomUUID(),
  cycleNumber,
  protocol,
  drugs: [],
  startDate: '',
  endDate: '',
  premedications: [],
  status: 'scheduled',
  notes: '',
});

const createNewDrug = (): ChemoDrug => ({
  name: '',
  dose: '',
  unit: 'mg/m2',
  route: 'IV',
  schedule: '',
  infusionTime: '',
});

const createNewSideEffect = (): Omit<SideEffect, 'id'> => ({
  type: '',
  grade: 1,
  startDate: new Date().toISOString().split('T')[0],
  treatment: '',
  resolved: false,
});

const createNewLabResult = (): Omit<LabResult, 'id'> => ({
  date: new Date().toISOString().split('T')[0],
  type: '',
  value: '',
  unit: '',
  normalRange: '',
  flag: 'normal',
});

const cancerTypes = [
  'Breast Cancer',
  'Lung Cancer',
  'Colorectal Cancer',
  'Prostate Cancer',
  'Ovarian Cancer',
  'Pancreatic Cancer',
  'Leukemia',
  'Lymphoma',
  'Multiple Myeloma',
  'Melanoma',
  'Bladder Cancer',
  'Kidney Cancer',
  'Liver Cancer',
  'Stomach Cancer',
  'Brain Cancer',
  'Other',
];

const commonProtocols = [
  'FOLFOX',
  'FOLFIRI',
  'FOLFIRINOX',
  'R-CHOP',
  'ABVD',
  'AC-T',
  'TC',
  'TCH',
  'BEACOPP',
  'MVAC',
  'Cisplatin/Etoposide',
  'Carboplatin/Paclitaxel',
  'Gemcitabine/Cisplatin',
  'Docetaxel',
  'Custom Protocol',
];

const commonDrugs = [
  'Cisplatin',
  'Carboplatin',
  'Oxaliplatin',
  'Paclitaxel',
  'Docetaxel',
  'Doxorubicin',
  'Cyclophosphamide',
  'Methotrexate',
  'Fluorouracil (5-FU)',
  'Gemcitabine',
  'Irinotecan',
  'Vincristine',
  'Vinblastine',
  'Etoposide',
  'Bleomycin',
  'Rituximab',
  'Trastuzumab',
  'Bevacizumab',
  'Pembrolizumab',
  'Nivolumab',
];

const commonPremedications = [
  'Dexamethasone',
  'Ondansetron',
  'Granisetron',
  'Diphenhydramine',
  'Ranitidine',
  'Lorazepam',
  'Acetaminophen',
  'Aprepitant',
  'Prochlorperazine',
];

const sideEffectTypes = [
  'Nausea/Vomiting',
  'Fatigue',
  'Neutropenia',
  'Anemia',
  'Thrombocytopenia',
  'Neuropathy',
  'Mucositis',
  'Diarrhea',
  'Constipation',
  'Alopecia',
  'Skin Rash',
  'Hand-Foot Syndrome',
  'Hepatotoxicity',
  'Nephrotoxicity',
  'Cardiotoxicity',
  'Allergic Reaction',
  'Infection',
  'Febrile Neutropenia',
];

const labTestTypes = [
  { name: 'WBC', unit: 'K/uL', range: '4.5-11.0' },
  { name: 'ANC', unit: 'K/uL', range: '1.5-8.0' },
  { name: 'Hemoglobin', unit: 'g/dL', range: '12.0-16.0' },
  { name: 'Platelets', unit: 'K/uL', range: '150-400' },
  { name: 'Creatinine', unit: 'mg/dL', range: '0.7-1.3' },
  { name: 'BUN', unit: 'mg/dL', range: '7-20' },
  { name: 'AST', unit: 'U/L', range: '10-40' },
  { name: 'ALT', unit: 'U/L', range: '7-56' },
  { name: 'Bilirubin', unit: 'mg/dL', range: '0.1-1.2' },
  { name: 'Albumin', unit: 'g/dL', range: '3.5-5.0' },
  { name: 'Sodium', unit: 'mEq/L', range: '136-145' },
  { name: 'Potassium', unit: 'mEq/L', range: '3.5-5.0' },
  { name: 'Magnesium', unit: 'mg/dL', range: '1.7-2.2' },
];

export const ChemoTherapyTool: React.FC<ChemoTherapyToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

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
  } = useToolData<ChemoPatient>(TOOL_ID, [], patientColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCancerType, setFilterCancerType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showSideEffectModal, setShowSideEffectModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<ChemoPatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<ChemoPatient | null>(null);
  const [formData, setFormData] = useState<ChemoPatient>(createNewPatient());
  const [expandedCycles, setExpandedCycles] = useState<Set<string>>(new Set());

  // Cycle form state
  const [cycleFormData, setCycleFormData] = useState<ChemoCycle>(createNewCycle(1, ''));
  const [editingCycle, setEditingCycle] = useState<ChemoCycle | null>(null);
  const [newDrug, setNewDrug] = useState<ChemoDrug>(createNewDrug());
  const [newPremedication, setNewPremedication] = useState('');

  // Side effect form state
  const [sideEffectFormData, setSideEffectFormData] = useState<Omit<SideEffect, 'id'>>(createNewSideEffect());

  // Lab result form state
  const [labFormData, setLabFormData] = useState<Omit<LabResult, 'id'>>(createNewLabResult());

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.status && ['active', 'completed', 'on-hold', 'discontinued'].includes(params.status)) {
        setFilterStatus(params.status);
        hasChanges = true;
      }
      if (params.cancerType && cancerTypes.includes(params.cancerType)) {
        setFilterCancerType(params.cancerType);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Statistics
  const stats = useMemo(() => {
    const active = patients.filter(p => p.status === 'active');
    const completed = patients.filter(p => p.status === 'completed');
    const onHold = patients.filter(p => p.status === 'on-hold');
    const totalCycles = patients.reduce((sum, p) => sum + p.cycles.length, 0);
    const completedCycles = patients.reduce(
      (sum, p) => sum + p.cycles.filter(c => c.status === 'completed').length,
      0
    );
    const totalSideEffects = patients.reduce((sum, p) => sum + p.sideEffects.length, 0);
    const unresolvedSideEffects = patients.reduce(
      (sum, p) => sum + p.sideEffects.filter(s => !s.resolved).length,
      0
    );
    const grade3_4SideEffects = patients.reduce(
      (sum, p) => sum + p.sideEffects.filter(s => s.grade >= 3).length,
      0
    );
    return {
      total: patients.length,
      active: active.length,
      completed: completed.length,
      onHold: onHold.length,
      totalCycles,
      completedCycles,
      totalSideEffects,
      unresolvedSideEffects,
      grade3_4SideEffects,
    };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch =
        searchQuery === '' ||
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.protocol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || patient.status === filterStatus;
      const matchesCancerType = filterCancerType === '' || patient.cancerType === filterCancerType;
      return matchesSearch && matchesStatus && matchesCancerType;
    });
  }, [patients, searchQuery, filterStatus, filterCancerType]);

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
      message: 'Are you sure you want to delete this patient record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePatient(id);
      if (selectedPatient?.id === id) setSelectedPatient(null);
    }
  };

  const openEditModal = (patient: ChemoPatient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setShowModal(true);
  };

  const toggleCycleExpand = (cycleId: string) => {
    const newExpanded = new Set(expandedCycles);
    if (newExpanded.has(cycleId)) {
      newExpanded.delete(cycleId);
    } else {
      newExpanded.add(cycleId);
    }
    setExpandedCycles(newExpanded);
  };

  // Cycle management
  const openCycleModal = (cycle?: ChemoCycle) => {
    if (cycle) {
      setEditingCycle(cycle);
      setCycleFormData(cycle);
    } else {
      const nextCycleNum = selectedPatient ? selectedPatient.cycles.length + 1 : 1;
      setCycleFormData(createNewCycle(nextCycleNum, selectedPatient?.protocol || ''));
      setEditingCycle(null);
    }
    setShowCycleModal(true);
  };

  const addDrugToCycle = () => {
    if (newDrug.name.trim()) {
      setCycleFormData({
        ...cycleFormData,
        drugs: [...cycleFormData.drugs, { ...newDrug }],
      });
      setNewDrug(createNewDrug());
    }
  };

  const removeDrugFromCycle = (index: number) => {
    setCycleFormData({
      ...cycleFormData,
      drugs: cycleFormData.drugs.filter((_, i) => i !== index),
    });
  };

  const addPremedicationToCycle = () => {
    if (newPremedication.trim() && !cycleFormData.premedications.includes(newPremedication.trim())) {
      setCycleFormData({
        ...cycleFormData,
        premedications: [...cycleFormData.premedications, newPremedication.trim()],
      });
      setNewPremedication('');
    }
  };

  const removePremedicationFromCycle = (med: string) => {
    setCycleFormData({
      ...cycleFormData,
      premedications: cycleFormData.premedications.filter(p => p !== med),
    });
  };

  const saveCycle = () => {
    if (selectedPatient) {
      let updatedCycles: ChemoCycle[];
      if (editingCycle) {
        updatedCycles = selectedPatient.cycles.map(c => (c.id === editingCycle.id ? cycleFormData : c));
      } else {
        updatedCycles = [...selectedPatient.cycles, cycleFormData];
      }
      const updated = { ...selectedPatient, cycles: updatedCycles, updatedAt: new Date().toISOString() };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowCycleModal(false);
      setCycleFormData(createNewCycle(1, ''));
      setEditingCycle(null);
    }
  };

  const deleteCycle = async (cycleId: string) => {
    const confirmed = await confirm({
      title: 'Delete Cycle',
      message: 'Are you sure you want to delete this cycle?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (selectedPatient && confirmed) {
      const updatedCycles = selectedPatient.cycles.filter(c => c.id !== cycleId);
      const updated = { ...selectedPatient, cycles: updatedCycles, updatedAt: new Date().toISOString() };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  // Side effect management
  const saveSideEffect = () => {
    if (selectedPatient) {
      const sideEffect: SideEffect = { ...sideEffectFormData, id: crypto.randomUUID() };
      const updated = {
        ...selectedPatient,
        sideEffects: [...selectedPatient.sideEffects, sideEffect],
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowSideEffectModal(false);
      setSideEffectFormData(createNewSideEffect());
    }
  };

  const toggleSideEffectResolved = (sideEffectId: string) => {
    if (selectedPatient) {
      const updatedSideEffects = selectedPatient.sideEffects.map(s =>
        s.id === sideEffectId
          ? { ...s, resolved: !s.resolved, endDate: !s.resolved ? new Date().toISOString().split('T')[0] : undefined }
          : s
      );
      const updated = { ...selectedPatient, sideEffects: updatedSideEffects, updatedAt: new Date().toISOString() };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const deleteSideEffect = async (sideEffectId: string) => {
    const confirmed = await confirm({
      title: 'Delete Side Effect Record',
      message: 'Are you sure you want to delete this side effect record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (selectedPatient && confirmed) {
      const updatedSideEffects = selectedPatient.sideEffects.filter(s => s.id !== sideEffectId);
      const updated = { ...selectedPatient, sideEffects: updatedSideEffects, updatedAt: new Date().toISOString() };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  // Lab result management
  const saveLabResult = () => {
    if (selectedPatient) {
      const labResult: LabResult = { ...labFormData, id: crypto.randomUUID() };
      const updated = {
        ...selectedPatient,
        labResults: [...selectedPatient.labResults, labResult],
        updatedAt: new Date().toISOString(),
      };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
      setShowLabModal(false);
      setLabFormData(createNewLabResult());
    }
  };

  const deleteLabResult = async (labId: string) => {
    const confirmed = await confirm({
      title: 'Delete Lab Result',
      message: 'Are you sure you want to delete this lab result?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (selectedPatient && confirmed) {
      const updatedLabResults = selectedPatient.labResults.filter(l => l.id !== labId);
      const updated = { ...selectedPatient, labResults: updatedLabResults, updatedAt: new Date().toISOString() };
      updatePatient(selectedPatient.id, updated);
      setSelectedPatient(updated);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'in-progress':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'on-hold':
      case 'delayed':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'discontinued':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'scheduled':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getGradeColor = (grade: number) => {
    switch (grade) {
      case 1:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 2:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 3:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 4:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLabFlagColor = (flag: string) => {
    switch (flag) {
      case 'normal':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'in-progress':
        return <Activity className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'on-hold':
      case 'delayed':
        return <PauseCircle className="w-4 h-4" />;
      case 'discontinued':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
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
    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const buttonDanger = `flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium border border-red-500/30`;

  const [activeTab, setActiveTab] = useState<'cycles' | 'side-effects' | 'labs'>('cycles');

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.chemoTherapy.chemotherapyTracker', 'Chemotherapy Tracker')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.chemoTherapy.trackChemotherapyTreatmentsProtocolsAnd', 'Track chemotherapy treatments, protocols, and side effects')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="chemo-therapy" toolName="Chemo Therapy" />

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
            onExportCSV={() => exportCSV({ filename: 'chemo-therapy' })}
            onExportExcel={() => exportExcel({ filename: 'chemo-therapy' })}
            onExportJSON={() => exportJSON({ filename: 'chemo-therapy' })}
            onExportPDF={() => exportPDF({ filename: 'chemo-therapy', title: 'Chemotherapy Records' })}
            onPrint={() => print('Chemotherapy Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={patients.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button
            onClick={() => {
              setFormData(createNewPatient());
              setShowModal(true);
            }}
            className={buttonPrimary}
          >
            <Plus className="w-4 h-4" />
            {t('tools.chemoTherapy.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <User className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chemoTherapy.totalPatients', 'Total Patients')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chemoTherapy.active', 'Active')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chemoTherapy.cycles', 'Cycles')}</p>
              <p className="text-2xl font-bold text-purple-500">
                {stats.completedCycles}/{stats.totalCycles}
              </p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chemoTherapy.sideEffects', 'Side Effects')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.unresolvedSideEffects}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chemoTherapy.grade34', 'Grade 3/4')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.grade3_4SideEffects}</p>
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
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('tools.chemoTherapy.searchPatientMrnOrProtocol', 'Search patient, MRN, or protocol...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={`${inputClass} w-full sm:w-40`}
          >
            <option value="">{t('tools.chemoTherapy.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.chemoTherapy.active2', 'Active')}</option>
            <option value="completed">{t('tools.chemoTherapy.completed', 'Completed')}</option>
            <option value="on-hold">{t('tools.chemoTherapy.onHold', 'On Hold')}</option>
            <option value="discontinued">{t('tools.chemoTherapy.discontinued', 'Discontinued')}</option>
          </select>
          <select
            value={filterCancerType}
            onChange={e => setFilterCancerType(e.target.value)}
            className={`${inputClass} w-full sm:w-48`}
          >
            <option value="">{t('tools.chemoTherapy.allCancerTypes', 'All Cancer Types')}</option>
            {cancerTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.chemoTherapy.patientRecords', 'Patient Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.chemoTherapy.noPatientsRecorded', 'No patients recorded')}</p>
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
                        : theme === 'dark'
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <User className="w-4 h-4 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.patientName}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            MRN: {patient.mrn}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {patient.cancerType} - {patient.protocol}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(patient.status)}`}>
                              {getStatusIcon(patient.status)}
                              {patient.status}
                            </span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {patient.cycles.length} cycles
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openEditModal(patient);
                          }}
                          className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(patient.id);
                          }}
                          className="p-1.5 hover:bg-red-500/20 rounded"
                        >
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
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedPatient.patientName}</h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedPatient.status)}`}>
                        {getStatusIcon(selectedPatient.status)}
                        {selectedPatient.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      MRN: {selectedPatient.mrn} | {selectedPatient.diagnosis}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Patient Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.chemoTherapy.cancerType', 'Cancer Type')}</p>
                    <p className="font-medium">{selectedPatient.cancerType}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.chemoTherapy.stage', 'Stage')}</p>
                    <p className="font-medium">{selectedPatient.stage || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.chemoTherapy.protocol', 'Protocol')}</p>
                    <p className="font-medium">{selectedPatient.protocol}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.chemoTherapy.oncologist', 'Oncologist')}</p>
                    <p className="font-medium">{selectedPatient.oncologist || 'N/A'}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className={`flex gap-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setActiveTab('cycles')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'cycles'
                        ? 'border-cyan-500 text-cyan-500'
                        : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4" />
                      Cycles ({selectedPatient.cycles.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('side-effects')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'side-effects'
                        ? 'border-cyan-500 text-cyan-500'
                        : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Side Effects ({selectedPatient.sideEffects.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('labs')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'labs'
                        ? 'border-cyan-500 text-cyan-500'
                        : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TestTube className="w-4 h-4" />
                      Lab Results ({selectedPatient.labResults.length})
                    </div>
                  </button>
                </div>

                {/* Cycles Tab */}
                {activeTab === 'cycles' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-cyan-500" />
                        {t('tools.chemoTherapy.treatmentCycles', 'Treatment Cycles')}
                      </h3>
                      <button onClick={() => openCycleModal()} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Cycle
                      </button>
                    </div>
                    {selectedPatient.cycles.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.chemoTherapy.noCyclesRecorded', 'No cycles recorded')}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatient.cycles.map(cycle => (
                          <div
                            key={cycle.id}
                            className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div
                              className="p-4 flex items-center justify-between cursor-pointer"
                              onClick={() => toggleCycleExpand(cycle.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                  <Beaker className="w-4 h-4 text-purple-500" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Cycle {cycle.cycleNumber}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(cycle.status)}`}>
                                      {cycle.status}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {cycle.startDate} - {cycle.endDate || 'Ongoing'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {cycle.drugs.length} drugs
                                </span>
                                {expandedCycles.has(cycle.id) ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            {expandedCycles.has(cycle.id) && (
                              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                                {/* Drugs */}
                                <div className="mb-4">
                                  <p className="text-sm font-medium mb-2">{t('tools.chemoTherapy.drugs', 'Drugs')}</p>
                                  <div className="space-y-2">
                                    {cycle.drugs.map((drug, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Pill className="w-4 h-4 text-cyan-500" />
                                          <span className="font-medium">{drug.name}</span>
                                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {drug.dose} {drug.unit} ({drug.route})
                                          </span>
                                        </div>
                                        {drug.schedule && (
                                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Schedule: {drug.schedule}
                                            {drug.infusionTime && ` | Infusion: ${drug.infusionTime}`}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {/* Premedications */}
                                {cycle.premedications.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-sm font-medium mb-2">{t('tools.chemoTherapy.premedications', 'Premedications')}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {cycle.premedications.map((med, idx) => (
                                        <span
                                          key={idx}
                                          className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
                                        >
                                          {med}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Dose Modification */}
                                {cycle.doseModification && (
                                  <div className="mb-4">
                                    <p className="text-sm font-medium mb-1">{t('tools.chemoTherapy.doseModification', 'Dose Modification')}</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                      {cycle.doseModification}
                                    </p>
                                  </div>
                                )}
                                {/* Notes */}
                                {cycle.notes && (
                                  <div className="mb-4">
                                    <p className="text-sm font-medium mb-1">{t('tools.chemoTherapy.notes', 'Notes')}</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {cycle.notes}
                                    </p>
                                  </div>
                                )}
                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button onClick={() => openCycleModal(cycle)} className={buttonSecondary}>
                                    <Edit2 className="w-4 h-4" /> Edit
                                  </button>
                                  <button onClick={() => deleteCycle(cycle.id)} className={buttonDanger}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Side Effects Tab */}
                {activeTab === 'side-effects' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        {t('tools.chemoTherapy.sideEffectsCtcaeGrading', 'Side Effects (CTCAE Grading)')}
                      </h3>
                      <button onClick={() => setShowSideEffectModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Log Side Effect
                      </button>
                    </div>
                    {selectedPatient.sideEffects.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.chemoTherapy.noSideEffectsRecorded', 'No side effects recorded')}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedPatient.sideEffects].reverse().map(effect => (
                          <div
                            key={effect.id}
                            className={`p-4 rounded-lg ${
                              effect.resolved
                                ? theme === 'dark'
                                  ? 'bg-gray-700/30'
                                  : 'bg-gray-50'
                                : theme === 'dark'
                                  ? 'bg-gray-700/50'
                                  : 'bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{effect.type}</span>
                                <span className={`px-2 py-0.5 text-xs rounded border ${getGradeColor(effect.grade)}`}>
                                  Grade {effect.grade}
                                </span>
                                {effect.resolved && (
                                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                                    {t('tools.chemoTherapy.resolved', 'Resolved')}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => toggleSideEffectResolved(effect.id)}
                                  className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                  title={effect.resolved ? t('tools.chemoTherapy.markAsActive', 'Mark as active') : t('tools.chemoTherapy.markAsResolved', 'Mark as resolved')}
                                >
                                  {effect.resolved ? (
                                    <XCircle className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </button>
                                <button
                                  onClick={() => deleteSideEffect(effect.id)}
                                  className="p-1.5 hover:bg-red-500/20 rounded"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Started: {effect.startDate}
                              {effect.endDate && ` | Resolved: ${effect.endDate}`}
                            </p>
                            {effect.treatment && (
                              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Treatment: {effect.treatment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Labs Tab */}
                {activeTab === 'labs' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <TestTube className="w-4 h-4 text-blue-500" />
                        {t('tools.chemoTherapy.labResults', 'Lab Results')}
                      </h3>
                      <button onClick={() => setShowLabModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Lab Result
                      </button>
                    </div>
                    {selectedPatient.labResults.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.chemoTherapy.noLabResultsRecorded', 'No lab results recorded')}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              <th className="text-left p-2">{t('tools.chemoTherapy.date', 'Date')}</th>
                              <th className="text-left p-2">{t('tools.chemoTherapy.test', 'Test')}</th>
                              <th className="text-left p-2">{t('tools.chemoTherapy.value', 'Value')}</th>
                              <th className="text-left p-2">{t('tools.chemoTherapy.range', 'Range')}</th>
                              <th className="text-left p-2">{t('tools.chemoTherapy.flag', 'Flag')}</th>
                              <th className="text-right p-2">{t('tools.chemoTherapy.actions', 'Actions')}</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {[...selectedPatient.labResults].reverse().map(lab => (
                              <tr key={lab.id}>
                                <td className="p-2">{lab.date}</td>
                                <td className="p-2 font-medium">{lab.type}</td>
                                <td className="p-2">
                                  {lab.value} {lab.unit}
                                </td>
                                <td className={`p-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {lab.normalRange}
                                </td>
                                <td className="p-2">
                                  <span className={`px-2 py-0.5 text-xs rounded border ${getLabFlagColor(lab.flag)}`}>
                                    {lab.flag}
                                  </span>
                                </td>
                                <td className="p-2 text-right">
                                  <button
                                    onClick={() => deleteLabResult(lab.id)}
                                    className="p-1.5 hover:bg-red-500/20 rounded"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedPatient.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-500" />
                      {t('tools.chemoTherapy.notes4', 'Notes')}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedPatient.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Activity className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.chemoTherapy.selectAPatient', 'Select a patient')}</p>
              <p className="text-sm">{t('tools.chemoTherapy.chooseAPatientToView', 'Choose a patient to view treatment details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingPatient ? t('tools.chemoTherapy.editPatient', 'Edit Patient') : t('tools.chemoTherapy.addPatient2', 'Add Patient')}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPatient(null);
                }}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.patientName', 'Patient Name *')}</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.chemoTherapy.fullName', 'Full name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.mrn', 'MRN *')}</label>
                  <input
                    type="text"
                    value={formData.mrn}
                    onChange={e => setFormData({ ...formData, mrn: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.chemoTherapy.medicalRecordNumber', 'Medical Record Number')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.cancerType2', 'Cancer Type *')}</label>
                  <select
                    value={formData.cancerType}
                    onChange={e => setFormData({ ...formData, cancerType: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.chemoTherapy.selectCancerType', 'Select cancer type')}</option>
                    {cancerTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.stage2', 'Stage')}</label>
                  <input
                    type="text"
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.chemoTherapy.eGStageIiiaT2n1m0', 'e.g., Stage IIIA, T2N1M0')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.diagnosis', 'Diagnosis')}</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.chemoTherapy.detailedDiagnosis', 'Detailed diagnosis')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.protocol2', 'Protocol *')}</label>
                  <select
                    value={formData.protocol}
                    onChange={e => setFormData({ ...formData, protocol: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.chemoTherapy.selectProtocol', 'Select protocol')}</option>
                    {commonProtocols.map(protocol => (
                      <option key={protocol} value={protocol}>
                        {protocol}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.oncologist2', 'Oncologist')}</label>
                  <input
                    type="text"
                    value={formData.oncologist}
                    onChange={e => setFormData({ ...formData, oncologist: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.chemoTherapy.treatingOncologist', 'Treating oncologist')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.startDate', 'Start Date')}</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="active">{t('tools.chemoTherapy.active3', 'Active')}</option>
                    <option value="completed">{t('tools.chemoTherapy.completed2', 'Completed')}</option>
                    <option value="on-hold">{t('tools.chemoTherapy.onHold2', 'On Hold')}</option>
                    <option value="discontinued">{t('tools.chemoTherapy.discontinued2', 'Discontinued')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.notes2', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={inputClass}
                  rows={3}
                  placeholder={t('tools.chemoTherapy.additionalNotes', 'Additional notes...')}
                />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPatient(null);
                  }}
                  className={buttonSecondary}
                >
                  {t('tools.chemoTherapy.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!formData.patientName || !formData.mrn || !formData.cancerType || !formData.protocol}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Modal */}
      {showCycleModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingCycle ? t('tools.chemoTherapy.editCycle', 'Edit Cycle') : t('tools.chemoTherapy.addCycle', 'Add Cycle')}</h2>
              <button
                onClick={() => {
                  setShowCycleModal(false);
                  setEditingCycle(null);
                }}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.cycleNumber', 'Cycle Number')}</label>
                  <input
                    type="number"
                    value={cycleFormData.cycleNumber}
                    onChange={e => setCycleFormData({ ...cycleFormData, cycleNumber: parseInt(e.target.value) })}
                    className={inputClass}
                    min={1}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.status2', 'Status')}</label>
                  <select
                    value={cycleFormData.status}
                    onChange={e => setCycleFormData({ ...cycleFormData, status: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="scheduled">{t('tools.chemoTherapy.scheduled', 'Scheduled')}</option>
                    <option value="in-progress">{t('tools.chemoTherapy.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.chemoTherapy.completed3', 'Completed')}</option>
                    <option value="delayed">{t('tools.chemoTherapy.delayed', 'Delayed')}</option>
                    <option value="cancelled">{t('tools.chemoTherapy.cancelled', 'Cancelled')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.startDate2', 'Start Date')}</label>
                  <input
                    type="date"
                    value={cycleFormData.startDate}
                    onChange={e => setCycleFormData({ ...cycleFormData, startDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.endDate', 'End Date')}</label>
                  <input
                    type="date"
                    value={cycleFormData.endDate}
                    onChange={e => setCycleFormData({ ...cycleFormData, endDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Drugs Section */}
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.drugs2', 'Drugs')}</label>
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <select
                      value={newDrug.name}
                      onChange={e => setNewDrug({ ...newDrug, name: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.chemoTherapy.selectDrug', 'Select drug')}</option>
                      {commonDrugs.map(drug => (
                        <option key={drug} value={drug}>
                          {drug}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDrug.dose}
                        onChange={e => setNewDrug({ ...newDrug, dose: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.chemoTherapy.dose', 'Dose')}
                      />
                      <select
                        value={newDrug.unit}
                        onChange={e => setNewDrug({ ...newDrug, unit: e.target.value })}
                        className={`${inputClass} w-32`}
                      >
                        <option value="mg/m2">mg/m2</option>
                        <option value="mg">mg</option>
                        <option value="mg/kg">mg/kg</option>
                        <option value="AUC">{t('tools.chemoTherapy.auc', 'AUC')}</option>
                      </select>
                    </div>
                    <select
                      value={newDrug.route}
                      onChange={e => setNewDrug({ ...newDrug, route: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="IV">IV</option>
                      <option value="oral">{t('tools.chemoTherapy.oral', 'Oral')}</option>
                      <option value="subcutaneous">{t('tools.chemoTherapy.subcutaneous', 'Subcutaneous')}</option>
                      <option value="intramuscular">{t('tools.chemoTherapy.intramuscular', 'Intramuscular')}</option>
                    </select>
                    <input
                      type="text"
                      value={newDrug.schedule}
                      onChange={e => setNewDrug({ ...newDrug, schedule: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.chemoTherapy.scheduleEGDay1', 'Schedule (e.g., Day 1, 8)')}
                    />
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newDrug.infusionTime || ''}
                      onChange={e => setNewDrug({ ...newDrug, infusionTime: e.target.value })}
                      className={`${inputClass} flex-1`}
                      placeholder={t('tools.chemoTherapy.infusionTimeEG2', 'Infusion time (e.g., 2 hours)')}
                    />
                    <button onClick={addDrugToCycle} className={buttonPrimary}>
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {cycleFormData.drugs.length > 0 && (
                    <div className="space-y-2">
                      {cycleFormData.drugs.map((drug, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
                        >
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-cyan-500" />
                            <span>
                              {drug.name} - {drug.dose} {drug.unit} ({drug.route})
                            </span>
                          </div>
                          <button onClick={() => removeDrugFromCycle(idx)} className="p-1 hover:bg-red-500/20 rounded">
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Premedications Section */}
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.premedications2', 'Premedications')}</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newPremedication}
                    onChange={e => setNewPremedication(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{t('tools.chemoTherapy.selectPremedication', 'Select premedication')}</option>
                    {commonPremedications
                      .filter(m => !cycleFormData.premedications.includes(m))
                      .map(med => (
                        <option key={med} value={med}>
                          {med}
                        </option>
                      ))}
                  </select>
                  <button onClick={addPremedicationToCycle} className={buttonSecondary}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cycleFormData.premedications.map((med, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1"
                    >
                      {med}
                      <button onClick={() => removePremedicationFromCycle(med)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dose Modification */}
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.doseModification2', 'Dose Modification')}</label>
                <input
                  type="text"
                  value={cycleFormData.doseModification || ''}
                  onChange={e => setCycleFormData({ ...cycleFormData, doseModification: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.chemoTherapy.eG25DoseReduction', 'e.g., 25% dose reduction due to neutropenia')}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.notes3', 'Notes')}</label>
                <textarea
                  value={cycleFormData.notes}
                  onChange={e => setCycleFormData({ ...cycleFormData, notes: e.target.value })}
                  className={inputClass}
                  rows={2}
                />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCycleModal(false);
                    setEditingCycle(null);
                  }}
                  className={buttonSecondary}
                >
                  {t('tools.chemoTherapy.cancel2', 'Cancel')}
                </button>
                <button type="button" onClick={saveCycle} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Cycle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Effect Modal */}
      {showSideEffectModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.chemoTherapy.logSideEffect', 'Log Side Effect')}</h2>
              <button
                onClick={() => setShowSideEffectModal(false)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.sideEffectType', 'Side Effect Type *')}</label>
                <select
                  value={sideEffectFormData.type}
                  onChange={e => setSideEffectFormData({ ...sideEffectFormData, type: e.target.value })}
                  className={inputClass}
                >
                  <option value="">{t('tools.chemoTherapy.selectSideEffect', 'Select side effect')}</option>
                  {sideEffectTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.ctcaeGrade', 'CTCAE Grade *')}</label>
                  <select
                    value={sideEffectFormData.grade}
                    onChange={e => setSideEffectFormData({ ...sideEffectFormData, grade: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
                    className={inputClass}
                  >
                    <option value={1}>{t('tools.chemoTherapy.grade1Mild', 'Grade 1 - Mild')}</option>
                    <option value={2}>{t('tools.chemoTherapy.grade2Moderate', 'Grade 2 - Moderate')}</option>
                    <option value={3}>{t('tools.chemoTherapy.grade3Severe', 'Grade 3 - Severe')}</option>
                    <option value={4}>{t('tools.chemoTherapy.grade4LifeThreatening', 'Grade 4 - Life-threatening')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.startDate3', 'Start Date')}</label>
                  <input
                    type="date"
                    value={sideEffectFormData.startDate}
                    onChange={e => setSideEffectFormData({ ...sideEffectFormData, startDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.treatmentGiven', 'Treatment Given')}</label>
                <input
                  type="text"
                  value={sideEffectFormData.treatment}
                  onChange={e => setSideEffectFormData({ ...sideEffectFormData, treatment: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.chemoTherapy.eGOndansetron8mgPo', 'e.g., Ondansetron 8mg PO')}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="resolved"
                  checked={sideEffectFormData.resolved}
                  onChange={e => setSideEffectFormData({ ...sideEffectFormData, resolved: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="resolved" className={labelClass}>
                  {t('tools.chemoTherapy.resolved2', 'Resolved')}
                </label>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowSideEffectModal(false)} className={buttonSecondary}>
                  {t('tools.chemoTherapy.cancel3', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={saveSideEffect}
                  disabled={!sideEffectFormData.type}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Result Modal */}
      {showLabModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.chemoTherapy.addLabResult', 'Add Lab Result')}</h2>
              <button
                onClick={() => setShowLabModal(false)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.date2', 'Date')}</label>
                <input
                  type="date"
                  value={labFormData.date}
                  onChange={e => setLabFormData({ ...labFormData, date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.testType', 'Test Type *')}</label>
                <select
                  value={labFormData.type}
                  onChange={e => {
                    const selected = labTestTypes.find(t => t.name === e.target.value);
                    setLabFormData({
                      ...labFormData,
                      type: e.target.value,
                      unit: selected?.unit || '',
                      normalRange: selected?.range || '',
                    });
                  }}
                  className={inputClass}
                >
                  <option value="">{t('tools.chemoTherapy.selectTest', 'Select test')}</option>
                  {labTestTypes.map(test => (
                    <option key={test.name} value={test.name}>
                      {test.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.value2', 'Value *')}</label>
                  <input
                    type="text"
                    value={labFormData.value}
                    onChange={e => setLabFormData({ ...labFormData, value: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.chemoTherapy.resultValue', 'Result value')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.chemoTherapy.unit', 'Unit')}</label>
                  <input
                    type="text"
                    value={labFormData.unit}
                    onChange={e => setLabFormData({ ...labFormData, unit: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.chemoTherapy.unit2', 'Unit')}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.normalRange', 'Normal Range')}</label>
                <input
                  type="text"
                  value={labFormData.normalRange}
                  onChange={e => setLabFormData({ ...labFormData, normalRange: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., 4.5-11.0"
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.chemoTherapy.flag2', 'Flag')}</label>
                <select
                  value={labFormData.flag}
                  onChange={e => setLabFormData({ ...labFormData, flag: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="normal">{t('tools.chemoTherapy.normal', 'Normal')}</option>
                  <option value="low">{t('tools.chemoTherapy.low', 'Low')}</option>
                  <option value="high">{t('tools.chemoTherapy.high', 'High')}</option>
                  <option value="critical">{t('tools.chemoTherapy.critical', 'Critical')}</option>
                </select>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowLabModal(false)} className={buttonSecondary}>
                  {t('tools.chemoTherapy.cancel4', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={saveLabResult}
                  disabled={!labFormData.type || !labFormData.value}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.chemoTherapy.aboutChemotherapyTracker', 'About Chemotherapy Tracker')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive chemotherapy treatment tracking for oncology patients. Monitor treatment cycles, drug regimens,
          premedications, side effects with CTCAE grading, and laboratory results. Track protocol adherence, dose
          modifications, and treatment outcomes. Export data for clinical documentation and reporting.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ChemoTherapyTool;
