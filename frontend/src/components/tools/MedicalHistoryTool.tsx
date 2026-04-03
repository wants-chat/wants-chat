'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Heart,
  Activity,
  Pill,
  Stethoscope,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Users,
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
interface Condition {
  id: string;
  name: string;
  diagnosedDate: string;
  status: 'active' | 'resolved' | 'chronic' | 'managed';
  severity: 'mild' | 'moderate' | 'severe';
  treatingPhysician: string;
  notes: string;
}

interface Surgery {
  id: string;
  name: string;
  date: string;
  hospital: string;
  surgeon: string;
  outcome: string;
  complications: string;
}

interface FamilyHistory {
  id: string;
  relation: string;
  condition: string;
  ageOfOnset: string;
  notes: string;
}

interface MedicalHistory {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  bloodType: string;
  conditions: Condition[];
  surgeries: Surgery[];
  familyHistory: FamilyHistory[];
  socialHistory: {
    smoking: 'never' | 'former' | 'current';
    alcohol: 'none' | 'occasional' | 'moderate' | 'heavy';
    exercise: 'sedentary' | 'light' | 'moderate' | 'active';
    occupation: string;
  };
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicalHistoryToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'medical-history';

const historyColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'bloodType', header: 'Blood Type', type: 'string' },
  { key: 'conditionsCount', header: 'Conditions', type: 'number' },
  { key: 'surgeriesCount', header: 'Surgeries', type: 'number' },
  { key: 'lastUpdated', header: 'Last Updated', type: 'date' },
];

