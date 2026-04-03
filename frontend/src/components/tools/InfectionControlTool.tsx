'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Activity,
  Users,
  Building2,
  ClipboardList,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  FileText,
  Hand,
  Droplets,
  Stethoscope,
  Thermometer,
  Eye,
  Target,
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
interface InfectionCase {
  id: string;
  patientId: string;
  patientName: string;
  location: string;
  unit: string;
  infectionType: 'CAUTI' | 'CLABSI' | 'SSI' | 'VAP' | 'CDI' | 'MRSA' | 'VRE' | 'other';
  organism: string;
  cultureDate: string;
  onsetDate: string;
  deviceAssociated: boolean;
  deviceType?: string;
  daysOnDevice?: number;
  treatment: string;
  outcome: 'resolved' | 'ongoing' | 'deceased';
  isolationPrecautions: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Outbreak {
  id: string;
  name: string;
  organism: string;
  startDate: string;
  endDate?: string;
  affectedUnits: string[];
  caseCount: number;
  cases: string[];
  status: 'active' | 'contained' | 'resolved';
  interventions: string[];
  investigation: string;
  createdAt: string;
  updatedAt: string;
}

interface SurveillanceMetric {
  id: string;
  period: string;
  unit: string;
  infectionType: string;
  caseCount: number;
  deviceDays: number;
  patientDays: number;
  rate: number;
  benchmark: number;
  createdAt: string;
}

interface HandHygieneAudit {
  id: string;
  date: string;
  unit: string;
  observer: string;
  opportunitiesObserved: number;
  complianceEvents: number;
  complianceRate: number;
  notes: string;
  createdAt: string;
}

interface EnvironmentRound {
  id: string;
  date: string;
  unit: string;
  inspector: string;
  findingsCount: number;
  criticalFindings: number;
  findings: string[];
  correctiveActions: string[];
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
}

interface InfectionControlToolProps {
  uiConfig?: UIConfig;
}

type TabType = 'cases' | 'outbreaks' | 'surveillance' | 'hand-hygiene' | 'environment' | 'dashboard';

const TOOL_ID = 'infection-control';

const infectionCaseColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'infectionType', header: 'Infection Type', type: 'string' },
  { key: 'organism', header: 'Organism', type: 'string' },
  { key: 'outcome', header: 'Outcome', type: 'string' },
  { key: 'onsetDate', header: 'Onset Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewInfectionCase = (): InfectionCase => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  location: '',
  unit: '',
  infectionType: 'CAUTI',
  organism: '',
  cultureDate: new Date().toISOString().split('T')[0],
  onsetDate: new Date().toISOString().split('T')[0],
  deviceAssociated: false,
  deviceType: '',
  daysOnDevice: 0,
  treatment: '',
  outcome: 'ongoing',
  isolationPrecautions: [],
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewOutbreak = (): Outbreak => ({
  id: crypto.randomUUID(),
  name: '',
  organism: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  affectedUnits: [],
  caseCount: 0,
  cases: [],
  status: 'active',
  interventions: [],
  investigation: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewSurveillanceMetric = (): SurveillanceMetric => ({
  id: crypto.randomUUID(),
  period: new Date().toISOString().split('T')[0].substring(0, 7),
  unit: '',
  infectionType: 'CAUTI',
  caseCount: 0,
  deviceDays: 0,
  patientDays: 0,
  rate: 0,
  benchmark: 0,
  createdAt: new Date().toISOString(),
});

const createNewHandHygieneAudit = (): HandHygieneAudit => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString().split('T')[0],
  unit: '',
  observer: '',
  opportunitiesObserved: 0,
  complianceEvents: 0,
  complianceRate: 0,
  notes: '',
  createdAt: new Date().toISOString(),
});

const createNewEnvironmentRound = (): EnvironmentRound => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString().split('T')[0],
  unit: '',
  inspector: '',
  findingsCount: 0,
  criticalFindings: 0,
  findings: [],
  correctiveActions: [],
  status: 'open',
  createdAt: new Date().toISOString(),
});

const infectionTypes = [
  { value: 'CAUTI', label: 'CAUTI (Catheter-Associated UTI)', icon: Droplets },
  { value: 'CLABSI', label: 'CLABSI (Central Line-Associated BSI)', icon: Activity },
  { value: 'SSI', label: 'SSI (Surgical Site Infection)', icon: Stethoscope },
  { value: 'VAP', label: 'VAP (Ventilator-Associated Pneumonia)', icon: Activity },
  { value: 'CDI', label: 'CDI (Clostridioides difficile)', icon: AlertTriangle },
  { value: 'MRSA', label: 'MRSA', icon: ShieldAlert },
  { value: 'VRE', label: 'VRE', icon: ShieldAlert },
  { value: 'other', label: 'Other', icon: AlertCircle },
];

const deviceTypes = [
  'Central Venous Catheter',
  'Peripheral IV Catheter',
  'Urinary Catheter',
  'Mechanical Ventilator',
  'Endotracheal Tube',
  'Tracheostomy',
  'Feeding Tube',
  'Surgical Drain',
  'Other',
];

const isolationPrecautionTypes = [
  'Standard Precautions',
  'Contact Precautions',
  'Droplet Precautions',
  'Airborne Precautions',
  'Protective Environment',
  'Contact + Droplet',
  'Contact + Airborne',
];

const commonOrganisms = [
  'Staphylococcus aureus (MSSA)',
  'Staphylococcus aureus (MRSA)',
  'Escherichia coli',
  'Klebsiella pneumoniae',
  'Pseudomonas aeruginosa',
  'Acinetobacter baumannii',
  'Enterococcus faecalis',
  'Enterococcus faecium (VRE)',
  'Clostridioides difficile',
  'Candida albicans',
  'Candida auris',
  'Streptococcus pneumoniae',
  'Enterobacter spp.',
];

const hospitalUnits = [
  'ICU',
  'MICU',
  'SICU',
  'CCU',
  'NICU',
  'PICU',
  'Emergency Department',
  'Medical/Surgical',
  'Orthopedics',
  'Oncology',
  'Cardiology',
  'Neurology',
  'Transplant',
  'Labor & Delivery',
  'Rehabilitation',
  'Long-term Care',
];

