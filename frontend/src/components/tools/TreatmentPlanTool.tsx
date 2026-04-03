'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import {
  ClipboardList,
  User,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Printer,
  Send,
  Filter,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
type Priority = 'urgent' | 'high' | 'medium' | 'low';
type Status = 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'declined';
type PhaseStatus = 'pending' | 'scheduled' | 'completed';

interface Treatment {
  id: string;
  toothNumber: number | null;
  cdtCode: string;
  procedure: string;
  priority: Priority;
  estimatedCost: number;
  insuranceEstimate: number;
  patientCost: number;
  notes: string;
  phaseNumber: number;
}

interface TreatmentPhase {
  id: string;
  phaseNumber: number;
  name: string;
  treatments: Treatment[];
  totalCost: number;
  insuranceTotal: number;
  patientTotal: number;
  status: PhaseStatus;
  scheduledDate?: string;
  completedDate?: string;
  notes: string;
}

interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  insuranceProvider: string;
  insuranceId: string;
  annualMax: number;
  usedBenefits: number;
  remainingBenefits: number;
}

interface TreatmentPlan {
  id: string;
  patientId: string;
  patient: PatientInfo;
  phases: TreatmentPhase[];
  status: Status;
  createdAt: string;
  updatedAt: string;
  presentedDate?: string;
  acceptedDate?: string;
  totalCost: number;
  insuranceTotal: number;
  patientTotal: number;
  notes: string;
  priority: Priority;
}

type TabType = 'plans' | 'create' | 'analytics';

const DEFAULT_PATIENT: PatientInfo = {
  id: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  insuranceProvider: '',
  insuranceId: '',
  annualMax: 1500,
  usedBenefits: 0,
  remainingBenefits: 1500,
};

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#dc2626',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981',
};

const STATUS_COLORS: Record<Status, string> = {
  proposed: '#6b7280',
  accepted: '#10b981',
  in_progress: '#3b82f6',
  completed: '#059669',
  declined: '#dc2626',
};

