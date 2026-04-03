'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import {
  Stethoscope,
  User,
  Calendar,
  Phone,
  Mail,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  DollarSign,
  Clock,
  Bell,
  Camera,
  Activity,
  ClipboardList,
  Receipt,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
type ToothCondition = 'healthy' | 'cavity' | 'crown' | 'missing' | 'implant' | 'filling' | 'root_canal' | 'extraction_needed';

interface ToothData {
  number: number;
  condition: ToothCondition;
  notes: string;
  treatments: TreatmentRecord[];
  lastUpdated: string;
}

interface TreatmentRecord {
  id: string;
  date: string;
  procedure: string;
  cost: number;
  notes: string;
  dentist: string;
}

interface XRayRecord {
  id: string;
  date: string;
  type: string;
  findings: string;
  imagePath?: string;
}

interface PeriodontalReading {
  toothNumber: number;
  pocketDepths: number[];
  bleeding: boolean[];
  recession: number[];
}

interface TreatmentPlanItem {
  id: string;
  toothNumber: number | null;
  procedure: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedCost: number;
  status: 'pending' | 'scheduled' | 'completed' | 'declined';
  scheduledDate?: string;
  notes: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}

interface InsuranceClaim {
  id: string;
  date: string;
  procedure: string;
  amount: number;
  insurancePaid: number;
  patientResponsibility: number;
  status: 'submitted' | 'pending' | 'approved' | 'denied' | 'paid';
  claimNumber: string;
}

interface ClinicalNote {
  id: string;
  date: string;
  note: string;
  author: string;
  category: 'general' | 'treatment' | 'followup' | 'emergency';
}

interface Reminder {
  id: string;
  type: 'recall' | 'followup' | 'treatment';
  date: string;
  message: string;
  status: 'pending' | 'sent' | 'completed';
}

interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  insuranceProvider: string;
  insuranceId: string;
  insuranceGroup: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string[];
  medications: string[];
  medicalHistory: string;
}

interface DentalChartData {
  patient: PatientProfile;
  teeth: ToothData[];
  xrays: XRayRecord[];
  periodontal: PeriodontalReading[];
  treatmentPlan: TreatmentPlanItem[];
  appointments: Appointment[];
  claims: InsuranceClaim[];
  notes: ClinicalNote[];
  reminders: Reminder[];
}

type TabType = 'chart' | 'periodontal' | 'xrays' | 'treatment' | 'appointments' | 'claims' | 'notes' | 'reminders';

const DEFAULT_PATIENT: PatientProfile = {
  id: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  insuranceProvider: '',
  insuranceId: '',
  insuranceGroup: '',
  emergencyContact: '',
  emergencyPhone: '',
  allergies: [],
  medications: [],
  medicalHistory: '',
};

const TOOTH_CONDITIONS: { value: ToothCondition; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: '#10b981' },
  { value: 'cavity', label: 'Cavity', color: '#ef4444' },
  { value: 'crown', label: 'Crown', color: '#f59e0b' },
  { value: 'missing', label: 'Missing', color: '#6b7280' },
  { value: 'implant', label: 'Implant', color: '#3b82f6' },
  { value: 'filling', label: 'Filling', color: '#8b5cf6' },
  { value: 'root_canal', label: 'Root Canal', color: '#ec4899' },
  { value: 'extraction_needed', label: 'Extraction Needed', color: '#dc2626' },
];

const PROCEDURES = [
  'Cleaning',
  'Filling',
  'Crown',
  'Root Canal',
  'Extraction',
  'Implant',
  'Bridge',
  'Veneer',
  'Whitening',
  'Deep Cleaning',
  'Periodontal Treatment',
  'Dentures',
  'Night Guard',
  'Sealant',
  'Bonding',
];

const generateInitialTeeth = (): ToothData[] => {
  const teeth: ToothData[] = [];
  // Upper teeth: 1-16 (right to left from patient's perspective)
  // Lower teeth: 17-32 (left to right from patient's perspective)
  for (let i = 1; i <= 32; i++) {
    teeth.push({
      number: i,
      condition: 'healthy',
      notes: '',
      treatments: [],
      lastUpdated: new Date().toISOString(),
    });
  }
  return teeth;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configurations for export
const dentalChartColumns: ColumnConfig[] = [
  { key: 'id', header: 'Record ID', type: 'string' },
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'teethCount', header: 'Teeth Count', type: 'number' },
  { key: 'treatmentPlanCount', header: 'Treatment Plans', type: 'number' },
  { key: 'appointmentsCount', header: 'Appointments', type: 'number' },
  { key: 'claimsCount', header: 'Claims', type: 'number' },
  { key: 'updatedAt', header: 'Last Updated', type: 'date' },
];

// Generate default dental chart data
const generateDefaultDentalChartData = (): DentalChartData & { id: string } => ({
  id: generateId(),
  patient: { ...DEFAULT_PATIENT, id: generateId() },
  teeth: generateInitialTeeth(),
  xrays: [],
  periodontal: [],
  treatmentPlan: [],
  appointments: [],
  claims: [],
  notes: [],
  reminders: [],
});

interface DentalChartToolProps {
  uiConfig?: UIConfig;
}

