'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Pill,
  Activity,
  FileText,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Zap,
  Filter,
  BookOpen,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

// Types
interface Drug {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  schedule: '' | 'II' | 'III' | 'IV' | 'V';
  commonDosages: string[];
  contraindications: string[];
  sideEffects: string[];
  createdAt: string;
}

interface Interaction {
  id: string;
  drug1Id: string;
  drug2Id: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  mechanism: string;
  clinicalEffects: string;
  management: string;
  documentation: 'poor' | 'fair' | 'good' | 'excellent';
  references: string[];
  createdAt: string;
  updatedAt: string;
}

interface InteractionCheck {
  id: string;
  patientId?: string;
  patientName?: string;
  drugIds: string[];
  checkedAt: string;
  interactionsFound: number;
  notes: string;
}

interface DrugInteractionToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'drug-interaction';

// Column configuration for export
const interactionColumns: ColumnConfig[] = [
  { key: 'drug1Name', header: 'Drug 1', type: 'string' },
  { key: 'drug2Name', header: 'Drug 2', type: 'string' },
  { key: 'severity', header: 'Severity', type: 'string' },
  { key: 'mechanism', header: 'Mechanism', type: 'string' },
  { key: 'clinicalEffects', header: 'Clinical Effects', type: 'string' },
  { key: 'management', header: 'Management', type: 'string' },
  { key: 'documentation', header: 'Documentation', type: 'string' },
];

const drugColumns: ColumnConfig[] = [
  { key: 'name', header: 'Drug Name', type: 'string' },
  { key: 'genericName', header: 'Generic Name', type: 'string' },
  { key: 'drugClass', header: 'Class', type: 'string' },
  { key: 'schedule', header: 'Schedule', type: 'string' },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  'minor': { label: 'Minor', color: 'text-blue-600', icon: <Info className="w-5 h-5" />, bgColor: 'bg-blue-100' },
  'moderate': { label: 'Moderate', color: 'text-yellow-600', icon: <AlertCircle className="w-5 h-5" />, bgColor: 'bg-yellow-100' },
  'major': { label: 'Major', color: 'text-orange-600', icon: <AlertTriangle className="w-5 h-5" />, bgColor: 'bg-orange-100' },
  'contraindicated': { label: 'Contraindicated', color: 'text-red-600', icon: <X className="w-5 h-5" />, bgColor: 'bg-red-100' },
};

const DOCUMENTATION_CONFIG: Record<string, { label: string; color: string }> = {
  'poor': { label: 'Poor', color: 'gray' },
  'fair': { label: 'Fair', color: 'yellow' },
  'good': { label: 'Good', color: 'blue' },
  'excellent': { label: 'Excellent', color: 'green' },
};

const DRUG_CLASSES = [
  'ACE Inhibitor',
  'ARB',
  'Antibiotic',
  'Anticoagulant',
  'Anticonvulsant',
  'Antidepressant',
  'Antidiabetic',
  'Antihistamine',
  'Antihypertensive',
  'Antipsychotic',
  'Beta Blocker',
  'Calcium Channel Blocker',
  'Diuretic',
  'NSAID',
  'Opioid',
  'PPI',
  'Statin',
  'Other',
];

// Sample drug interactions database
const SAMPLE_INTERACTIONS: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    drug1Id: '',
    drug2Id: '',
    severity: 'major',
    mechanism: 'Additive anticoagulant effects',
    clinicalEffects: 'Increased risk of bleeding',
    management: 'Monitor for signs of bleeding; consider alternative analgesic',
    documentation: 'excellent',
    references: ['FDA Drug Safety Communication'],
  },
];

const createNewDrug = (): Drug => ({
  id: crypto.randomUUID(),
  name: '',
  genericName: '',
  brandNames: [],
  drugClass: '',
  schedule: '',
  commonDosages: [],
  contraindications: [],
  sideEffects: [],
  createdAt: new Date().toISOString(),
});

