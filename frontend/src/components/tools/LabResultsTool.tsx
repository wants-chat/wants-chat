'use client';

import React, { useState, useMemo } from 'react';
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
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Filter,
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
interface LabTest {
  id: string;
  testName: string;
  category: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  status: 'normal' | 'low' | 'high' | 'critical';
  notes: string;
}

interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  orderNumber: string;
  testDate: string;
  receivedDate: string;
  reportedDate: string;
  orderingPhysician: string;
  performingLab: string;
  specimenType: string;
  tests: LabTest[];
  overallStatus: 'normal' | 'abnormal' | 'critical' | 'pending';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface LabResultsToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'lab-results';

const labColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'testDate', header: 'Test Date', type: 'date' },
  { key: 'overallStatus', header: 'Status', type: 'string' },
  { key: 'testsCount', header: 'Tests', type: 'number' },
  { key: 'orderingPhysician', header: 'Physician', type: 'string' },
];

const createNewResult = (): LabResult => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  orderNumber: `LAB-${Date.now().toString(36).toUpperCase()}`,
  testDate: new Date().toISOString().split('T')[0],
  receivedDate: '',
  reportedDate: '',
  orderingPhysician: '',
  performingLab: '',
  specimenType: 'blood',
  tests: [],
  overallStatus: 'pending',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const testCategories = [
  'Complete Blood Count (CBC)',
  'Basic Metabolic Panel',
  'Comprehensive Metabolic Panel',
  'Lipid Panel',
  'Liver Function Tests',
  'Thyroid Panel',
  'Urinalysis',
  'Coagulation Studies',
  'Cardiac Markers',
  'Inflammatory Markers',
  'Hormone Levels',
  'Tumor Markers',
  'Other',
];

const specimenTypes = ['blood', 'urine', 'stool', 'saliva', 'tissue', 'csf', 'other'];

const commonTests = [
  { name: 'WBC', unit: '10^3/uL', min: 4.5, max: 11.0, category: 'Complete Blood Count (CBC)' },
  { name: 'RBC', unit: '10^6/uL', min: 4.5, max: 5.5, category: 'Complete Blood Count (CBC)' },
  { name: 'Hemoglobin', unit: 'g/dL', min: 12.0, max: 16.0, category: 'Complete Blood Count (CBC)' },
  { name: 'Hematocrit', unit: '%', min: 36, max: 46, category: 'Complete Blood Count (CBC)' },
  { name: 'Platelets', unit: '10^3/uL', min: 150, max: 400, category: 'Complete Blood Count (CBC)' },
  { name: 'Glucose', unit: 'mg/dL', min: 70, max: 100, category: 'Basic Metabolic Panel' },
  { name: 'BUN', unit: 'mg/dL', min: 7, max: 20, category: 'Basic Metabolic Panel' },
  { name: 'Creatinine', unit: 'mg/dL', min: 0.6, max: 1.2, category: 'Basic Metabolic Panel' },
  { name: 'Sodium', unit: 'mEq/L', min: 136, max: 145, category: 'Basic Metabolic Panel' },
  { name: 'Potassium', unit: 'mEq/L', min: 3.5, max: 5.0, category: 'Basic Metabolic Panel' },
  { name: 'Cholesterol (Total)', unit: 'mg/dL', min: 0, max: 200, category: 'Lipid Panel' },
  { name: 'HDL', unit: 'mg/dL', min: 40, max: 999, category: 'Lipid Panel' },
  { name: 'LDL', unit: 'mg/dL', min: 0, max: 100, category: 'Lipid Panel' },
  { name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150, category: 'Lipid Panel' },
  { name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4.0, category: 'Thyroid Panel' },
  { name: 'Free T4', unit: 'ng/dL', min: 0.8, max: 1.8, category: 'Thyroid Panel' },
  { name: 'AST', unit: 'U/L', min: 10, max: 40, category: 'Liver Function Tests' },
  { name: 'ALT', unit: 'U/L', min: 7, max: 56, category: 'Liver Function Tests' },
  { name: 'HbA1c', unit: '%', min: 4.0, max: 5.6, category: 'Other' },
];