const CDT_CODES = [
  { code: 'D0120', procedure: 'Periodic oral evaluation', fee: 65 },
  { code: 'D0150', procedure: 'Comprehensive oral evaluation', fee: 115 },
  { code: 'D0210', procedure: 'Full mouth X-rays', fee: 150 },
  { code: 'D0220', procedure: 'Periapical X-ray', fee: 35 },
  { code: 'D0274', procedure: 'Bitewings - four films', fee: 75 },
  { code: 'D1110', procedure: 'Adult prophylaxis (cleaning)', fee: 125 },
  { code: 'D1206', procedure: 'Topical fluoride varnish', fee: 45 },
  { code: 'D2140', procedure: 'Amalgam - one surface', fee: 175 },
  { code: 'D2150', procedure: 'Amalgam - two surfaces', fee: 225 },
  { code: 'D2160', procedure: 'Amalgam - three surfaces', fee: 275 },
  { code: 'D2330', procedure: 'Resin composite - one surface', fee: 200 },
  { code: 'D2331', procedure: 'Resin composite - two surfaces', fee: 265 },
  { code: 'D2332', procedure: 'Resin composite - three surfaces', fee: 325 },
  { code: 'D2740', procedure: 'Crown - porcelain/ceramic', fee: 1250 },
  { code: 'D2750', procedure: 'Crown - porcelain fused to metal', fee: 1150 },
  { code: 'D2950', procedure: 'Core buildup', fee: 350 },
  { code: 'D3310', procedure: 'Root canal - anterior', fee: 850 },
  { code: 'D3320', procedure: 'Root canal - bicuspid', fee: 975 },
  { code: 'D3330', procedure: 'Root canal - molar', fee: 1200 },
  { code: 'D4341', procedure: 'Periodontal scaling - per quadrant', fee: 275 },
  { code: 'D4342', procedure: 'Periodontal scaling - 1-3 teeth', fee: 175 },
  { code: 'D4910', procedure: 'Periodontal maintenance', fee: 175 },
  { code: 'D7140', procedure: 'Extraction - erupted tooth', fee: 225 },
  { code: 'D7210', procedure: 'Extraction - surgical', fee: 375 },
  { code: 'D7240', procedure: 'Removal of impacted tooth', fee: 450 },
  { code: 'D6010', procedure: 'Implant placement', fee: 2500 },
  { code: 'D6058', procedure: 'Implant abutment', fee: 850 },
  { code: 'D6066', procedure: 'Implant crown - porcelain/ceramic', fee: 1650 },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configurations for export
const treatmentPlanColumns: ColumnConfig[] = [
  { key: 'id', header: 'Plan ID', type: 'string' },
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'insuranceTotal', header: 'Insurance Estimate', type: 'currency' },
  { key: 'patientTotal', header: 'Patient Responsibility', type: 'currency' },
  { key: 'phaseCount', header: 'Phases', type: 'number' },
  { key: 'treatmentCount', header: 'Treatments', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

// Generate default treatment plan
const generateDefaultTreatmentPlan = (): TreatmentPlan => ({
  id: generateId(),
  patientId: '',
  patient: { ...DEFAULT_PATIENT, id: generateId() },
  phases: [],
  status: 'proposed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalCost: 0,
  insuranceTotal: 0,
  patientTotal: 0,
  notes: '',
  priority: 'medium',
});

interface TreatmentPlanToolProps {
  uiConfig?: UIConfig;
}

export const TreatmentPlanTool: React.FC<TreatmentPlanToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize useToolData hook for backend persistence
  const {
    data: plans,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TreatmentPlan>(
    'treatment-plans',
    [],
    treatmentPlanColumns,
    { autoSave: true }
  );

  // Form states
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [newTreatment, setNewTreatment] = useState<Partial<Treatment>>({});
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  // Export handlers
  const handleExportCSV = () => {
    const exportData = plans.map(plan => ({
      ...plan,
      patientName: `${plan.patient.firstName} ${plan.patient.lastName}`.trim() || 'Unknown',
      phaseCount: plan.phases.length,
      treatmentCount: plan.phases.reduce((acc, p) => acc + p.treatments.length, 0),
    }));
    exportToCSV(exportData, treatmentPlanColumns, { filename: 'treatment-plans-export' });
  };

  const handleExportExcel = () => {
    const exportData = plans.map(plan => ({
      ...plan,
      patientName: `${plan.patient.firstName} ${plan.patient.lastName}`.trim() || 'Unknown',
      phaseCount: plan.phases.length,
      treatmentCount: plan.phases.reduce((acc, p) => acc + p.treatments.length, 0),
    }));
    exportToExcel(exportData, treatmentPlanColumns, { filename: 'treatment-plans-export' });
  };

  const handleExportJSON = () => {
    exportToJSON(plans, { filename: 'treatment-plans-export' });
  };

  const handleExportPDF = async () => {
    const exportData = plans.map(plan => ({
      ...plan,
      patientName: `${plan.patient.firstName} ${plan.patient.lastName}`.trim() || 'Unknown',
      phaseCount: plan.phases.length,
      treatmentCount: plan.phases.reduce((acc, p) => acc + p.treatments.length, 0),
    }));
    await exportToPDF(exportData, treatmentPlanColumns, {
      filename: 'treatment-plans-export',
      title: 'Treatment Plans Export',
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const exportData = plans.map(plan => ({
      ...plan,
      patientName: `${plan.patient.firstName} ${plan.patient.lastName}`.trim() || 'Unknown',
      phaseCount: plan.phases.length,
      treatmentCount: plan.phases.reduce((acc, p) => acc + p.treatments.length, 0),
    }));
    return copyUtil(exportData, treatmentPlanColumns);
  };

  const handlePrint = () => {
    const exportData = plans.map(plan => ({
      ...plan,
      patientName: `${plan.patient.firstName} ${plan.patient.lastName}`.trim() || 'Unknown',
      phaseCount: plan.phases.length,
      treatmentCount: plan.phases.reduce((acc, p) => acc + p.treatments.length, 0),
    }));
    printData(exportData, treatmentPlanColumns, { title: 'Treatment Plans' });
  };

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patientName || params.firstName || params.lastName) {
        const newPlan = generateDefaultTreatmentPlan();
        newPlan.patient.firstName = params.firstName || '';
        newPlan.patient.lastName = params.lastName || params.patientName?.split(' ').pop() || '';
        setEditingPlan(newPlan);
        setActiveTab('create');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate plan totals
  const calculatePlanTotals = (plan: TreatmentPlan): TreatmentPlan => {
    let totalCost = 0;
    let insuranceTotal = 0;
    let patientTotal = 0;

    plan.phases.forEach(phase => {
      phase.treatments.forEach(treatment => {
        totalCost += treatment.estimatedCost;
        insuranceTotal += treatment.insuranceEstimate;
        patientTotal += treatment.patientCost;
      });
      phase.totalCost = phase.treatments.reduce((acc, t) => acc + t.estimatedCost, 0);
      phase.insuranceTotal = phase.treatments.reduce((acc, t) => acc + t.insuranceEstimate, 0);
      phase.patientTotal = phase.treatments.reduce((acc, t) => acc + t.patientCost, 0);
    });

    return {
      ...plan,
      totalCost,
      insuranceTotal,
      patientTotal,
      updatedAt: new Date().toISOString(),
    };
  };

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch =
      `${plan.patient.firstName} ${plan.patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || plan.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Create new plan
  const handleCreatePlan = () => {
    const newPlan = generateDefaultTreatmentPlan();
    setEditingPlan(newPlan);
    setActiveTab('create');
  };

  // Save plan
  const handleSavePlan = () => {
    if (!editingPlan) return;

    const planToSave = calculatePlanTotals(editingPlan);

    const existingPlan = plans.find(p => p.id === planToSave.id);
    if (existingPlan) {
      updateItem(planToSave.id, planToSave);
    } else {
      addItem(planToSave);
    }

    setEditingPlan(null);
    setActiveTab('plans');
  };

  // Add treatment to phase
  const handleAddTreatment = () => {
    if (!editingPlan || !newTreatment.cdtCode) return;

    const cdtInfo = CDT_CODES.find(c => c.code === newTreatment.cdtCode);
    const estimatedCost = cdtInfo?.fee || newTreatment.estimatedCost || 0;
    const insuranceEstimate = Math.round(estimatedCost * 0.5); // 50% insurance estimate
    const patientCost = estimatedCost - insuranceEstimate;

    const treatment: Treatment = {
      id: generateId(),
      toothNumber: newTreatment.toothNumber || null,
      cdtCode: newTreatment.cdtCode || '',
      procedure: cdtInfo?.procedure || newTreatment.procedure || '',
      priority: newTreatment.priority || 'medium',
      estimatedCost,
      insuranceEstimate,
      patientCost,
      notes: newTreatment.notes || '',
      phaseNumber: selectedPhase,
    };

    // Find or create phase
    let phase = editingPlan.phases.find(p => p.phaseNumber === selectedPhase);
    if (!phase) {
      phase = {
        id: generateId(),
        phaseNumber: selectedPhase,
        name: `Phase ${selectedPhase}`,
        treatments: [],
        totalCost: 0,
        insuranceTotal: 0,
        patientTotal: 0,
        status: 'pending',
        notes: '',
      };
      editingPlan.phases.push(phase);
    }

    phase.treatments.push(treatment);

    setEditingPlan({ ...calculatePlanTotals(editingPlan) });
    setNewTreatment({});
    setShowTreatmentForm(false);
  };

  // Remove treatment
  const handleRemoveTreatment = (phaseNumber: number, treatmentId: string) => {
    if (!editingPlan) return;

    const phase = editingPlan.phases.find(p => p.phaseNumber === phaseNumber);
    if (phase) {
      phase.treatments = phase.treatments.filter(t => t.id !== treatmentId);
      if (phase.treatments.length === 0) {
        editingPlan.phases = editingPlan.phases.filter(p => p.phaseNumber !== phaseNumber);
      }
      setEditingPlan({ ...calculatePlanTotals(editingPlan) });
    }
  };

  // Update plan status
  const handleUpdateStatus = (planId: string, status: Status) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const updates: Partial<TreatmentPlan> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (status === 'accepted') {
        updates.acceptedDate = new Date().toISOString();
      }
      updateItem(planId, updates);
    }
  };

  // Delete plan
  const handleDeletePlan = async (planId: string) => {
    const confirmed = await confirm({
      title: 'Delete Treatment Plan',
      message: 'Are you sure you want to delete this treatment plan?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(planId);
    }
  };

  // Analytics calculations
  const getAnalytics = () => {
    const totalPlans = plans.length;
    const acceptedPlans = plans.filter(p => p.status === 'accepted' || p.status === 'in_progress' || p.status === 'completed').length;
    const acceptanceRate = totalPlans > 0 ? (acceptedPlans / totalPlans) * 100 : 0;
    const totalProposed = plans.reduce((acc, p) => acc + p.totalCost, 0);
    const totalAccepted = plans.filter(p => p.status !== 'proposed' && p.status !== 'declined')
      .reduce((acc, p) => acc + p.totalCost, 0);
    const avgPlanValue = totalPlans > 0 ? totalProposed / totalPlans : 0;

    return {
      totalPlans,
      acceptedPlans,
      acceptanceRate,
      totalProposed,
      totalAccepted,
      avgPlanValue,
    };
  };

  const analytics = getAnalytics();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <ClipboardList className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.treatmentPlan.treatmentPlanManager', 'Treatment Plan Manager')}
              </CardTitle>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.treatmentPlan.createAndManageDentalTreatment', 'Create and manage dental treatment plans')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="treatment-plan" toolName="Treatment Plan" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['plans', 'create', 'analytics'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (tab === 'create' && !editingPlan) {
                handleCreatePlan();
              } else {
                setActiveTab(tab);
              }
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'bg-white text-blue-600 border-b-2 border-blue-500'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Plans List Tab */}
      {activeTab === 'plans' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.treatmentPlan.searchByPatientNameOr', 'Search by patient name or plan ID...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                {t('tools.treatmentPlan.filters', 'Filters')}
              </button>
              <button
                onClick={handleCreatePlan}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                {t('tools.treatmentPlan.newPlan', 'New Plan')}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="flex flex-wrap gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.treatmentPlan.status', 'Status')}
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.treatmentPlan.allStatuses', 'All Statuses')}</option>
                    <option value="proposed">{t('tools.treatmentPlan.proposed', 'Proposed')}</option>
                    <option value="accepted">{t('tools.treatmentPlan.accepted', 'Accepted')}</option>
                    <option value="in_progress">{t('tools.treatmentPlan.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.treatmentPlan.completed', 'Completed')}</option>
                    <option value="declined">{t('tools.treatmentPlan.declined', 'Declined')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.treatmentPlan.priority', 'Priority')}
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.treatmentPlan.allPriorities', 'All Priorities')}</option>
                    <option value="urgent">{t('tools.treatmentPlan.urgent', 'Urgent')}</option>
                    <option value="high">{t('tools.treatmentPlan.high', 'High')}</option>
                    <option value="medium">{t('tools.treatmentPlan.medium', 'Medium')}</option>
                    <option value="low">{t('tools.treatmentPlan.low', 'Low')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Plans List */}
            <div className="space-y-4">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.treatmentPlan.noTreatmentPlansFoundCreate', 'No treatment plans found. Create your first plan!')}
                  </p>
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PRIORITY_COLORS[plan.priority] }}
                        />
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {plan.patient.firstName} {plan.patient.lastName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {plan.phases.length} phase(s) - {plan.phases.reduce((acc, p) => acc + p.treatments.length, 0)} treatment(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${plan.totalCost.toLocaleString()}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Patient: ${plan.patientTotal.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: STATUS_COLORS[plan.status] }}
                        >
                          {plan.status.replace('_', ' ')}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPlan({ ...plan });
                              setActiveTab('create');
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
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
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Tab */}
      {activeTab === 'create' && editingPlan && (
        <div className="space-y-4">
          {/* Patient Information */}
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.treatmentPlan.patientInformation', 'Patient Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.treatmentPlan.firstName', 'First Name *')}
                </label>
                <input
                  type="text"
                  value={editingPlan.patient.firstName}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    patient: { ...editingPlan.patient, firstName: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.treatmentPlan.lastName', 'Last Name *')}
                </label>
                <input
                  type="text"
                  value={editingPlan.patient.lastName}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    patient: { ...editingPlan.patient, lastName: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.treatmentPlan.phone', 'Phone')}
                </label>
                <input
                  type="tel"
                  value={editingPlan.patient.phone}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    patient: { ...editingPlan.patient, phone: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.treatmentPlan.insuranceProvider', 'Insurance Provider')}
                </label>
                <input
                  type="text"
                  value={editingPlan.patient.insuranceProvider}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    patient: { ...editingPlan.patient, insuranceProvider: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.treatmentPlan.annualMax', 'Annual Max ($)')}
                </label>
                <input
                  type="number"
                  value={editingPlan.patient.annualMax}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    patient: { ...editingPlan.patient, annualMax: parseFloat(e.target.value) || 0 }
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.treatmentPlan.priority2', 'Priority')}
                </label>
                <select
                  value={editingPlan.priority}
                  onChange={(e) => setEditingPlan({ ...editingPlan, priority: e.target.value as Priority })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="urgent">{t('tools.treatmentPlan.urgent2', 'Urgent')}</option>
                  <option value="high">{t('tools.treatmentPlan.high2', 'High')}</option>
                  <option value="medium">{t('tools.treatmentPlan.medium2', 'Medium')}</option>
                  <option value="low">{t('tools.treatmentPlan.low2', 'Low')}</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Phases */}
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.treatmentPlan.treatmentPhases', 'Treatment Phases')}
              </CardTitle>
              <button
                onClick={() => setShowTreatmentForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('tools.treatmentPlan.addTreatment', 'Add Treatment')}
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Treatment Form */}
              {showTreatmentForm && (
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.treatmentPlan.cdtCode', 'CDT Code')}
                      </label>
                      <select
                        value={newTreatment.cdtCode || ''}
                        onChange={(e) => setNewTreatment({ ...newTreatment, cdtCode: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">{t('tools.treatmentPlan.selectProcedure', 'Select procedure...')}</option>
                        {CDT_CODES.map((cdt) => (
                          <option key={cdt.code} value={cdt.code}>
                            {cdt.code} - {cdt.procedure} (${cdt.fee})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.treatmentPlan.tooth', 'Tooth #')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="32"
                        value={newTreatment.toothNumber || ''}
                        onChange={(e) => setNewTreatment({ ...newTreatment, toothNumber: parseInt(e.target.value) || undefined })}
                        placeholder="1-32"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.treatmentPlan.phase', 'Phase')}
                      </label>
                      <select
                        value={selectedPhase}
                        onChange={(e) => setSelectedPhase(parseInt(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>Phase {num}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.treatmentPlan.priority3', 'Priority')}
                      </label>
                      <select
                        value={newTreatment.priority || 'medium'}
                        onChange={(e) => setNewTreatment({ ...newTreatment, priority: e.target.value as Priority })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="urgent">{t('tools.treatmentPlan.urgent3', 'Urgent')}</option>
                        <option value="high">{t('tools.treatmentPlan.high3', 'High')}</option>
                        <option value="medium">{t('tools.treatmentPlan.medium3', 'Medium')}</option>
                        <option value="low">{t('tools.treatmentPlan.low3', 'Low')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setShowTreatmentForm(false);
                        setNewTreatment({});
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {t('tools.treatmentPlan.cancel', 'Cancel')}
                    </button>
                    <button
                      onClick={handleAddTreatment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {t('tools.treatmentPlan.addTreatment2', 'Add Treatment')}
                    </button>
                  </div>
                </div>
              )}

              {/* Phases List */}
              {editingPlan.phases.length === 0 ? (
                <div className="text-center py-8">
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.treatmentPlan.noTreatmentsAddedYetClick', 'No treatments added yet. Click "Add Treatment" to begin.')}
                  </p>
                </div>
              ) : (
                editingPlan.phases.sort((a, b) => a.phaseNumber - b.phaseNumber).map((phase) => (
                  <div
                    key={phase.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Phase {phase.phaseNumber}
                      </h4>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total: ${phase.totalCost.toLocaleString()} | Patient: ${phase.patientTotal.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {phase.treatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: PRIORITY_COLORS[treatment.priority] }}
                            />
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {treatment.cdtCode} - {treatment.procedure}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {treatment.toothNumber ? `Tooth #${treatment.toothNumber}` : 'Full mouth'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${treatment.estimatedCost}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Ins: ${treatment.insuranceEstimate} | Pt: ${treatment.patientCost}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveTreatment(phase.phaseNumber, treatment.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Plan Summary */}
              {editingPlan.phases.length > 0 && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.treatmentPlan.totalCost', 'Total Cost')}</p>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${editingPlan.totalCost.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.treatmentPlan.insuranceEstimate', 'Insurance Estimate')}</p>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${editingPlan.insuranceTotal.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.treatmentPlan.patientResponsibility', 'Patient Responsibility')}</p>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${editingPlan.patientTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setEditingPlan(null);
                setActiveTab('plans');
              }}
              className={`px-6 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.treatmentPlan.cancel2', 'Cancel')}
            </button>
            <button
              onClick={handleSavePlan}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {t('tools.treatmentPlan.savePlan', 'Save Plan')}
            </button>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.treatmentPlan.treatmentPlanAnalytics', 'Treatment Plan Analytics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.treatmentPlan.totalPlans', 'Total Plans')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalPlans}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.treatmentPlan.acceptanceRate', 'Acceptance Rate')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.acceptanceRate.toFixed(1)}%
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.treatmentPlan.avgPlanValue', 'Avg Plan Value')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.avgPlanValue.toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.treatmentPlan.totalProposed', 'Total Proposed')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.totalProposed.toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.treatmentPlan.totalAccepted', 'Total Accepted')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.totalAccepted.toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.treatmentPlan.acceptedPlans', 'Accepted Plans')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.acceptedPlans}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default TreatmentPlanTool;