const createNewInteraction = (): Interaction => ({
  id: crypto.randomUUID(),
  drug1Id: '',
  drug2Id: '',
  severity: 'moderate',
  mechanism: '',
  clinicalEffects: '',
  management: '',
  documentation: 'good',
  references: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const DrugInteractionTool: React.FC<DrugInteractionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use hooks for data management
  const {
    data: drugs,
    addItem: addDrug,
    updateItem: updateDrug,
    deleteItem: deleteDrug,
    isLoading: drugsLoading,
  } = useToolData<Drug>(`${TOOL_ID}-drugs`, [], drugColumns);

  const {
    data: interactions,
    addItem: addInteraction,
    updateItem: updateInteraction,
    deleteItem: deleteInteraction,
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
  } = useToolData<Interaction>(TOOL_ID, [], interactionColumns);

  const {
    data: checkHistory,
    addItem: addCheckHistory,
  } = useToolData<InteractionCheck>(`${TOOL_ID}-history`, [], []);

  // UI State
  const [activeTab, setActiveTab] = useState<'check' | 'interactions' | 'drugs' | 'history'>('check');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Interaction check state
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [showDrugSearch, setShowDrugSearch] = useState(false);
  const [checkResults, setCheckResults] = useState<Interaction[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  // Form arrays
  const [newBrandName, setNewBrandName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newContraindication, setNewContraindication] = useState('');
  const [newSideEffect, setNewSideEffect] = useState('');
  const [newReference, setNewReference] = useState('');

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.drugName || params.drugs) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Statistics
  const stats = useMemo(() => {
    const totalInteractions = interactions.length;
    const contraindicated = interactions.filter(i => i.severity === 'contraindicated').length;
    const major = interactions.filter(i => i.severity === 'major').length;
    const moderate = interactions.filter(i => i.severity === 'moderate').length;
    const checksToday = checkHistory.filter(c =>
      c.checkedAt.startsWith(new Date().toISOString().split('T')[0])
    ).length;

    return {
      totalDrugs: drugs.length,
      totalInteractions,
      contraindicated,
      major,
      moderate,
      checksToday,
    };
  }, [drugs, interactions, checkHistory]);

  // Filtered drugs for search
  const filteredDrugs = useMemo(() => {
    if (!drugSearchQuery) return drugs;
    const query = drugSearchQuery.toLowerCase();
    return drugs.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.genericName.toLowerCase().includes(query) ||
      d.brandNames.some(b => b.toLowerCase().includes(query))
    );
  }, [drugs, drugSearchQuery]);

  // Check for interactions
  const checkInteractions = () => {
    if (selectedDrugs.length < 2) {
      setValidationMessage('Please select at least 2 drugs to check for interactions');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const foundInteractions: Interaction[] = [];

    // Check all pairs of selected drugs
    for (let i = 0; i < selectedDrugs.length; i++) {
      for (let j = i + 1; j < selectedDrugs.length; j++) {
        const drug1Id = selectedDrugs[i];
        const drug2Id = selectedDrugs[j];

        // Find matching interaction
        const interaction = interactions.find(int =>
          (int.drug1Id === drug1Id && int.drug2Id === drug2Id) ||
          (int.drug1Id === drug2Id && int.drug2Id === drug1Id)
        );

        if (interaction) {
          foundInteractions.push(interaction);
        }
      }
    }

    setCheckResults(foundInteractions);
    setHasChecked(true);

    // Save check to history
    const check: InteractionCheck = {
      id: crypto.randomUUID(),
      drugIds: selectedDrugs,
      checkedAt: new Date().toISOString(),
      interactionsFound: foundInteractions.length,
      notes: '',
    };
    addCheckHistory(check);
  };

  // Get drug name by ID
  const getDrugName = (drugId: string): string => {
    const drug = drugs.find(d => d.id === drugId);
    return drug ? drug.name : 'Unknown Drug';
  };

  // Handlers
  const handleAddDrugToCheck = (drugId: string) => {
    if (!selectedDrugs.includes(drugId)) {
      setSelectedDrugs([...selectedDrugs, drugId]);
    }
    setDrugSearchQuery('');
    setShowDrugSearch(false);
    setHasChecked(false);
  };

  const handleRemoveDrugFromCheck = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter(id => id !== drugId));
    setHasChecked(false);
  };

  const handleSaveDrug = () => {
    if (!editingDrug) return;
    if (!editingDrug.name) {
      setValidationMessage('Please enter a drug name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (drugs.find(d => d.id === editingDrug.id)) {
      updateDrug(editingDrug.id, editingDrug);
    } else {
      addDrug(editingDrug);
    }

    setShowDrugModal(false);
    setEditingDrug(null);
  };

  const handleSaveInteraction = () => {
    if (!editingInteraction) return;
    if (!editingInteraction.drug1Id || !editingInteraction.drug2Id) {
      setValidationMessage('Please select both drugs');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const updated = {
      ...editingInteraction,
      updatedAt: new Date().toISOString(),
    };

    if (interactions.find(i => i.id === editingInteraction.id)) {
      updateInteraction(editingInteraction.id, updated);
    } else {
      addInteraction(updated);
    }

    setShowInteractionModal(false);
    setEditingInteraction(null);
  };

  // Array field handlers
  const handleAddArrayItem = (field: string, value: string, setter: (v: string) => void) => {
    if (!editingDrug || !value.trim()) return;
    const fieldName = field as keyof Drug;
    const currentArray = editingDrug[fieldName] as string[];
    setEditingDrug({
      ...editingDrug,
      [fieldName]: [...currentArray, value.trim()],
    });
    setter('');
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    if (!editingDrug) return;
    const fieldName = field as keyof Drug;
    const currentArray = editingDrug[fieldName] as string[];
    setEditingDrug({
      ...editingDrug,
      [fieldName]: currentArray.filter((_, i) => i !== index),
    });
  };

  // Export handlers
  const handleExportCSV = () => exportCSV({ filename: 'drug-interactions' });
  const handleExportExcel = () => exportExcel({ filename: 'drug-interactions' });
  const handleExportJSON = () => exportJSON({ filename: 'drug-interactions' });
  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'drug-interactions',
      title: 'Drug Interaction Database',
      subtitle: `Total: ${interactions.length} interactions`,
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
          <div className="p-2 bg-orange-500 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.drugInteraction.drugInteractionChecker', 'Drug Interaction Checker')}</h1>
            <p className={textSecondary}>{t('tools.drugInteraction.checkAndManageDrugInteractions', 'Check and manage drug interactions')}</p>
          </div>
          {isPrefilled && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Prefilled
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="drug-interaction" toolName="Drug Interaction" />

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
            onPrint={() => print('Drug Interactions')}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-blue-500" />
            <span className={textSecondary}>{t('tools.drugInteraction.drugs', 'Drugs')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalDrugs}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className={textSecondary}>{t('tools.drugInteraction.interactions', 'Interactions')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalInteractions}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <X className="w-5 h-5 text-red-500" />
            <span className={textSecondary}>{t('tools.drugInteraction.contraindicated', 'Contraindicated')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.contraindicated}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className={textSecondary}>{t('tools.drugInteraction.major', 'Major')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.major}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className={textSecondary}>{t('tools.drugInteraction.moderate', 'Moderate')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.moderate}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className={textSecondary}>{t('tools.drugInteraction.checksToday', 'Checks Today')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.checksToday}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${cardBg} ${borderColor} border rounded-lg mb-6`}>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['check', 'interactions', 'drugs', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : `${textSecondary} hover:text-orange-500`
              }`}
            >
              {tab === 'check' ? 'Check Interactions' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : activeTab === 'check' ? (
            <div className="space-y-6">
              {/* Drug Selection */}
              <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
                <h3 className={`font-semibold mb-4 ${textPrimary}`}>{t('tools.drugInteraction.selectDrugsToCheck', 'Select Drugs to Check')}</h3>

                {/* Drug Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={drugSearchQuery}
                    onChange={(e) => {
                      setDrugSearchQuery(e.target.value);
                      setShowDrugSearch(true);
                    }}
                    onFocus={() => setShowDrugSearch(true)}
                    placeholder={t('tools.drugInteraction.searchForADrugTo', 'Search for a drug to add...')}
                    className={`w-full px-4 py-2 pl-10 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />

                  {showDrugSearch && filteredDrugs.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 ${cardBg} ${borderColor} border rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                      {filteredDrugs.map((drug) => (
                        <button
                          key={drug.id}
                          onClick={() => handleAddDrugToCheck(drug.id)}
                          disabled={selectedDrugs.includes(drug.id)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            selectedDrugs.includes(drug.id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className={textPrimary}>{drug.name}</span>
                          {drug.genericName && (
                            <span className={`ml-2 text-sm ${textSecondary}`}>({drug.genericName})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Drugs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDrugs.map((drugId) => (
                    <span
                      key={drugId}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-2"
                    >
                      <Pill className="w-4 h-4" />
                      {getDrugName(drugId)}
                      <button
                        onClick={() => handleRemoveDrugFromCheck(drugId)}
                        className="hover:text-orange-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Check Button */}
                <button
                  onClick={checkInteractions}
                  disabled={selectedDrugs.length < 2}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedDrugs.length < 2
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  {t('tools.drugInteraction.checkInteractions', 'Check Interactions')}
                </button>
              </div>

              {/* Results */}
              {hasChecked && (
                <div className={`${cardBg} ${borderColor} border rounded-lg p-4`}>
                  <h3 className={`font-semibold mb-4 ${textPrimary}`}>
                    Interaction Results
                    {checkResults.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-sm rounded-full">
                        {checkResults.length} found
                      </span>
                    )}
                  </h3>

                  {checkResults.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{t('tools.drugInteraction.noInteractionsFound', 'No interactions found')}</p>
                        <p className={`text-sm ${textSecondary}`}>
                          {t('tools.drugInteraction.theSelectedDrugsHaveNo', 'The selected drugs have no known interactions in our database')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {checkResults
                        .sort((a, b) => {
                          const order = { contraindicated: 0, major: 1, moderate: 2, minor: 3 };
                          return order[a.severity] - order[b.severity];
                        })
                        .map((interaction) => (
                          <div
                            key={interaction.id}
                            className={`p-4 rounded-lg border-l-4 ${
                              interaction.severity === 'contraindicated' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
                              interaction.severity === 'major' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                              interaction.severity === 'moderate' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                              'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${SEVERITY_CONFIG[interaction.severity].bgColor}`}>
                                {SEVERITY_CONFIG[interaction.severity].icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`font-semibold ${SEVERITY_CONFIG[interaction.severity].color}`}>
                                    {SEVERITY_CONFIG[interaction.severity].label}
                                  </span>
                                  <span className={`text-sm px-2 py-0.5 rounded ${
                                    DOCUMENTATION_CONFIG[interaction.documentation].color === 'green'
                                      ? 'bg-green-100 text-green-700'
                                      : DOCUMENTATION_CONFIG[interaction.documentation].color === 'blue'
                                      ? 'bg-blue-100 text-blue-700'
                                      : DOCUMENTATION_CONFIG[interaction.documentation].color === 'yellow'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {DOCUMENTATION_CONFIG[interaction.documentation].label} Documentation
                                  </span>
                                </div>
                                <p className={`font-medium ${textPrimary}`}>
                                  {getDrugName(interaction.drug1Id)} + {getDrugName(interaction.drug2Id)}
                                </p>
                                <div className="mt-3 space-y-2">
                                  <div>
                                    <span className={`text-sm font-medium ${textSecondary}`}>{t('tools.drugInteraction.mechanism', 'Mechanism:')}</span>
                                    <span className={`text-sm ${textPrimary}`}>{interaction.mechanism}</span>
                                  </div>
                                  <div>
                                    <span className={`text-sm font-medium ${textSecondary}`}>{t('tools.drugInteraction.clinicalEffects', 'Clinical Effects:')}</span>
                                    <span className={`text-sm ${textPrimary}`}>{interaction.clinicalEffects}</span>
                                  </div>
                                  <div>
                                    <span className={`text-sm font-medium ${textSecondary}`}>{t('tools.drugInteraction.management', 'Management:')}</span>
                                    <span className={`text-sm ${textPrimary}`}>{interaction.management}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'interactions' ? (
            <div>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('tools.drugInteraction.searchInteractions', 'Search interactions...')}
                    className={`w-full pl-10 pr-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className={`px-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                >
                  <option value="">{t('tools.drugInteraction.allSeverities', 'All Severities')}</option>
                  {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingInteraction(createNewInteraction());
                    setShowInteractionModal(true);
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Interaction
                </button>
              </div>

              {/* Interactions List */}
              <div className="space-y-3">
                {interactions
                  .filter(i => {
                    const matchesSearch = searchQuery === '' ||
                      getDrugName(i.drug1Id).toLowerCase().includes(searchQuery.toLowerCase()) ||
                      getDrugName(i.drug2Id).toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesSeverity = filterSeverity === '' || i.severity === filterSeverity;
                    return matchesSearch && matchesSeverity;
                  })
                  .map((interaction) => (
                    <div
                      key={interaction.id}
                      className={`${cardBg} ${borderColor} border rounded-lg p-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${SEVERITY_CONFIG[interaction.severity].bgColor}`}>
                            {SEVERITY_CONFIG[interaction.severity].icon}
                          </div>
                          <div>
                            <p className={`font-medium ${textPrimary}`}>
                              {getDrugName(interaction.drug1Id)} + {getDrugName(interaction.drug2Id)}
                            </p>
                            <p className={`text-sm ${textSecondary}`}>{interaction.mechanism}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-sm ${
                            interaction.severity === 'contraindicated' ? 'bg-red-100 text-red-700' :
                            interaction.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                            interaction.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {SEVERITY_CONFIG[interaction.severity].label}
                          </span>
                          <button
                            onClick={() => {
                              setEditingInteraction(interaction);
                              setShowInteractionModal(true);
                            }}
                            className={`p-1 ${textSecondary} hover:text-orange-500`}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirm({
                                title: 'Delete Interaction',
                                message: 'Are you sure you want to delete this interaction? This action cannot be undone.',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                variant: 'danger',
                              });
                              if (confirmed) {
                                deleteInteraction(interaction.id);
                              }
                            }}
                            className={`p-1 ${textSecondary} hover:text-red-500`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : activeTab === 'drugs' ? (
            <div>
              {/* Drug Actions */}
              <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('tools.drugInteraction.searchDrugs', 'Search drugs...')}
                    className={`w-full pl-10 pr-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingDrug(createNewDrug());
                    setShowDrugModal(true);
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Drug
                </button>
              </div>

              {/* Drugs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drugs
                  .filter(d =>
                    searchQuery === '' ||
                    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.genericName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((drug) => (
                    <div
                      key={drug.id}
                      className={`${cardBg} ${borderColor} border rounded-lg p-4`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Pill className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${textPrimary}`}>{drug.name}</h3>
                            {drug.genericName && (
                              <p className={`text-sm ${textSecondary}`}>{drug.genericName}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingDrug(drug);
                              setShowDrugModal(true);
                            }}
                            className={`p-1 ${textSecondary} hover:text-orange-500`}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirm({
                                title: 'Delete Drug',
                                message: 'Are you sure you want to delete this drug? This action cannot be undone.',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                variant: 'danger',
                              });
                              if (confirmed) {
                                deleteDrug(drug.id);
                              }
                            }}
                            className={`p-1 ${textSecondary} hover:text-red-500`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className={`space-y-1 text-sm ${textSecondary}`}>
                        <p><span className="font-medium">{t('tools.drugInteraction.class', 'Class:')}</span> {drug.drugClass || 'N/A'}</p>
                        {drug.schedule && (
                          <p><span className="font-medium">{t('tools.drugInteraction.schedule', 'Schedule:')}</span> C-{drug.schedule}</p>
                        )}
                        {drug.brandNames.length > 0 && (
                          <p><span className="font-medium">{t('tools.drugInteraction.brands', 'Brands:')}</span> {drug.brandNames.slice(0, 2).join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {checkHistory.length === 0 ? (
                <div className={`text-center py-12 ${textSecondary}`}>
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.drugInteraction.noCheckHistoryYet', 'No check history yet')}</p>
                </div>
              ) : (
                checkHistory
                  .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
                  .map((check) => (
                    <div
                      key={check.id}
                      className={`${cardBg} ${borderColor} border rounded-lg p-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className={`w-4 h-4 ${textSecondary}`} />
                            <span className={textSecondary}>
                              {new Date(check.checkedAt).toLocaleString()}
                            </span>
                            {check.interactionsFound > 0 ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                {check.interactionsFound} interaction(s)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                {t('tools.drugInteraction.noInteractions', 'No interactions')}
                              </span>
                            )}
                          </div>
                          <p className={textPrimary}>
                            <span className="font-medium">{t('tools.drugInteraction.drugsChecked', 'Drugs checked:')}</span>
                            {check.drugIds.map(id => getDrugName(id)).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drug Modal */}
      {showDrugModal && editingDrug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {drugs.find(d => d.id === editingDrug.id) ? t('tools.drugInteraction.editDrug', 'Edit Drug') : t('tools.drugInteraction.addDrug', 'Add Drug')}
              </h2>
              <button onClick={() => { setShowDrugModal(false); setEditingDrug(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.drugName', 'Drug Name *')}</label>
                  <input
                    type="text"
                    value={editingDrug.name}
                    onChange={(e) => setEditingDrug({ ...editingDrug, name: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    placeholder={t('tools.drugInteraction.eGLisinopril', 'e.g., Lisinopril')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.genericName', 'Generic Name')}</label>
                  <input
                    type="text"
                    value={editingDrug.genericName}
                    onChange={(e) => setEditingDrug({ ...editingDrug, genericName: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.drugClass', 'Drug Class')}</label>
                  <select
                    value={editingDrug.drugClass}
                    onChange={(e) => setEditingDrug({ ...editingDrug, drugClass: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.drugInteraction.selectClass', 'Select Class')}</option>
                    {DRUG_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.schedule2', 'Schedule')}</label>
                  <select
                    value={editingDrug.schedule}
                    onChange={(e) => setEditingDrug({ ...editingDrug, schedule: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.drugInteraction.notControlled', 'Not Controlled')}</option>
                    <option value="II">{t('tools.drugInteraction.scheduleIi', 'Schedule II')}</option>
                    <option value="III">{t('tools.drugInteraction.scheduleIii', 'Schedule III')}</option>
                    <option value="IV">{t('tools.drugInteraction.scheduleIv', 'Schedule IV')}</option>
                    <option value="V">{t('tools.drugInteraction.scheduleV', 'Schedule V')}</option>
                  </select>
                </div>
              </div>

              {/* Brand Names */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.brandNames', 'Brand Names')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder={t('tools.drugInteraction.addBrandName', 'Add brand name')}
                    className={`flex-1 px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('brandNames', newBrandName, setNewBrandName)}
                  />
                  <button
                    onClick={() => handleAddArrayItem('brandNames', newBrandName, setNewBrandName)}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingDrug.brandNames.map((name, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-1">
                      {name}
                      <button onClick={() => handleRemoveArrayItem('brandNames', index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Common Dosages */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.commonDosages', 'Common Dosages')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder={t('tools.drugInteraction.eG10mg20mg', 'e.g., 10mg, 20mg')}
                    className={`flex-1 px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('commonDosages', newDosage, setNewDosage)}
                  />
                  <button
                    onClick={() => handleAddArrayItem('commonDosages', newDosage, setNewDosage)}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingDrug.commonDosages.map((dosage, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                      {dosage}
                      <button onClick={() => handleRemoveArrayItem('commonDosages', index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Contraindications */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.contraindications', 'Contraindications')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newContraindication}
                    onChange={(e) => setNewContraindication(e.target.value)}
                    placeholder={t('tools.drugInteraction.addContraindication', 'Add contraindication')}
                    className={`flex-1 px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('contraindications', newContraindication, setNewContraindication)}
                  />
                  <button
                    onClick={() => handleAddArrayItem('contraindications', newContraindication, setNewContraindication)}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingDrug.contraindications.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                      {item}
                      <button onClick={() => handleRemoveArrayItem('contraindications', index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowDrugModal(false); setEditingDrug(null); }}
                className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                {t('tools.drugInteraction.cancel', 'Cancel')}
              </button>
              <button onClick={handleSaveDrug} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Modal */}
      {showInteractionModal && editingInteraction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {interactions.find(i => i.id === editingInteraction.id) ? t('tools.drugInteraction.editInteraction', 'Edit Interaction') : t('tools.drugInteraction.addInteraction', 'Add Interaction')}
              </h2>
              <button onClick={() => { setShowInteractionModal(false); setEditingInteraction(null); }} className={textSecondary}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.drug1', 'Drug 1 *')}</label>
                  <select
                    value={editingInteraction.drug1Id}
                    onChange={(e) => setEditingInteraction({ ...editingInteraction, drug1Id: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.drugInteraction.selectDrug', 'Select Drug')}</option>
                    {drugs.map((drug) => (
                      <option key={drug.id} value={drug.id}>{drug.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.drug2', 'Drug 2 *')}</label>
                  <select
                    value={editingInteraction.drug2Id}
                    onChange={(e) => setEditingInteraction({ ...editingInteraction, drug2Id: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    <option value="">{t('tools.drugInteraction.selectDrug2', 'Select Drug')}</option>
                    {drugs.map((drug) => (
                      <option key={drug.id} value={drug.id}>{drug.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.severity', 'Severity')}</label>
                  <select
                    value={editingInteraction.severity}
                    onChange={(e) => setEditingInteraction({ ...editingInteraction, severity: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.documentationLevel', 'Documentation Level')}</label>
                  <select
                    value={editingInteraction.documentation}
                    onChange={(e) => setEditingInteraction({ ...editingInteraction, documentation: e.target.value as any })}
                    className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  >
                    {Object.entries(DOCUMENTATION_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.mechanism2', 'Mechanism')}</label>
                <textarea
                  value={editingInteraction.mechanism}
                  onChange={(e) => setEditingInteraction({ ...editingInteraction, mechanism: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.drugInteraction.describeTheMechanismOfInteraction', 'Describe the mechanism of interaction...')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.clinicalEffects2', 'Clinical Effects')}</label>
                <textarea
                  value={editingInteraction.clinicalEffects}
                  onChange={(e) => setEditingInteraction({ ...editingInteraction, clinicalEffects: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.drugInteraction.describeTheClinicalEffects', 'Describe the clinical effects...')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.management2', 'Management')}</label>
                <textarea
                  value={editingInteraction.management}
                  onChange={(e) => setEditingInteraction({ ...editingInteraction, management: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  placeholder={t('tools.drugInteraction.describeHowToManageThis', 'Describe how to manage this interaction...')}
                />
              </div>

              {/* References */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.drugInteraction.references', 'References')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    placeholder={t('tools.drugInteraction.addReference', 'Add reference')}
                    className={`flex-1 px-3 py-2 ${inputBg} ${borderColor} border rounded-lg ${textPrimary}`}
                  />
                  <button
                    onClick={() => {
                      if (newReference.trim()) {
                        setEditingInteraction({
                          ...editingInteraction,
                          references: [...editingInteraction.references, newReference.trim()],
                        });
                        setNewReference('');
                      }
                    }}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {editingInteraction.references.map((ref, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <BookOpen className={`w-4 h-4 ${textSecondary}`} />
                      <span className={`flex-1 text-sm ${textPrimary}`}>{ref}</span>
                      <button
                        onClick={() => setEditingInteraction({
                          ...editingInteraction,
                          references: editingInteraction.references.filter((_, i) => i !== index),
                        })}
                        className={`${textSecondary} hover:text-red-500`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowInteractionModal(false); setEditingInteraction(null); }}
                className={`px-4 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                {t('tools.drugInteraction.cancel2', 'Cancel')}
              </button>
              <button onClick={handleSaveInteraction} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-40">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{validationMessage}</p>
            </div>
            <button
              onClick={() => setValidationMessage(null)}
              className="text-red-700 hover:text-red-900 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default DrugInteractionTool;
