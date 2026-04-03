import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';

interface HarvestSchedule {
  id: string;
  cropName: string;
  variety: string;
  fieldName: string;
  fieldSize: number;
  sizeUnit: 'acres' | 'hectares' | 'sqft';
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate: string;
  daysToMaturity: number;
  harvestWindow: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'growing' | 'ready' | 'in-progress' | 'completed' | 'delayed';
  estimatedYield: number;
  yieldUnit: 'bushels' | 'tons' | 'lbs' | 'kg' | 'boxes';
  laborRequired: number;
  equipmentNeeded: string[];
  storageDestination: string;
  marketDestination: string;
  qualityGrade: string;
  weatherDependency: 'low' | 'medium' | 'high';
  notes: string;
}

const generateSampleData = (): HarvestSchedule[] => [
  {
    id: '1',
    cropName: 'Corn',
    variety: 'Pioneer P1197',
    fieldName: 'North Field',
    fieldSize: 80,
    sizeUnit: 'acres',
    plantingDate: '2024-04-15',
    expectedHarvestDate: '2024-10-01',
    actualHarvestDate: '',
    daysToMaturity: 115,
    harvestWindow: 14,
    priority: 'high',
    status: 'growing',
    estimatedYield: 14000,
    yieldUnit: 'bushels',
    laborRequired: 4,
    equipmentNeeded: ['Combine Harvester', 'Grain Cart', 'Semi Truck'],
    storageDestination: 'Grain Bin #1',
    marketDestination: 'County Elevator',
    qualityGrade: 'Grade 2',
    weatherDependency: 'high',
    notes: 'Monitor moisture levels closely',
  },
  {
    id: '2',
    cropName: 'Soybeans',
    variety: 'Asgrow AG46X6',
    fieldName: 'South Field',
    fieldSize: 60,
    sizeUnit: 'acres',
    plantingDate: '2024-05-01',
    expectedHarvestDate: '2024-10-15',
    actualHarvestDate: '',
    daysToMaturity: 110,
    harvestWindow: 21,
    priority: 'medium',
    status: 'growing',
    estimatedYield: 3000,
    yieldUnit: 'bushels',
    laborRequired: 3,
    equipmentNeeded: ['Combine Harvester', 'Grain Cart'],
    storageDestination: 'Grain Bin #2',
    marketDestination: 'ADM Elevator',
    qualityGrade: 'Grade 1',
    weatherDependency: 'medium',
    notes: 'Check for pod shatter before harvest',
  },
  {
    id: '3',
    cropName: 'Apples',
    variety: 'Honeycrisp',
    fieldName: 'East Orchard',
    fieldSize: 15,
    sizeUnit: 'acres',
    plantingDate: '2020-03-15',
    expectedHarvestDate: '2024-09-15',
    actualHarvestDate: '2024-09-18',
    daysToMaturity: 180,
    harvestWindow: 21,
    priority: 'critical',
    status: 'completed',
    estimatedYield: 12000,
    yieldUnit: 'boxes',
    laborRequired: 12,
    equipmentNeeded: ['Picking Bins', 'Tractor', 'Forklift'],
    storageDestination: 'Cold Storage A',
    marketDestination: 'Local Market + Wholesale',
    qualityGrade: 'Extra Fancy',
    weatherDependency: 'high',
    notes: 'Peak ripeness achieved, excellent quality',
  },
];

const columnConfig: ColumnConfig[] = [
  { key: 'cropName', header: 'Crop', width: 12 },
  { key: 'variety', header: 'Variety', width: 15 },
  { key: 'fieldName', header: 'Field', width: 15 },
  { key: 'expectedHarvestDate', header: 'Expected Date', width: 12 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'priority', header: 'Priority', width: 10 },
  { key: 'estimatedYield', header: 'Est. Yield', width: 12 },
  { key: 'laborRequired', header: 'Labor', width: 8 },
  { key: 'marketDestination', header: 'Market', width: 15 },
];

const HarvestSchedulerTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: schedules,
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
  } = useToolData<HarvestSchedule>('harvest-scheduler', generateSampleData(), columnConfig);

  const [activeTab, setActiveTab] = useState<'schedule' | 'calendar' | 'resources' | 'completed'>('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<HarvestSchedule | null>(null);

  const [formData, setFormData] = useState<Partial<HarvestSchedule>>({
    cropName: '',
    variety: '',
    fieldName: '',
    fieldSize: 0,
    sizeUnit: 'acres',
    plantingDate: '',
    expectedHarvestDate: '',
    actualHarvestDate: '',
    daysToMaturity: 0,
    harvestWindow: 7,
    priority: 'medium',
    status: 'growing',
    estimatedYield: 0,
    yieldUnit: 'bushels',
    laborRequired: 1,
    equipmentNeeded: [],
    storageDestination: '',
    marketDestination: '',
    qualityGrade: '',
    weatherDependency: 'medium',
    notes: '',
  });

  const [equipmentInput, setEquipmentInput] = useState('');

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesSearch =
        schedule.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.variety.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || schedule.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [schedules, searchTerm, filterStatus, filterPriority]);

  const stats = useMemo(() => {
    const ready = schedules.filter((s) => s.status === 'ready').length;
    const inProgress = schedules.filter((s) => s.status === 'in-progress').length;
    const completed = schedules.filter((s) => s.status === 'completed').length;
    const totalLaborNeeded = schedules
      .filter((s) => s.status === 'ready' || s.status === 'in-progress')
      .reduce((sum, s) => sum + s.laborRequired, 0);

    // Calculate days until next harvest
    const upcomingHarvests = schedules
      .filter((s) => s.status === 'growing' || s.status === 'ready')
      .map((s) => new Date(s.expectedHarvestDate).getTime() - Date.now())
      .filter((d) => d > 0);
    const daysUntilNext = upcomingHarvests.length > 0 ? Math.ceil(Math.min(...upcomingHarvests) / (1000 * 60 * 60 * 24)) : 0;

    return { ready, inProgress, completed, totalLaborNeeded, daysUntilNext };
  }, [schedules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      updateItem(editingSchedule.id, formData);
    } else {
      addItem({
        ...formData,
        id: Date.now().toString(),
      } as HarvestSchedule);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cropName: '',
      variety: '',
      fieldName: '',
      fieldSize: 0,
      sizeUnit: 'acres',
      plantingDate: '',
      expectedHarvestDate: '',
      actualHarvestDate: '',
      daysToMaturity: 0,
      harvestWindow: 7,
      priority: 'medium',
      status: 'growing',
      estimatedYield: 0,
      yieldUnit: 'bushels',
      laborRequired: 1,
      equipmentNeeded: [],
      storageDestination: '',
      marketDestination: '',
      qualityGrade: '',
      weatherDependency: 'medium',
      notes: '',
    });
    setEquipmentInput('');
    setEditingSchedule(null);
    setShowAddModal(false);
  };

  const handleEdit = (schedule: HarvestSchedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setEquipmentInput(schedule.equipmentNeeded.join(', '));
    setShowAddModal(true);
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      const items = equipmentInput.split(',').map((item) => item.trim()).filter(Boolean);
      setFormData({
        ...formData,
        equipmentNeeded: [...new Set([...(formData.equipmentNeeded || []), ...items])],
      });
      setEquipmentInput('');
    }
  };

  const removeEquipment = (item: string) => {
    setFormData({
      ...formData,
      equipmentNeeded: (formData.equipmentNeeded || []).filter((e) => e !== item),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getDaysUntilHarvest = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
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
              <span>🌾</span>
              {t('tools.harvestScheduler.harvestScheduler', 'Harvest Scheduler')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.harvestScheduler.planAndTrackYourHarvest', 'Plan and track your harvest operations')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="harvest-scheduler" toolName="Harvest Scheduler" />

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
              {t('tools.harvestScheduler.addHarvest', 'Add Harvest')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.harvestScheduler.readyToHarvest', 'Ready to Harvest')}</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.ready}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.harvestScheduler.inProgress', 'In Progress')}</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.harvestScheduler.completed', 'Completed')}</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.harvestScheduler.laborNeeded', 'Labor Needed')}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalLaborNeeded}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.harvestScheduler.daysToNext', 'Days to Next')}</p>
            <p className="text-2xl font-bold text-orange-600">{stats.daysUntilNext}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto">
          {[
            { id: 'schedule', label: 'Schedule', icon: '📋' },
            { id: 'calendar', label: 'Calendar View', icon: '📅' },
            { id: 'resources', label: 'Resources', icon: '🚜' },
            { id: 'completed', label: 'Completed', icon: '✅' },
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
        {activeTab === 'schedule' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('tools.harvestScheduler.searchCropsFieldsVarieties', 'Search crops, fields, varieties...')}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.harvestScheduler.allStatus', 'All Status')}</option>
                <option value="growing">{t('tools.harvestScheduler.growing', 'Growing')}</option>
                <option value="ready">{t('tools.harvestScheduler.ready', 'Ready')}</option>
                <option value="in-progress">{t('tools.harvestScheduler.inProgress2', 'In Progress')}</option>
                <option value="delayed">{t('tools.harvestScheduler.delayed', 'Delayed')}</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.harvestScheduler.allPriority', 'All Priority')}</option>
                <option value="critical">{t('tools.harvestScheduler.critical', 'Critical')}</option>
                <option value="high">{t('tools.harvestScheduler.high', 'High')}</option>
                <option value="medium">{t('tools.harvestScheduler.medium', 'Medium')}</option>
                <option value="low">{t('tools.harvestScheduler.low', 'Low')}</option>
              </select>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
              {filteredSchedules.filter((s) => s.status !== 'completed').length === 0 ? (
                <div
                  className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.harvestScheduler.noScheduledHarvests', 'No scheduled harvests')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.harvestScheduler.scheduleFirstHarvest', 'Schedule First Harvest')}
                  </button>
                </div>
              ) : (
                filteredSchedules
                  .filter((s) => s.status !== 'completed')
                  .sort((a, b) => new Date(a.expectedHarvestDate).getTime() - new Date(b.expectedHarvestDate).getTime())
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🌾</span>
                            <div>
                              <h3 className="font-semibold text-lg">{schedule.cropName} - {schedule.variety}</h3>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {schedule.fieldName} ({schedule.fieldSize} {schedule.sizeUnit})
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(schedule.status)}`}>
                              {schedule.status.replace('-', ' ').charAt(0).toUpperCase() + schedule.status.replace('-', ' ').slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                              {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
                            </span>
                            {schedule.weatherDependency === 'high' && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {t('tools.harvestScheduler.weatherSensitive', 'Weather Sensitive')}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.harvestScheduler.harvestDate', 'Harvest Date:')}</span>
                              <span className="ml-2 font-medium">{new Date(schedule.expectedHarvestDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.harvestScheduler.estYield', 'Est. Yield:')}</span>
                              <span className="ml-2 font-medium">{schedule.estimatedYield.toLocaleString()} {schedule.yieldUnit}</span>
                            </div>
                            <div>
                              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.harvestScheduler.labor', 'Labor:')}</span>
                              <span className="ml-2 font-medium">{schedule.laborRequired} workers</span>
                            </div>
                            <div>
                              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.harvestScheduler.window', 'Window:')}</span>
                              <span className="ml-2 font-medium">{schedule.harvestWindow} days</span>
                            </div>
                          </div>
                          {schedule.equipmentNeeded.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {schedule.equipmentNeeded.map((eq, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                                >
                                  {eq}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`text-center p-3 rounded-lg ${
                            getDaysUntilHarvest(schedule.expectedHarvestDate) <= 0
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : getDaysUntilHarvest(schedule.expectedHarvestDate) <= 7
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-green-100 dark:bg-green-900/30'
                          }`}>
                            <p className="text-2xl font-bold">
                              {getDaysUntilHarvest(schedule.expectedHarvestDate)}
                            </p>
                            <p className="text-xs">days</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(schedule)}
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
                              onClick={() => updateItem(schedule.id, { status: 'completed', actualHarvestDate: new Date().toISOString().split('T')[0] })}
                              className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                              title={t('tools.harvestScheduler.markComplete', 'Mark Complete')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteItem(schedule.id)}
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

        {activeTab === 'calendar' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.harvestScheduler.harvestCalendar', 'Harvest Calendar')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {schedules
                .filter((s) => s.status !== 'completed')
                .sort((a, b) => new Date(a.expectedHarvestDate).getTime() - new Date(b.expectedHarvestDate).getTime())
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      schedule.priority === 'critical'
                        ? 'border-red-500'
                        : schedule.priority === 'high'
                        ? 'border-orange-500'
                        : schedule.priority === 'medium'
                        ? 'border-yellow-500'
                        : 'border-green-500'
                    } ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(schedule.expectedHarvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <h3 className="font-semibold">{schedule.cropName}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{schedule.fieldName}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.harvestScheduler.equipmentRequirements', 'Equipment Requirements')}</h2>
              <div className="space-y-3">
                {Array.from(
                  new Set(
                    schedules
                      .filter((s) => s.status !== 'completed')
                      .flatMap((s) => s.equipmentNeeded)
                  )
                ).map((equipment) => {
                  const count = schedules.filter(
                    (s) => s.status !== 'completed' && s.equipmentNeeded.includes(equipment)
                  ).length;
                  return (
                    <div key={equipment} className="flex items-center justify-between">
                      <span>{equipment}</span>
                      <span className={`px-2 py-1 rounded text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        Needed for {count} harvest{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.harvestScheduler.laborSummary', 'Labor Summary')}</h2>
              <div className="space-y-4">
                {schedules
                  .filter((s) => s.status === 'ready' || s.status === 'in-progress')
                  .map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{schedule.cropName}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{schedule.fieldName}</p>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{schedule.laborRequired} workers</span>
                    </div>
                  ))}
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t('tools.harvestScheduler.totalLaborRequired', 'Total Labor Required')}</span>
                    <span className="text-xl font-bold text-purple-600">{stats.totalLaborNeeded} workers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.harvestScheduler.completedHarvests', 'Completed Harvests')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-3 px-4">{t('tools.harvestScheduler.crop', 'Crop')}</th>
                    <th className="text-left py-3 px-4">{t('tools.harvestScheduler.field', 'Field')}</th>
                    <th className="text-left py-3 px-4">{t('tools.harvestScheduler.harvestDate2', 'Harvest Date')}</th>
                    <th className="text-left py-3 px-4">{t('tools.harvestScheduler.yield', 'Yield')}</th>
                    <th className="text-left py-3 px-4">{t('tools.harvestScheduler.destination', 'Destination')}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules
                    .filter((s) => s.status === 'completed')
                    .sort((a, b) => new Date(b.actualHarvestDate || b.expectedHarvestDate).getTime() - new Date(a.actualHarvestDate || a.expectedHarvestDate).getTime())
                    .map((schedule) => (
                      <tr key={schedule.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{schedule.cropName}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{schedule.variety}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{schedule.fieldName}</td>
                        <td className="py-3 px-4">{new Date(schedule.actualHarvestDate || schedule.expectedHarvestDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{schedule.estimatedYield.toLocaleString()} {schedule.yieldUnit}</td>
                        <td className="py-3 px-4">{schedule.marketDestination}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
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
            <h2 className="text-xl font-bold mb-4">{editingSchedule ? t('tools.harvestScheduler.editHarvest', 'Edit Harvest') : t('tools.harvestScheduler.scheduleHarvest', 'Schedule Harvest')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.cropName', 'Crop Name')}</label>
                  <input
                    type="text"
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.variety', 'Variety')}</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.fieldName', 'Field Name')}</label>
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
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.fieldSize', 'Field Size')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.fieldSize}
                      onChange={(e) => setFormData({ ...formData, fieldSize: parseFloat(e.target.value) || 0 })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="0"
                    />
                    <select
                      value={formData.sizeUnit}
                      onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value as HarvestSchedule['sizeUnit'] })}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="acres">{t('tools.harvestScheduler.acres', 'Acres')}</option>
                      <option value="hectares">{t('tools.harvestScheduler.hectares', 'Hectares')}</option>
                      <option value="sqft">{t('tools.harvestScheduler.sqFt', 'Sq Ft')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.plantingDate', 'Planting Date')}</label>
                  <input
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.expectedHarvestDate', 'Expected Harvest Date')}</label>
                  <input
                    type="date"
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.daysToMaturity', 'Days to Maturity')}</label>
                  <input
                    type="number"
                    value={formData.daysToMaturity}
                    onChange={(e) => setFormData({ ...formData, daysToMaturity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.harvestWindowDays', 'Harvest Window (days)')}</label>
                  <input
                    type="number"
                    value={formData.harvestWindow}
                    onChange={(e) => setFormData({ ...formData, harvestWindow: parseInt(e.target.value) || 7 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.priority', 'Priority')}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as HarvestSchedule['priority'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="low">{t('tools.harvestScheduler.low2', 'Low')}</option>
                    <option value="medium">{t('tools.harvestScheduler.medium2', 'Medium')}</option>
                    <option value="high">{t('tools.harvestScheduler.high2', 'High')}</option>
                    <option value="critical">{t('tools.harvestScheduler.critical2', 'Critical')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as HarvestSchedule['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="growing">{t('tools.harvestScheduler.growing2', 'Growing')}</option>
                    <option value="ready">{t('tools.harvestScheduler.ready2', 'Ready')}</option>
                    <option value="in-progress">{t('tools.harvestScheduler.inProgress3', 'In Progress')}</option>
                    <option value="delayed">{t('tools.harvestScheduler.delayed2', 'Delayed')}</option>
                    <option value="completed">{t('tools.harvestScheduler.completed2', 'Completed')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.estimatedYield', 'Estimated Yield')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.estimatedYield}
                      onChange={(e) => setFormData({ ...formData, estimatedYield: parseFloat(e.target.value) || 0 })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="0"
                    />
                    <select
                      value={formData.yieldUnit}
                      onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value as HarvestSchedule['yieldUnit'] })}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="bushels">{t('tools.harvestScheduler.bushels', 'Bushels')}</option>
                      <option value="tons">{t('tools.harvestScheduler.tons', 'Tons')}</option>
                      <option value="lbs">{t('tools.harvestScheduler.lbs', 'Lbs')}</option>
                      <option value="kg">Kg</option>
                      <option value="boxes">{t('tools.harvestScheduler.boxes', 'Boxes')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.laborRequired', 'Labor Required')}</label>
                  <input
                    type="number"
                    value={formData.laborRequired}
                    onChange={(e) => setFormData({ ...formData, laborRequired: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.weatherDependency', 'Weather Dependency')}</label>
                  <select
                    value={formData.weatherDependency}
                    onChange={(e) => setFormData({ ...formData, weatherDependency: e.target.value as HarvestSchedule['weatherDependency'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="low">{t('tools.harvestScheduler.low3', 'Low')}</option>
                    <option value="medium">{t('tools.harvestScheduler.medium3', 'Medium')}</option>
                    <option value="high">{t('tools.harvestScheduler.high3', 'High')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.equipmentNeeded', 'Equipment Needed')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    placeholder={t('tools.harvestScheduler.addEquipmentCommaSeparated', 'Add equipment (comma separated)')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addEquipment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('tools.harvestScheduler.add', 'Add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.equipmentNeeded || []).map((eq, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      {eq}
                      <button type="button" onClick={() => removeEquipment(eq)} className="text-red-500 hover:text-red-700">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.storageDestination', 'Storage Destination')}</label>
                  <input
                    type="text"
                    value={formData.storageDestination}
                    onChange={(e) => setFormData({ ...formData, storageDestination: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.marketDestination', 'Market Destination')}</label>
                  <input
                    type="text"
                    value={formData.marketDestination}
                    onChange={(e) => setFormData({ ...formData, marketDestination: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.harvestScheduler.notes', 'Notes')}</label>
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
                  {t('tools.harvestScheduler.cancel', 'Cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {editingSchedule ? t('tools.harvestScheduler.update', 'Update') : t('tools.harvestScheduler.schedule', 'Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestSchedulerTool;
