'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Activity,
  CheckCircle,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  ClipboardList,
  Stethoscope,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  XCircle,
  Pause,
  Play,
  UserCheck,
  UserX,
  Building2,
  Target,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

// Types
interface TrialVisit {
  id: string;
  visitNumber: number;
  visitName: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  procedures: string[];
  notes: string;
}

interface AdverseEvent {
  id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening' | 'fatal';
  causality: 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'definite';
  onsetDate: string;
  resolutionDate?: string;
  outcome: string;
  reportedToSponsor: boolean;
}

interface ProtocolDeviation {
  id: string;
  date: string;
  description: string;
  category: 'major' | 'minor';
  correctionAction: string;
  reportedDate?: string;
}

interface TrialParticipant {
  id: string;
  participantId: string;
  patientName: string;
  enrollmentDate: string;
  arm: string;
  status: 'screening' | 'enrolled' | 'active' | 'completed' | 'withdrawn' | 'screen-failed';
  visits: TrialVisit[];
  adverseEvents: AdverseEvent[];
  protocolDeviations: ProtocolDeviation[];
  consentDate: string;
  eligibilityCriteria: { criterion: string; met: boolean }[];
  demographics: {
    age: number;
    gender: string;
    ethnicity?: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ClinicalTrial {
  id: string;
  protocolNumber: string;
  title: string;
  sponsor: string;
  phase: 'I' | 'II' | 'III' | 'IV';
  indication: string;
  principalInvestigator: string;
  startDate: string;
  endDate?: string;
  targetEnrollment: number;
  participants: TrialParticipant[];
  arms: string[];
  status: 'recruiting' | 'active' | 'closed' | 'completed' | 'suspended';
  description: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClinicalTrialToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'clinical-trial';

const trialColumns: ColumnConfig[] = [
  { key: 'protocolNumber', header: 'Protocol #', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'sponsor', header: 'Sponsor', type: 'string' },
  { key: 'phase', header: 'Phase', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'targetEnrollment', header: 'Target', type: 'number' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
];

const createNewTrial = (): ClinicalTrial => ({
  id: crypto.randomUUID(),
  protocolNumber: '',
  title: '',
  sponsor: '',
  phase: 'II',
  indication: '',
  principalInvestigator: '',
  startDate: new Date().toISOString().split('T')[0],
  targetEnrollment: 100,
  participants: [],
  arms: ['Treatment', 'Placebo'],
  status: 'recruiting',
  description: '',
  inclusionCriteria: [],
  exclusionCriteria: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewParticipant = (trialArms: string[]): TrialParticipant => ({
  id: crypto.randomUUID(),
  participantId: `P-${Date.now().toString(36).toUpperCase()}`,
  patientName: '',
  enrollmentDate: new Date().toISOString().split('T')[0],
  arm: trialArms[0] || 'Treatment',
  status: 'screening',
  visits: [],
  adverseEvents: [],
  protocolDeviations: [],
  consentDate: new Date().toISOString().split('T')[0],
  eligibilityCriteria: [],
  demographics: {
    age: 0,
    gender: '',
  },
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const phases = ['I', 'II', 'III', 'IV'];
const trialStatuses = ['recruiting', 'active', 'closed', 'completed', 'suspended'];
const participantStatuses = ['screening', 'enrolled', 'active', 'completed', 'withdrawn', 'screen-failed'];
const visitStatuses = ['scheduled', 'completed', 'missed', 'rescheduled'];
const severityLevels = ['mild', 'moderate', 'severe', 'life-threatening', 'fatal'];
const causalityLevels = ['unrelated', 'unlikely', 'possible', 'probable', 'definite'];

const commonProcedures = [
  'Blood Draw', 'Vitals Check', 'ECG', 'Physical Exam', 'Lab Work',
  'MRI Scan', 'CT Scan', 'X-Ray', 'Urine Sample', 'Drug Administration',
  'Questionnaire', 'Cognitive Assessment', 'Quality of Life Assessment',
];

export const ClinicalTrialTool: React.FC<ClinicalTrialToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  const {
    data: trials,
    addItem: addTrial,
    updateItem: updateTrial,
    deleteItem: deleteTrial,
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
  } = useToolData<ClinicalTrial>(TOOL_ID, [], trialColumns);

  // State for UI
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'trials' | 'participants' | 'analytics'>('trials');

  // Modal states
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showAdverseEventModal, setShowAdverseEventModal] = useState(false);
  const [showDeviationModal, setShowDeviationModal] = useState(false);

  // Selection states
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<TrialParticipant | null>(null);
  const [editingTrial, setEditingTrial] = useState<ClinicalTrial | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<TrialParticipant | null>(null);

  // Form data
  const [trialFormData, setTrialFormData] = useState<ClinicalTrial>(createNewTrial());
  const [participantFormData, setParticipantFormData] = useState<TrialParticipant>(createNewParticipant([]));

  // Visit form
  const [visitFormData, setVisitFormData] = useState<Omit<TrialVisit, 'id'>>({
    visitNumber: 1,
    visitName: 'Visit 1',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    procedures: [],
    notes: '',
  });

  // Adverse Event form
  const [aeFormData, setAeFormData] = useState<Omit<AdverseEvent, 'id'>>({
    description: '',
    severity: 'mild',
    causality: 'possible',
    onsetDate: new Date().toISOString().split('T')[0],
    outcome: '',
    reportedToSponsor: false,
  });

  // Protocol Deviation form
  const [deviationFormData, setDeviationFormData] = useState<Omit<ProtocolDeviation, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'minor',
    correctionAction: '',
  });

  // Helper for new criteria/arm
  const [newInclusionCriterion, setNewInclusionCriterion] = useState('');
  const [newExclusionCriterion, setNewExclusionCriterion] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newProcedure, setNewProcedure] = useState('');

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

      if (params.phase && phases.includes(params.phase)) {
        setTrialFormData(prev => ({ ...prev, phase: params.phase }));
        hasChanges = true;
      }
      if (params.status && trialStatuses.includes(params.status)) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Expanded section states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    visits: true,
    adverseEvents: true,
    deviations: false,
    eligibility: false,
  });

  // Statistics
  const stats = useMemo(() => {
    const totalTrials = trials.length;
    const recruiting = trials.filter(t => t.status === 'recruiting').length;
    const active = trials.filter(t => t.status === 'active').length;
    const completed = trials.filter(t => t.status === 'completed').length;
    const totalParticipants = trials.reduce((sum, t) => sum + t.participants.length, 0);
    const activeParticipants = trials.reduce((sum, t) =>
      sum + t.participants.filter(p => p.status === 'active').length, 0);
    const totalAdverseEvents = trials.reduce((sum, t) =>
      sum + t.participants.reduce((pSum, p) => pSum + p.adverseEvents.length, 0), 0);
    const seriousAdverseEvents = trials.reduce((sum, t) =>
      sum + t.participants.reduce((pSum, p) =>
        pSum + p.adverseEvents.filter(ae =>
          ae.severity === 'severe' || ae.severity === 'life-threatening' || ae.severity === 'fatal'
        ).length, 0), 0);

    return {
      totalTrials,
      recruiting,
      active,
      completed,
      totalParticipants,
      activeParticipants,
      totalAdverseEvents,
      seriousAdverseEvents,
    };
  }, [trials]);

  // Selected trial stats
  const trialStats = useMemo(() => {
    if (!selectedTrial) return null;
    const participants = selectedTrial.participants;
    const enrolled = participants.filter(p =>
      p.status !== 'screening' && p.status !== 'screen-failed'
    ).length;
    const enrollmentRate = selectedTrial.targetEnrollment > 0
      ? (enrolled / selectedTrial.targetEnrollment) * 100
      : 0;
    const completedVisits = participants.reduce((sum, p) =>
      sum + p.visits.filter(v => v.status === 'completed').length, 0);
    const totalVisits = participants.reduce((sum, p) => sum + p.visits.length, 0);
    const visitCompletionRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;
    const totalAEs = participants.reduce((sum, p) => sum + p.adverseEvents.length, 0);
    const totalDeviations = participants.reduce((sum, p) => sum + p.protocolDeviations.length, 0);

    const armBreakdown = selectedTrial.arms.map(arm => ({
      name: arm,
      count: participants.filter(p => p.arm === arm).length,
    }));

    return {
      totalParticipants: participants.length,
      enrolled,
      enrollmentRate,
      completedVisits,
      totalVisits,
      visitCompletionRate,
      totalAEs,
      totalDeviations,
      armBreakdown,
      byStatus: participantStatuses.map(status => ({
        status,
        count: participants.filter(p => p.status === status).length,
      })),
    };
  }, [selectedTrial]);

  // Filtered trials
  const filteredTrials = useMemo(() => {
    return trials.filter(trial => {
      const matchesSearch = searchQuery === '' ||
        trial.protocolNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trial.sponsor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPhase = filterPhase === '' || trial.phase === filterPhase;
      const matchesStatus = filterStatus === '' || trial.status === filterStatus;
      return matchesSearch && matchesPhase && matchesStatus;
    });
  }, [trials, searchQuery, filterPhase, filterStatus]);

  // Handlers
  const handleSaveTrial = () => {
    if (editingTrial) {
      updateTrial(trialFormData.id, { ...trialFormData, updatedAt: new Date().toISOString() });
      if (selectedTrial?.id === trialFormData.id) {
        setSelectedTrial({ ...trialFormData, updatedAt: new Date().toISOString() });
      }
    } else {
      addTrial({ ...trialFormData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowTrialModal(false);
    setEditingTrial(null);
    setTrialFormData(createNewTrial());
  };

  const handleDeleteTrial = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Clinical Trial',
      message: 'Are you sure you want to delete this clinical trial? This will remove all participant data.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteTrial(id);
      if (selectedTrial?.id === id) {
        setSelectedTrial(null);
        setSelectedParticipant(null);
      }
    }
  };

  const handleSaveParticipant = () => {
    if (!selectedTrial) return;

    const updatedParticipants = editingParticipant
      ? selectedTrial.participants.map(p =>
          p.id === participantFormData.id
            ? { ...participantFormData, updatedAt: new Date().toISOString() }
            : p
        )
      : [...selectedTrial.participants, { ...participantFormData, updatedAt: new Date().toISOString() }];

    const updatedTrial = {
      ...selectedTrial,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };

    updateTrial(selectedTrial.id, updatedTrial);
    setSelectedTrial(updatedTrial);
    setShowParticipantModal(false);
    setEditingParticipant(null);
    setParticipantFormData(createNewParticipant(selectedTrial.arms));
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!selectedTrial) return;
    const confirmed = await confirm({
      title: 'Remove Participant',
      message: 'Are you sure you want to remove this participant?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const updatedParticipants = selectedTrial.participants.filter(p => p.id !== participantId);
      const updatedTrial = {
        ...selectedTrial,
        participants: updatedParticipants,
        updatedAt: new Date().toISOString(),
      };
      updateTrial(selectedTrial.id, updatedTrial);
      setSelectedTrial(updatedTrial);
      if (selectedParticipant?.id === participantId) {
        setSelectedParticipant(null);
      }
    }
  };

  const handleSaveVisit = () => {
    if (!selectedTrial || !selectedParticipant) return;

    const newVisit: TrialVisit = { ...visitFormData, id: crypto.randomUUID() };
    const updatedParticipant = {
      ...selectedParticipant,
      visits: [...selectedParticipant.visits, newVisit],
      updatedAt: new Date().toISOString(),
    };

    const updatedParticipants = selectedTrial.participants.map(p =>
      p.id === selectedParticipant.id ? updatedParticipant : p
    );

    const updatedTrial = {
      ...selectedTrial,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };

    updateTrial(selectedTrial.id, updatedTrial);
    setSelectedTrial(updatedTrial);
    setSelectedParticipant(updatedParticipant);
    setShowVisitModal(false);
    setVisitFormData({
      visitNumber: updatedParticipant.visits.length + 1,
      visitName: `Visit ${updatedParticipant.visits.length + 1}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      procedures: [],
      notes: '',
    });
  };

  const handleSaveAdverseEvent = () => {
    if (!selectedTrial || !selectedParticipant) return;

    const newAE: AdverseEvent = { ...aeFormData, id: crypto.randomUUID() };
    const updatedParticipant = {
      ...selectedParticipant,
      adverseEvents: [...selectedParticipant.adverseEvents, newAE],
      updatedAt: new Date().toISOString(),
    };

    const updatedParticipants = selectedTrial.participants.map(p =>
      p.id === selectedParticipant.id ? updatedParticipant : p
    );

    const updatedTrial = {
      ...selectedTrial,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };

    updateTrial(selectedTrial.id, updatedTrial);
    setSelectedTrial(updatedTrial);
    setSelectedParticipant(updatedParticipant);
    setShowAdverseEventModal(false);
    setAeFormData({
      description: '',
      severity: 'mild',
      causality: 'possible',
      onsetDate: new Date().toISOString().split('T')[0],
      outcome: '',
      reportedToSponsor: false,
    });
  };

  const handleSaveDeviation = () => {
    if (!selectedTrial || !selectedParticipant) return;

    const newDeviation: ProtocolDeviation = { ...deviationFormData, id: crypto.randomUUID() };
    const updatedParticipant = {
      ...selectedParticipant,
      protocolDeviations: [...selectedParticipant.protocolDeviations, newDeviation],
      updatedAt: new Date().toISOString(),
    };

    const updatedParticipants = selectedTrial.participants.map(p =>
      p.id === selectedParticipant.id ? updatedParticipant : p
    );

    const updatedTrial = {
      ...selectedTrial,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };

    updateTrial(selectedTrial.id, updatedTrial);
    setSelectedTrial(updatedTrial);
    setSelectedParticipant(updatedParticipant);
    setShowDeviationModal(false);
    setDeviationFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'minor',
      correctionAction: '',
    });
  };

  const updateVisitStatus = (visitId: string, newStatus: TrialVisit['status']) => {
    if (!selectedTrial || !selectedParticipant) return;

    const updatedVisits = selectedParticipant.visits.map(v =>
      v.id === visitId
        ? { ...v, status: newStatus, actualDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : v.actualDate }
        : v
    );

    const updatedParticipant = { ...selectedParticipant, visits: updatedVisits, updatedAt: new Date().toISOString() };
    const updatedParticipants = selectedTrial.participants.map(p =>
      p.id === selectedParticipant.id ? updatedParticipant : p
    );

    const updatedTrial = { ...selectedTrial, participants: updatedParticipants, updatedAt: new Date().toISOString() };
    updateTrial(selectedTrial.id, updatedTrial);
    setSelectedTrial(updatedTrial);
    setSelectedParticipant(updatedParticipant);
  };

  const openEditTrialModal = (trial: ClinicalTrial) => {
    setEditingTrial(trial);
    setTrialFormData(trial);
    setShowTrialModal(true);
  };

  const openEditParticipantModal = (participant: TrialParticipant) => {
    setEditingParticipant(participant);
    setParticipantFormData(participant);
    setShowParticipantModal(true);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addInclusionCriterion = () => {
    if (newInclusionCriterion.trim()) {
      setTrialFormData({
        ...trialFormData,
        inclusionCriteria: [...trialFormData.inclusionCriteria, newInclusionCriterion.trim()],
      });
      setNewInclusionCriterion('');
    }
  };

  const addExclusionCriterion = () => {
    if (newExclusionCriterion.trim()) {
      setTrialFormData({
        ...trialFormData,
        exclusionCriteria: [...trialFormData.exclusionCriteria, newExclusionCriterion.trim()],
      });
      setNewExclusionCriterion('');
    }
  };

  const addTrialArm = () => {
    if (newArm.trim() && !trialFormData.arms.includes(newArm.trim())) {
      setTrialFormData({
        ...trialFormData,
        arms: [...trialFormData.arms, newArm.trim()],
      });
      setNewArm('');
    }
  };

  const addVisitProcedure = () => {
    if (newProcedure.trim() && !visitFormData.procedures.includes(newProcedure.trim())) {
      setVisitFormData({
        ...visitFormData,
        procedures: [...visitFormData.procedures, newProcedure.trim()],
      });
      setNewProcedure('');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'screening': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'enrolled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'withdrawn': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'screen-failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'missed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'rescheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'severe': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'life-threatening': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'fatal': return 'bg-red-700/30 text-red-300 border-red-700/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'I': return 'bg-blue-500/20 text-blue-400';
      case 'II': return 'bg-cyan-500/20 text-cyan-400';
      case 'III': return 'bg-purple-500/20 text-purple-400';
      case 'IV': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <FlaskConical className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.clinicalTrial.clinicalTrialManager', 'Clinical Trial Manager')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.clinicalTrial.manageClinicalTrialEnrollmentAnd', 'Manage clinical trial enrollment and patient tracking')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="clinical-trial" toolName="Clinical Trial" />

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
            onExportCSV={() => exportCSV({ filename: 'clinical-trials' })}
            onExportExcel={() => exportExcel({ filename: 'clinical-trials' })}
            onExportJSON={() => exportJSON({ filename: 'clinical-trials' })}
            onExportPDF={() => exportPDF({ filename: 'clinical-trials', title: 'Clinical Trials Report' })}
            onPrint={() => print('Clinical Trials Report')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={trials.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setTrialFormData(createNewTrial()); setShowTrialModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.clinicalTrial.newTrial', 'New Trial')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 text-center">
            <FlaskConical className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
            <p className="text-2xl font-bold text-cyan-500">{stats.totalTrials}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.totalTrials', 'Total Trials')}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-blue-500">{stats.recruiting}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.recruiting', 'Recruiting')}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.active', 'Active')}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-purple-500">{stats.completed}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.completed', 'Completed')}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
            <p className="text-2xl font-bold text-indigo-500">{stats.totalParticipants}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.participants', 'Participants')}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <UserCheck className="w-6 h-6 mx-auto mb-2 text-teal-500" />
            <p className="text-2xl font-bold text-teal-500">{stats.activeParticipants}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.activePts', 'Active Pts')}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-500">{stats.totalAdverseEvents}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.totalAes', 'Total AEs')}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold text-red-500">{stats.seriousAdverseEvents}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalTrial.saes', 'SAEs')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={tabClass(activeTab === 'trials')} onClick={() => setActiveTab('trials')}>
          <FlaskConical className="w-4 h-4 inline mr-2" />
          {t('tools.clinicalTrial.trials', 'Trials')}
        </button>
        <button className={tabClass(activeTab === 'participants')} onClick={() => setActiveTab('participants')}>
          <Users className="w-4 h-4 inline mr-2" />
          {t('tools.clinicalTrial.participants2', 'Participants')}
        </button>
        <button className={tabClass(activeTab === 'analytics')} onClick={() => setActiveTab('analytics')}>
          <BarChart3 className="w-4 h-4 inline mr-2" />
          {t('tools.clinicalTrial.analytics', 'Analytics')}
        </button>
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
              placeholder={t('tools.clinicalTrial.searchTrialsByProtocolTitle', 'Search trials by protocol, title, or sponsor...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterPhase} onChange={(e) => setFilterPhase(e.target.value)} className={`${inputClass} w-full sm:w-32`}>
            <option value="">{t('tools.clinicalTrial.allPhases', 'All Phases')}</option>
            {phases.map(p => <option key={p} value={p}>Phase {p}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.clinicalTrial.allStatuses', 'All Statuses')}</option>
            {trialStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'trials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trial List */}
          <div className={`${cardClass} lg:col-span-1`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-lg font-semibold">{t('tools.clinicalTrial.clinicalTrials', 'Clinical Trials')}</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : filteredTrials.length === 0 ? (
                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.clinicalTrial.noTrialsFound', 'No trials found')}</p>
                  <button onClick={() => { setTrialFormData(createNewTrial()); setShowTrialModal(true); }} className="mt-3 text-cyan-500 hover:text-cyan-400">
                    {t('tools.clinicalTrial.createYourFirstTrial', '+ Create your first trial')}
                  </button>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredTrials.map(trial => (
                    <div
                      key={trial.id}
                      onClick={() => { setSelectedTrial(trial); setSelectedParticipant(null); }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedTrial?.id === trial.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded ${getPhaseColor(trial.phase)}`}>
                              Phase {trial.phase}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(trial.status)}`}>
                              {trial.status}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{trial.protocolNumber}</p>
                          <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {trial.title}
                          </p>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {trial.participants.length} / {trial.targetEnrollment} participants
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditTrialModal(trial); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTrial(trial.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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

          {/* Trial Details */}
          <div className={`${cardClass} lg:col-span-2`}>
            {selectedTrial ? (
              <div>
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-sm rounded ${getPhaseColor(selectedTrial.phase)}`}>
                          Phase {selectedTrial.phase}
                        </span>
                        <span className={`px-2 py-1 text-sm rounded border ${getStatusColor(selectedTrial.status)}`}>
                          {selectedTrial.status}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold">{selectedTrial.protocolNumber}</h2>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {selectedTrial.title}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setParticipantFormData(createNewParticipant(selectedTrial.arms));
                        setShowParticipantModal(true);
                      }}
                      className={buttonPrimary}
                    >
                      <Plus className="w-4 h-4" /> Add Participant
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Trial Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.clinicalTrial.sponsor', 'Sponsor')}</p>
                      <p className="font-medium text-sm">{selectedTrial.sponsor || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.clinicalTrial.indication', 'Indication')}</p>
                      <p className="font-medium text-sm">{selectedTrial.indication || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.clinicalTrial.principalInvestigator', 'Principal Investigator')}</p>
                      <p className="font-medium text-sm">{selectedTrial.principalInvestigator || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.clinicalTrial.startDate', 'Start Date')}</p>
                      <p className="font-medium text-sm">{selectedTrial.startDate}</p>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  {trialStats && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{t('tools.clinicalTrial.enrollmentProgress', 'Enrollment Progress')}</span>
                        <span className="text-sm text-cyan-500">{trialStats.enrolled} / {selectedTrial.targetEnrollment}</span>
                      </div>
                      <div className="w-full bg-gray-600/30 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-teal-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(trialStats.enrollmentRate, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{trialStats.enrollmentRate.toFixed(1)}% of target</p>
                    </div>
                  )}

                  {/* Arms Distribution */}
                  {trialStats && selectedTrial.arms.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">{t('tools.clinicalTrial.treatmentArms', 'Treatment Arms')}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {trialStats.armBreakdown.map((arm, idx) => (
                          <div key={idx} className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <p className="font-medium">{arm.name}</p>
                            <p className="text-2xl font-bold text-cyan-500">{arm.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Participants List */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-500" />
                      Participants ({selectedTrial.participants.length})
                    </h3>
                    {selectedTrial.participants.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.clinicalTrial.noParticipantsEnrolledYet', 'No participants enrolled yet')}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {selectedTrial.participants.map(participant => (
                          <div
                            key={participant.id}
                            onClick={() => setSelectedParticipant(participant)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedParticipant?.id === participant.id
                                ? 'bg-cyan-500/20 border border-cyan-500/30'
                                : theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                  <User className="w-4 h-4 text-cyan-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{participant.patientName || participant.participantId}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{participant.arm}</span>
                                    <span>|</span>
                                    <span>{participant.visits.length} visits</span>
                                    <span>|</span>
                                    <span>{participant.adverseEvents.length} AEs</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(participant.status)}`}>
                                  {participant.status}
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); openEditParticipantModal(participant); }} className="p-1 hover:bg-gray-600 rounded">
                                  <Edit2 className="w-3 h-3 text-gray-400" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteParticipant(participant.id); }} className="p-1 hover:bg-red-500/20 rounded">
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FlaskConical className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t('tools.clinicalTrial.selectATrial', 'Select a trial')}</p>
                <p className="text-sm">{t('tools.clinicalTrial.chooseATrialToView', 'Choose a trial to view details and manage participants')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'participants' && selectedTrial && selectedParticipant && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Participant Info */}
          <div className={`${cardClass} lg:col-span-1`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('tools.clinicalTrial.participantDetails', 'Participant Details')}</h2>
                <button onClick={() => openEditParticipantModal(selectedParticipant)} className="p-2 hover:bg-gray-700 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <User className="w-8 h-8 text-cyan-500" />
                </div>
                <p className="font-bold text-lg">{selectedParticipant.patientName || 'Unnamed'}</p>
                <p className="text-sm text-gray-400">{selectedParticipant.participantId}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-sm rounded border ${getStatusColor(selectedParticipant.status)}`}>
                  {selectedParticipant.status}
                </span>
              </div>

              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">{t('tools.clinicalTrial.arm', 'Arm')}</span>
                  <span className="font-medium">{selectedParticipant.arm}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">{t('tools.clinicalTrial.enrolled', 'Enrolled')}</span>
                  <span className="font-medium">{selectedParticipant.enrollmentDate}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">{t('tools.clinicalTrial.consentDate', 'Consent Date')}</span>
                  <span className="font-medium">{selectedParticipant.consentDate}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">{t('tools.clinicalTrial.age', 'Age')}</span>
                  <span className="font-medium">{selectedParticipant.demographics.age || 'N/A'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">{t('tools.clinicalTrial.gender', 'Gender')}</span>
                  <span className="font-medium">{selectedParticipant.demographics.gender || 'N/A'}</span>
                </div>
              </div>

              {selectedParticipant.notes && (
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-400 mb-1">{t('tools.clinicalTrial.notes', 'Notes')}</p>
                  <p className="text-sm">{selectedParticipant.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Visits, AEs, Deviations */}
          <div className={`${cardClass} lg:col-span-2`}>
            <div className="p-4 space-y-6">
              {/* Visits Section */}
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => toggleSection('visits')}
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    Visits ({selectedParticipant.visits.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowVisitModal(true); }}
                      className="p-1 hover:bg-cyan-500/20 rounded text-cyan-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {expandedSections.visits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {expandedSections.visits && (
                  <div className="space-y-2">
                    {selectedParticipant.visits.length === 0 ? (
                      <p className="text-sm text-gray-400">{t('tools.clinicalTrial.noVisitsScheduled', 'No visits scheduled')}</p>
                    ) : (
                      selectedParticipant.visits.map(visit => (
                        <div key={visit.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{visit.visitName}</span>
                              <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(visit.status)}`}>
                                {visit.status}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {visit.status === 'scheduled' && (
                                <>
                                  <button
                                    onClick={() => updateVisitStatus(visit.id, 'completed')}
                                    className="p-1 hover:bg-green-500/20 rounded text-green-500"
                                    title={t('tools.clinicalTrial.markComplete', 'Mark Complete')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateVisitStatus(visit.id, 'missed')}
                                    className="p-1 hover:bg-red-500/20 rounded text-red-500"
                                    title={t('tools.clinicalTrial.markMissed', 'Mark Missed')}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>Scheduled: {visit.scheduledDate} {visit.actualDate && `| Actual: ${visit.actualDate}`}</p>
                            {visit.procedures.length > 0 && (
                              <p>Procedures: {visit.procedures.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Adverse Events Section */}
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => toggleSection('adverseEvents')}
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Adverse Events ({selectedParticipant.adverseEvents.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAdverseEventModal(true); }}
                      className="p-1 hover:bg-yellow-500/20 rounded text-yellow-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {expandedSections.adverseEvents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {expandedSections.adverseEvents && (
                  <div className="space-y-2">
                    {selectedParticipant.adverseEvents.length === 0 ? (
                      <p className="text-sm text-gray-400">{t('tools.clinicalTrial.noAdverseEventsReported', 'No adverse events reported')}</p>
                    ) : (
                      selectedParticipant.adverseEvents.map(ae => (
                        <div key={ae.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{ae.description}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs rounded border ${getSeverityColor(ae.severity)}`}>
                                {ae.severity}
                              </span>
                              {ae.reportedToSponsor && (
                                <span className="text-xs text-green-500">{t('tools.clinicalTrial.reported', 'Reported')}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>Onset: {ae.onsetDate} | Causality: {ae.causality}</p>
                            {ae.outcome && <p>Outcome: {ae.outcome}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Protocol Deviations Section */}
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => toggleSection('deviations')}
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Protocol Deviations ({selectedParticipant.protocolDeviations.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeviationModal(true); }}
                      className="p-1 hover:bg-orange-500/20 rounded text-orange-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {expandedSections.deviations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {expandedSections.deviations && (
                  <div className="space-y-2">
                    {selectedParticipant.protocolDeviations.length === 0 ? (
                      <p className="text-sm text-gray-400">{t('tools.clinicalTrial.noProtocolDeviationsRecorded', 'No protocol deviations recorded')}</p>
                    ) : (
                      selectedParticipant.protocolDeviations.map(deviation => (
                        <div key={deviation.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{deviation.description}</span>
                            <span className={`px-2 py-0.5 text-xs rounded border ${
                              deviation.category === 'major'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }`}>
                              {deviation.category}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            <p>Date: {deviation.date}</p>
                            {deviation.correctionAction && <p>Action: {deviation.correctionAction}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (!selectedTrial || !selectedParticipant) && (
        <div className={`${cardClass} p-12 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{t('tools.clinicalTrial.selectATrialAndParticipant', 'Select a trial and participant')}</p>
          <p className="text-sm">{t('tools.clinicalTrial.chooseATrialFromThe', 'Choose a trial from the Trials tab, then select a participant to view details')}</p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enrollment by Phase */}
          <div className={cardClass}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="font-semibold">{t('tools.clinicalTrial.trialsByPhase', 'Trials by Phase')}</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {phases.map(phase => {
                  const count = trials.filter(t => t.phase === phase).length;
                  const percentage = trials.length > 0 ? (count / trials.length) * 100 : 0;
                  return (
                    <div key={phase}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Phase {phase}</span>
                        <span>{count} trials</span>
                      </div>
                      <div className="w-full bg-gray-600/30 rounded-full h-2">
                        <div className={`h-2 rounded-full ${getPhaseColor(phase)}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className={cardClass}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="font-semibold">{t('tools.clinicalTrial.trialStatusDistribution', 'Trial Status Distribution')}</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {trialStatuses.map(status => {
                  const count = trials.filter(t => t.status === status).length;
                  const percentage = trials.length > 0 ? (count / trials.length) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{status}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full bg-gray-600/30 rounded-full h-2">
                        <div className={`h-2 rounded-full ${getStatusColor(status).includes('green') ? 'bg-green-500' : getStatusColor(status).includes('blue') ? 'bg-blue-500' : getStatusColor(status).includes('purple') ? 'bg-purple-500' : getStatusColor(status).includes('red') ? 'bg-red-500' : 'bg-gray-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Adverse Events Summary */}
          <div className={cardClass}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="font-semibold">{t('tools.clinicalTrial.adverseEventsBySeverity', 'Adverse Events by Severity')}</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {severityLevels.map(severity => {
                  const count = trials.reduce((sum, t) =>
                    sum + t.participants.reduce((pSum, p) =>
                      pSum + p.adverseEvents.filter(ae => ae.severity === severity).length, 0), 0);
                  return (
                    <div key={severity} className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-sm rounded border ${getSeverityColor(severity)}`}>
                        {severity}
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Participant Status */}
          <div className={cardClass}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="font-semibold">{t('tools.clinicalTrial.participantsByStatus', 'Participants by Status')}</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {participantStatuses.map(status => {
                  const count = trials.reduce((sum, t) =>
                    sum + t.participants.filter(p => p.status === status).length, 0);
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-sm rounded border ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trial Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingTrial ? t('tools.clinicalTrial.editTrial', 'Edit Trial') : t('tools.clinicalTrial.newClinicalTrial', 'New Clinical Trial')}</h2>
              <button onClick={() => { setShowTrialModal(false); setEditingTrial(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.protocolNumber', 'Protocol Number *')}</label>
                  <input type="text" value={trialFormData.protocolNumber} onChange={(e) => setTrialFormData({ ...trialFormData, protocolNumber: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.eGAbc001', 'e.g., ABC-001')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.phase', 'Phase')}</label>
                  <select value={trialFormData.phase} onChange={(e) => setTrialFormData({ ...trialFormData, phase: e.target.value as any })} className={inputClass}>
                    {phases.map(p => <option key={p} value={p}>Phase {p}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.clinicalTrial.title', 'Title *')}</label>
                  <input type="text" value={trialFormData.title} onChange={(e) => setTrialFormData({ ...trialFormData, title: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.fullTrialTitle', 'Full trial title')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.sponsor2', 'Sponsor')}</label>
                  <input type="text" value={trialFormData.sponsor} onChange={(e) => setTrialFormData({ ...trialFormData, sponsor: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.sponsoringOrganization', 'Sponsoring organization')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.indication2', 'Indication')}</label>
                  <input type="text" value={trialFormData.indication} onChange={(e) => setTrialFormData({ ...trialFormData, indication: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.eGType2Diabetes', 'e.g., Type 2 Diabetes')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.principalInvestigator2', 'Principal Investigator')}</label>
                  <input type="text" value={trialFormData.principalInvestigator} onChange={(e) => setTrialFormData({ ...trialFormData, principalInvestigator: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.drName', 'Dr. Name')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.status', 'Status')}</label>
                  <select value={trialFormData.status} onChange={(e) => setTrialFormData({ ...trialFormData, status: e.target.value as any })} className={inputClass}>
                    {trialStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.startDate2', 'Start Date')}</label>
                  <input type="date" value={trialFormData.startDate} onChange={(e) => setTrialFormData({ ...trialFormData, startDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.targetEnrollment', 'Target Enrollment')}</label>
                  <input type="number" value={trialFormData.targetEnrollment} onChange={(e) => setTrialFormData({ ...trialFormData, targetEnrollment: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.description', 'Description')}</label>
                <textarea value={trialFormData.description} onChange={(e) => setTrialFormData({ ...trialFormData, description: e.target.value })} className={inputClass} rows={2} />
              </div>

              {/* Treatment Arms */}
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.treatmentArms2', 'Treatment Arms')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newArm} onChange={(e) => setNewArm(e.target.value)} placeholder={t('tools.clinicalTrial.addArm', 'Add arm')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrialArm())} />
                  <button type="button" onClick={addTrialArm} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trialFormData.arms.map((arm, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {arm}
                      <button onClick={() => setTrialFormData({ ...trialFormData, arms: trialFormData.arms.filter((_, idx) => idx !== i) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Inclusion Criteria */}
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.inclusionCriteria', 'Inclusion Criteria')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newInclusionCriterion} onChange={(e) => setNewInclusionCriterion(e.target.value)} placeholder={t('tools.clinicalTrial.addCriterion', 'Add criterion')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusionCriterion())} />
                  <button type="button" onClick={addInclusionCriterion} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {trialFormData.inclusionCriteria.map((criterion, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span>{criterion}</span>
                      <button onClick={() => setTrialFormData({ ...trialFormData, inclusionCriteria: trialFormData.inclusionCriteria.filter((_, idx) => idx !== i) })} className="text-red-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusion Criteria */}
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.exclusionCriteria', 'Exclusion Criteria')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newExclusionCriterion} onChange={(e) => setNewExclusionCriterion(e.target.value)} placeholder={t('tools.clinicalTrial.addCriterion2', 'Add criterion')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusionCriterion())} />
                  <button type="button" onClick={addExclusionCriterion} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {trialFormData.exclusionCriteria.map((criterion, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span>{criterion}</span>
                      <button onClick={() => setTrialFormData({ ...trialFormData, exclusionCriteria: trialFormData.exclusionCriteria.filter((_, idx) => idx !== i) })} className="text-red-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowTrialModal(false); setEditingTrial(null); }} className={buttonSecondary}>{t('tools.clinicalTrial.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSaveTrial} disabled={!trialFormData.protocolNumber || !trialFormData.title} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participant Modal */}
      {showParticipantModal && selectedTrial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingParticipant ? t('tools.clinicalTrial.editParticipant', 'Edit Participant') : t('tools.clinicalTrial.addParticipant', 'Add Participant')}</h2>
              <button onClick={() => { setShowParticipantModal(false); setEditingParticipant(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>{t('tools.clinicalTrial.patientName', 'Patient Name')}</label>
                  <input type="text" value={participantFormData.patientName} onChange={(e) => setParticipantFormData({ ...participantFormData, patientName: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.fullName', 'Full name')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.participantId', 'Participant ID')}</label>
                  <input type="text" value={participantFormData.participantId} onChange={(e) => setParticipantFormData({ ...participantFormData, participantId: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.treatmentArm', 'Treatment Arm')}</label>
                  <select value={participantFormData.arm} onChange={(e) => setParticipantFormData({ ...participantFormData, arm: e.target.value })} className={inputClass}>
                    {selectedTrial.arms.map(arm => <option key={arm} value={arm}>{arm}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.status2', 'Status')}</label>
                  <select value={participantFormData.status} onChange={(e) => setParticipantFormData({ ...participantFormData, status: e.target.value as any })} className={inputClass}>
                    {participantStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.enrollmentDate', 'Enrollment Date')}</label>
                  <input type="date" value={participantFormData.enrollmentDate} onChange={(e) => setParticipantFormData({ ...participantFormData, enrollmentDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.consentDate2', 'Consent Date')}</label>
                  <input type="date" value={participantFormData.consentDate} onChange={(e) => setParticipantFormData({ ...participantFormData, consentDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.age2', 'Age')}</label>
                  <input type="number" value={participantFormData.demographics.age || ''} onChange={(e) => setParticipantFormData({ ...participantFormData, demographics: { ...participantFormData.demographics, age: parseInt(e.target.value) || 0 } })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.gender2', 'Gender')}</label>
                  <select value={participantFormData.demographics.gender} onChange={(e) => setParticipantFormData({ ...participantFormData, demographics: { ...participantFormData.demographics, gender: e.target.value } })} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Male">{t('tools.clinicalTrial.male', 'Male')}</option>
                    <option value="Female">{t('tools.clinicalTrial.female', 'Female')}</option>
                    <option value="Other">{t('tools.clinicalTrial.other', 'Other')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.notes2', 'Notes')}</label>
                <textarea value={participantFormData.notes} onChange={(e) => setParticipantFormData({ ...participantFormData, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowParticipantModal(false); setEditingParticipant(null); }} className={buttonSecondary}>{t('tools.clinicalTrial.cancel2', 'Cancel')}</button>
                <button type="button" onClick={handleSaveParticipant} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Modal */}
      {showVisitModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.clinicalTrial.scheduleVisit', 'Schedule Visit')}</h2>
              <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.visitNumber', 'Visit Number')}</label>
                  <input type="number" value={visitFormData.visitNumber} onChange={(e) => setVisitFormData({ ...visitFormData, visitNumber: parseInt(e.target.value) || 1 })} className={inputClass} min="1" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.visitName', 'Visit Name')}</label>
                  <input type="text" value={visitFormData.visitName} onChange={(e) => setVisitFormData({ ...visitFormData, visitName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.scheduledDate', 'Scheduled Date')}</label>
                  <input type="date" value={visitFormData.scheduledDate} onChange={(e) => setVisitFormData({ ...visitFormData, scheduledDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.status3', 'Status')}</label>
                  <select value={visitFormData.status} onChange={(e) => setVisitFormData({ ...visitFormData, status: e.target.value as any })} className={inputClass}>
                    {visitStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.procedures', 'Procedures')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newProcedure} onChange={(e) => setNewProcedure(e.target.value)} placeholder={t('tools.clinicalTrial.addProcedure', 'Add procedure')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVisitProcedure())} />
                  <button type="button" onClick={addVisitProcedure} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonProcedures.filter(p => !visitFormData.procedures.includes(p)).slice(0, 6).map(p => (
                    <button key={p} type="button" onClick={() => setVisitFormData({ ...visitFormData, procedures: [...visitFormData.procedures, p] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {p}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {visitFormData.procedures.map((p, i) => (
                    <span key={i} className="px-2 py-1 text-sm rounded bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {p} <button onClick={() => setVisitFormData({ ...visitFormData, procedures: visitFormData.procedures.filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.notes3', 'Notes')}</label>
                <textarea value={visitFormData.notes} onChange={(e) => setVisitFormData({ ...visitFormData, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowVisitModal(false)} className={buttonSecondary}>{t('tools.clinicalTrial.cancel3', 'Cancel')}</button>
                <button type="button" onClick={handleSaveVisit} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.clinicalTrial.saveVisit', 'Save Visit')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adverse Event Modal */}
      {showAdverseEventModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.clinicalTrial.reportAdverseEvent', 'Report Adverse Event')}</h2>
              <button onClick={() => setShowAdverseEventModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.description2', 'Description *')}</label>
                <input type="text" value={aeFormData.description} onChange={(e) => setAeFormData({ ...aeFormData, description: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.describeTheAdverseEvent', 'Describe the adverse event')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.severity', 'Severity')}</label>
                  <select value={aeFormData.severity} onChange={(e) => setAeFormData({ ...aeFormData, severity: e.target.value as any })} className={inputClass}>
                    {severityLevels.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.causality', 'Causality')}</label>
                  <select value={aeFormData.causality} onChange={(e) => setAeFormData({ ...aeFormData, causality: e.target.value as any })} className={inputClass}>
                    {causalityLevels.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.onsetDate', 'Onset Date')}</label>
                  <input type="date" value={aeFormData.onsetDate} onChange={(e) => setAeFormData({ ...aeFormData, onsetDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.resolutionDate', 'Resolution Date')}</label>
                  <input type="date" value={aeFormData.resolutionDate || ''} onChange={(e) => setAeFormData({ ...aeFormData, resolutionDate: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.outcome', 'Outcome')}</label>
                <input type="text" value={aeFormData.outcome} onChange={(e) => setAeFormData({ ...aeFormData, outcome: e.target.value })} className={inputClass} placeholder={t('tools.clinicalTrial.eGResolvedOngoing', 'e.g., Resolved, Ongoing')} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="reportedToSponsor" checked={aeFormData.reportedToSponsor} onChange={(e) => setAeFormData({ ...aeFormData, reportedToSponsor: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="reportedToSponsor" className={labelClass}>{t('tools.clinicalTrial.reportedToSponsor', 'Reported to Sponsor')}</label>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowAdverseEventModal(false)} className={buttonSecondary}>{t('tools.clinicalTrial.cancel4', 'Cancel')}</button>
                <button type="button" onClick={handleSaveAdverseEvent} disabled={!aeFormData.description} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save AE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Protocol Deviation Modal */}
      {showDeviationModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.clinicalTrial.logProtocolDeviation', 'Log Protocol Deviation')}</h2>
              <button onClick={() => setShowDeviationModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.description3', 'Description *')}</label>
                <textarea value={deviationFormData.description} onChange={(e) => setDeviationFormData({ ...deviationFormData, description: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.clinicalTrial.describeTheProtocolDeviation', 'Describe the protocol deviation')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.date', 'Date')}</label>
                  <input type="date" value={deviationFormData.date} onChange={(e) => setDeviationFormData({ ...deviationFormData, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clinicalTrial.category', 'Category')}</label>
                  <select value={deviationFormData.category} onChange={(e) => setDeviationFormData({ ...deviationFormData, category: e.target.value as any })} className={inputClass}>
                    <option value="minor">{t('tools.clinicalTrial.minor', 'Minor')}</option>
                    <option value="major">{t('tools.clinicalTrial.major', 'Major')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.clinicalTrial.correctiveAction', 'Corrective Action')}</label>
                <textarea value={deviationFormData.correctionAction} onChange={(e) => setDeviationFormData({ ...deviationFormData, correctionAction: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.clinicalTrial.describeCorrectiveActionsTaken', 'Describe corrective actions taken')} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowDeviationModal(false)} className={buttonSecondary}>{t('tools.clinicalTrial.cancel5', 'Cancel')}</button>
                <button type="button" onClick={handleSaveDeviation} disabled={!deviationFormData.description} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Deviation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.clinicalTrial.aboutClinicalTrialManager', 'About Clinical Trial Manager')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage clinical trial enrollment, participant tracking, and protocol compliance. Track patient visits,
          adverse events, and protocol deviations. Monitor enrollment progress and generate comprehensive reports
          for regulatory submissions.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ClinicalTrialTool;
