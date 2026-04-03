'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  FileText,
  Target,
  Beaker,
  Microscope,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// TypeScript Interfaces
interface Variable {
  id: string;
  name: string;
  type: 'independent' | 'dependent' | 'controlled';
  value: string;
  unit: string;
}

interface Observation {
  id: string;
  experimentId: string;
  timestamp: Date;
  note: string;
  dataPoint?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface Equipment {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  methodology: string;
  startDate: Date;
  endDate: Date | null;
  status: 'planning' | 'in-progress' | 'completed' | 'paused' | 'failed';
  variables: Variable[];
  observations: Observation[];
  equipment: Equipment[];
  teamMembers: TeamMember[];
  results: string;
  conclusions: string;
  createdAt: Date;
  updatedAt: Date;
}

type TabType = 'experiments' | 'observations' | 'variables' | 'results';
type StatusFilter = 'all' | 'planning' | 'in-progress' | 'completed' | 'paused' | 'failed';

interface ExperimentLogToolProps {
  uiConfig?: UIConfig;
}

// Status configuration
const statusConfig = {
  'planning': { label: 'Planning', color: 'blue', icon: FileText },
  'in-progress': { label: 'In Progress', color: 'yellow', icon: PlayCircle },
  'completed': { label: 'Completed', color: 'green', icon: CheckCircle },
  'paused': { label: 'Paused', color: 'orange', icon: PauseCircle },
  'failed': { label: 'Failed', color: 'red', icon: XCircle },
};

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'hypothesis', header: 'Hypothesis', type: 'string' },
  { key: 'methodology', header: 'Methodology', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'results', header: 'Results', type: 'string' },
  { key: 'conclusions', header: 'Conclusions', type: 'string' },
  { key: 'variableCount', header: 'Variables', type: 'number' },
  { key: 'observationCount', header: 'Observations', type: 'number' },
  { key: 'teamSize', header: 'Team Size', type: 'number' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

export const ExperimentLogTool: React.FC<ExperimentLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: experiments,
    setData: setExperiments,
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
  } = useToolData<Experiment>('experiment-log', [], COLUMNS);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('experiments');

  // UI state
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewExperimentForm, setShowNewExperimentForm] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [researcherFilter, setResearcherFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Form state for new experiment
  const [newExperiment, setNewExperiment] = useState<Partial<Experiment>>({
    title: '',
    hypothesis: '',
    methodology: '',
    startDate: new Date(),
    endDate: null,
    status: 'planning',
    variables: [],
    observations: [],
    equipment: [],
    teamMembers: [],
    results: '',
    conclusions: '',
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.title || data.description) {
        setNewExperiment(prev => ({
          ...prev,
          title: data.title || prev.title,
          hypothesis: data.description || prev.hypothesis,
        }));
        setShowNewExperimentForm(true);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Get unique researchers for filter
  const uniqueResearchers = useMemo(() => {
    const researchers = new Set<string>();
    experiments.forEach(exp => {
      exp.teamMembers.forEach(member => researchers.add(member.name));
    });
    return Array.from(researchers);
  }, [experiments]);

  // Filtered experiments
  const filteredExperiments = useMemo(() => {
    return experiments.filter(exp => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          exp.title.toLowerCase().includes(query) ||
          exp.hypothesis.toLowerCase().includes(query) ||
          exp.methodology.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && exp.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateRangeStart) {
        const startDate = new Date(dateRangeStart);
        if (exp.startDate < startDate) return false;
      }
      if (dateRangeEnd) {
        const endDate = new Date(dateRangeEnd);
        if (exp.startDate > endDate) return false;
      }

      // Researcher filter
      if (researcherFilter) {
        const hasResearcher = exp.teamMembers.some(m => m.name === researcherFilter);
        if (!hasResearcher) return false;
      }

      return true;
    });
  }, [experiments, searchQuery, statusFilter, dateRangeStart, dateRangeEnd, researcherFilter]);

  // CRUD Operations
  const createExperiment = () => {
    if (!newExperiment.title) return;

    const experiment: Experiment = {
      id: Date.now().toString(),
      title: newExperiment.title || '',
      hypothesis: newExperiment.hypothesis || '',
      methodology: newExperiment.methodology || '',
      startDate: newExperiment.startDate || new Date(),
      endDate: newExperiment.endDate || null,
      status: newExperiment.status || 'planning',
      variables: newExperiment.variables || [],
      observations: newExperiment.observations || [],
      equipment: newExperiment.equipment || [],
      teamMembers: newExperiment.teamMembers || [],
      results: newExperiment.results || '',
      conclusions: newExperiment.conclusions || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addItem(experiment);
    setNewExperiment({
      title: '',
      hypothesis: '',
      methodology: '',
      startDate: new Date(),
      endDate: null,
      status: 'planning',
      variables: [],
      observations: [],
      equipment: [],
      teamMembers: [],
      results: '',
      conclusions: '',
    });
    setShowNewExperimentForm(false);
  };

  const handleUpdateExperiment = (updated: Experiment) => {
    updateItem(updated.id, { ...updated, updatedAt: new Date() });
    setSelectedExperiment(updated);
    setIsEditing(false);
  };

  const handleDeleteExperiment = (id: string) => {
    deleteItem(id);
    if (selectedExperiment?.id === id) {
      setSelectedExperiment(null);
    }
  };

  // Observation operations
  const addObservation = (experimentId: string, note: string, dataPoint?: string) => {
    const observation: Observation = {
      id: Date.now().toString(),
      experimentId,
      timestamp: new Date(),
      note,
      dataPoint,
    };

    const experiment = experiments.find(exp => exp.id === experimentId);
    if (experiment) {
      const updatedObservations = [observation, ...experiment.observations];
      updateItem(experimentId, {
        observations: updatedObservations,
        updatedAt: new Date(),
      });

      if (selectedExperiment?.id === experimentId) {
        setSelectedExperiment({
          ...selectedExperiment,
          observations: updatedObservations,
        });
      }
    }
  };

  // Variable operations
  const addVariable = (experimentId: string, variable: Omit<Variable, 'id'>) => {
    const newVariable: Variable = {
      ...variable,
      id: Date.now().toString(),
    };

    const experiment = experiments.find(exp => exp.id === experimentId);
    if (experiment) {
      const updatedVariables = [...experiment.variables, newVariable];
      updateItem(experimentId, {
        variables: updatedVariables,
        updatedAt: new Date(),
      });

      if (selectedExperiment?.id === experimentId) {
        setSelectedExperiment({
          ...selectedExperiment,
          variables: updatedVariables,
        });
      }
    }
  };

  const removeVariable = (experimentId: string, variableId: string) => {
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (experiment) {
      const updatedVariables = experiment.variables.filter(v => v.id !== variableId);
      updateItem(experimentId, {
        variables: updatedVariables,
        updatedAt: new Date(),
      });

      if (selectedExperiment?.id === experimentId) {
        setSelectedExperiment({
          ...selectedExperiment,
          variables: updatedVariables,
        });
      }
    }
  };

  // Styling helpers
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'
  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;

  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`;

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return 'gray';
    return config.color;
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    const Icon = config.icon;
    const colorClasses = {
      blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      yellow: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
      red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[config.color as keyof typeof colorClasses]}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate stats for export
  const completedExperiments = useMemo(() =>
    experiments.filter(e => e.status === 'completed').length,
    [experiments]
  );

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'experiments', label: 'Experiments', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'observations', label: 'Observations', icon: <Microscope className="w-4 h-4" /> },
    { id: 'variables', label: 'Variables', icon: <Beaker className="w-4 h-4" /> },
    { id: 'results', label: 'Results', icon: <Target className="w-4 h-4" /> },
  ];

  // Variable form state
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableType, setNewVariableType] = useState<'independent' | 'dependent' | 'controlled'>('independent');
  const [newVariableValue, setNewVariableValue] = useState('');
  const [newVariableUnit, setNewVariableUnit] = useState('');

  // Observation form state
  const [newObservationNote, setNewObservationNote] = useState('');
  const [newObservationDataPoint, setNewObservationDataPoint] = useState('');

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <FlaskConical className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.experimentLog', 'Experiment Log')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.experimentLog.trackYourResearchExperimentsAnd', 'Track your research experiments and scientific observations')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="experiment-log" toolName="Experiment Log" />

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
              onExportCSV={() => exportCSV({ filename: 'experiment-log' })}
              onExportExcel={() => exportExcel({ filename: 'experiment-log' })}
              onExportJSON={() => exportJSON({ filename: 'experiment-log' })}
              onExportPDF={() => exportPDF({
                filename: 'experiment-log',
                title: 'Experiment Log',
                subtitle: `${completedExperiments} of ${experiments.length} experiments completed`,
                orientation: 'landscape',
              })}
              onPrint={() => print('Experiment Log')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.experimentLog.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.experimentLog.searchExperiments', 'Search experiments...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showFilters
                ? 'bg-[#0D9488] text-white'
                : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowNewExperimentForm(true)}
            className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.experimentLog.newExperiment', 'New Experiment')}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} grid grid-cols-1 md:grid-cols-4 gap-4`}>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.status', 'Status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={inputClass}
              >
                <option value="all">{t('tools.experimentLog.allStatus', 'All Status')}</option>
                <option value="planning">{t('tools.experimentLog.planning', 'Planning')}</option>
                <option value="in-progress">{t('tools.experimentLog.inProgress', 'In Progress')}</option>
                <option value="completed">{t('tools.experimentLog.completed', 'Completed')}</option>
                <option value="paused">{t('tools.experimentLog.paused', 'Paused')}</option>
                <option value="failed">{t('tools.experimentLog.failed', 'Failed')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.startDateFrom', 'Start Date From')}</label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.startDateTo', 'Start Date To')}</label>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.researcher', 'Researcher')}</label>
              <select
                value={researcherFilter}
                onChange={(e) => setResearcherFilter(e.target.value)}
                className={inputClass}
              >
                <option value="">{t('tools.experimentLog.allResearchers', 'All Researchers')}</option>
                {uniqueResearchers.map(researcher => (
                  <option key={researcher} value={researcher}>{researcher}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `${isDark ? t('tools.experimentLog.text0d9488Border0d9488', 'text-[#0D9488] border-[#0D9488]') : t('tools.experimentLog.text0d9488Border0d94882', 'text-[#0D9488] border-[#0D9488]')} border-b-2`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* New Experiment Form Modal */}
        {showNewExperimentForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-900' : 'bg-white'} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.createNewExperiment', 'Create New Experiment')}</h3>
                <button onClick={() => setShowNewExperimentForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.title', 'Title *')}</label>
                  <input
                    type="text"
                    value={newExperiment.title || ''}
                    onChange={(e) => setNewExperiment({ ...newExperiment, title: e.target.value })}
                    placeholder={t('tools.experimentLog.enterExperimentTitle', 'Enter experiment title...')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.hypothesis', 'Hypothesis')}</label>
                  <textarea
                    value={newExperiment.hypothesis || ''}
                    onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                    placeholder={t('tools.experimentLog.stateYourHypothesis', 'State your hypothesis...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.methodology', 'Methodology')}</label>
                  <textarea
                    value={newExperiment.methodology || ''}
                    onChange={(e) => setNewExperiment({ ...newExperiment, methodology: e.target.value })}
                    placeholder={t('tools.experimentLog.describeYourExperimentalMethodology', 'Describe your experimental methodology...')}
                    rows={4}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.startDate', 'Start Date')}</label>
                    <input
                      type="date"
                      value={newExperiment.startDate ? new Date(newExperiment.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewExperiment({ ...newExperiment, startDate: new Date(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.experimentLog.status2', 'Status')}</label>
                    <select
                      value={newExperiment.status || 'planning'}
                      onChange={(e) => setNewExperiment({ ...newExperiment, status: e.target.value as Experiment['status'] })}
                      className={inputClass}
                    >
                      <option value="planning">{t('tools.experimentLog.planning2', 'Planning')}</option>
                      <option value="in-progress">{t('tools.experimentLog.inProgress2', 'In Progress')}</option>
                      <option value="completed">{t('tools.experimentLog.completed2', 'Completed')}</option>
                      <option value="paused">{t('tools.experimentLog.paused2', 'Paused')}</option>
                      <option value="failed">{t('tools.experimentLog.failed2', 'Failed')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewExperimentForm(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {t('tools.experimentLog.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={createExperiment}
                    disabled={!newExperiment.title}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.experimentLog.createExperiment', 'Create Experiment')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experiments Tab */}
        {activeTab === 'experiments' && (
          <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = experiments.filter(e => e.status === status).length;
                const Icon = config.icon;
                return (
                  <div key={status} className={cardClass}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${config.color}-500`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{config.label}</span>
                    </div>
                    <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Experiments List */}
            <div className="space-y-3">
              {filteredExperiments.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">{t('tools.experimentLog.noExperimentsFound', 'No experiments found')}</p>
                  <p className="text-sm">{t('tools.experimentLog.createANewExperimentTo', 'Create a new experiment to get started')}</p>
                </div>
              ) : (
                filteredExperiments.map(experiment => (
                  <div
                    key={experiment.id}
                    className={`${cardClass} cursor-pointer hover:ring-2 hover:ring-[#0D9488]/50 transition-all ${
                      selectedExperiment?.id === experiment.id ? 'ring-2 ring-[#0D9488]' : ''
                    }`}
                    onClick={() => setSelectedExperiment(experiment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{experiment.title}</h4>
                          {getStatusBadge(experiment.status)}
                        </div>
                        <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {experiment.hypothesis}
                        </p>
                        <div className={`flex items-center gap-4 mt-3 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(experiment.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Microscope className="w-3 h-3" />
                            {experiment.observations.length} observations
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {experiment.teamMembers.length} members
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExperiment(experiment.id);
                        }}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'} transition-colors`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Experiment Detail */}
            {selectedExperiment && (
              <div className={`${cardClass} mt-6 space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.experimentDetails', 'Experiment Details')}</h3>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdateExperiment(selectedExperiment)}
                          className="px-3 py-1.5 bg-[#0D9488] text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          {t('tools.experimentLog.save', 'Save')}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {t('tools.experimentLog.cancel2', 'Cancel')}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        <Edit2 className="w-3 h-3" />
                        {t('tools.experimentLog.edit', 'Edit')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.experimentLog.title2', 'Title')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={selectedExperiment.title}
                        onChange={(e) => setSelectedExperiment({ ...selectedExperiment, title: e.target.value })}
                        className={inputClass}
                      />
                    ) : (
                      <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedExperiment.title}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.experimentLog.status3', 'Status')}</label>
                    {isEditing ? (
                      <select
                        value={selectedExperiment.status}
                        onChange={(e) => setSelectedExperiment({ ...selectedExperiment, status: e.target.value as Experiment['status'] })}
                        className={inputClass}
                      >
                        <option value="planning">{t('tools.experimentLog.planning3', 'Planning')}</option>
                        <option value="in-progress">{t('tools.experimentLog.inProgress3', 'In Progress')}</option>
                        <option value="completed">{t('tools.experimentLog.completed3', 'Completed')}</option>
                        <option value="paused">{t('tools.experimentLog.paused3', 'Paused')}</option>
                        <option value="failed">{t('tools.experimentLog.failed3', 'Failed')}</option>
                      </select>
                    ) : (
                      getStatusBadge(selectedExperiment.status)
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.experimentLog.hypothesis2', 'Hypothesis')}</label>
                  {isEditing ? (
                    <textarea
                      value={selectedExperiment.hypothesis}
                      onChange={(e) => setSelectedExperiment({ ...selectedExperiment, hypothesis: e.target.value })}
                      rows={2}
                      className={inputClass}
                    />
                  ) : (
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{selectedExperiment.hypothesis}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.experimentLog.methodology2', 'Methodology')}</label>
                  {isEditing ? (
                    <textarea
                      value={selectedExperiment.methodology}
                      onChange={(e) => setSelectedExperiment({ ...selectedExperiment, methodology: e.target.value })}
                      rows={3}
                      className={inputClass}
                    />
                  ) : (
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{selectedExperiment.methodology}</p>
                  )}
                </div>

                {/* Team Members */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.experimentLog.teamMembers', 'Team Members')}</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedExperiment.teamMembers.map(member => (
                      <span key={member.id} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                        {member.name} - {member.role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.experimentLog.equipmentMaterials', 'Equipment/Materials')}</label>
                  <div className="space-y-1">
                    {selectedExperiment.equipment.map(item => (
                      <div key={item.id} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.name} x{item.quantity} {item.notes && `(${item.notes})`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === 'observations' && (
          <div className="space-y-4">
            {selectedExperiment ? (
              <>
                <div className={`p-4 rounded-lg ${isDark ? t('tools.experimentLog.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/20') : t('tools.experimentLog.bg0d94885Border0d9488', 'bg-[#0D9488]/5 border-[#0D9488]/10')} border`}>
                  <p className={`text-sm ${isDark ? t('tools.experimentLog.text0d9488', 'text-[#0D9488]') : t('tools.experimentLog.text0b8276', 'text-[#0B8276]')}`}>
                    Adding observations to: <span className="font-semibold">{selectedExperiment.title}</span>
                  </p>
                </div>

                {/* Add Observation Form */}
                <div className={cardClass}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.addNewObservation', 'Add New Observation')}</h4>
                  <div className="space-y-3">
                    <textarea
                      value={newObservationNote}
                      onChange={(e) => setNewObservationNote(e.target.value)}
                      placeholder={t('tools.experimentLog.enterYourObservationNotes', 'Enter your observation notes...')}
                      rows={3}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={newObservationDataPoint}
                      onChange={(e) => setNewObservationDataPoint(e.target.value)}
                      placeholder={t('tools.experimentLog.dataPointOptionalEG', 'Data point (optional, e.g., \'4.2 mL/min\')')}
                      className={inputClass}
                    />
                    <button
                      onClick={() => {
                        if (newObservationNote.trim()) {
                          addObservation(selectedExperiment.id, newObservationNote, newObservationDataPoint || undefined);
                          setNewObservationNote('');
                          setNewObservationDataPoint('');
                        }
                      }}
                      disabled={!newObservationNote.trim()}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.experimentLog.addObservation', 'Add Observation')}
                    </button>
                  </div>
                </div>

                {/* Observations List */}
                <div className="space-y-3">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Observation Log ({selectedExperiment.observations.length})
                  </h4>
                  {selectedExperiment.observations.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.experimentLog.noObservationsRecordedYet', 'No observations recorded yet.')}</p>
                  ) : (
                    selectedExperiment.observations.map(obs => (
                      <div key={obs.id} className={cardClass}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <Clock className="w-4 h-4 text-[#0D9488]" />
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {obs.timestamp.toLocaleString()}
                            </div>
                            <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{obs.note}</p>
                            {obs.dataPoint && (
                              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isDark ? t('tools.experimentLog.bg0d948820Text0d9488', 'bg-[#0D9488]/20 text-[#0D9488]') : t('tools.experimentLog.bg0d948810Text0b8276', 'bg-[#0D9488]/10 text-[#0B8276]')}`}>
                                <Target className="w-3 h-3" />
                                {obs.dataPoint}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Microscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">{t('tools.experimentLog.selectAnExperiment', 'Select an experiment')}</p>
                <p className="text-sm">{t('tools.experimentLog.chooseAnExperimentFromThe', 'Choose an experiment from the Experiments tab to add observations')}</p>
              </div>
            )}
          </div>
        )}

        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <div className="space-y-4">
            {selectedExperiment ? (
              <>
                <div className={`p-4 rounded-lg ${isDark ? t('tools.experimentLog.bg0d948810Border0d94882', 'bg-[#0D9488]/10 border-[#0D9488]/20') : t('tools.experimentLog.bg0d94885Border0d94882', 'bg-[#0D9488]/5 border-[#0D9488]/10')} border`}>
                  <p className={`text-sm ${isDark ? t('tools.experimentLog.text0d94882', 'text-[#0D9488]') : t('tools.experimentLog.text0b82762', 'text-[#0B8276]')}`}>
                    Managing variables for: <span className="font-semibold">{selectedExperiment.title}</span>
                  </p>
                </div>

                {/* Add Variable Form */}
                <div className={cardClass}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.addNewVariable', 'Add New Variable')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={newVariableName}
                      onChange={(e) => setNewVariableName(e.target.value)}
                      placeholder={t('tools.experimentLog.variableName', 'Variable name')}
                      className={inputClass}
                    />
                    <select
                      value={newVariableType}
                      onChange={(e) => setNewVariableType(e.target.value as 'independent' | 'dependent' | 'controlled')}
                      className={inputClass}
                    >
                      <option value="independent">{t('tools.experimentLog.independent', 'Independent')}</option>
                      <option value="dependent">{t('tools.experimentLog.dependent', 'Dependent')}</option>
                      <option value="controlled">{t('tools.experimentLog.controlled', 'Controlled')}</option>
                    </select>
                    <input
                      type="text"
                      value={newVariableValue}
                      onChange={(e) => setNewVariableValue(e.target.value)}
                      placeholder={t('tools.experimentLog.valueRange', 'Value/Range')}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={newVariableUnit}
                      onChange={(e) => setNewVariableUnit(e.target.value)}
                      placeholder={t('tools.experimentLog.unit', 'Unit')}
                      className={inputClass}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (newVariableName.trim()) {
                        addVariable(selectedExperiment.id, {
                          name: newVariableName,
                          type: newVariableType,
                          value: newVariableValue,
                          unit: newVariableUnit,
                        });
                        setNewVariableName('');
                        setNewVariableValue('');
                        setNewVariableUnit('');
                      }
                    }}
                    disabled={!newVariableName.trim()}
                    className="mt-3 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.experimentLog.addVariable', 'Add Variable')}
                  </button>
                </div>

                {/* Variables by Type */}
                {['independent', 'dependent', 'controlled'].map(type => {
                  const variables = selectedExperiment.variables.filter(v => v.type === type);
                  const typeLabels = {
                    independent: { label: 'Independent Variables', color: 'blue' },
                    dependent: { label: 'Dependent Variables', color: 'green' },
                    controlled: { label: 'Controlled Variables', color: 'purple' },
                  };
                  const config = typeLabels[type as keyof typeof typeLabels];

                  return (
                    <div key={type} className="space-y-2">
                      <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className={`w-2 h-2 rounded-full bg-${config.color}-500`}></span>
                        {config.label} ({variables.length})
                      </h4>
                      {variables.length === 0 ? (
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No {type} variables defined.</p>
                      ) : (
                        <div className="space-y-2">
                          {variables.map(variable => (
                            <div key={variable.id} className={`${cardClass} flex items-center justify-between`}>
                              <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{variable.name}</p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {variable.value} {variable.unit}
                                </p>
                              </div>
                              <button
                                onClick={() => removeVariable(selectedExperiment.id, variable.id)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Beaker className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">{t('tools.experimentLog.selectAnExperiment2', 'Select an experiment')}</p>
                <p className="text-sm">{t('tools.experimentLog.chooseAnExperimentFromThe2', 'Choose an experiment from the Experiments tab to manage variables')}</p>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {selectedExperiment ? (
              <>
                <div className={`p-4 rounded-lg ${isDark ? t('tools.experimentLog.bg0d948810Border0d94883', 'bg-[#0D9488]/10 border-[#0D9488]/20') : t('tools.experimentLog.bg0d94885Border0d94883', 'bg-[#0D9488]/5 border-[#0D9488]/10')} border`}>
                  <p className={`text-sm ${isDark ? t('tools.experimentLog.text0d94883', 'text-[#0D9488]') : t('tools.experimentLog.text0b82763', 'text-[#0B8276]')}`}>
                    Results for: <span className="font-semibold">{selectedExperiment.title}</span>
                  </p>
                </div>

                {/* Results Section */}
                <div className={cardClass}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.results', 'Results')}</h4>
                  <textarea
                    value={selectedExperiment.results}
                    onChange={(e) => setSelectedExperiment({ ...selectedExperiment, results: e.target.value })}
                    placeholder={t('tools.experimentLog.documentYourExperimentalResults', 'Document your experimental results...')}
                    rows={5}
                    className={inputClass}
                  />
                </div>

                {/* Conclusions Section */}
                <div className={cardClass}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.conclusions', 'Conclusions')}</h4>
                  <textarea
                    value={selectedExperiment.conclusions}
                    onChange={(e) => setSelectedExperiment({ ...selectedExperiment, conclusions: e.target.value })}
                    placeholder={t('tools.experimentLog.stateYourConclusionsBasedOn', 'State your conclusions based on the results...')}
                    rows={5}
                    className={inputClass}
                  />
                </div>

                <button
                  onClick={() => handleUpdateExperiment(selectedExperiment)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.experimentLog.saveResultsConclusions', 'Save Results & Conclusions')}
                </button>

                {/* Summary Card */}
                <div className={`${cardClass} ${isDark ? t('tools.experimentLog.bgGradientToRFrom', 'bg-gradient-to-r from-gray-800 to-[#0D9488]/10') : t('tools.experimentLog.bgGradientToRFrom2', 'bg-gradient-to-r from-gray-50 to-[#0D9488]/5')}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.experimentLog.experimentSummary', 'Experiment Summary')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.experimentLog.duration', 'Duration')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedExperiment.endDate
                          ? Math.ceil((selectedExperiment.endDate.getTime() - selectedExperiment.startDate.getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                          : 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.experimentLog.observations', 'Observations')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedExperiment.observations.length}</p>
                    </div>
                    <div>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.experimentLog.variables', 'Variables')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedExperiment.variables.length}</p>
                    </div>
                    <div>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.experimentLog.teamSize', 'Team Size')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedExperiment.teamMembers.length}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">{t('tools.experimentLog.selectAnExperiment3', 'Select an experiment')}</p>
                <p className="text-sm">{t('tools.experimentLog.chooseAnExperimentFromThe3', 'Choose an experiment from the Experiments tab to view and edit results')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentLogTool;