const commonInterventions = [
  'Enhanced environmental cleaning',
  'Contact precautions implemented',
  'Staff education/training',
  'Antibiotic stewardship review',
  'Active surveillance cultures',
  'Cohort nursing',
  'Visitor restrictions',
  'Equipment decontamination',
  'Hand hygiene campaign',
  'Isolation room assignment',
];

export const InfectionControlTool: React.FC<InfectionControlToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Data management hooks
  const {
    data: infectionCases,
    addItem: addCase,
    updateItem: updateCase,
    deleteItem: deleteCase,
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
  } = useToolData<InfectionCase>(TOOL_ID, [], infectionCaseColumns);

  const {
    data: outbreaks,
    addItem: addOutbreak,
    updateItem: updateOutbreak,
    deleteItem: deleteOutbreak,
  } = useToolData<Outbreak>(`${TOOL_ID}-outbreaks`, [], []);

  const {
    data: surveillanceMetrics,
    addItem: addMetric,
    updateItem: updateMetric,
    deleteItem: deleteMetric,
  } = useToolData<SurveillanceMetric>(`${TOOL_ID}-surveillance`, [], []);

  const {
    data: handHygieneAudits,
    addItem: addAudit,
    updateItem: updateAudit,
    deleteItem: deleteAudit,
  } = useToolData<HandHygieneAudit>(`${TOOL_ID}-hand-hygiene`, [], []);

  const {
    data: environmentRounds,
    addItem: addRound,
    updateItem: updateRound,
    deleteItem: deleteRound,
  } = useToolData<EnvironmentRound>(`${TOOL_ID}-environment`, [], []);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal states
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showOutbreakModal, setShowOutbreakModal] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showRoundModal, setShowRoundModal] = useState(false);

  // Selected items
  const [selectedCase, setSelectedCase] = useState<InfectionCase | null>(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState<Outbreak | null>(null);

  // Editing states
  const [editingCase, setEditingCase] = useState<InfectionCase | null>(null);
  const [editingOutbreak, setEditingOutbreak] = useState<Outbreak | null>(null);
  const [editingMetric, setEditingMetric] = useState<SurveillanceMetric | null>(null);
  const [editingAudit, setEditingAudit] = useState<HandHygieneAudit | null>(null);
  const [editingRound, setEditingRound] = useState<EnvironmentRound | null>(null);

  // Form data
  const [caseFormData, setCaseFormData] = useState<InfectionCase>(createNewInfectionCase());
  const [outbreakFormData, setOutbreakFormData] = useState<Outbreak>(createNewOutbreak());
  const [metricFormData, setMetricFormData] = useState<SurveillanceMetric>(createNewSurveillanceMetric());
  const [auditFormData, setAuditFormData] = useState<HandHygieneAudit>(createNewHandHygieneAudit());
  const [roundFormData, setRoundFormData] = useState<EnvironmentRound>(createNewEnvironmentRound());

  // Temp input states
  const [newPrecaution, setNewPrecaution] = useState('');
  const [newIntervention, setNewIntervention] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newFinding, setNewFinding] = useState('');
  const [newAction, setNewAction] = useState('');

  // Statistics
  const stats = useMemo(() => {
    const activeOutbreaks = outbreaks.filter(o => o.status === 'active').length;
    const ongoingCases = infectionCases.filter(c => c.outcome === 'ongoing').length;
    const resolvedCases = infectionCases.filter(c => c.outcome === 'resolved').length;
    const deceasedCases = infectionCases.filter(c => c.outcome === 'deceased').length;

    const deviceAssociated = infectionCases.filter(c => c.deviceAssociated).length;

    const typeBreakdown = infectionTypes.map(type => ({
      type: type.value,
      label: type.label.split(' ')[0],
      count: infectionCases.filter(c => c.infectionType === type.value).length
    }));

    const avgHandHygieneCompliance = handHygieneAudits.length > 0
      ? (handHygieneAudits.reduce((sum, a) => sum + a.complianceRate, 0) / handHygieneAudits.length).toFixed(1)
      : 0;

    const openEnvironmentIssues = environmentRounds.filter(r => r.status !== 'closed')
      .reduce((sum, r) => sum + r.findingsCount, 0);

    return {
      totalCases: infectionCases.length,
      ongoingCases,
      resolvedCases,
      deceasedCases,
      activeOutbreaks,
      deviceAssociated,
      typeBreakdown,
      avgHandHygieneCompliance,
      openEnvironmentIssues,
      totalAudits: handHygieneAudits.length,
    };
  }, [infectionCases, outbreaks, handHygieneAudits, environmentRounds]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return infectionCases.filter(c => {
      const matchesSearch = searchQuery === '' ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.organism.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnit = filterUnit === '' || c.unit === filterUnit;
      const matchesType = filterType === '' || c.infectionType === filterType;
      const matchesOutcome = filterOutcome === '' || c.outcome === filterOutcome;
      const matchesDateFrom = dateFrom === '' || c.onsetDate >= dateFrom;
      const matchesDateTo = dateTo === '' || c.onsetDate <= dateTo;
      return matchesSearch && matchesUnit && matchesType && matchesOutcome && matchesDateFrom && matchesDateTo;
    });
  }, [infectionCases, searchQuery, filterUnit, filterType, filterOutcome, dateFrom, dateTo]);

  // Handlers
  const handleSaveCase = () => {
    if (editingCase) {
      updateCase(caseFormData.id, { ...caseFormData, updatedAt: new Date().toISOString() });
    } else {
      addCase({ ...caseFormData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowCaseModal(false);
    setEditingCase(null);
    setCaseFormData(createNewInfectionCase());
  };

  const handleSaveOutbreak = () => {
    const updatedOutbreak = {
      ...outbreakFormData,
      caseCount: outbreakFormData.cases.length,
      updatedAt: new Date().toISOString()
    };
    if (editingOutbreak) {
      updateOutbreak(outbreakFormData.id, updatedOutbreak);
    } else {
      addOutbreak({ ...updatedOutbreak, createdAt: new Date().toISOString() });
    }
    setShowOutbreakModal(false);
    setEditingOutbreak(null);
    setOutbreakFormData(createNewOutbreak());
  };

  const handleSaveMetric = () => {
    // Calculate rate per 1000 device days
    const rate = metricFormData.deviceDays > 0
      ? (metricFormData.caseCount / metricFormData.deviceDays) * 1000
      : 0;
    const updatedMetric = { ...metricFormData, rate: parseFloat(rate.toFixed(2)) };

    if (editingMetric) {
      updateMetric(metricFormData.id, updatedMetric);
    } else {
      addMetric({ ...updatedMetric, createdAt: new Date().toISOString() });
    }
    setShowMetricModal(false);
    setEditingMetric(null);
    setMetricFormData(createNewSurveillanceMetric());
  };

  const handleSaveAudit = () => {
    // Calculate compliance rate
    const rate = auditFormData.opportunitiesObserved > 0
      ? (auditFormData.complianceEvents / auditFormData.opportunitiesObserved) * 100
      : 0;
    const updatedAudit = { ...auditFormData, complianceRate: parseFloat(rate.toFixed(1)) };

    if (editingAudit) {
      updateAudit(auditFormData.id, updatedAudit);
    } else {
      addAudit({ ...updatedAudit, createdAt: new Date().toISOString() });
    }
    setShowAuditModal(false);
    setEditingAudit(null);
    setAuditFormData(createNewHandHygieneAudit());
  };

  const handleSaveRound = () => {
    const updatedRound = {
      ...roundFormData,
      findingsCount: roundFormData.findings.length
    };

    if (editingRound) {
      updateRound(roundFormData.id, updatedRound);
    } else {
      addRound({ ...updatedRound, createdAt: new Date().toISOString() });
    }
    setShowRoundModal(false);
    setEditingRound(null);
    setRoundFormData(createNewEnvironmentRound());
  };

  const handleDeleteCase = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Case',
      message: 'Are you sure you want to delete this infection case?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteCase(id);
      if (selectedCase?.id === id) setSelectedCase(null);
    }
  };

  const handleDeleteOutbreak = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Outbreak',
      message: 'Are you sure you want to delete this outbreak record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOutbreak(id);
      if (selectedOutbreak?.id === id) setSelectedOutbreak(null);
    }
  };

  const openEditCaseModal = (c: InfectionCase) => {
    setEditingCase(c);
    setCaseFormData(c);
    setShowCaseModal(true);
  };

  const openEditOutbreakModal = (o: Outbreak) => {
    setEditingOutbreak(o);
    setOutbreakFormData(o);
    setShowOutbreakModal(true);
  };

  const openEditMetricModal = (m: SurveillanceMetric) => {
    setEditingMetric(m);
    setMetricFormData(m);
    setShowMetricModal(true);
  };

  const openEditAuditModal = (a: HandHygieneAudit) => {
    setEditingAudit(a);
    setAuditFormData(a);
    setShowAuditModal(true);
  };

  const openEditRoundModal = (r: EnvironmentRound) => {
    setEditingRound(r);
    setRoundFormData(r);
    setShowRoundModal(true);
  };

  // Helper functions
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ongoing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'deceased': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'contained': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'closed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = infectionTypes.find(t => t.value === type);
    return typeConfig?.icon || AlertCircle;
  };

  const addPrecaution = () => {
    if (newPrecaution.trim() && !caseFormData.isolationPrecautions.includes(newPrecaution.trim())) {
      setCaseFormData({ ...caseFormData, isolationPrecautions: [...caseFormData.isolationPrecautions, newPrecaution.trim()] });
      setNewPrecaution('');
    }
  };

  const removePrecaution = (precaution: string) => {
    setCaseFormData({ ...caseFormData, isolationPrecautions: caseFormData.isolationPrecautions.filter(p => p !== precaution) });
  };

  const addInterventionToOutbreak = () => {
    if (newIntervention.trim() && !outbreakFormData.interventions.includes(newIntervention.trim())) {
      setOutbreakFormData({ ...outbreakFormData, interventions: [...outbreakFormData.interventions, newIntervention.trim()] });
      setNewIntervention('');
    }
  };

  const removeIntervention = (intervention: string) => {
    setOutbreakFormData({ ...outbreakFormData, interventions: outbreakFormData.interventions.filter(i => i !== intervention) });
  };

  const addAffectedUnit = () => {
    if (newUnit.trim() && !outbreakFormData.affectedUnits.includes(newUnit.trim())) {
      setOutbreakFormData({ ...outbreakFormData, affectedUnits: [...outbreakFormData.affectedUnits, newUnit.trim()] });
      setNewUnit('');
    }
  };

  const removeAffectedUnit = (unit: string) => {
    setOutbreakFormData({ ...outbreakFormData, affectedUnits: outbreakFormData.affectedUnits.filter(u => u !== unit) });
  };

  const addFindingToRound = () => {
    if (newFinding.trim() && !roundFormData.findings.includes(newFinding.trim())) {
      setRoundFormData({ ...roundFormData, findings: [...roundFormData.findings, newFinding.trim()] });
      setNewFinding('');
    }
  };

  const removeFinding = (finding: string) => {
    setRoundFormData({ ...roundFormData, findings: roundFormData.findings.filter(f => f !== finding) });
  };

  const addActionToRound = () => {
    if (newAction.trim() && !roundFormData.correctiveActions.includes(newAction.trim())) {
      setRoundFormData({ ...roundFormData, correctiveActions: [...roundFormData.correctiveActions, newAction.trim()] });
      setNewAction('');
    }
  };

  const removeAction = (action: string) => {
    setRoundFormData({ ...roundFormData, correctiveActions: roundFormData.correctiveActions.filter(a => a !== action) });
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-red-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
      : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  // Dashboard Component
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Cases</p>
              <p className="text-2xl font-bold text-red-500">{stats.totalCases}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ongoing</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.ongoingCases}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Active Outbreaks</p>
              <p className="text-2xl font-bold text-orange-500">{stats.activeOutbreaks}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Hand className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Hand Hygiene</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.avgHandHygieneCompliance}%</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Resolved</p>
              <p className="text-2xl font-bold text-green-500">{stats.resolvedCases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Infection Type Breakdown */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            Infection Type Breakdown
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {stats.typeBreakdown.map(item => (
              <div key={item.type} className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-2xl font-bold text-red-400">{item.count}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Outbreaks & Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Outbreaks */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Active Outbreaks
            </h3>
          </div>
          <div className="p-4">
            {outbreaks.filter(o => o.status === 'active').length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No active outbreaks</p>
            ) : (
              <div className="space-y-3">
                {outbreaks.filter(o => o.status === 'active').map(outbreak => (
                  <div key={outbreak.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{outbreak.name}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {outbreak.organism} - {outbreak.caseCount} cases
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(outbreak.status)}`}>
                        {outbreak.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Cases */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              Recent Cases
            </h3>
          </div>
          <div className="p-4">
            {infectionCases.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No cases recorded</p>
            ) : (
              <div className="space-y-3">
                {[...infectionCases].sort((a, b) => new Date(b.onsetDate).getTime() - new Date(a.onsetDate).getTime()).slice(0, 5).map(c => {
                  const TypeIcon = getTypeIcon(c.infectionType);
                  return (
                    <div key={c.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="w-4 h-4 text-red-400" />
                          <div>
                            <p className="font-medium">{c.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {c.infectionType} - {c.unit}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded border ${getOutcomeColor(c.outcome)}`}>
                          {c.outcome}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environment & Hand Hygiene Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold flex items-center gap-2">
              <Hand className="w-5 h-5 text-cyan-500" />
              {t('tools.infectionControl.handHygieneComplianceTrend', 'Hand Hygiene Compliance Trend')}
            </h3>
          </div>
          <div className="p-4">
            {handHygieneAudits.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.infectionControl.noAuditsRecorded', 'No audits recorded')}</p>
            ) : (
              <div className="space-y-2">
                {[...handHygieneAudits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(audit => (
                  <div key={audit.id} className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{audit.date} - {audit.unit}</span>
                    <span className={`font-medium ${audit.complianceRate >= 80 ? 'text-green-400' : audit.complianceRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {audit.complianceRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              {t('tools.infectionControl.environmentOfCare', 'Environment of Care')}
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-2xl font-bold text-purple-400">{environmentRounds.length}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.infectionControl.totalRounds', 'Total Rounds')}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-2xl font-bold text-orange-400">{stats.openEnvironmentIssues}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.infectionControl.openIssues', 'Open Issues')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Cases Tab
  const renderCases = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className={`${cardClass} p-4`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.infectionControl.searchPatientOrganism', 'Search patient, organism...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className={`${inputClass} w-full lg:w-40`}>
            <option value="">{t('tools.infectionControl.allUnits', 'All Units')}</option>
            {hospitalUnits.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full lg:w-40`}>
            <option value="">{t('tools.infectionControl.allTypes', 'All Types')}</option>
            {infectionTypes.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
          </select>
          <select value={filterOutcome} onChange={(e) => setFilterOutcome(e.target.value)} className={`${inputClass} w-full lg:w-40`}>
            <option value="">{t('tools.infectionControl.allOutcomes', 'All Outcomes')}</option>
            <option value="ongoing">{t('tools.infectionControl.ongoing', 'Ongoing')}</option>
            <option value="resolved">{t('tools.infectionControl.resolved', 'Resolved')}</option>
            <option value="deceased">{t('tools.infectionControl.deceased', 'Deceased')}</option>
          </select>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.infectionControl.from', 'From:')}</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} w-40`} />
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.infectionControl.to', 'To:')}</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} w-40`} />
          </div>
          {(dateFrom || dateTo || filterUnit || filterType || filterOutcome || searchQuery) && (
            <button
              onClick={() => { setSearchQuery(''); setFilterUnit(''); setFilterType(''); setFilterOutcome(''); setDateFrom(''); setDateTo(''); }}
              className={buttonSecondary}
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Infection Cases ({filteredCases.length})</h2>
            <button onClick={() => { setCaseFormData(createNewInfectionCase()); setShowCaseModal(true); }} className={buttonPrimary}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.infectionControl.noCasesFound', 'No cases found')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredCases.map(c => {
                  const TypeIcon = getTypeIcon(c.infectionType);
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedCase?.id === c.id
                          ? 'bg-red-500/10 border-l-4 border-red-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium">{c.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {c.infectionType} - {c.unit}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getOutcomeColor(c.outcome)}`}>
                              {c.outcome}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditCaseModal(c); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCase(c.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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

        {/* Case Details */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedCase ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedCase.patientName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getOutcomeColor(selectedCase.outcome)}`}>
                        {selectedCase.outcome}
                      </span>
                      {selectedCase.deviceAssociated && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">{t('tools.infectionControl.deviceAssociated', 'Device-Associated')}</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Patient ID: {selectedCase.patientId} | {selectedCase.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Case Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.infectionType', 'Infection Type')}</p>
                    <p className="font-medium">{selectedCase.infectionType}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.organism', 'Organism')}</p>
                    <p className="font-medium">{selectedCase.organism || 'Pending'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.onsetDate', 'Onset Date')}</p>
                    <p className="font-medium">{selectedCase.onsetDate}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.cultureDate', 'Culture Date')}</p>
                    <p className="font-medium">{selectedCase.cultureDate}</p>
                  </div>
                </div>

                {/* Device Info */}
                {selectedCase.deviceAssociated && (
                  <div className={`p-4 rounded-lg border border-blue-500/30 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-400">
                      <Activity className="w-4 h-4" />
                      {t('tools.infectionControl.deviceInformation', 'Device Information')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.infectionControl.deviceType', 'Device Type')}</p>
                        <p className="font-medium">{selectedCase.deviceType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.infectionControl.daysOnDevice', 'Days on Device')}</p>
                        <p className="font-medium">{selectedCase.daysOnDevice} days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Isolation Precautions */}
                {selectedCase.isolationPrecautions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-yellow-500" />
                      {t('tools.infectionControl.isolationPrecautions2', 'Isolation Precautions')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.isolationPrecautions.map((p, i) => (
                        <span key={i} className={`px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-400`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment */}
                {selectedCase.treatment && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-green-500" />
                      {t('tools.infectionControl.treatment2', 'Treatment')}
                    </h3>
                    <p className="text-sm">{selectedCase.treatment}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedCase.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {t('tools.infectionControl.notes4', 'Notes')}
                    </h3>
                    <p className="text-sm">{selectedCase.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <ShieldAlert className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.infectionControl.selectAnInfectionCase', 'Select an infection case')}</p>
              <p className="text-sm">{t('tools.infectionControl.chooseACaseToView', 'Choose a case to view details')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Outbreaks Tab
  const renderOutbreaks = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setOutbreakFormData(createNewOutbreak()); setShowOutbreakModal(true); }} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Outbreak
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {outbreaks.length === 0 ? (
          <div className={`${cardClass} col-span-2 p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.infectionControl.noOutbreaksRecorded', 'No outbreaks recorded')}</p>
          </div>
        ) : (
          outbreaks.map(outbreak => (
            <div key={outbreak.id} className={cardClass}>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{outbreak.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(outbreak.status)}`}>
                        {outbreak.status}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {outbreak.organism}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditOutbreakModal(outbreak)} className="p-1.5 hover:bg-gray-600 rounded">
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => handleDeleteOutbreak(outbreak.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-lg font-bold text-red-400">{outbreak.caseCount}</p>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.cases', 'Cases')}</p>
                  </div>
                  <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-lg font-bold text-orange-400">{outbreak.affectedUnits.length}</p>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.units', 'Units')}</p>
                  </div>
                  <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-lg font-bold text-cyan-400">{outbreak.interventions.length}</p>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.interventions', 'Interventions')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">{t('tools.infectionControl.affectedUnits', 'Affected Units')}</p>
                  <div className="flex flex-wrap gap-1">
                    {outbreak.affectedUnits.map((unit, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded">{unit}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">{t('tools.infectionControl.interventions2', 'Interventions')}</p>
                  <div className="flex flex-wrap gap-1">
                    {outbreak.interventions.slice(0, 3).map((int, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">{int}</span>
                    ))}
                    {outbreak.interventions.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded">+{outbreak.interventions.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>Started: {outbreak.startDate}</span>
                  {outbreak.endDate && <span>Ended: {outbreak.endDate}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Surveillance Tab
  const renderSurveillance = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setMetricFormData(createNewSurveillanceMetric()); setShowMetricModal(true); }} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Metric
        </button>
      </div>

      <div className={cardClass}>
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            {t('tools.infectionControl.surveillanceMetricsRatePer1', 'Surveillance Metrics (Rate per 1,000 Device Days)')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <th className="p-4">{t('tools.infectionControl.period', 'Period')}</th>
                <th className="p-4">{t('tools.infectionControl.unit', 'Unit')}</th>
                <th className="p-4">{t('tools.infectionControl.type', 'Type')}</th>
                <th className="p-4">{t('tools.infectionControl.cases2', 'Cases')}</th>
                <th className="p-4">{t('tools.infectionControl.deviceDays', 'Device Days')}</th>
                <th className="p-4">{t('tools.infectionControl.rate', 'Rate')}</th>
                <th className="p-4">{t('tools.infectionControl.benchmark', 'Benchmark')}</th>
                <th className="p-4">{t('tools.infectionControl.status', 'Status')}</th>
                <th className="p-4">{t('tools.infectionControl.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {surveillanceMetrics.length === 0 ? (
                <tr>
                  <td colSpan={9} className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.infectionControl.noSurveillanceMetricsRecorded', 'No surveillance metrics recorded')}
                  </td>
                </tr>
              ) : (
                surveillanceMetrics.map(metric => (
                  <tr key={metric.id} className={theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="p-4">{metric.period}</td>
                    <td className="p-4">{metric.unit}</td>
                    <td className="p-4">{metric.infectionType}</td>
                    <td className="p-4">{metric.caseCount}</td>
                    <td className="p-4">{metric.deviceDays}</td>
                    <td className="p-4 font-medium">{metric.rate.toFixed(2)}</td>
                    <td className="p-4">{metric.benchmark}</td>
                    <td className="p-4">
                      {metric.rate <= metric.benchmark ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <TrendingDown className="w-4 h-4" /> Good
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <TrendingUp className="w-4 h-4" /> Above
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEditMetricModal(metric)} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => deleteMetric(metric.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Hand Hygiene Tab
  const renderHandHygiene = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setAuditFormData(createNewHandHygieneAudit()); setShowAuditModal(true); }} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Audit
        </button>
      </div>

      <div className={cardClass}>
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold flex items-center gap-2">
            <Hand className="w-5 h-5 text-cyan-500" />
            {t('tools.infectionControl.handHygieneAudits', 'Hand Hygiene Audits')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <th className="p-4">{t('tools.infectionControl.date', 'Date')}</th>
                <th className="p-4">{t('tools.infectionControl.unit2', 'Unit')}</th>
                <th className="p-4">{t('tools.infectionControl.observer', 'Observer')}</th>
                <th className="p-4">{t('tools.infectionControl.opportunities', 'Opportunities')}</th>
                <th className="p-4">{t('tools.infectionControl.compliance', 'Compliance')}</th>
                <th className="p-4">{t('tools.infectionControl.rate2', 'Rate')}</th>
                <th className="p-4">{t('tools.infectionControl.notes', 'Notes')}</th>
                <th className="p-4">{t('tools.infectionControl.actions2', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {handHygieneAudits.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.infectionControl.noAuditsRecorded2', 'No audits recorded')}
                  </td>
                </tr>
              ) : (
                handHygieneAudits.map(audit => (
                  <tr key={audit.id} className={theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="p-4">{audit.date}</td>
                    <td className="p-4">{audit.unit}</td>
                    <td className="p-4">{audit.observer}</td>
                    <td className="p-4">{audit.opportunitiesObserved}</td>
                    <td className="p-4">{audit.complianceEvents}</td>
                    <td className="p-4">
                      <span className={`font-medium ${audit.complianceRate >= 80 ? 'text-green-400' : audit.complianceRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {audit.complianceRate}%
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate">{audit.notes || '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEditAuditModal(audit)} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => deleteAudit(audit.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Environment Tab
  const renderEnvironment = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setRoundFormData(createNewEnvironmentRound()); setShowRoundModal(true); }} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Round
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {environmentRounds.length === 0 ? (
          <div className={`${cardClass} col-span-2 p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.infectionControl.noEnvironmentRoundsRecorded', 'No environment rounds recorded')}</p>
          </div>
        ) : (
          environmentRounds.map(round => (
            <div key={round.id} className={cardClass}>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{round.unit}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(round.status)}`}>
                        {round.status}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {round.date} | Inspector: {round.inspector}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditRoundModal(round)} className="p-1.5 hover:bg-gray-600 rounded">
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => deleteRound(round.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-lg font-bold text-orange-400">{round.findingsCount}</p>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.findings', 'Findings')}</p>
                  </div>
                  <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-lg font-bold text-red-400">{round.criticalFindings}</p>
                    <p className="text-xs text-gray-400">{t('tools.infectionControl.critical', 'Critical')}</p>
                  </div>
                </div>

                {round.findings.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{t('tools.infectionControl.findings2', 'Findings')}</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {round.findings.slice(0, 3).map((f, i) => (
                        <li key={i} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{f}</li>
                      ))}
                      {round.findings.length > 3 && (
                        <li className="text-gray-400">+{round.findings.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {round.correctiveActions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{t('tools.infectionControl.correctiveActions', 'Corrective Actions')}</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {round.correctiveActions.slice(0, 2).map((a, i) => (
                        <li key={i} className="text-green-400">{a}</li>
                      ))}
                      {round.correctiveActions.length > 2 && (
                        <li className="text-gray-400">+{round.correctiveActions.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.infectionControl.infectionControl', 'Infection Control')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.infectionControl.trackHaisOutbreaksAndPrevention', 'Track HAIs, outbreaks, and prevention measures')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="infection-control" toolName="Infection Control" />

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
            onExportCSV={() => exportCSV({ filename: 'infection-control' })}
            onExportExcel={() => exportExcel({ filename: 'infection-control' })}
            onExportJSON={() => exportJSON({ filename: 'infection-control' })}
            onExportPDF={() => exportPDF({ filename: 'infection-control', title: 'Infection Control Records' })}
            onPrint={() => print('Infection Control Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={infectionCases.length === 0}
            theme={theme as 'light' | 'dark'}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveTab('dashboard')} className={tabClass(activeTab === 'dashboard')}>
          <BarChart3 className="w-4 h-4 inline mr-1" /> Dashboard
        </button>
        <button onClick={() => setActiveTab('cases')} className={tabClass(activeTab === 'cases')}>
          <ShieldAlert className="w-4 h-4 inline mr-1" /> Cases ({infectionCases.length})
        </button>
        <button onClick={() => setActiveTab('outbreaks')} className={tabClass(activeTab === 'outbreaks')}>
          <AlertTriangle className="w-4 h-4 inline mr-1" /> Outbreaks ({outbreaks.length})
        </button>
        <button onClick={() => setActiveTab('surveillance')} className={tabClass(activeTab === 'surveillance')}>
          <Target className="w-4 h-4 inline mr-1" /> Surveillance
        </button>
        <button onClick={() => setActiveTab('hand-hygiene')} className={tabClass(activeTab === 'hand-hygiene')}>
          <Hand className="w-4 h-4 inline mr-1" /> Hand Hygiene
        </button>
        <button onClick={() => setActiveTab('environment')} className={tabClass(activeTab === 'environment')}>
          <Eye className="w-4 h-4 inline mr-1" /> Environment
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'cases' && renderCases()}
      {activeTab === 'outbreaks' && renderOutbreaks()}
      {activeTab === 'surveillance' && renderSurveillance()}
      {activeTab === 'hand-hygiene' && renderHandHygiene()}
      {activeTab === 'environment' && renderEnvironment()}

      {/* Infection Case Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingCase ? t('tools.infectionControl.editCase', 'Edit Case') : t('tools.infectionControl.addInfectionCase', 'Add Infection Case')}</h2>
              <button onClick={() => { setShowCaseModal(false); setEditingCase(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.patientId', 'Patient ID *')}</label>
                  <input type="text" value={caseFormData.patientId} onChange={(e) => setCaseFormData({ ...caseFormData, patientId: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.patientName', 'Patient Name *')}</label>
                  <input type="text" value={caseFormData.patientName} onChange={(e) => setCaseFormData({ ...caseFormData, patientName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.location', 'Location')}</label>
                  <input type="text" value={caseFormData.location} onChange={(e) => setCaseFormData({ ...caseFormData, location: e.target.value })} className={inputClass} placeholder={t('tools.infectionControl.roomBed', 'Room/Bed')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.unit3', 'Unit *')}</label>
                  <select value={caseFormData.unit} onChange={(e) => setCaseFormData({ ...caseFormData, unit: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectUnit', 'Select Unit')}</option>
                    {hospitalUnits.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.infectionType2', 'Infection Type *')}</label>
                  <select value={caseFormData.infectionType} onChange={(e) => setCaseFormData({ ...caseFormData, infectionType: e.target.value as any })} className={inputClass}>
                    {infectionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.organism2', 'Organism')}</label>
                  <select value={caseFormData.organism} onChange={(e) => setCaseFormData({ ...caseFormData, organism: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectOrType', 'Select or type')}</option>
                    {commonOrganisms.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.onsetDate2', 'Onset Date *')}</label>
                  <input type="date" value={caseFormData.onsetDate} onChange={(e) => setCaseFormData({ ...caseFormData, onsetDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.cultureDate2', 'Culture Date')}</label>
                  <input type="date" value={caseFormData.cultureDate} onChange={(e) => setCaseFormData({ ...caseFormData, cultureDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.outcome', 'Outcome')}</label>
                  <select value={caseFormData.outcome} onChange={(e) => setCaseFormData({ ...caseFormData, outcome: e.target.value as any })} className={inputClass}>
                    <option value="ongoing">{t('tools.infectionControl.ongoing2', 'Ongoing')}</option>
                    <option value="resolved">{t('tools.infectionControl.resolved2', 'Resolved')}</option>
                    <option value="deceased">{t('tools.infectionControl.deceased2', 'Deceased')}</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="deviceAssociated" checked={caseFormData.deviceAssociated} onChange={(e) => setCaseFormData({ ...caseFormData, deviceAssociated: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="deviceAssociated" className={labelClass}>{t('tools.infectionControl.deviceAssociated2', 'Device Associated')}</label>
                </div>
              </div>

              {caseFormData.deviceAssociated && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div>
                    <label className={labelClass}>{t('tools.infectionControl.deviceType2', 'Device Type')}</label>
                    <select value={caseFormData.deviceType} onChange={(e) => setCaseFormData({ ...caseFormData, deviceType: e.target.value })} className={inputClass}>
                      <option value="">{t('tools.infectionControl.selectDevice', 'Select Device')}</option>
                      {deviceTypes.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.infectionControl.daysOnDevice2', 'Days on Device')}</label>
                    <input type="number" value={caseFormData.daysOnDevice} onChange={(e) => setCaseFormData({ ...caseFormData, daysOnDevice: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>{t('tools.infectionControl.isolationPrecautions', 'Isolation Precautions')}</label>
                <div className="flex gap-2 mb-2">
                  <select value={newPrecaution} onChange={(e) => setNewPrecaution(e.target.value)} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectPrecaution', 'Select precaution')}</option>
                    {isolationPrecautionTypes.filter(p => !caseFormData.isolationPrecautions.includes(p)).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button type="button" onClick={addPrecaution} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {caseFormData.isolationPrecautions.map((p, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                      {p} <button onClick={() => removePrecaution(p)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.treatment', 'Treatment')}</label>
                <textarea value={caseFormData.treatment} onChange={(e) => setCaseFormData({ ...caseFormData, treatment: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.infectionControl.antibioticTherapyEtc', 'Antibiotic therapy, etc.')} />
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.notes2', 'Notes')}</label>
                <textarea value={caseFormData.notes} onChange={(e) => setCaseFormData({ ...caseFormData, notes: e.target.value })} className={inputClass} rows={2} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowCaseModal(false); setEditingCase(null); }} className={buttonSecondary}>{t('tools.infectionControl.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSaveCase} disabled={!caseFormData.patientId || !caseFormData.patientName || !caseFormData.unit} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outbreak Modal */}
      {showOutbreakModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingOutbreak ? t('tools.infectionControl.editOutbreak', 'Edit Outbreak') : t('tools.infectionControl.addOutbreak', 'Add Outbreak')}</h2>
              <button onClick={() => { setShowOutbreakModal(false); setEditingOutbreak(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.outbreakName', 'Outbreak Name *')}</label>
                  <input type="text" value={outbreakFormData.name} onChange={(e) => setOutbreakFormData({ ...outbreakFormData, name: e.target.value })} className={inputClass} placeholder={t('tools.infectionControl.eGIcuCdiOutbreak', 'e.g., ICU CDI Outbreak Jan 2024')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.organism3', 'Organism *')}</label>
                  <select value={outbreakFormData.organism} onChange={(e) => setOutbreakFormData({ ...outbreakFormData, organism: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectOrganism', 'Select Organism')}</option>
                    {commonOrganisms.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.startDate', 'Start Date *')}</label>
                  <input type="date" value={outbreakFormData.startDate} onChange={(e) => setOutbreakFormData({ ...outbreakFormData, startDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.endDate', 'End Date')}</label>
                  <input type="date" value={outbreakFormData.endDate} onChange={(e) => setOutbreakFormData({ ...outbreakFormData, endDate: e.target.value })} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.infectionControl.status2', 'Status')}</label>
                  <select value={outbreakFormData.status} onChange={(e) => setOutbreakFormData({ ...outbreakFormData, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.infectionControl.active', 'Active')}</option>
                    <option value="contained">{t('tools.infectionControl.contained', 'Contained')}</option>
                    <option value="resolved">{t('tools.infectionControl.resolved3', 'Resolved')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.affectedUnits2', 'Affected Units')}</label>
                <div className="flex gap-2 mb-2">
                  <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectUnit2', 'Select unit')}</option>
                    {hospitalUnits.filter(u => !outbreakFormData.affectedUnits.includes(u)).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button type="button" onClick={addAffectedUnit} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {outbreakFormData.affectedUnits.map((u, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-1">
                      {u} <button onClick={() => removeAffectedUnit(u)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.interventions3', 'Interventions')}</label>
                <div className="flex gap-2 mb-2">
                  <select value={newIntervention} onChange={(e) => setNewIntervention(e.target.value)} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectIntervention', 'Select intervention')}</option>
                    {commonInterventions.filter(i => !outbreakFormData.interventions.includes(i)).map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <button type="button" onClick={addInterventionToOutbreak} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {outbreakFormData.interventions.map((int, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {int} <button onClick={() => removeIntervention(int)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.investigationSummary', 'Investigation Summary')}</label>
                <textarea value={outbreakFormData.investigation} onChange={(e) => setOutbreakFormData({ ...outbreakFormData, investigation: e.target.value })} className={inputClass} rows={3} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowOutbreakModal(false); setEditingOutbreak(null); }} className={buttonSecondary}>{t('tools.infectionControl.cancel2', 'Cancel')}</button>
                <button type="button" onClick={handleSaveOutbreak} disabled={!outbreakFormData.name || !outbreakFormData.organism} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surveillance Metric Modal */}
      {showMetricModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingMetric ? t('tools.infectionControl.editMetric', 'Edit Metric') : t('tools.infectionControl.addSurveillanceMetric', 'Add Surveillance Metric')}</h2>
              <button onClick={() => { setShowMetricModal(false); setEditingMetric(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.periodYyyyMm', 'Period (YYYY-MM)')}</label>
                  <input type="month" value={metricFormData.period} onChange={(e) => setMetricFormData({ ...metricFormData, period: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.unit4', 'Unit')}</label>
                  <select value={metricFormData.unit} onChange={(e) => setMetricFormData({ ...metricFormData, unit: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectUnit3', 'Select Unit')}</option>
                    {hospitalUnits.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.infectionType3', 'Infection Type')}</label>
                  <select value={metricFormData.infectionType} onChange={(e) => setMetricFormData({ ...metricFormData, infectionType: e.target.value })} className={inputClass}>
                    {infectionTypes.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.caseCount', 'Case Count')}</label>
                  <input type="number" value={metricFormData.caseCount} onChange={(e) => setMetricFormData({ ...metricFormData, caseCount: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.deviceDays2', 'Device Days')}</label>
                  <input type="number" value={metricFormData.deviceDays} onChange={(e) => setMetricFormData({ ...metricFormData, deviceDays: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.patientDays', 'Patient Days')}</label>
                  <input type="number" value={metricFormData.patientDays} onChange={(e) => setMetricFormData({ ...metricFormData, patientDays: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t('tools.infectionControl.nhsnBenchmarkPer1000', 'NHSN Benchmark (per 1,000 device days)')}</label>
                  <input type="number" step="0.01" value={metricFormData.benchmark} onChange={(e) => setMetricFormData({ ...metricFormData, benchmark: parseFloat(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
              </div>

              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-400">Calculated Rate: <span className="font-bold text-cyan-400">
                  {metricFormData.deviceDays > 0 ? ((metricFormData.caseCount / metricFormData.deviceDays) * 1000).toFixed(2) : '0.00'}
                </span> {t('tools.infectionControl.per1000DeviceDays', 'per 1,000 device days')}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowMetricModal(false); setEditingMetric(null); }} className={buttonSecondary}>{t('tools.infectionControl.cancel3', 'Cancel')}</button>
                <button type="button" onClick={handleSaveMetric} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hand Hygiene Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingAudit ? t('tools.infectionControl.editAudit', 'Edit Audit') : t('tools.infectionControl.addHandHygieneAudit', 'Add Hand Hygiene Audit')}</h2>
              <button onClick={() => { setShowAuditModal(false); setEditingAudit(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.date2', 'Date')}</label>
                  <input type="date" value={auditFormData.date} onChange={(e) => setAuditFormData({ ...auditFormData, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.unit5', 'Unit')}</label>
                  <select value={auditFormData.unit} onChange={(e) => setAuditFormData({ ...auditFormData, unit: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectUnit4', 'Select Unit')}</option>
                    {hospitalUnits.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t('tools.infectionControl.observerName', 'Observer Name')}</label>
                  <input type="text" value={auditFormData.observer} onChange={(e) => setAuditFormData({ ...auditFormData, observer: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.opportunitiesObserved', 'Opportunities Observed')}</label>
                  <input type="number" value={auditFormData.opportunitiesObserved} onChange={(e) => setAuditFormData({ ...auditFormData, opportunitiesObserved: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.complianceEvents', 'Compliance Events')}</label>
                  <input type="number" value={auditFormData.complianceEvents} onChange={(e) => setAuditFormData({ ...auditFormData, complianceEvents: parseInt(e.target.value) || 0 })} className={inputClass} min="0" max={auditFormData.opportunitiesObserved} />
                </div>
              </div>

              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-400">Compliance Rate: <span className={`font-bold ${
                  auditFormData.opportunitiesObserved > 0
                    ? ((auditFormData.complianceEvents / auditFormData.opportunitiesObserved) * 100) >= 80
                      ? 'text-green-400'
                      : ((auditFormData.complianceEvents / auditFormData.opportunitiesObserved) * 100) >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    : 'text-gray-400'
                }`}>
                  {auditFormData.opportunitiesObserved > 0 ? ((auditFormData.complianceEvents / auditFormData.opportunitiesObserved) * 100).toFixed(1) : '0.0'}%
                </span></p>
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.notes3', 'Notes')}</label>
                <textarea value={auditFormData.notes} onChange={(e) => setAuditFormData({ ...auditFormData, notes: e.target.value })} className={inputClass} rows={2} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowAuditModal(false); setEditingAudit(null); }} className={buttonSecondary}>{t('tools.infectionControl.cancel4', 'Cancel')}</button>
                <button type="button" onClick={handleSaveAudit} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment Round Modal */}
      {showRoundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingRound ? t('tools.infectionControl.editRound', 'Edit Round') : t('tools.infectionControl.addEnvironmentRound', 'Add Environment Round')}</h2>
              <button onClick={() => { setShowRoundModal(false); setEditingRound(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.date3', 'Date')}</label>
                  <input type="date" value={roundFormData.date} onChange={(e) => setRoundFormData({ ...roundFormData, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.unit6', 'Unit')}</label>
                  <select value={roundFormData.unit} onChange={(e) => setRoundFormData({ ...roundFormData, unit: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.infectionControl.selectUnit5', 'Select Unit')}</option>
                    {hospitalUnits.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.inspector', 'Inspector')}</label>
                  <input type="text" value={roundFormData.inspector} onChange={(e) => setRoundFormData({ ...roundFormData, inspector: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.infectionControl.criticalFindingsCount', 'Critical Findings Count')}</label>
                  <input type="number" value={roundFormData.criticalFindings} onChange={(e) => setRoundFormData({ ...roundFormData, criticalFindings: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.infectionControl.status3', 'Status')}</label>
                  <select value={roundFormData.status} onChange={(e) => setRoundFormData({ ...roundFormData, status: e.target.value as any })} className={inputClass}>
                    <option value="open">{t('tools.infectionControl.open', 'Open')}</option>
                    <option value="in-progress">{t('tools.infectionControl.inProgress', 'In Progress')}</option>
                    <option value="closed">{t('tools.infectionControl.closed', 'Closed')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.findings3', 'Findings')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newFinding} onChange={(e) => setNewFinding(e.target.value)} placeholder={t('tools.infectionControl.addFinding', 'Add finding')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFindingToRound())} />
                  <button type="button" onClick={addFindingToRound} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {roundFormData.findings.map((f, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <span className="text-sm">{f}</span>
                      <button onClick={() => removeFinding(f)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.infectionControl.correctiveActions2', 'Corrective Actions')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder={t('tools.infectionControl.addAction', 'Add action')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActionToRound())} />
                  <button type="button" onClick={addActionToRound} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {roundFormData.correctiveActions.map((a, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
                      <span className="text-sm text-green-400">{a}</span>
                      <button onClick={() => removeAction(a)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowRoundModal(false); setEditingRound(null); }} className={buttonSecondary}>{t('tools.infectionControl.cancel5', 'Cancel')}</button>
                <button type="button" onClick={handleSaveRound} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.infectionControl.aboutInfectionControl', 'About Infection Control')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive infection prevention and control surveillance tool. Track healthcare-associated infections (HAIs)
          including CAUTI, CLABSI, SSI, VAP, CDI, and MRSA. Manage outbreaks, monitor hand hygiene compliance, conduct
          environment of care rounds, and calculate infection rates per 1,000 device days for benchmarking against NHSN data.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default InfectionControlTool;
