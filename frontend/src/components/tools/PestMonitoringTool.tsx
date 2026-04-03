import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';

interface PestRecord {
  id: string;
  date: string;
  fieldName: string;
  cropType: string;
  pestType: 'insect' | 'disease' | 'weed' | 'rodent' | 'bird' | 'other';
  pestName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: number;
  areaUnit: 'acres' | 'hectares' | 'sqft';
  symptoms: string;
  treatmentApplied: string;
  treatmentDate: string;
  treatmentCost: number;
  effectiveness: 'pending' | 'ineffective' | 'partial' | 'effective' | 'excellent';
  weatherConditions: string;
  notes: string;
  followUpDate: string;
  status: 'active' | 'monitoring' | 'resolved' | 'recurring';
}

const generateSampleData = (): PestRecord[] => [
  {
    id: '1',
    date: '2024-01-15',
    fieldName: 'North Field',
    cropType: 'Corn',
    pestType: 'insect',
    pestName: 'Corn Borer',
    severity: 'medium',
    affectedArea: 5,
    areaUnit: 'acres',
    symptoms: 'Holes in stalks, frass near entry points',
    treatmentApplied: 'Bt spray application',
    treatmentDate: '2024-01-16',
    treatmentCost: 450,
    effectiveness: 'effective',
    weatherConditions: 'Sunny, 75°F',
    notes: 'Early detection helped minimize damage',
    followUpDate: '2024-01-23',
    status: 'resolved',
  },
  {
    id: '2',
    date: '2024-01-18',
    fieldName: 'South Field',
    cropType: 'Soybeans',
    pestType: 'disease',
    pestName: 'Soybean Rust',
    severity: 'high',
    affectedArea: 12,
    areaUnit: 'acres',
    symptoms: 'Yellow-brown pustules on leaf undersides',
    treatmentApplied: 'Fungicide spray - triazole',
    treatmentDate: '2024-01-19',
    treatmentCost: 890,
    effectiveness: 'partial',
    weatherConditions: 'Humid, 68°F',
    notes: 'Second application may be needed',
    followUpDate: '2024-01-26',
    status: 'monitoring',
  },
  {
    id: '3',
    date: '2024-01-20',
    fieldName: 'East Orchard',
    cropType: 'Apples',
    pestType: 'insect',
    pestName: 'Codling Moth',
    severity: 'low',
    affectedArea: 2,
    areaUnit: 'acres',
    symptoms: 'Entry holes in fruit, larvae inside',
    treatmentApplied: 'Pheromone traps installed',
    treatmentDate: '2024-01-21',
    treatmentCost: 200,
    effectiveness: 'pending',
    weatherConditions: 'Partly cloudy, 62°F',
    notes: 'Monitoring trap catches weekly',
    followUpDate: '2024-01-28',
    status: 'active',
  },
];

const columnConfig: ColumnConfig[] = [
  { key: 'date', header: 'Date', width: 12 },
  { key: 'fieldName', header: 'Field', width: 15 },
  { key: 'cropType', header: 'Crop', width: 12 },
  { key: 'pestType', header: 'Pest Type', width: 12 },
  { key: 'pestName', header: 'Pest Name', width: 15 },
  { key: 'severity', header: 'Severity', width: 10 },
  { key: 'affectedArea', header: 'Affected Area', width: 12 },
  { key: 'treatmentApplied', header: 'Treatment', width: 20 },
  { key: 'treatmentCost', header: 'Cost ($)', width: 10 },
  { key: 'effectiveness', header: 'Effectiveness', width: 12 },
  { key: 'status', header: 'Status', width: 10 },
];

const PestMonitoringTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: records,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PestRecord>('pest-monitoring', generateSampleData(), columnConfig);

  const [activeTab, setActiveTab] = useState<'monitoring' | 'treatments' | 'analytics' | 'alerts'>('monitoring');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPestType, setFilterPestType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PestRecord | null>(null);

  const [formData, setFormData] = useState<Partial<PestRecord>>({
    date: new Date().toISOString().split('T')[0],
    fieldName: '',
    cropType: '',
    pestType: 'insect',
    pestName: '',
    severity: 'low',
    affectedArea: 0,
    areaUnit: 'acres',
    symptoms: '',
    treatmentApplied: '',
    treatmentDate: '',
    treatmentCost: 0,
    effectiveness: 'pending',
    weatherConditions: '',
    notes: '',
    followUpDate: '',
    status: 'active',
  });

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.pestName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPestType = filterPestType === 'all' || record.pestType === filterPestType;
      const matchesSeverity = filterSeverity === 'all' || record.severity === filterSeverity;
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      return matchesSearch && matchesPestType && matchesSeverity && matchesStatus;
    });
  }, [records, searchTerm, filterPestType, filterSeverity, filterStatus]);

  const stats = useMemo(() => {
    const activeIssues = records.filter((r) => r.status === 'active' || r.status === 'monitoring').length;
    const criticalIssues = records.filter((r) => r.severity === 'critical' || r.severity === 'high').length;
    const totalTreatmentCost = records.reduce((sum, r) => sum + r.treatmentCost, 0);
    const resolvedIssues = records.filter((r) => r.status === 'resolved').length;
    return { activeIssues, criticalIssues, totalTreatmentCost, resolvedIssues };
  }, [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateItem(editingRecord.id, formData);
    } else {
      addItem({
        ...formData,
        id: Date.now().toString(),
      } as PestRecord);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      fieldName: '',
      cropType: '',
      pestType: 'insect',
      pestName: '',
      severity: 'low',
      affectedArea: 0,
      areaUnit: 'acres',
      symptoms: '',
      treatmentApplied: '',
      treatmentDate: '',
      treatmentCost: 0,
      effectiveness: 'pending',
      weatherConditions: '',
      notes: '',
      followUpDate: '',
      status: 'active',
    });
    setEditingRecord(null);
    setShowAddModal(false);
  };

  const handleEdit = (record: PestRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowAddModal(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'recurring':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'effective':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ineffective':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPestTypeIcon = (type: string) => {
    switch (type) {
      case 'insect':
        return '🐛';
      case 'disease':
        return '🦠';
      case 'weed':
        return '🌿';
      case 'rodent':
        return '🐀';
      case 'bird':
        return '🐦';
      default:
        return '⚠️';
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🐛</span>
              {t('tools.pestMonitoring.pestMonitoring', 'Pest Monitoring')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.pestMonitoring.trackAndManagePestIssues', 'Track and manage pest issues across your farm')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="pest-monitoring" toolName="Pest Monitoring" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onPrint={print}
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('tools.pestMonitoring.reportIssue', 'Report Issue')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pestMonitoring.activeIssues', 'Active Issues')}</p>
            <p className="text-2xl font-bold text-red-600">{stats.activeIssues}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pestMonitoring.criticalHigh', 'Critical/High')}</p>
            <p className="text-2xl font-bold text-orange-600">{stats.criticalIssues}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pestMonitoring.resolved', 'Resolved')}</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pestMonitoring.treatmentCost', 'Treatment Cost')}</p>
            <p className="text-2xl font-bold text-blue-600">${stats.totalTreatmentCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto">
          {[
            { id: 'monitoring', label: 'Monitoring Log', icon: '📋' },
            { id: 'treatments', label: 'Treatments', icon: '💊' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'alerts', label: 'Alerts', icon: '🔔' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'monitoring' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('tools.pestMonitoring.searchByFieldCropOr', 'Search by field, crop, or pest name...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <select
                value={filterPestType}
                onChange={(e) => setFilterPestType(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.pestMonitoring.allPestTypes', 'All Pest Types')}</option>
                <option value="insect">{t('tools.pestMonitoring.insect', 'Insect')}</option>
                <option value="disease">{t('tools.pestMonitoring.disease', 'Disease')}</option>
                <option value="weed">{t('tools.pestMonitoring.weed', 'Weed')}</option>
                <option value="rodent">{t('tools.pestMonitoring.rodent', 'Rodent')}</option>
                <option value="bird">{t('tools.pestMonitoring.bird', 'Bird')}</option>
                <option value="other">{t('tools.pestMonitoring.other', 'Other')}</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.pestMonitoring.allSeverity', 'All Severity')}</option>
                <option value="critical">{t('tools.pestMonitoring.critical', 'Critical')}</option>
                <option value="high">{t('tools.pestMonitoring.high', 'High')}</option>
                <option value="medium">{t('tools.pestMonitoring.medium', 'Medium')}</option>
                <option value="low">{t('tools.pestMonitoring.low', 'Low')}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.pestMonitoring.allStatus', 'All Status')}</option>
                <option value="active">{t('tools.pestMonitoring.active', 'Active')}</option>
                <option value="monitoring">{t('tools.pestMonitoring.monitoring', 'Monitoring')}</option>
                <option value="resolved">{t('tools.pestMonitoring.resolved2', 'Resolved')}</option>
                <option value="recurring">{t('tools.pestMonitoring.recurring', 'Recurring')}</option>
              </select>
            </div>

            {/* Records List */}
            <div className="space-y-4">
              {filteredRecords.length === 0 ? (
                <div
                  className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestMonitoring.noPestRecordsFound', 'No pest records found')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.pestMonitoring.reportFirstIssue', 'Report First Issue')}
                  </button>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getPestTypeIcon(record.pestType)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{record.pestName}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {record.fieldName} - {record.cropType}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(record.severity)}`}>
                            {record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getEffectivenessColor(
                              record.effectiveness
                            )}`}
                          >
                            {record.effectiveness.charAt(0).toUpperCase() + record.effectiveness.slice(1)}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          <strong>{t('tools.pestMonitoring.symptoms', 'Symptoms:')}</strong> {record.symptoms}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <strong>{t('tools.pestMonitoring.treatment', 'Treatment:')}</strong> {record.treatmentApplied || 'None applied'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {record.affectedArea} {record.areaUnit}
                        </p>
                        {record.treatmentCost > 0 && (
                          <p className="text-sm font-medium text-green-600">${record.treatmentCost.toLocaleString()}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className={`p-2 rounded-lg ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            } transition-colors`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteItem(record.id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.pestMonitoring.treatmentHistory', 'Treatment History')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-3 px-4">{t('tools.pestMonitoring.date', 'Date')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pestMonitoring.pest', 'Pest')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pestMonitoring.treatment2', 'Treatment')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pestMonitoring.cost', 'Cost')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pestMonitoring.effectiveness', 'Effectiveness')}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.filter(r => r.treatmentApplied).map((record) => (
                    <tr key={record.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4">{new Date(record.treatmentDate || record.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{record.pestName}</td>
                      <td className="py-3 px-4">{record.treatmentApplied}</td>
                      <td className="py-3 px-4">${record.treatmentCost.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEffectivenessColor(record.effectiveness)}`}>
                          {record.effectiveness}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">{t('tools.pestMonitoring.issuesByPestType', 'Issues by Pest Type')}</h3>
              <div className="space-y-3">
                {['insect', 'disease', 'weed', 'rodent', 'bird', 'other'].map((type) => {
                  const count = records.filter((r) => r.pestType === type).length;
                  const percentage = records.length > 0 ? (count / records.length) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xl">{getPestTypeIcon(type)}</span>
                      <span className="w-20 capitalize">{type}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-green-600 h-4 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">{t('tools.pestMonitoring.treatmentEffectiveness', 'Treatment Effectiveness')}</h3>
              <div className="space-y-3">
                {['excellent', 'effective', 'partial', 'ineffective', 'pending'].map((eff) => {
                  const count = records.filter((r) => r.effectiveness === eff).length;
                  const percentage = records.length > 0 ? (count / records.length) * 100 : 0;
                  return (
                    <div key={eff} className="flex items-center gap-3">
                      <span className="w-24 capitalize">{eff}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            eff === 'excellent' || eff === 'effective'
                              ? 'bg-green-600'
                              : eff === 'partial'
                              ? 'bg-yellow-500'
                              : eff === 'ineffective'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.pestMonitoring.activeAlerts', 'Active Alerts')}</h2>
            <div className="space-y-4">
              {records
                .filter((r) => r.status === 'active' || r.severity === 'critical' || r.severity === 'high')
                .map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      record.severity === 'critical'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : record.severity === 'high'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPestTypeIcon(record.pestType)}</span>
                      <div>
                        <h3 className="font-semibold">{record.pestName} - {record.fieldName}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Severity: {record.severity} | Status: {record.status}
                        </p>
                        {record.followUpDate && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Follow-up: {new Date(record.followUpDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {records.filter((r) => r.status === 'active' || r.severity === 'critical' || r.severity === 'high')
                .length === 0 && (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.pestMonitoring.noActiveAlerts', 'No active alerts')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } p-6`}
          >
            <h2 className="text-xl font-bold mb-4">{editingRecord ? t('tools.pestMonitoring.editPestRecord', 'Edit Pest Record') : t('tools.pestMonitoring.reportPestIssue', 'Report Pest Issue')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.date2', 'Date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.fieldName', 'Field Name')}</label>
                  <input
                    type="text"
                    value={formData.fieldName}
                    onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.cropType', 'Crop Type')}</label>
                  <input
                    type="text"
                    value={formData.cropType}
                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.pestType', 'Pest Type')}</label>
                  <select
                    value={formData.pestType}
                    onChange={(e) => setFormData({ ...formData, pestType: e.target.value as PestRecord['pestType'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="insect">{t('tools.pestMonitoring.insect2', 'Insect')}</option>
                    <option value="disease">{t('tools.pestMonitoring.disease2', 'Disease')}</option>
                    <option value="weed">{t('tools.pestMonitoring.weed2', 'Weed')}</option>
                    <option value="rodent">{t('tools.pestMonitoring.rodent2', 'Rodent')}</option>
                    <option value="bird">{t('tools.pestMonitoring.bird2', 'Bird')}</option>
                    <option value="other">{t('tools.pestMonitoring.other2', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.pestName', 'Pest Name')}</label>
                  <input
                    type="text"
                    value={formData.pestName}
                    onChange={(e) => setFormData({ ...formData, pestName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.severity', 'Severity')}</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as PestRecord['severity'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="low">{t('tools.pestMonitoring.low2', 'Low')}</option>
                    <option value="medium">{t('tools.pestMonitoring.medium2', 'Medium')}</option>
                    <option value="high">{t('tools.pestMonitoring.high2', 'High')}</option>
                    <option value="critical">{t('tools.pestMonitoring.critical2', 'Critical')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.affectedArea', 'Affected Area')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.affectedArea}
                      onChange={(e) => setFormData({ ...formData, affectedArea: parseFloat(e.target.value) || 0 })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={formData.areaUnit}
                      onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value as PestRecord['areaUnit'] })}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="acres">{t('tools.pestMonitoring.acres', 'Acres')}</option>
                      <option value="hectares">{t('tools.pestMonitoring.hectares', 'Hectares')}</option>
                      <option value="sqft">{t('tools.pestMonitoring.sqFt', 'Sq Ft')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PestRecord['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="active">{t('tools.pestMonitoring.active2', 'Active')}</option>
                    <option value="monitoring">{t('tools.pestMonitoring.monitoring2', 'Monitoring')}</option>
                    <option value="resolved">{t('tools.pestMonitoring.resolved3', 'Resolved')}</option>
                    <option value="recurring">{t('tools.pestMonitoring.recurring2', 'Recurring')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.symptoms2', 'Symptoms')}</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.treatmentApplied', 'Treatment Applied')}</label>
                  <input
                    type="text"
                    value={formData.treatmentApplied}
                    onChange={(e) => setFormData({ ...formData, treatmentApplied: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.treatmentDate', 'Treatment Date')}</label>
                  <input
                    type="date"
                    value={formData.treatmentDate}
                    onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.treatmentCost2', 'Treatment Cost ($)')}</label>
                  <input
                    type="number"
                    value={formData.treatmentCost}
                    onChange={(e) => setFormData({ ...formData, treatmentCost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.effectiveness2', 'Effectiveness')}</label>
                  <select
                    value={formData.effectiveness}
                    onChange={(e) =>
                      setFormData({ ...formData, effectiveness: e.target.value as PestRecord['effectiveness'] })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="pending">{t('tools.pestMonitoring.pending', 'Pending')}</option>
                    <option value="ineffective">{t('tools.pestMonitoring.ineffective', 'Ineffective')}</option>
                    <option value="partial">{t('tools.pestMonitoring.partial', 'Partial')}</option>
                    <option value="effective">{t('tools.pestMonitoring.effective', 'Effective')}</option>
                    <option value="excellent">{t('tools.pestMonitoring.excellent', 'Excellent')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.weatherConditions', 'Weather Conditions')}</label>
                  <input
                    type="text"
                    value={formData.weatherConditions}
                    onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.followUpDate', 'Follow-up Date')}</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.pestMonitoring.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.pestMonitoring.cancel', 'Cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {editingRecord ? t('tools.pestMonitoring.updateRecord', 'Update Record') : t('tools.pestMonitoring.reportIssue2', 'Report Issue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PestMonitoringTool;
