'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  AlertTriangle,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Shield,
  Activity,
  Pill,
  Heart,
  ThermometerSun,
  Clock,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface Reaction {
  id: string;
  date: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  symptoms: string[];
  treatment: string;
  notes: string;
}

interface Allergy {
  id: string;
  patientId: string;
  patientName: string;
  allergen: string;
  allergenType: 'drug' | 'food' | 'environmental' | 'insect' | 'latex' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction: string;
  symptoms: string[];
  onsetDate: string;
  diagnosedBy: string;
  status: 'active' | 'inactive' | 'resolved';
  reactions: Reaction[];
  avoidanceInstructions: string;
  emergencyPlan: string;
  hasEpiPen: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface AllergyTrackerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'allergy-tracker';

const allergyColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'allergen', header: 'Allergen', type: 'string' },
  { key: 'allergenType', header: 'Type', type: 'string' },
  { key: 'severity', header: 'Severity', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'onsetDate', header: 'Onset Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewAllergy = (): Allergy => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  allergen: '',
  allergenType: 'food',
  severity: 'moderate',
  reaction: '',
  symptoms: [],
  onsetDate: '',
  diagnosedBy: '',
  status: 'active',
  reactions: [],
  avoidanceInstructions: '',
  emergencyPlan: '',
  hasEpiPen: false,
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const allergenTypes = [
  { value: 'drug', label: 'Drug/Medication', icon: Pill },
  { value: 'food', label: 'Food', icon: Heart },
  { value: 'environmental', label: 'Environmental', icon: ThermometerSun },
  { value: 'insect', label: 'Insect', icon: Activity },
  { value: 'latex', label: 'Latex', icon: Shield },
  { value: 'other', label: 'Other', icon: AlertTriangle },
];

const commonSymptoms = [
  'Hives', 'Itching', 'Swelling', 'Rash', 'Difficulty breathing',
  'Wheezing', 'Runny nose', 'Sneezing', 'Watery eyes', 'Nausea',
  'Vomiting', 'Diarrhea', 'Abdominal pain', 'Dizziness', 'Anaphylaxis',
  'Throat tightening', 'Tongue swelling', 'Low blood pressure',
];

export const AllergyTrackerTool: React.FC<AllergyTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: allergies,
    addItem: addAllergy,
    updateItem: updateAllergy,
    deleteItem: deleteAllergy,
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
  } = useToolData<Allergy>(TOOL_ID, [], allergyColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy | null>(null);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [formData, setFormData] = useState<Allergy>(createNewAllergy());
  const [newSymptom, setNewSymptom] = useState('');
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.formData) {
        setFormData(params.formData);
        setShowModal(true);
        setEditingAllergy(params.editingAllergy || null);
      }
      if (params.searchQuery) setSearchQuery(params.searchQuery);
      if (params.filterType) setFilterType(params.filterType);
      if (params.filterSeverity) setFilterSeverity(params.filterSeverity);
      if (params.selectedAllergy) setSelectedAllergy(params.selectedAllergy);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const [newReaction, setNewReaction] = useState<Omit<Reaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    severity: 'moderate',
    symptoms: [],
    treatment: '',
    notes: '',
  });
  const [reactionSymptom, setReactionSymptom] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Statistics
  const stats = useMemo(() => {
    const active = allergies.filter(a => a.status === 'active');
    const lifeThreatening = allergies.filter(a => a.severity === 'life-threatening');
    const drugAllergies = allergies.filter(a => a.allergenType === 'drug');
    const foodAllergies = allergies.filter(a => a.allergenType === 'food');
    return {
      total: allergies.length,
      active: active.length,
      lifeThreatening: lifeThreatening.length,
      drugAllergies: drugAllergies.length,
      foodAllergies: foodAllergies.length,
    };
  }, [allergies]);

  // Filtered allergies
  const filteredAllergies = useMemo(() => {
    return allergies.filter(allergy => {
      const matchesSearch = searchQuery === '' ||
        allergy.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allergy.allergen.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || allergy.allergenType === filterType;
      const matchesSeverity = filterSeverity === '' || allergy.severity === filterSeverity;
      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [allergies, searchQuery, filterType, filterSeverity]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.patientName) errors.patientName = 'Patient name is required';
    if (!formData.allergen) errors.allergen = 'Allergen is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (editingAllergy) {
      updateAllergy(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addAllergy({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingAllergy(null);
    setFormData(createNewAllergy());
    setFormErrors({});

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Allergy Record',
      message: 'Are you sure you want to delete this allergy record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteAllergy(id);
      if (selectedAllergy?.id === id) setSelectedAllergy(null);
    }
  };

  const openEditModal = (allergy: Allergy) => {
    setEditingAllergy(allergy);
    setFormData(allergy);
    setShowModal(true);
  };

  const addSymptom = () => {
    if (newSymptom.trim() && !formData.symptoms.includes(newSymptom.trim())) {
      setFormData({ ...formData, symptoms: [...formData.symptoms, newSymptom.trim()] });
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setFormData({ ...formData, symptoms: formData.symptoms.filter(s => s !== symptom) });
  };

  const addReactionSymptom = () => {
    if (reactionSymptom.trim() && !newReaction.symptoms.includes(reactionSymptom.trim())) {
      setNewReaction({ ...newReaction, symptoms: [...newReaction.symptoms, reactionSymptom.trim()] });
      setReactionSymptom('');
    }
  };

  const saveReaction = () => {
    if (selectedAllergy) {
      const reaction: Reaction = { ...newReaction, id: crypto.randomUUID() };
      const updated = { ...selectedAllergy, reactions: [...selectedAllergy.reactions, reaction], updatedAt: new Date().toISOString() };
      updateAllergy(selectedAllergy.id, updated);
      setSelectedAllergy(updated);
      setShowReactionModal(false);
      setNewReaction({ date: new Date().toISOString().split('T')[0], severity: 'moderate', symptoms: [], treatment: '', notes: '' });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'severe': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'life-threatening': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = allergenTypes.find(t => t.value === type);
    return typeConfig?.icon || AlertTriangle;
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

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.allergyTracker.allergyTracker', 'Allergy Tracker')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.allergyTracker.trackAndManagePatientAllergies', 'Track and manage patient allergies')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="allergy-tracker" toolName="Allergy Tracker" />

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
            onExportCSV={() => exportCSV({ filename: 'allergy-tracker' })}
            onExportExcel={() => exportExcel({ filename: 'allergy-tracker' })}
            onExportJSON={() => exportJSON({ filename: 'allergy-tracker' })}
            onExportPDF={() => exportPDF({ filename: 'allergy-tracker', title: 'Allergy Records' })}
            onPrint={() => print('Allergy Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={allergies.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewAllergy()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.allergyTracker.addAllergy', 'Add Allergy')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.allergyTracker.total', 'Total')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.allergyTracker.active', 'Active')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.allergyTracker.critical', 'Critical')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.lifeThreatening}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Pill className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.allergyTracker.drug', 'Drug')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.drugAllergies}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Heart className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.allergyTracker.food', 'Food')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.foodAllergies}</p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.allergyTracker.searchPatientOrAllergen', 'Search patient or allergen...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.allergyTracker.allTypes', 'All Types')}</option>
            {allergenTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.allergyTracker.allSeverity', 'All Severity')}</option>
            <option value="mild">{t('tools.allergyTracker.mild', 'Mild')}</option>
            <option value="moderate">{t('tools.allergyTracker.moderate', 'Moderate')}</option>
            <option value="severe">{t('tools.allergyTracker.severe', 'Severe')}</option>
            <option value="life-threatening">{t('tools.allergyTracker.lifeThreatening', 'Life-threatening')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allergy List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">{t('tools.allergyTracker.allergyRecords', 'Allergy Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredAllergies.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.allergyTracker.noAllergiesRecorded', 'No allergies recorded')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredAllergies.map(allergy => {
                  const TypeIcon = getTypeIcon(allergy.allergenType);
                  return (
                    <div
                      key={allergy.id}
                      onClick={() => setSelectedAllergy(allergy)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedAllergy?.id === allergy.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium">{allergy.allergen}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {allergy.patientName}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getSeverityColor(allergy.severity)}`}>
                              {allergy.severity}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(allergy); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(allergy.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedAllergy ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedAllergy.allergen}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getSeverityColor(selectedAllergy.severity)}`}>
                        {selectedAllergy.severity}
                      </span>
                      {selectedAllergy.hasEpiPen && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">{t('tools.allergyTracker.epipen', 'EpiPen')}</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Patient: {selectedAllergy.patientName}
                    </p>
                  </div>
                  <button onClick={() => setShowReactionModal(true)} className={buttonPrimary}>
                    <Plus className="w-4 h-4" /> Log Reaction
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Allergy Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.allergyTracker.type', 'Type')}</p>
                    <p className="font-medium capitalize">{selectedAllergy.allergenType}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.allergyTracker.status', 'Status')}</p>
                    <p className="font-medium capitalize">{selectedAllergy.status}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.allergyTracker.onsetDate', 'Onset Date')}</p>
                    <p className="font-medium">{selectedAllergy.onsetDate || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.allergyTracker.diagnosedBy', 'Diagnosed By')}</p>
                    <p className="font-medium">{selectedAllergy.diagnosedBy || 'N/A'}</p>
                  </div>
                </div>

                {/* Symptoms */}
                {selectedAllergy.symptoms.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('tools.allergyTracker.typicalSymptoms', 'Typical Symptoms')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAllergy.symptoms.map((symptom, i) => (
                        <span key={i} className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avoidance & Emergency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAllergy.avoidanceInstructions && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-yellow-500" />
                        {t('tools.allergyTracker.avoidanceInstructions2', 'Avoidance Instructions')}
                      </h3>
                      <p className="text-sm">{selectedAllergy.avoidanceInstructions}</p>
                    </div>
                  )}
                  {selectedAllergy.emergencyPlan && (
                    <div className={`p-4 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        {t('tools.allergyTracker.emergencyPlan2', 'Emergency Plan')}
                      </h3>
                      <p className="text-sm">{selectedAllergy.emergencyPlan}</p>
                    </div>
                  )}
                </div>

                {/* Reaction History */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    Reaction History ({selectedAllergy.reactions.length})
                  </h3>
                  {selectedAllergy.reactions.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.allergyTracker.noReactionsLogged', 'No reactions logged')}</p>
                  ) : (
                    <div className="space-y-3">
                      {[...selectedAllergy.reactions].reverse().map(reaction => (
                        <div key={reaction.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{reaction.date}</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${getSeverityColor(reaction.severity)}`}>
                              {reaction.severity}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {reaction.symptoms.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">{s}</span>
                            ))}
                          </div>
                          {reaction.treatment && <p className="text-sm"><span className="text-gray-400">{t('tools.allergyTracker.treatment', 'Treatment:')}</span> {reaction.treatment}</p>}
                          {reaction.notes && <p className="text-sm text-gray-400 mt-1">{reaction.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <AlertTriangle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.allergyTracker.selectAnAllergyRecord', 'Select an allergy record')}</p>
              <p className="text-sm">{t('tools.allergyTracker.chooseAnAllergyToView', 'Choose an allergy to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingAllergy ? t('tools.allergyTracker.editAllergy', 'Edit Allergy') : t('tools.allergyTracker.addAllergy2', 'Add Allergy')}</h2>
              <button onClick={() => { setShowModal(false); setEditingAllergy(null); setFormErrors({}); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.patientName', 'Patient Name *')}</label>
                  <input type="text" value={formData.patientName} onChange={(e) => { setFormData({ ...formData, patientName: e.target.value }); setFormErrors(prev => ({ ...prev, patientName: '' })); }} className={`${inputClass} ${formErrors.patientName ? 'border-red-500' : ''}`} />
                  {formErrors.patientName && <p className="text-red-500 text-xs mt-1">{formErrors.patientName}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.allergen', 'Allergen *')}</label>
                  <input type="text" value={formData.allergen} onChange={(e) => { setFormData({ ...formData, allergen: e.target.value }); setFormErrors(prev => ({ ...prev, allergen: '' })); }} className={`${inputClass} ${formErrors.allergen ? 'border-red-500' : ''}`} placeholder={t('tools.allergyTracker.eGPenicillinPeanuts', 'e.g., Penicillin, Peanuts')} />
                  {formErrors.allergen && <p className="text-red-500 text-xs mt-1">{formErrors.allergen}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.type2', 'Type')}</label>
                  <select value={formData.allergenType} onChange={(e) => setFormData({ ...formData, allergenType: e.target.value as any })} className={inputClass}>
                    {allergenTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.severity', 'Severity')}</label>
                  <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })} className={inputClass}>
                    <option value="mild">{t('tools.allergyTracker.mild2', 'Mild')}</option>
                    <option value="moderate">{t('tools.allergyTracker.moderate2', 'Moderate')}</option>
                    <option value="severe">{t('tools.allergyTracker.severe2', 'Severe')}</option>
                    <option value="life-threatening">{t('tools.allergyTracker.lifeThreatening2', 'Life-threatening')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.onsetDate2', 'Onset Date')}</label>
                  <input type="date" value={formData.onsetDate} onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.diagnosedBy2', 'Diagnosed By')}</label>
                  <input type="text" value={formData.diagnosedBy} onChange={(e) => setFormData({ ...formData, diagnosedBy: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.status2', 'Status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.allergyTracker.active2', 'Active')}</option>
                    <option value="inactive">{t('tools.allergyTracker.inactive', 'Inactive')}</option>
                    <option value="resolved">{t('tools.allergyTracker.resolved', 'Resolved')}</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="hasEpiPen" checked={formData.hasEpiPen} onChange={(e) => setFormData({ ...formData, hasEpiPen: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="hasEpiPen" className={labelClass}>{t('tools.allergyTracker.hasEpipen', 'Has EpiPen')}</label>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.allergyTracker.symptoms', 'Symptoms')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSymptom} onChange={(e) => setNewSymptom(e.target.value)} placeholder={t('tools.allergyTracker.addSymptom', 'Add symptom')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())} />
                  <button type="button" onClick={addSymptom} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonSymptoms.filter(s => !formData.symptoms.includes(s)).slice(0, 8).map(s => (
                    <button key={s} type="button" onClick={() => setFormData({ ...formData, symptoms: [...formData.symptoms, s] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {s}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.symptoms.map((s, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {s} <button onClick={() => removeSymptom(s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.allergyTracker.avoidanceInstructions', 'Avoidance Instructions')}</label>
                <textarea value={formData.avoidanceInstructions} onChange={(e) => setFormData({ ...formData, avoidanceInstructions: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.allergyTracker.emergencyPlan', 'Emergency Plan')}</label>
                <textarea value={formData.emergencyPlan} onChange={(e) => setFormData({ ...formData, emergencyPlan: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.allergyTracker.notes', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={2} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowModal(false); setEditingAllergy(null); setFormErrors({}); }} className={buttonSecondary}>{t('tools.allergyTracker.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reaction Modal */}
      {showReactionModal && selectedAllergy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('tools.allergyTracker.logReaction', 'Log Reaction')}</h2>
              <button onClick={() => setShowReactionModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.date', 'Date')}</label>
                  <input type="date" value={newReaction.date} onChange={(e) => setNewReaction({ ...newReaction, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.allergyTracker.severity2', 'Severity')}</label>
                  <select value={newReaction.severity} onChange={(e) => setNewReaction({ ...newReaction, severity: e.target.value as any })} className={inputClass}>
                    <option value="mild">{t('tools.allergyTracker.mild3', 'Mild')}</option>
                    <option value="moderate">{t('tools.allergyTracker.moderate3', 'Moderate')}</option>
                    <option value="severe">{t('tools.allergyTracker.severe3', 'Severe')}</option>
                    <option value="life-threatening">{t('tools.allergyTracker.lifeThreatening3', 'Life-threatening')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.allergyTracker.symptoms2', 'Symptoms')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={reactionSymptom} onChange={(e) => setReactionSymptom(e.target.value)} placeholder={t('tools.allergyTracker.addSymptom2', 'Add symptom')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReactionSymptom())} />
                  <button type="button" onClick={addReactionSymptom} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newReaction.symptoms.map((s, i) => (
                    <span key={i} className="px-2 py-1 text-sm rounded bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {s} <button onClick={() => setNewReaction({ ...newReaction, symptoms: newReaction.symptoms.filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.allergyTracker.treatmentGiven', 'Treatment Given')}</label>
                <input type="text" value={newReaction.treatment} onChange={(e) => setNewReaction({ ...newReaction, treatment: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.allergyTracker.notes2', 'Notes')}</label>
                <textarea value={newReaction.notes} onChange={(e) => setNewReaction({ ...newReaction, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setShowReactionModal(false)} className={buttonSecondary}>{t('tools.allergyTracker.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveReaction} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.allergyTracker.saveReaction', 'Save Reaction')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.allergyTracker.aboutAllergyTracker', 'About Allergy Tracker')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Track and manage patient allergies with detailed reaction history. Document allergen types, severity levels,
          symptoms, avoidance instructions, and emergency plans. Log reactions as they occur to maintain accurate records.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default AllergyTrackerTool;