export const LabResultsTool: React.FC<LabResultsToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: results,
    addItem: addResult,
    updateItem: updateResult,
    deleteItem: deleteResult,
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
  } = useToolData<LabResult>(TOOL_ID, [], labColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [editingResult, setEditingResult] = useState<LabResult | null>(null);
  const [formData, setFormData] = useState<LabResult>(createNewResult());

  const [newTest, setNewTest] = useState<Omit<LabTest, 'id' | 'status'>>({
    testName: '',
    category: '',
    value: 0,
    unit: '',
    referenceMin: 0,
    referenceMax: 0,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Statistics
  const stats = useMemo(() => {
    const normal = results.filter(r => r.overallStatus === 'normal').length;
    const abnormal = results.filter(r => r.overallStatus === 'abnormal').length;
    const critical = results.filter(r => r.overallStatus === 'critical').length;
    const pending = results.filter(r => r.overallStatus === 'pending').length;
    return { total: results.length, normal, abnormal, critical, pending };
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = searchQuery === '' ||
        result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || result.overallStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [results, searchQuery, filterStatus]);

  const calculateTestStatus = (value: number, min: number, max: number): 'normal' | 'low' | 'high' | 'critical' => {
    if (value < min * 0.5 || value > max * 2) return 'critical';
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  };

  const calculateOverallStatus = (tests: LabTest[]): 'normal' | 'abnormal' | 'critical' | 'pending' => {
    if (tests.length === 0) return 'pending';
    if (tests.some(t => t.status === 'critical')) return 'critical';
    if (tests.some(t => t.status === 'low' || t.status === 'high')) return 'abnormal';
    return 'normal';
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.patientName) errors.patientName = 'Patient name is required';
    if (!formData.testDate) errors.testDate = 'Test date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const overallStatus = calculateOverallStatus(formData.tests);
    if (editingResult) {
      updateResult(formData.id, { ...formData, overallStatus, updatedAt: new Date().toISOString() });
    } else {
      addResult({ ...formData, overallStatus, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingResult(null);
    setFormData(createNewResult());
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Lab Result',
      message: 'Are you sure you want to delete this lab result? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteResult(id);
      if (selectedResult?.id === id) setSelectedResult(null);
    }
  };

  const addTest = () => {
    if (selectedResult && newTest.testName) {
      const status = calculateTestStatus(newTest.value, newTest.referenceMin, newTest.referenceMax);
      const test: LabTest = { ...newTest, id: crypto.randomUUID(), status };
      const tests = [...selectedResult.tests, test];
      const updated = { ...selectedResult, tests, overallStatus: calculateOverallStatus(tests), updatedAt: new Date().toISOString() };
      updateResult(selectedResult.id, updated);
      setSelectedResult(updated);
      setShowTestModal(false);
      setNewTest({ testName: '', category: '', value: 0, unit: '', referenceMin: 0, referenceMax: 0, notes: '' });
    }
  };

  const deleteTest = async (testId: string) => {
    if (selectedResult) {
      const confirmed = await confirm({
        title: 'Delete Test',
        message: 'Are you sure you want to delete this test?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (confirmed) {
        const tests = selectedResult.tests.filter(t => t.id !== testId);
        const updated = { ...selectedResult, tests, overallStatus: calculateOverallStatus(tests), updatedAt: new Date().toISOString() };
        updateResult(selectedResult.id, updated);
        setSelectedResult(updated);
      }
    }
  };

  const prefillTest = (test: typeof commonTests[0]) => {
    setNewTest({
      testName: test.name,
      category: test.category,
      value: 0,
      unit: test.unit,
      referenceMin: test.min,
      referenceMax: test.max,
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500/20 text-green-400';
      case 'abnormal': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-blue-500/20 text-blue-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'low': return <TrendingDown className="w-4 h-4 text-blue-400" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
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

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <FlaskConical className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.labResults.labResults', 'Lab Results')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.labResults.trackAndManageLaboratoryTest', 'Track and manage laboratory test results')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="lab-results" toolName="Lab Results" />

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
            onExportCSV={() => exportCSV({ filename: 'lab-results' })}
            onExportExcel={() => exportExcel({ filename: 'lab-results' })}
            onExportJSON={() => exportJSON({ filename: 'lab-results' })}
            onExportPDF={() => exportPDF({ filename: 'lab-results', title: 'Lab Results' })}
            onPrint={() => print('Lab Results')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={results.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewResult()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.labResults.newResult', 'New Result')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labResults.total', 'Total')}</p>
            <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labResults.normal', 'Normal')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.normal}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labResults.abnormal', 'Abnormal')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.abnormal}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labResults.critical', 'Critical')}</p>
            <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labResults.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-gray-500">{stats.pending}</p>
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
              placeholder={t('tools.labResults.searchPatientOrOrder', 'Search patient or order...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.labResults.allStatus', 'All Status')}</option>
            <option value="normal">{t('tools.labResults.normal2', 'Normal')}</option>
            <option value="abnormal">{t('tools.labResults.abnormal2', 'Abnormal')}</option>
            <option value="critical">{t('tools.labResults.critical2', 'Critical')}</option>
            <option value="pending">{t('tools.labResults.pending2', 'Pending')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">{t('tools.labResults.labReports', 'Lab Reports')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.labResults.noLabResultsFound', 'No lab results found')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredResults.map(result => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedResult?.id === result.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{result.patientName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {result.orderNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{result.testDate}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(result.overallStatus)}`}>
                            {result.overallStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingResult(result); setFormData(result); setShowModal(true); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(result.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
          {selectedResult ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold">{selectedResult.patientName}</h2>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(selectedResult.overallStatus)}`}>
                        {selectedResult.overallStatus}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Order: {selectedResult.orderNumber}
                    </p>
                  </div>
                  <button onClick={() => setShowTestModal(true)} className={buttonPrimary}>
                    <Plus className="w-4 h-4" /> Add Test
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.labResults.testDate', 'Test Date')}</p>
                    <p className="font-medium">{selectedResult.testDate}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.labResults.physician', 'Physician')}</p>
                    <p className="font-medium">{selectedResult.orderingPhysician || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.labResults.specimen', 'Specimen')}</p>
                    <p className="font-medium capitalize">{selectedResult.specimenType}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.labResults.lab', 'Lab')}</p>
                    <p className="font-medium">{selectedResult.performingLab || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-4">Test Results ({selectedResult.tests.length})</h3>
                {selectedResult.tests.length === 0 ? (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labResults.noTestsRecorded', 'No tests recorded')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                          <th className="text-left py-2 px-3">{t('tools.labResults.test', 'Test')}</th>
                          <th className="text-left py-2 px-3">{t('tools.labResults.result', 'Result')}</th>
                          <th className="text-left py-2 px-3">{t('tools.labResults.reference', 'Reference')}</th>
                          <th className="text-left py-2 px-3">{t('tools.labResults.status', 'Status')}</th>
                          <th className="text-left py-2 px-3">{t('tools.labResults.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedResult.tests.map(test => (
                          <tr key={test.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                            <td className="py-3 px-3">
                              <p className="font-medium">{test.testName}</p>
                              <p className="text-xs text-gray-400">{test.category}</p>
                            </td>
                            <td className="py-3 px-3 font-medium">
                              {test.value} {test.unit}
                            </td>
                            <td className="py-3 px-3 text-gray-400">
                              {test.referenceMin} - {test.referenceMax} {test.unit}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(test.status)}
                                <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(test.status)}`}>
                                  {test.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <button onClick={() => deleteTest(test.id)} className="text-red-500 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <FlaskConical className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.labResults.selectALabResult', 'Select a lab result')}</p>
              <p className="text-sm">{t('tools.labResults.chooseAResultToView', 'Choose a result to view test details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Result Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingResult ? t('tools.labResults.editLabResult', 'Edit Lab Result') : t('tools.labResults.newLabResult', 'New Lab Result')}</h2>
              <button onClick={() => { setShowModal(false); setEditingResult(null); setFormErrors({}); }} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.labResults.patientName', 'Patient Name *')}</label>
                  <input type="text" value={formData.patientName} onChange={(e) => { setFormData({ ...formData, patientName: e.target.value }); setFormErrors(prev => ({ ...prev, patientName: '' })); }} className={`${inputClass} ${formErrors.patientName ? 'border-red-500' : ''}`} />
                  {formErrors.patientName && <p className="text-red-500 text-xs mt-1">{formErrors.patientName}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.orderNumber', 'Order Number')}</label>
                  <input type="text" value={formData.orderNumber} onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.testDate2', 'Test Date *')}</label>
                  <input type="date" value={formData.testDate} onChange={(e) => { setFormData({ ...formData, testDate: e.target.value }); setFormErrors(prev => ({ ...prev, testDate: '' })); }} className={`${inputClass} ${formErrors.testDate ? 'border-red-500' : ''}`} />
                  {formErrors.testDate && <p className="text-red-500 text-xs mt-1">{formErrors.testDate}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.reportedDate', 'Reported Date')}</label>
                  <input type="date" value={formData.reportedDate} onChange={(e) => setFormData({ ...formData, reportedDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.orderingPhysician', 'Ordering Physician')}</label>
                  <input type="text" value={formData.orderingPhysician} onChange={(e) => setFormData({ ...formData, orderingPhysician: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.performingLab', 'Performing Lab')}</label>
                  <input type="text" value={formData.performingLab} onChange={(e) => setFormData({ ...formData, performingLab: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.specimenType', 'Specimen Type')}</label>
                  <select value={formData.specimenType} onChange={(e) => setFormData({ ...formData, specimenType: e.target.value })} className={inputClass}>
                    {specimenTypes.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.labResults.notes', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { setShowModal(false); setEditingResult(null); setFormErrors({}); }} className={buttonSecondary}>{t('tools.labResults.cancel', 'Cancel')}</button>
                <button onClick={handleSave} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.labResults.save', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Modal */}
      {showTestModal && selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('tools.labResults.addTestResult', 'Add Test Result')}</h2>
              <button onClick={() => setShowTestModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.labResults.quickSelect', 'Quick Select')}</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {commonTests.slice(0, 10).map(test => (
                    <button key={test.name} onClick={() => prefillTest(test)} className={`px-3 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {test.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.labResults.testName', 'Test Name *')}</label>
                  <input type="text" value={newTest.testName} onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.category', 'Category')}</label>
                  <select value={newTest.category} onChange={(e) => setNewTest({ ...newTest, category: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.labResults.selectCategory', 'Select category')}</option>
                    {testCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.resultValue', 'Result Value *')}</label>
                  <input type="number" step="0.01" value={newTest.value} onChange={(e) => setNewTest({ ...newTest, value: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.unit', 'Unit')}</label>
                  <input type="text" value={newTest.unit} onChange={(e) => setNewTest({ ...newTest, unit: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.referenceMin', 'Reference Min')}</label>
                  <input type="number" step="0.01" value={newTest.referenceMin} onChange={(e) => setNewTest({ ...newTest, referenceMin: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.labResults.referenceMax', 'Reference Max')}</label>
                  <input type="number" step="0.01" value={newTest.referenceMax} onChange={(e) => setNewTest({ ...newTest, referenceMax: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.labResults.notes2', 'Notes')}</label>
                <textarea value={newTest.notes} onChange={(e) => setNewTest({ ...newTest, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowTestModal(false)} className={buttonSecondary}>{t('tools.labResults.cancel2', 'Cancel')}</button>
                <button onClick={addTest} disabled={!newTest.testName} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.labResults.addTest', 'Add Test')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.labResults.aboutLabResults', 'About Lab Results')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Track laboratory test results with automatic status calculation based on reference ranges.
          Manage multiple tests per report and monitor abnormal or critical values for timely follow-up.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default LabResultsTool;