export const DentalChartTool: React.FC<DentalChartToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chart');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize useToolData hook for backend persistence
  const {
    data: toolDataArray,
    addItem,
    updateItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<DentalChartData & { id: string }>(
    'dental-chart',
    [generateDefaultDentalChartData()],
    dentalChartColumns,
    { autoSave: true }
  );

  // Get the first (and only) record from the array, or create default
  const data: DentalChartData = toolDataArray[0] || generateDefaultDentalChartData();

  // Helper function to update the data
  const setData = (updater: React.SetStateAction<DentalChartData>) => {
    const currentData = toolDataArray[0] || generateDefaultDentalChartData();
    const newData = typeof updater === 'function' ? updater(currentData) : updater;

    if (toolDataArray.length > 0) {
      updateItem(toolDataArray[0].id, newData as Partial<DentalChartData & { id: string }>);
    } else {
      addItem({ ...newData, id: generateId() } as DentalChartData & { id: string });
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const exportData = toolDataArray.map(item => ({
      ...item,
      patientName: `${item.patient.firstName} ${item.patient.lastName}`.trim() || 'New Patient',
      teethCount: item.teeth.length,
      treatmentPlanCount: item.treatmentPlan.length,
      appointmentsCount: item.appointments.length,
      claimsCount: item.claims.length,
      updatedAt: new Date().toISOString(),
    }));
    exportToCSV(exportData, dentalChartColumns, { filename: 'dental-chart-export' });
  };

  const handleExportExcel = () => {
    const exportData = toolDataArray.map(item => ({
      ...item,
      patientName: `${item.patient.firstName} ${item.patient.lastName}`.trim() || 'New Patient',
      teethCount: item.teeth.length,
      treatmentPlanCount: item.treatmentPlan.length,
      appointmentsCount: item.appointments.length,
      claimsCount: item.claims.length,
      updatedAt: new Date().toISOString(),
    }));
    exportToExcel(exportData, dentalChartColumns, { filename: 'dental-chart-export' });
  };

  const handleExportJSON = () => {
    exportToJSON(toolDataArray, { filename: 'dental-chart-export' });
  };

  const handleExportPDF = async () => {
    const exportData = toolDataArray.map(item => ({
      ...item,
      patientName: `${item.patient.firstName} ${item.patient.lastName}`.trim() || 'New Patient',
      teethCount: item.teeth.length,
      treatmentPlanCount: item.treatmentPlan.length,
      appointmentsCount: item.appointments.length,
      claimsCount: item.claims.length,
      updatedAt: new Date().toISOString(),
    }));
    await exportToPDF(exportData, dentalChartColumns, {
      filename: 'dental-chart-export',
      title: 'Dental Chart Export',
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const exportData = toolDataArray.map(item => ({
      ...item,
      patientName: `${item.patient.firstName} ${item.patient.lastName}`.trim() || 'New Patient',
      teethCount: item.teeth.length,
      treatmentPlanCount: item.treatmentPlan.length,
      appointmentsCount: item.appointments.length,
      claimsCount: item.claims.length,
      updatedAt: new Date().toISOString(),
    }));
    return copyUtil(exportData, dentalChartColumns);
  };

  const handlePrint = () => {
    const exportData = toolDataArray.map(item => ({
      ...item,
      patientName: `${item.patient.firstName} ${item.patient.lastName}`.trim() || 'New Patient',
      teethCount: item.teeth.length,
      treatmentPlanCount: item.treatmentPlan.length,
      appointmentsCount: item.appointments.length,
      claimsCount: item.claims.length,
      updatedAt: new Date().toISOString(),
    }));
    printData(exportData, dentalChartColumns, { title: 'Dental Chart' });
  };

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery edit mode
      if (params.isEditFromGallery) {
        if (params.patient) {
          setData(prev => ({
            ...prev,
            patient: { ...prev.patient, ...params.patient }
          }));
        }
        if (params.patientName) {
          const nameParts = (params.patientName as string).split(' ');
          setData(prev => ({
            ...prev,
            patient: {
              ...prev.patient,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || ''
            }
          }));
        }
        if (params.teeth) {
          setData(prev => ({ ...prev, teeth: params.teeth }));
        }
        if (params.treatmentPlan) {
          setData(prev => ({ ...prev, treatmentPlan: params.treatmentPlan }));
        }
        if (params.appointments) {
          setData(prev => ({ ...prev, appointments: params.appointments }));
        }
        if (params.activeTab) setActiveTab(params.activeTab);
        if (params.editingPatient) setEditingPatient(params.editingPatient);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Regular prefill from AI
        let hasChanges = false;

        if (params.patientName) {
          setData(prev => ({
            ...prev,
            patient: { ...prev.patient, name: params.patientName as string }
          }));
          hasChanges = true;
        }
        if (params.patientId) {
          hasChanges = true;
        }

        if (hasChanges) {
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Form states for adding new items
  const [newTreatmentPlan, setNewTreatmentPlan] = useState<Partial<TreatmentPlanItem>>({});
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({});
  const [newClaim, setNewClaim] = useState<Partial<InsuranceClaim>>({});
  const [newNote, setNewNote] = useState<Partial<ClinicalNote>>({});
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({});
  const [newXray, setNewXray] = useState<Partial<XRayRecord>>({});
  const [newTreatmentForTooth, setNewTreatmentForTooth] = useState<Partial<TreatmentRecord>>({});
  const [editingPatient, setEditingPatient] = useState<PatientProfile>({ ...data.patient });

  // Calculate treatment costs
  const totalEstimatedCosts = useMemo(() => {
    return data.treatmentPlan
      .filter((item) => item.status !== 'completed' && item.status !== 'declined')
      .reduce((sum, item) => sum + item.estimatedCost, 0);
  }, [data.treatmentPlan]);

  const totalClaimsPending = useMemo(() => {
    return data.claims
      .filter((claim) => claim.status === 'pending' || claim.status === 'submitted')
      .reduce((sum, claim) => sum + claim.amount, 0);
  }, [data.claims]);

  // Update patient
  const savePatient = () => {
    setData((prev) => ({ ...prev, patient: editingPatient }));
    setShowPatientEdit(false);
  };

  // Update tooth condition
  const updateTooth = (toothNumber: number, updates: Partial<ToothData>) => {
    setData((prev) => ({
      ...prev,
      teeth: prev.teeth.map((tooth) =>
        tooth.number === toothNumber
          ? { ...tooth, ...updates, lastUpdated: new Date().toISOString() }
          : tooth
      ),
    }));
  };

  // Add treatment to tooth
  const addTreatmentToTooth = (toothNumber: number) => {
    if (!newTreatmentForTooth.procedure) return;
    const treatment: TreatmentRecord = {
      id: generateId(),
      date: newTreatmentForTooth.date || new Date().toISOString().split('T')[0],
      procedure: newTreatmentForTooth.procedure || '',
      cost: newTreatmentForTooth.cost || 0,
      notes: newTreatmentForTooth.notes || '',
      dentist: newTreatmentForTooth.dentist || '',
    };
    updateTooth(toothNumber, {
      treatments: [...(data.teeth.find((t) => t.number === toothNumber)?.treatments || []), treatment],
    });
    setNewTreatmentForTooth({});
  };

  // Add treatment plan item
  const addTreatmentPlanItem = () => {
    if (!newTreatmentPlan.procedure) return;
    const item: TreatmentPlanItem = {
      id: generateId(),
      toothNumber: newTreatmentPlan.toothNumber || null,
      procedure: newTreatmentPlan.procedure || '',
      priority: newTreatmentPlan.priority || 'medium',
      estimatedCost: newTreatmentPlan.estimatedCost || 0,
      status: 'pending',
      notes: newTreatmentPlan.notes || '',
    };
    setData((prev) => ({ ...prev, treatmentPlan: [...prev.treatmentPlan, item] }));
    setNewTreatmentPlan({});
  };

  // Add appointment
  const addAppointment = () => {
    if (!newAppointment.date || !newAppointment.time) return;
    const appointment: Appointment = {
      id: generateId(),
      date: newAppointment.date || '',
      time: newAppointment.time || '',
      type: newAppointment.type || 'General',
      notes: newAppointment.notes || '',
      status: 'scheduled',
    };
    setData((prev) => ({ ...prev, appointments: [...prev.appointments, appointment] }));
    setNewAppointment({});
  };

  // Add claim
  const addClaim = () => {
    if (!newClaim.procedure) return;
    const claim: InsuranceClaim = {
      id: generateId(),
      date: newClaim.date || new Date().toISOString().split('T')[0],
      procedure: newClaim.procedure || '',
      amount: newClaim.amount || 0,
      insurancePaid: newClaim.insurancePaid || 0,
      patientResponsibility: newClaim.patientResponsibility || 0,
      status: 'submitted',
      claimNumber: newClaim.claimNumber || `CLM-${Date.now()}`,
    };
    setData((prev) => ({ ...prev, claims: [...prev.claims, claim] }));
    setNewClaim({});
  };

  // Add clinical note
  const addNote = () => {
    if (!newNote.note) return;
    const note: ClinicalNote = {
      id: generateId(),
      date: new Date().toISOString(),
      note: newNote.note || '',
      author: newNote.author || 'Dr. Smith',
      category: newNote.category || 'general',
    };
    setData((prev) => ({ ...prev, notes: [...prev.notes, note] }));
    setNewNote({});
  };

  // Add reminder
  const addReminder = () => {
    if (!newReminder.date || !newReminder.message) return;
    const reminder: Reminder = {
      id: generateId(),
      type: newReminder.type || 'recall',
      date: newReminder.date || '',
      message: newReminder.message || '',
      status: 'pending',
    };
    setData((prev) => ({ ...prev, reminders: [...prev.reminders, reminder] }));
    setNewReminder({});
  };

  // Add X-ray
  const addXray = () => {
    if (!newXray.type) return;
    const xray: XRayRecord = {
      id: generateId(),
      date: newXray.date || new Date().toISOString().split('T')[0],
      type: newXray.type || '',
      findings: newXray.findings || '',
    };
    setData((prev) => ({ ...prev, xrays: [...prev.xrays, xray] }));
    setNewXray({});
  };

  // Delete handlers
  const deleteItem = (type: 'treatmentPlan' | 'appointments' | 'claims' | 'notes' | 'reminders' | 'xrays', id: string) => {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].filter((item: { id: string }) => item.id !== id),
    }));
  };

  // Update treatment plan status
  const updateTreatmentPlanStatus = (id: string, status: TreatmentPlanItem['status']) => {
    setData((prev) => ({
      ...prev,
      treatmentPlan: prev.treatmentPlan.map((item) => (item.id === id ? { ...item, status } : item)),
    }));
  };

  // Update claim status
  const updateClaimStatus = (id: string, status: InsuranceClaim['status']) => {
    setData((prev) => ({
      ...prev,
      claims: prev.claims.map((claim) => (claim.id === id ? { ...claim, status } : claim)),
    }));
  };

  // Update appointment status
  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((apt) => (apt.id === id ? { ...apt, status } : apt)),
    }));
  };

  // Get tooth color based on condition
  const getToothColor = (condition: ToothCondition) => {
    return TOOTH_CONDITIONS.find((c) => c.value === condition)?.color || '#10b981';
  };

  // Input class helper
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const selectClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const buttonPrimary = 'bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2';

  const buttonSecondary = `px-4 py-2 rounded-lg font-medium transition-colors ${
    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  }`;

  const cardClass = `${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  // Render tooth component
  const renderTooth = (toothNumber: number, isUpper: boolean) => {
    const tooth = data.teeth.find((t) => t.number === toothNumber);
    if (!tooth) return null;

    const isSelected = selectedTooth === toothNumber;
    const color = getToothColor(tooth.condition);

    return (
      <button
        key={toothNumber}
        onClick={() => setSelectedTooth(isSelected ? null : toothNumber)}
        className={`relative w-10 h-14 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
          isSelected ? 'ring-2 ring-[#0D9488] ring-offset-2' : ''
        } ${theme === 'dark' ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
        style={{
          backgroundColor: tooth.condition === 'missing' ? 'transparent' : `${color}20`,
          borderColor: color,
        }}
      >
        <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {toothNumber}
        </span>
        {tooth.condition !== 'healthy' && tooth.condition !== 'missing' && (
          <div
            className="w-3 h-3 rounded-full mt-1"
            style={{ backgroundColor: color }}
          />
        )}
        {tooth.condition === 'missing' && (
          <X className="w-4 h-4 text-gray-400" />
        )}
      </button>
    );
  };

  // Tabs configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'chart', label: 'Dental Chart', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'periodontal', label: 'Periodontal', icon: <Activity className="w-4 h-4" /> },
    { id: 'xrays', label: 'X-Rays', icon: <Camera className="w-4 h-4" /> },
    { id: 'treatment', label: 'Treatment Plan', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'claims', label: 'Insurance', icon: <Receipt className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'reminders', label: 'Reminders', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.dentalChartPatientRecords', 'Dental Chart & Patient Records')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.dentalChart.comprehensiveDentalChartingAndPatient', 'Comprehensive dental charting and patient management')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WidgetEmbedButton toolSlug="dental-chart" toolName="Dental Chart" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onCopyToClipboard={handleCopyToClipboard}
                onPrint={handlePrint}
                theme={theme}
                showImport={false}
              />
            </div>
          </div>

          {/* Patient Profile Section */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <User className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h2 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {data.patient.firstName && data.patient.lastName
                      ? `${data.patient.firstName} ${data.patient.lastName}`
                      : 'New Patient'}
                  </h2>
                  {data.patient.dateOfBirth && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      DOB: {data.patient.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPatient({ ...data.patient });
                  setShowPatientEdit(!showPatientEdit);
                }}
                className={buttonSecondary}
              >
                <Edit2 className="w-4 h-4 mr-1 inline" />
                {showPatientEdit ? t('tools.dentalChart.cancel2', 'Cancel') : t('tools.dentalChart.editPatient', 'Edit Patient')}
              </button>
            </div>

            {showPatientEdit ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.firstName', 'First Name')}</label>
                  <input
                    type="text"
                    value={editingPatient.firstName}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, firstName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.lastName', 'Last Name')}</label>
                  <input
                    type="text"
                    value={editingPatient.lastName}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, lastName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.dateOfBirth', 'Date of Birth')}</label>
                  <input
                    type="date"
                    value={editingPatient.dateOfBirth}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, phone: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.email', 'Email')}</label>
                  <input
                    type="email"
                    value={editingPatient.email}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.address', 'Address')}</label>
                  <input
                    type="text"
                    value={editingPatient.address}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, address: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.insuranceProvider', 'Insurance Provider')}</label>
                  <input
                    type="text"
                    value={editingPatient.insuranceProvider}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, insuranceProvider: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.insuranceId', 'Insurance ID')}</label>
                  <input
                    type="text"
                    value={editingPatient.insuranceId}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, insuranceId: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.groupNumber', 'Group Number')}</label>
                  <input
                    type="text"
                    value={editingPatient.insuranceGroup}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, insuranceGroup: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.emergencyContact', 'Emergency Contact')}</label>
                  <input
                    type="text"
                    value={editingPatient.emergencyContact}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, emergencyContact: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.emergencyPhone', 'Emergency Phone')}</label>
                  <input
                    type="tel"
                    value={editingPatient.emergencyPhone}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, emergencyPhone: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.dentalChart.allergiesCommaSeparated', 'Allergies (comma-separated)')}</label>
                  <input
                    type="text"
                    value={editingPatient.allergies.join(', ')}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>{t('tools.dentalChart.medicalHistory', 'Medical History')}</label>
                  <textarea
                    value={editingPatient.medicalHistory}
                    onChange={(e) => setEditingPatient((p) => ({ ...p, medicalHistory: e.target.value }))}
                    className={`${inputClass} h-20`}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-2">
                  <button onClick={() => setShowPatientEdit(false)} className={buttonSecondary}>
                    {t('tools.dentalChart.cancel', 'Cancel')}
                  </button>
                  <button onClick={savePatient} className={buttonPrimary}>
                    <Save className="w-4 h-4" /> Save Patient
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {data.patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{data.patient.phone}</span>
                  </div>
                )}
                {data.patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{data.patient.email}</span>
                  </div>
                )}
                {data.patient.insuranceProvider && (
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{data.patient.insuranceProvider}</span>
                  </div>
                )}
                {data.patient.allergies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Allergies: {data.patient.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`}>{t('tools.dentalChart.pendingTreatments', 'Pending Treatments')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>
                {data.treatmentPlan.filter((t) => t.status === 'pending').length}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-green-600'}`}>{t('tools.dentalChart.estCosts', 'Est. Costs')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-green-700'}`}>
                ${totalEstimatedCosts.toLocaleString()}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-yellow-600'}`}>{t('tools.dentalChart.claimsPending', 'Claims Pending')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-yellow-700'}`}>
                ${totalClaimsPending.toLocaleString()}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-purple-600'}`}>{t('tools.dentalChart.upcomingAppts', 'Upcoming Appts')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-purple-700'}`}>
                {data.appointments.filter((a) => a.status === 'scheduled').length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {/* Dental Chart Tab */}
          {activeTab === 'chart' && (
            <div className="space-y-6">
              {/* Condition Legend */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.conditionLegend', 'Condition Legend')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {TOOTH_CONDITIONS.map((condition) => (
                    <div key={condition.value} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: condition.color }}
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {condition.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dental Chart Grid */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.upperTeethMaxillary', 'Upper Teeth (Maxillary)')}
                </h3>
                <div className="flex justify-center gap-1 mb-6 flex-wrap">
                  {/* Upper Right (1-8) */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => renderTooth(num, true))}
                  </div>
                  <div className={`w-px h-14 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'} mx-2`} />
                  {/* Upper Left (9-16) */}
                  <div className="flex gap-1">
                    {[9, 10, 11, 12, 13, 14, 15, 16].map((num) => renderTooth(num, true))}
                  </div>
                </div>

                <div className={`border-t-2 my-4 ${theme === 'dark' ? 'border-gray-500' : 'border-gray-400'}`} />

                <h3 className={`font-semibold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.lowerTeethMandibular', 'Lower Teeth (Mandibular)')}
                </h3>
                <div className="flex justify-center gap-1 flex-wrap">
                  {/* Lower Left (17-24) */}
                  <div className="flex gap-1">
                    {[32, 31, 30, 29, 28, 27, 26, 25].map((num) => renderTooth(num, false))}
                  </div>
                  <div className={`w-px h-14 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'} mx-2`} />
                  {/* Lower Right (25-32) */}
                  <div className="flex gap-1">
                    {[24, 23, 22, 21, 20, 19, 18, 17].map((num) => renderTooth(num, false))}
                  </div>
                </div>
              </div>

              {/* Selected Tooth Details */}
              {selectedTooth && (
                <div className={`p-6 rounded-lg border-2 border-[#0D9488] ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Tooth #{selectedTooth} Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>{t('tools.dentalChart.condition', 'Condition')}</label>
                      <select
                        value={data.teeth.find((t) => t.number === selectedTooth)?.condition || 'healthy'}
                        onChange={(e) => updateTooth(selectedTooth, { condition: e.target.value as ToothCondition })}
                        className={selectClass}
                      >
                        {TOOTH_CONDITIONS.map((condition) => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.dentalChart.notes', 'Notes')}</label>
                      <input
                        type="text"
                        value={data.teeth.find((t) => t.number === selectedTooth)?.notes || ''}
                        onChange={(e) => updateTooth(selectedTooth, { notes: e.target.value })}
                        placeholder={t('tools.dentalChart.addNotesForThisTooth', 'Add notes for this tooth')}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Treatment History for this tooth */}
                  <div className="mt-4">
                    <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.dentalChart.treatmentHistory', 'Treatment History')}
                    </h4>

                    {/* Add Treatment Form */}
                    <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className={labelClass}>{t('tools.dentalChart.date', 'Date')}</label>
                          <input
                            type="date"
                            value={newTreatmentForTooth.date || ''}
                            onChange={(e) => setNewTreatmentForTooth((p) => ({ ...p, date: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.dentalChart.procedure', 'Procedure')}</label>
                          <select
                            value={newTreatmentForTooth.procedure || ''}
                            onChange={(e) => setNewTreatmentForTooth((p) => ({ ...p, procedure: e.target.value }))}
                            className={selectClass}
                          >
                            <option value="">{t('tools.dentalChart.selectProcedure', 'Select procedure')}</option>
                            {PROCEDURES.map((proc) => (
                              <option key={proc} value={proc}>{proc}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.dentalChart.cost', 'Cost ($)')}</label>
                          <input
                            type="number"
                            value={newTreatmentForTooth.cost || ''}
                            onChange={(e) => setNewTreatmentForTooth((p) => ({ ...p, cost: parseFloat(e.target.value) }))}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => addTreatmentToTooth(selectedTooth)}
                            className={buttonPrimary}
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Treatment List */}
                    <div className="space-y-2">
                      {data.teeth
                        .find((t) => t.number === selectedTooth)
                        ?.treatments.map((treatment) => (
                          <div
                            key={treatment.id}
                            className={`p-3 rounded-lg flex justify-between items-center ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
                            }`}
                          >
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {treatment.procedure}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {treatment.date} - ${treatment.cost}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const tooth = data.teeth.find((t) => t.number === selectedTooth);
                                if (tooth) {
                                  updateTooth(selectedTooth, {
                                    treatments: tooth.treatments.filter((t) => t.id !== treatment.id),
                                  });
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      {(data.teeth.find((t) => t.number === selectedTooth)?.treatments.length || 0) === 0 && (
                        <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.dentalChart.noTreatmentHistoryForThis', 'No treatment history for this tooth')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Periodontal Tab */}
          {activeTab === 'periodontal' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.periodontalCharting', 'Periodontal Charting')}
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.dentalChart.recordPocketDepthsBleedingPoints', 'Record pocket depths, bleeding points, and gum recession for each tooth.')}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                        <th className={`py-2 px-2 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dentalChart.tooth', 'Tooth')}</th>
                        <th className={`py-2 px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>DB</th>
                        <th className={`py-2 px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>B</th>
                        <th className={`py-2 px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>MB</th>
                        <th className={`py-2 px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>DL</th>
                        <th className={`py-2 px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>L</th>
                        <th className={`py-2 px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>ML</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((toothNum) => (
                        <tr key={toothNum} className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <td className={`py-2 px-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            #{toothNum}
                          </td>
                          {[0, 1, 2, 3, 4, 5].map((site) => (
                            <td key={site} className="py-2 px-2">
                              <input
                                type="number"
                                min="0"
                                max="15"
                                className={`w-12 text-center rounded border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="-"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-yellow-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-yellow-800'}`}>
                    <strong>{t('tools.dentalChart.note', 'Note:')}</strong> Normal pocket depth is 1-3mm. Depths of 4mm or more may indicate periodontal disease.
                    DB=Disto-Buccal, B=Buccal, MB=Mesio-Buccal, DL=Disto-Lingual, L=Lingual, ML=Mesio-Lingual
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* X-Rays Tab */}
          {activeTab === 'xrays' && (
            <div className="space-y-6">
              {/* Add X-Ray Form */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.addXRayRecord', 'Add X-Ray Record')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.date2', 'Date')}</label>
                    <input
                      type="date"
                      value={newXray.date || ''}
                      onChange={(e) => setNewXray((p) => ({ ...p, date: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.type', 'Type')}</label>
                    <select
                      value={newXray.type || ''}
                      onChange={(e) => setNewXray((p) => ({ ...p, type: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">{t('tools.dentalChart.selectType', 'Select type')}</option>
                      <option value="Bitewing">{t('tools.dentalChart.bitewing', 'Bitewing')}</option>
                      <option value="Periapical">{t('tools.dentalChart.periapical', 'Periapical')}</option>
                      <option value="Panoramic">{t('tools.dentalChart.panoramic', 'Panoramic')}</option>
                      <option value="Cephalometric">{t('tools.dentalChart.cephalometric', 'Cephalometric')}</option>
                      <option value="CBCT">{t('tools.dentalChart.cbct3d', 'CBCT (3D)')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.findings', 'Findings')}</label>
                    <input
                      type="text"
                      value={newXray.findings || ''}
                      onChange={(e) => setNewXray((p) => ({ ...p, findings: e.target.value }))}
                      placeholder={t('tools.dentalChart.keyFindings', 'Key findings')}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addXray} className={buttonPrimary}>
                      <Plus className="w-4 h-4" /> Add X-Ray
                    </button>
                  </div>
                </div>
              </div>

              {/* X-Ray List */}
              <div className="space-y-3">
                {data.xrays.map((xray) => (
                  <div
                    key={xray.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Camera className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {xray.type}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {xray.date}
                          </p>
                          {xray.findings && (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              Findings: {xray.findings}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem('xrays', xray.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {data.xrays.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.dentalChart.noXRayRecordsYet', 'No X-ray records yet')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Treatment Plan Tab */}
          {activeTab === 'treatment' && (
            <div className="space-y-6">
              {/* Add Treatment Plan Item */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.addTreatmentPlanItem', 'Add Treatment Plan Item')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.toothOptional', 'Tooth # (optional)')}</label>
                    <input
                      type="number"
                      min="1"
                      max="32"
                      value={newTreatmentPlan.toothNumber || ''}
                      onChange={(e) => setNewTreatmentPlan((p) => ({ ...p, toothNumber: parseInt(e.target.value) || null }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.procedure2', 'Procedure')}</label>
                    <select
                      value={newTreatmentPlan.procedure || ''}
                      onChange={(e) => setNewTreatmentPlan((p) => ({ ...p, procedure: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">{t('tools.dentalChart.selectProcedure2', 'Select procedure')}</option>
                      {PROCEDURES.map((proc) => (
                        <option key={proc} value={proc}>{proc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.priority', 'Priority')}</label>
                    <select
                      value={newTreatmentPlan.priority || 'medium'}
                      onChange={(e) => setNewTreatmentPlan((p) => ({ ...p, priority: e.target.value as TreatmentPlanItem['priority'] }))}
                      className={selectClass}
                    >
                      <option value="urgent">{t('tools.dentalChart.urgent', 'Urgent')}</option>
                      <option value="high">{t('tools.dentalChart.high', 'High')}</option>
                      <option value="medium">{t('tools.dentalChart.medium', 'Medium')}</option>
                      <option value="low">{t('tools.dentalChart.low', 'Low')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.estCost', 'Est. Cost ($)')}</label>
                    <input
                      type="number"
                      value={newTreatmentPlan.estimatedCost || ''}
                      onChange={(e) => setNewTreatmentPlan((p) => ({ ...p, estimatedCost: parseFloat(e.target.value) }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addTreatmentPlanItem} className={buttonPrimary}>
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Treatment Plan List */}
              <div className="space-y-3">
                {data.treatmentPlan.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'declined' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <p className={`font-semibold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.toothNumber ? `#${item.toothNumber} - ` : ''}{item.procedure}
                        </p>
                        <p className={`text-lg font-bold text-[#0D9488]`}>
                          ${item.estimatedCost.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => updateTreatmentPlanStatus(item.id, e.target.value as TreatmentPlanItem['status'])}
                          className={`text-sm rounded ${
                            theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <option value="pending">{t('tools.dentalChart.pending', 'Pending')}</option>
                          <option value="scheduled">{t('tools.dentalChart.scheduled', 'Scheduled')}</option>
                          <option value="completed">{t('tools.dentalChart.completed', 'Completed')}</option>
                          <option value="declined">{t('tools.dentalChart.declined', 'Declined')}</option>
                        </select>
                        <button
                          onClick={() => deleteItem('treatmentPlan', item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {data.treatmentPlan.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.dentalChart.noTreatmentPlanItemsYet', 'No treatment plan items yet')}
                  </p>
                )}
              </div>

              {/* Cost Summary */}
              {data.treatmentPlan.length > 0 && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.dentalChart.totalEstimatedCostPendingScheduled', 'Total Estimated Cost (Pending/Scheduled):')}
                    </span>
                    <span className="text-2xl font-bold text-[#0D9488]">
                      ${totalEstimatedCosts.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Add Appointment Form */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.scheduleAppointment', 'Schedule Appointment')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.date3', 'Date')}</label>
                    <input
                      type="date"
                      value={newAppointment.date || ''}
                      onChange={(e) => setNewAppointment((p) => ({ ...p, date: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.time', 'Time')}</label>
                    <input
                      type="time"
                      value={newAppointment.time || ''}
                      onChange={(e) => setNewAppointment((p) => ({ ...p, time: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.type2', 'Type')}</label>
                    <select
                      value={newAppointment.type || ''}
                      onChange={(e) => setNewAppointment((p) => ({ ...p, type: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">{t('tools.dentalChart.selectType2', 'Select type')}</option>
                      <option value="Cleaning">{t('tools.dentalChart.cleaning', 'Cleaning')}</option>
                      <option value="Checkup">{t('tools.dentalChart.checkup', 'Checkup')}</option>
                      <option value="Treatment">{t('tools.dentalChart.treatment', 'Treatment')}</option>
                      <option value="Emergency">{t('tools.dentalChart.emergency', 'Emergency')}</option>
                      <option value="Consultation">{t('tools.dentalChart.consultation', 'Consultation')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.notes2', 'Notes')}</label>
                    <input
                      type="text"
                      value={newAppointment.notes || ''}
                      onChange={(e) => setNewAppointment((p) => ({ ...p, notes: e.target.value }))}
                      placeholder={t('tools.dentalChart.optionalNotes', 'Optional notes')}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addAppointment} className={buttonPrimary}>
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-3">
                {data.appointments
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Calendar className={`w-8 h-8 ${
                            apt.status === 'completed' ? 'text-green-500' :
                            apt.status === 'cancelled' ? 'text-red-500' :
                            apt.status === 'no_show' ? 'text-orange-500' :
                            'text-blue-500'
                          }`} />
                          <div>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {apt.type}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {apt.date} at {apt.time}
                            </p>
                            {apt.notes && (
                              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={apt.status}
                            onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as Appointment['status'])}
                            className={`text-sm rounded ${
                              theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <option value="scheduled">{t('tools.dentalChart.scheduled2', 'Scheduled')}</option>
                            <option value="completed">{t('tools.dentalChart.completed2', 'Completed')}</option>
                            <option value="cancelled">{t('tools.dentalChart.cancelled', 'Cancelled')}</option>
                            <option value="no_show">{t('tools.dentalChart.noShow', 'No Show')}</option>
                          </select>
                          <button
                            onClick={() => deleteItem('appointments', apt.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {data.appointments.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.dentalChart.noAppointmentsScheduled', 'No appointments scheduled')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Insurance Claims Tab */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              {/* Add Claim Form */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.submitInsuranceClaim', 'Submit Insurance Claim')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.date4', 'Date')}</label>
                    <input
                      type="date"
                      value={newClaim.date || ''}
                      onChange={(e) => setNewClaim((p) => ({ ...p, date: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.procedure3', 'Procedure')}</label>
                    <select
                      value={newClaim.procedure || ''}
                      onChange={(e) => setNewClaim((p) => ({ ...p, procedure: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">{t('tools.dentalChart.selectProcedure3', 'Select procedure')}</option>
                      {PROCEDURES.map((proc) => (
                        <option key={proc} value={proc}>{proc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.amount', 'Amount ($)')}</label>
                    <input
                      type="number"
                      value={newClaim.amount || ''}
                      onChange={(e) => setNewClaim((p) => ({ ...p, amount: parseFloat(e.target.value) }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.insurancePays', 'Insurance Pays ($)')}</label>
                    <input
                      type="number"
                      value={newClaim.insurancePaid || ''}
                      onChange={(e) => setNewClaim((p) => ({ ...p, insurancePaid: parseFloat(e.target.value) }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.patientPays', 'Patient Pays ($)')}</label>
                    <input
                      type="number"
                      value={newClaim.patientResponsibility || ''}
                      onChange={(e) => setNewClaim((p) => ({ ...p, patientResponsibility: parseFloat(e.target.value) }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addClaim} className={buttonPrimary}>
                      <Plus className="w-4 h-4" /> Submit
                    </button>
                  </div>
                </div>
              </div>

              {/* Claims List */}
              <div className="space-y-3">
                {data.claims.map((claim) => (
                  <div
                    key={claim.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            claim.status === 'paid' ? 'bg-green-100 text-green-800' :
                            claim.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            claim.status === 'denied' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {claim.status.toUpperCase()}
                          </span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {claim.claimNumber}
                          </span>
                        </div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {claim.procedure}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {claim.date}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            Total: <strong>${claim.amount}</strong>
                          </span>
                          <span className="text-green-600">
                            Insurance: <strong>${claim.insurancePaid}</strong>
                          </span>
                          <span className="text-orange-600">
                            Patient: <strong>${claim.patientResponsibility}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={claim.status}
                          onChange={(e) => updateClaimStatus(claim.id, e.target.value as InsuranceClaim['status'])}
                          className={`text-sm rounded ${
                            theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <option value="submitted">{t('tools.dentalChart.submitted', 'Submitted')}</option>
                          <option value="pending">{t('tools.dentalChart.pending2', 'Pending')}</option>
                          <option value="approved">{t('tools.dentalChart.approved', 'Approved')}</option>
                          <option value="denied">{t('tools.dentalChart.denied', 'Denied')}</option>
                          <option value="paid">{t('tools.dentalChart.paid', 'Paid')}</option>
                        </select>
                        <button
                          onClick={() => deleteItem('claims', claim.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {data.claims.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.dentalChart.noInsuranceClaimsYet', 'No insurance claims yet')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Clinical Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.addClinicalNote', 'Add Clinical Note')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.category', 'Category')}</label>
                    <select
                      value={newNote.category || 'general'}
                      onChange={(e) => setNewNote((p) => ({ ...p, category: e.target.value as ClinicalNote['category'] }))}
                      className={selectClass}
                    >
                      <option value="general">{t('tools.dentalChart.general', 'General')}</option>
                      <option value="treatment">{t('tools.dentalChart.treatment2', 'Treatment')}</option>
                      <option value="followup">{t('tools.dentalChart.followUp', 'Follow-up')}</option>
                      <option value="emergency">{t('tools.dentalChart.emergency2', 'Emergency')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.author', 'Author')}</label>
                    <input
                      type="text"
                      value={newNote.author || ''}
                      onChange={(e) => setNewNote((p) => ({ ...p, author: e.target.value }))}
                      placeholder={t('tools.dentalChart.drSmith', 'Dr. Smith')}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.dentalChart.note2', 'Note')}</label>
                    <textarea
                      value={newNote.note || ''}
                      onChange={(e) => setNewNote((p) => ({ ...p, note: e.target.value }))}
                      placeholder={t('tools.dentalChart.enterClinicalNote', 'Enter clinical note...')}
                      className={`${inputClass} h-20`}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={addNote} className={buttonPrimary}>
                    <Plus className="w-4 h-4" /> Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {data.notes
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              note.category === 'emergency' ? 'bg-red-100 text-red-800' :
                              note.category === 'treatment' ? 'bg-blue-100 text-blue-800' :
                              note.category === 'followup' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {note.category.toUpperCase()}
                            </span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              by {note.author}
                            </span>
                          </div>
                          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {note.note}
                          </p>
                          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(note.date).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteItem('notes', note.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {data.notes.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.dentalChart.noClinicalNotesYet', 'No clinical notes yet')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              {/* Add Reminder Form */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalChart.scheduleReminder', 'Schedule Reminder')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.type3', 'Type')}</label>
                    <select
                      value={newReminder.type || 'recall'}
                      onChange={(e) => setNewReminder((p) => ({ ...p, type: e.target.value as Reminder['type'] }))}
                      className={selectClass}
                    >
                      <option value="recall">{t('tools.dentalChart.recall', 'Recall')}</option>
                      <option value="followup">{t('tools.dentalChart.followUp2', 'Follow-up')}</option>
                      <option value="treatment">{t('tools.dentalChart.treatment3', 'Treatment')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dentalChart.date5', 'Date')}</label>
                    <input
                      type="date"
                      value={newReminder.date || ''}
                      onChange={(e) => setNewReminder((p) => ({ ...p, date: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.dentalChart.message', 'Message')}</label>
                    <input
                      type="text"
                      value={newReminder.message || ''}
                      onChange={(e) => setNewReminder((p) => ({ ...p, message: e.target.value }))}
                      placeholder={t('tools.dentalChart.reminderMessage', 'Reminder message...')}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={addReminder} className={buttonPrimary}>
                    <Plus className="w-4 h-4" /> Add Reminder
                  </button>
                </div>
              </div>

              {/* Reminders List */}
              <div className="space-y-3">
                {data.reminders
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Bell className={`w-8 h-8 ${
                            reminder.status === 'completed' ? 'text-green-500' :
                            reminder.status === 'sent' ? 'text-blue-500' :
                            'text-yellow-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                reminder.type === 'recall' ? 'bg-blue-100 text-blue-800' :
                                reminder.type === 'followup' ? 'bg-purple-100 text-purple-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {reminder.type.toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                reminder.status === 'completed' ? 'bg-green-100 text-green-800' :
                                reminder.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {reminder.status.toUpperCase()}
                              </span>
                            </div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {reminder.message}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {reminder.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setData((prev) => ({
                                ...prev,
                                reminders: prev.reminders.map((r) =>
                                  r.id === reminder.id ? { ...r, status: 'completed' as const } : r
                                ),
                              }));
                            }}
                            className={`px-3 py-1 rounded text-sm ${
                              theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem('reminders', reminder.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {data.reminders.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.dentalChart.noRemindersScheduled', 'No reminders scheduled')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DentalChartTool;