const createNewHistory = (): MedicalHistory => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dateOfBirth: '',
  bloodType: '',
  conditions: [],
  surgeries: [],
  familyHistory: [],
  socialHistory: {
    smoking: 'never',
    alcohol: 'none',
    exercise: 'moderate',
    occupation: '',
  },
  lastUpdated: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MedicalHistoryTool: React.FC<MedicalHistoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: histories,
    addItem: addHistory,
    updateItem: updateHistory,
    deleteItem: deleteHistory,
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
  } = useToolData<MedicalHistory>(TOOL_ID, [], historyColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistory | null>(null);
  const [editingHistory, setEditingHistory] = useState<MedicalHistory | null>(null);
  const [formData, setFormData] = useState<MedicalHistory>(createNewHistory());
  const [activeSection, setActiveSection] = useState<'conditions' | 'surgeries' | 'family' | 'social'>('conditions');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    conditions: true,
    surgeries: true,
    family: true,
    social: true,
  });

  // New condition/surgery/family forms
  const [newCondition, setNewCondition] = useState<Omit<Condition, 'id'>>({
    name: '', diagnosedDate: '', status: 'active', severity: 'mild', treatingPhysician: '', notes: '',
  });
  const [newSurgery, setNewSurgery] = useState<Omit<Surgery, 'id'>>({
    name: '', date: '', hospital: '', surgeon: '', outcome: '', complications: '',
  });
  const [newFamilyHistory, setNewFamilyHistory] = useState<Omit<FamilyHistory, 'id'>>({
    relation: '', condition: '', ageOfOnset: '', notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Statistics
  const stats = useMemo(() => {
    const totalConditions = histories.reduce((sum, h) => sum + h.conditions.length, 0);
    const activeConditions = histories.reduce((sum, h) => sum + h.conditions.filter(c => c.status === 'active').length, 0);
    const chronicConditions = histories.reduce((sum, h) => sum + h.conditions.filter(c => c.status === 'chronic').length, 0);
    return {
      totalPatients: histories.length,
      totalConditions,
      activeConditions,
      chronicConditions,
    };
  }, [histories]);

  // Filtered histories
  const filteredHistories = useMemo(() => {
    return histories.filter(history => {
      return searchQuery === '' ||
        history.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        history.patientId.includes(searchQuery);
    });
  }, [histories, searchQuery]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.patientName) errors.patientName = 'Patient name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (editingHistory) {
      updateHistory(formData.id, { ...formData, updatedAt: new Date().toISOString(), lastUpdated: new Date().toISOString().split('T')[0] });
    } else {
      addHistory({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingHistory(null);
    setFormData(createNewHistory());
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this medical history?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteHistory(id);
      if (selectedHistory?.id === id) setSelectedHistory(null);
    }
  };

  const openEditModal = (history: MedicalHistory) => {
    setEditingHistory(history);
    setFormData(history);
    setShowModal(true);
  };

  const addCondition = () => {
    if (newCondition.name) {
      const condition: Condition = { ...newCondition, id: crypto.randomUUID() };
      setFormData({ ...formData, conditions: [...formData.conditions, condition] });
      setNewCondition({ name: '', diagnosedDate: '', status: 'active', severity: 'mild', treatingPhysician: '', notes: '' });
    }
  };

  const removeCondition = (id: string) => {
    setFormData({ ...formData, conditions: formData.conditions.filter(c => c.id !== id) });
  };

  const addSurgery = () => {
    if (newSurgery.name) {
      const surgery: Surgery = { ...newSurgery, id: crypto.randomUUID() };
      setFormData({ ...formData, surgeries: [...formData.surgeries, surgery] });
      setNewSurgery({ name: '', date: '', hospital: '', surgeon: '', outcome: '', complications: '' });
    }
  };

  const removeSurgery = (id: string) => {
    setFormData({ ...formData, surgeries: formData.surgeries.filter(s => s.id !== id) });
  };

  const addFamilyHistoryItem = () => {
    if (newFamilyHistory.condition) {
      const item: FamilyHistory = { ...newFamilyHistory, id: crypto.randomUUID() };
      setFormData({ ...formData, familyHistory: [...formData.familyHistory, item] });
      setNewFamilyHistory({ relation: '', condition: '', ageOfOnset: '', notes: '' });
    }
  };

  const removeFamilyHistory = (id: string) => {
    setFormData({ ...formData, familyHistory: formData.familyHistory.filter(f => f.id !== id) });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'chronic': return 'bg-yellow-500/20 text-yellow-400';
      case 'managed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-500/20 text-green-400';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400';
      case 'severe': return 'bg-red-500/20 text-red-400';
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

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500 text-white'
      : theme === 'dark'
      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <History className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.medicalHistory.medicalHistory', 'Medical History')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.medicalHistory.trackPatientMedicalHistoryAnd', 'Track patient medical history and conditions')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="medical-history" toolName="Medical History" />

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
            onExportCSV={() => exportCSV({ filename: 'medical-history' })}
            onExportExcel={() => exportExcel({ filename: 'medical-history' })}
            onExportJSON={() => exportJSON({ filename: 'medical-history' })}
            onExportPDF={() => exportPDF({ filename: 'medical-history', title: 'Medical History Records' })}
            onPrint={() => print('Medical History Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={histories.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewHistory()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.medicalHistory.addRecord', 'Add Record')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalHistory.totalPatients', 'Total Patients')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalHistory.totalConditions', 'Total Conditions')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.totalConditions}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalHistory.activeConditions', 'Active Conditions')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.activeConditions}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Heart className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalHistory.chronicConditions', 'Chronic Conditions')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.chronicConditions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-4">{t('tools.medicalHistory.patientRecords', 'Patient Records')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools.medicalHistory.searchPatients', 'Search patients...')}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              </div>
            ) : filteredHistories.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.medicalHistory.noRecordsFound', 'No records found')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredHistories.map(history => (
                  <div
                    key={history.id}
                    onClick={() => setSelectedHistory(history)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedHistory?.id === history.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{history.patientName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {history.conditions.length} conditions | {history.surgeries.length} surgeries
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(history); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(history.id); }} className="p-1.5 hover:bg-red-500/20 rounded text-red-500">
                          <Trash2 className="w-4 h-4" />
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
          {selectedHistory ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedHistory.patientName}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        DOB: {selectedHistory.dateOfBirth || 'N/A'}
                      </span>
                      {selectedHistory.bloodType && (
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                          {selectedHistory.bloodType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setExpandedSections({ ...expandedSections, conditions: !expandedSections.conditions })}>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Medical Conditions ({selectedHistory.conditions.length})
                    </h3>
                    {expandedSections.conditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  {expandedSections.conditions && (
                    selectedHistory.conditions.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalHistory.noConditionsRecorded', 'No conditions recorded')}</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedHistory.conditions.map(condition => (
                          <div key={condition.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{condition.name}</span>
                              <div className="flex gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(condition.status)}`}>{condition.status}</span>
                                <span className={`px-2 py-0.5 text-xs rounded ${getSeverityColor(condition.severity)}`}>{condition.severity}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">Diagnosed: {condition.diagnosedDate}</p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>

                {/* Surgeries */}
                <div>
                  <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setExpandedSections({ ...expandedSections, surgeries: !expandedSections.surgeries })}>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-cyan-500" />
                      Surgical History ({selectedHistory.surgeries.length})
                    </h3>
                    {expandedSections.surgeries ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  {expandedSections.surgeries && (
                    selectedHistory.surgeries.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalHistory.noSurgeriesRecorded', 'No surgeries recorded')}</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedHistory.surgeries.map(surgery => (
                          <div key={surgery.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <p className="font-medium">{surgery.name}</p>
                            <p className="text-sm text-gray-400">{surgery.date} - {surgery.hospital}</p>
                            {surgery.surgeon && <p className="text-sm text-gray-400">Surgeon: {surgery.surgeon}</p>}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>

                {/* Family History */}
                <div>
                  <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setExpandedSections({ ...expandedSections, family: !expandedSections.family })}>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      Family History ({selectedHistory.familyHistory.length})
                    </h3>
                    {expandedSections.family ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  {expandedSections.family && (
                    selectedHistory.familyHistory.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalHistory.noFamilyHistoryRecorded', 'No family history recorded')}</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedHistory.familyHistory.map(item => (
                          <div key={item.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <p className="font-medium">{item.condition}</p>
                            <p className="text-sm text-gray-400">{item.relation} {item.ageOfOnset && `- Age of onset: ${item.ageOfOnset}`}</p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>

                {/* Social History */}
                <div>
                  <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setExpandedSections({ ...expandedSections, social: !expandedSections.social })}>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      {t('tools.medicalHistory.socialHistory2', 'Social History')}
                    </h3>
                    {expandedSections.social ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  {expandedSections.social && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-400">{t('tools.medicalHistory.smoking', 'Smoking:')}</span> {selectedHistory.socialHistory.smoking}</div>
                        <div><span className="text-gray-400">{t('tools.medicalHistory.alcohol', 'Alcohol:')}</span> {selectedHistory.socialHistory.alcohol}</div>
                        <div><span className="text-gray-400">{t('tools.medicalHistory.exercise', 'Exercise:')}</span> {selectedHistory.socialHistory.exercise}</div>
                        <div><span className="text-gray-400">{t('tools.medicalHistory.occupation', 'Occupation:')}</span> {selectedHistory.socialHistory.occupation || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <History className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.medicalHistory.selectAPatientRecord', 'Select a patient record')}</p>
              <p className="text-sm">{t('tools.medicalHistory.chooseAPatientToView', 'Choose a patient to view their medical history')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingHistory ? t('tools.medicalHistory.editMedicalHistory', 'Edit Medical History') : t('tools.medicalHistory.newMedicalHistory', 'New Medical History')}</h2>
              <button onClick={() => { setShowModal(false); setEditingHistory(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-4">{t('tools.medicalHistory.patientInformation', 'Patient Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.medicalHistory.patientName', 'Patient Name *')}</label>
                    <input type="text" value={formData.patientName} onChange={(e) => { setFormData({ ...formData, patientName: e.target.value }); setFormErrors(prev => ({ ...prev, patientName: '' })); }} className={`${inputClass} ${formErrors.patientName ? 'border-red-500' : ''}`} required />
                    {formErrors.patientName && <p className="text-red-500 text-xs mt-1">{formErrors.patientName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalHistory.dateOfBirth', 'Date of Birth')}</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalHistory.bloodType', 'Blood Type')}</label>
                    <select value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className={inputClass}>
                      <option value="">Select</option>
                      {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button onClick={() => setActiveSection('conditions')} className={tabClass(activeSection === 'conditions')}>{t('tools.medicalHistory.conditions', 'Conditions')}</button>
                <button onClick={() => setActiveSection('surgeries')} className={tabClass(activeSection === 'surgeries')}>{t('tools.medicalHistory.surgeries', 'Surgeries')}</button>
                <button onClick={() => setActiveSection('family')} className={tabClass(activeSection === 'family')}>{t('tools.medicalHistory.familyHistory', 'Family History')}</button>
                <button onClick={() => setActiveSection('social')} className={tabClass(activeSection === 'social')}>{t('tools.medicalHistory.socialHistory', 'Social History')}</button>
              </div>

              {/* Conditions Section */}
              {activeSection === 'conditions' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.conditionName', 'Condition Name *')}</label>
                      <input type="text" value={newCondition.name} onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })} className={inputClass} placeholder={t('tools.medicalHistory.eGHypertension', 'e.g., Hypertension')} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.diagnosedDate', 'Diagnosed Date')}</label>
                      <input type="date" value={newCondition.diagnosedDate} onChange={(e) => setNewCondition({ ...newCondition, diagnosedDate: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.status', 'Status')}</label>
                      <select value={newCondition.status} onChange={(e) => setNewCondition({ ...newCondition, status: e.target.value as any })} className={inputClass}>
                        <option value="active">{t('tools.medicalHistory.active', 'Active')}</option>
                        <option value="resolved">{t('tools.medicalHistory.resolved', 'Resolved')}</option>
                        <option value="chronic">{t('tools.medicalHistory.chronic', 'Chronic')}</option>
                        <option value="managed">{t('tools.medicalHistory.managed', 'Managed')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.severity', 'Severity')}</label>
                      <select value={newCondition.severity} onChange={(e) => setNewCondition({ ...newCondition, severity: e.target.value as any })} className={inputClass}>
                        <option value="mild">{t('tools.medicalHistory.mild', 'Mild')}</option>
                        <option value="moderate">{t('tools.medicalHistory.moderate', 'Moderate')}</option>
                        <option value="severe">{t('tools.medicalHistory.severe', 'Severe')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.treatingPhysician', 'Treating Physician')}</label>
                      <input type="text" value={newCondition.treatingPhysician} onChange={(e) => setNewCondition({ ...newCondition, treatingPhysician: e.target.value })} className={inputClass} />
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={addCondition} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.medicalHistory.add', 'Add')}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formData.conditions.map(c => (
                      <div key={c.id} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div>
                          <span className="font-medium">{c.name}</span>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${getStatusColor(c.status)}`}>{c.status}</span>
                        </div>
                        <button onClick={() => removeCondition(c.id)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Surgeries Section */}
              {activeSection === 'surgeries' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.surgeryName', 'Surgery Name *')}</label>
                      <input type="text" value={newSurgery.name} onChange={(e) => setNewSurgery({ ...newSurgery, name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.date', 'Date')}</label>
                      <input type="date" value={newSurgery.date} onChange={(e) => setNewSurgery({ ...newSurgery, date: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.hospital', 'Hospital')}</label>
                      <input type="text" value={newSurgery.hospital} onChange={(e) => setNewSurgery({ ...newSurgery, hospital: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.surgeon', 'Surgeon')}</label>
                      <input type="text" value={newSurgery.surgeon} onChange={(e) => setNewSurgery({ ...newSurgery, surgeon: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.outcome', 'Outcome')}</label>
                      <input type="text" value={newSurgery.outcome} onChange={(e) => setNewSurgery({ ...newSurgery, outcome: e.target.value })} className={inputClass} />
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={addSurgery} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.medicalHistory.add2', 'Add')}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formData.surgeries.map(s => (
                      <div key={s.id} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div><span className="font-medium">{s.name}</span> - {s.date}</div>
                        <button onClick={() => removeSurgery(s.id)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Family History Section */}
              {activeSection === 'family' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.relation', 'Relation')}</label>
                      <input type="text" value={newFamilyHistory.relation} onChange={(e) => setNewFamilyHistory({ ...newFamilyHistory, relation: e.target.value })} className={inputClass} placeholder={t('tools.medicalHistory.eGFather', 'e.g., Father')} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.condition', 'Condition *')}</label>
                      <input type="text" value={newFamilyHistory.condition} onChange={(e) => setNewFamilyHistory({ ...newFamilyHistory, condition: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.medicalHistory.ageOfOnset', 'Age of Onset')}</label>
                      <input type="text" value={newFamilyHistory.ageOfOnset} onChange={(e) => setNewFamilyHistory({ ...newFamilyHistory, ageOfOnset: e.target.value })} className={inputClass} placeholder="e.g., 50" />
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={addFamilyHistoryItem} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.medicalHistory.add3', 'Add')}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formData.familyHistory.map(f => (
                      <div key={f.id} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div><span className="font-medium">{f.condition}</span> - {f.relation}</div>
                        <button onClick={() => removeFamilyHistory(f.id)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social History Section */}
              {activeSection === 'social' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.medicalHistory.smokingStatus', 'Smoking Status')}</label>
                    <select value={formData.socialHistory.smoking} onChange={(e) => setFormData({ ...formData, socialHistory: { ...formData.socialHistory, smoking: e.target.value as any } })} className={inputClass}>
                      <option value="never">{t('tools.medicalHistory.never', 'Never')}</option>
                      <option value="former">{t('tools.medicalHistory.former', 'Former')}</option>
                      <option value="current">{t('tools.medicalHistory.current', 'Current')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalHistory.alcoholUse', 'Alcohol Use')}</label>
                    <select value={formData.socialHistory.alcohol} onChange={(e) => setFormData({ ...formData, socialHistory: { ...formData.socialHistory, alcohol: e.target.value as any } })} className={inputClass}>
                      <option value="none">None</option>
                      <option value="occasional">{t('tools.medicalHistory.occasional', 'Occasional')}</option>
                      <option value="moderate">{t('tools.medicalHistory.moderate2', 'Moderate')}</option>
                      <option value="heavy">{t('tools.medicalHistory.heavy', 'Heavy')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalHistory.exerciseLevel', 'Exercise Level')}</label>
                    <select value={formData.socialHistory.exercise} onChange={(e) => setFormData({ ...formData, socialHistory: { ...formData.socialHistory, exercise: e.target.value as any } })} className={inputClass}>
                      <option value="sedentary">{t('tools.medicalHistory.sedentary', 'Sedentary')}</option>
                      <option value="light">{t('tools.medicalHistory.light', 'Light')}</option>
                      <option value="moderate">{t('tools.medicalHistory.moderate3', 'Moderate')}</option>
                      <option value="active">{t('tools.medicalHistory.active2', 'Active')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.medicalHistory.occupation2', 'Occupation')}</label>
                    <input type="text" value={formData.socialHistory.occupation} onChange={(e) => setFormData({ ...formData, socialHistory: { ...formData.socialHistory, occupation: e.target.value } })} className={inputClass} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowModal(false); setEditingHistory(null); setFormErrors({}); }} className={buttonSecondary}>{t('tools.medicalHistory.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.medicalHistory.aboutMedicalHistoryTool', 'About Medical History Tool')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive medical history tracking for patients. Document conditions, surgeries, family history, and social factors.
          Maintain accurate records for better patient care and informed medical decisions.
        </p>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default MedicalHistoryTool;
