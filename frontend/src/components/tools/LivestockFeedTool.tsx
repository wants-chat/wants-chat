import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';

interface FeedSchedule {
  id: string;
  animalType: 'cattle' | 'sheep' | 'goat' | 'pig' | 'chicken' | 'turkey' | 'horse' | 'duck' | 'other';
  groupName: string;
  headCount: number;
  feedType: string;
  feedBrand: string;
  dailyAmount: number;
  amountUnit: 'lbs' | 'kg' | 'oz' | 'cups';
  feedingsPerDay: number;
  feedingTimes: string[];
  waterRequirement: number;
  waterUnit: 'gallons' | 'liters';
  supplements: string[];
  costPerUnit: number;
  dailyCost: number;
  startDate: string;
  endDate: string;
  purpose: 'maintenance' | 'growth' | 'lactation' | 'breeding' | 'finishing' | 'show';
  ageGroup: 'newborn' | 'young' | 'adult' | 'senior';
  notes: string;
  isActive: boolean;
}

interface FeedingLog {
  id: string;
  scheduleId: string;
  date: string;
  time: string;
  fedBy: string;
  amountFed: number;
  amountUnit: string;
  waterProvided: number;
  observations: string;
  healthIssues: string;
}

const generateSampleData = (): FeedSchedule[] => [
  {
    id: '1',
    animalType: 'cattle',
    groupName: 'Beef Cattle - Main Herd',
    headCount: 50,
    feedType: 'Grass Hay + Grain Mix',
    feedBrand: 'Purina Accuration',
    dailyAmount: 25,
    amountUnit: 'lbs',
    feedingsPerDay: 2,
    feedingTimes: ['06:00', '18:00'],
    waterRequirement: 15,
    waterUnit: 'gallons',
    supplements: ['Mineral Block', 'Salt Lick'],
    costPerUnit: 0.15,
    dailyCost: 187.5,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    purpose: 'finishing',
    ageGroup: 'adult',
    notes: 'Monitor weight gain weekly',
    isActive: true,
  },
  {
    id: '2',
    animalType: 'chicken',
    groupName: 'Layer Hens - Coop A',
    headCount: 200,
    feedType: 'Layer Feed',
    feedBrand: 'Nutrena NatureWise',
    dailyAmount: 0.25,
    amountUnit: 'lbs',
    feedingsPerDay: 2,
    feedingTimes: ['07:00', '17:00'],
    waterRequirement: 0.5,
    waterUnit: 'liters',
    supplements: ['Oyster Shell', 'Grit'],
    costPerUnit: 0.30,
    dailyCost: 15,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    purpose: 'lactation',
    ageGroup: 'adult',
    notes: 'Egg production tracking - current avg 85%',
    isActive: true,
  },
  {
    id: '3',
    animalType: 'pig',
    groupName: 'Grower Pigs - Barn 2',
    headCount: 30,
    feedType: 'Grower Feed',
    feedBrand: 'ADM Alliance',
    dailyAmount: 6,
    amountUnit: 'lbs',
    feedingsPerDay: 3,
    feedingTimes: ['06:00', '12:00', '18:00'],
    waterRequirement: 3,
    waterUnit: 'gallons',
    supplements: ['Probiotics'],
    costPerUnit: 0.22,
    dailyCost: 39.6,
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    purpose: 'growth',
    ageGroup: 'young',
    notes: 'Target weight 250 lbs by end date',
    isActive: true,
  },
];

const columnConfig: ColumnConfig[] = [
  { key: 'groupName', header: 'Group', width: 20 },
  { key: 'animalType', header: 'Type', width: 10 },
  { key: 'headCount', header: 'Head', width: 8 },
  { key: 'feedType', header: 'Feed', width: 15 },
  { key: 'dailyAmount', header: 'Daily Amt', width: 10 },
  { key: 'feedingsPerDay', header: 'Per Day', width: 8 },
  { key: 'dailyCost', header: 'Daily Cost', width: 10 },
  { key: 'purpose', header: 'Purpose', width: 10 },
  { key: 'isActive', header: 'Active', width: 8 },
];

const LivestockFeedTool: React.FC = () => {
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
  } = useToolData<FeedSchedule>('livestock-feed', generateSampleData(), columnConfig);

  const [activeTab, setActiveTab] = useState<'schedules' | 'log' | 'inventory' | 'costs'>('schedules');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnimal, setFilterAnimal] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FeedSchedule | null>(null);

  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  const [formData, setFormData] = useState<Partial<FeedSchedule>>({
    animalType: 'cattle',
    groupName: '',
    headCount: 0,
    feedType: '',
    feedBrand: '',
    dailyAmount: 0,
    amountUnit: 'lbs',
    feedingsPerDay: 2,
    feedingTimes: ['06:00', '18:00'],
    waterRequirement: 0,
    waterUnit: 'gallons',
    supplements: [],
    costPerUnit: 0,
    dailyCost: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    purpose: 'maintenance',
    ageGroup: 'adult',
    notes: '',
    isActive: true,
  });

  const [logFormData, setLogFormData] = useState<Partial<FeedingLog>>({
    scheduleId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    fedBy: '',
    amountFed: 0,
    amountUnit: 'lbs',
    waterProvided: 0,
    observations: '',
    healthIssues: '',
  });

  const [supplementInput, setSupplementInput] = useState('');
  const [feedingTimeInput, setFeedingTimeInput] = useState('');

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesSearch =
        schedule.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.feedType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAnimal = filterAnimal === 'all' || schedule.animalType === filterAnimal;
      const matchesPurpose = filterPurpose === 'all' || schedule.purpose === filterPurpose;
      return matchesSearch && matchesAnimal && matchesPurpose;
    });
  }, [schedules, searchTerm, filterAnimal, filterPurpose]);

  const stats = useMemo(() => {
    const activeSchedules = schedules.filter((s) => s.isActive);
    const totalDailyCost = activeSchedules.reduce((sum, s) => sum + s.dailyCost, 0);
    const totalAnimals = activeSchedules.reduce((sum, s) => sum + s.headCount, 0);
    const monthlyCost = totalDailyCost * 30;
    const uniqueGroups = new Set(schedules.map((s) => s.groupName)).size;

    return { totalDailyCost, totalAnimals, monthlyCost, uniqueGroups, activeSchedules: activeSchedules.length };
  }, [schedules]);

  const animalStats = useMemo(() => {
    const animalMap = new Map<string, { count: number; dailyCost: number }>();

    schedules.filter((s) => s.isActive).forEach((s) => {
      const existing = animalMap.get(s.animalType) || { count: 0, dailyCost: 0 };
      animalMap.set(s.animalType, {
        count: existing.count + s.headCount,
        dailyCost: existing.dailyCost + s.dailyCost,
      });
    });

    return Array.from(animalMap.entries()).map(([type, data]) => ({
      type,
      ...data,
    }));
  }, [schedules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      updateItem(editingSchedule.id, formData);
    } else {
      addItem({
        ...formData,
        id: Date.now().toString(),
      } as FeedSchedule);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      animalType: 'cattle',
      groupName: '',
      headCount: 0,
      feedType: '',
      feedBrand: '',
      dailyAmount: 0,
      amountUnit: 'lbs',
      feedingsPerDay: 2,
      feedingTimes: ['06:00', '18:00'],
      waterRequirement: 0,
      waterUnit: 'gallons',
      supplements: [],
      costPerUnit: 0,
      dailyCost: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      purpose: 'maintenance',
      ageGroup: 'adult',
      notes: '',
      isActive: true,
    });
    setSupplementInput('');
    setEditingSchedule(null);
    setShowAddModal(false);
  };

  const handleEdit = (schedule: FeedSchedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setSupplementInput(schedule.supplements.join(', '));
    setShowAddModal(true);
  };

  const handleLogFeeding = (schedule: FeedSchedule) => {
    setLogFormData({
      scheduleId: schedule.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      fedBy: '',
      amountFed: schedule.dailyAmount / schedule.feedingsPerDay,
      amountUnit: schedule.amountUnit,
      waterProvided: 0,
      observations: '',
      healthIssues: '',
    });
    setShowLogModal(true);
  };

  const submitLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: FeedingLog = {
      ...logFormData,
      id: Date.now().toString(),
    } as FeedingLog;
    setFeedingLogs([...feedingLogs, newLog]);
    setShowLogModal(false);
  };

  const addSupplement = () => {
    if (supplementInput.trim()) {
      const items = supplementInput.split(',').map((item) => item.trim()).filter(Boolean);
      setFormData({
        ...formData,
        supplements: [...new Set([...(formData.supplements || []), ...items])],
      });
      setSupplementInput('');
    }
  };

  const removeSupplement = (item: string) => {
    setFormData({
      ...formData,
      supplements: (formData.supplements || []).filter((s) => s !== item),
    });
  };

  const addFeedingTime = () => {
    if (feedingTimeInput && !(formData.feedingTimes || []).includes(feedingTimeInput)) {
      setFormData({
        ...formData,
        feedingTimes: [...(formData.feedingTimes || []), feedingTimeInput].sort(),
      });
      setFeedingTimeInput('');
    }
  };

  const removeFeedingTime = (time: string) => {
    setFormData({
      ...formData,
      feedingTimes: (formData.feedingTimes || []).filter((t) => t !== time),
    });
  };

  const updateCosts = (data: Partial<FeedSchedule>) => {
    const dailyAmount = data.dailyAmount || 0;
    const headCount = data.headCount || 0;
    const costPerUnit = data.costPerUnit || 0;
    const dailyCost = dailyAmount * headCount * costPerUnit;
    setFormData({
      ...data,
      dailyCost: Math.round(dailyCost * 100) / 100,
    });
  };

  const getAnimalIcon = (type: string) => {
    switch (type) {
      case 'cattle':
        return '🐄';
      case 'sheep':
        return '🐑';
      case 'goat':
        return '🐐';
      case 'pig':
        return '🐷';
      case 'chicken':
        return '🐔';
      case 'turkey':
        return '🦃';
      case 'horse':
        return '🐴';
      case 'duck':
        return '🦆';
      default:
        return '🐾';
    }
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose) {
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'growth':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'lactation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'breeding':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'finishing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'show':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
              <span>🌾</span>
              {t('tools.livestockFeed.livestockFeedSchedule', 'Livestock Feed Schedule')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.livestockFeed.manageFeedingSchedulesForAll', 'Manage feeding schedules for all your livestock')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="livestock-feed" toolName="Livestock Feed" />

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
              {t('tools.livestockFeed.addSchedule', 'Add Schedule')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockFeed.dailyCost', 'Daily Cost')}</p>
            <p className="text-2xl font-bold text-green-600">${stats.totalDailyCost.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockFeed.monthlyCost', 'Monthly Cost')}</p>
            <p className="text-2xl font-bold text-blue-600">${stats.monthlyCost.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockFeed.totalAnimals', 'Total Animals')}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalAnimals}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockFeed.activeSchedules', 'Active Schedules')}</p>
            <p className="text-2xl font-bold text-orange-600">{stats.activeSchedules}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockFeed.groups', 'Groups')}</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.uniqueGroups}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto">
          {[
            { id: 'schedules', label: 'Feed Schedules', icon: '📋' },
            { id: 'log', label: 'Feeding Log', icon: '📝' },
            { id: 'inventory', label: 'Feed Inventory', icon: '📦' },
            { id: 'costs', label: 'Cost Analysis', icon: '💰' },
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
        {activeTab === 'schedules' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('tools.livestockFeed.searchGroupsOrFeedTypes', 'Search groups or feed types...')}
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
                value={filterAnimal}
                onChange={(e) => setFilterAnimal(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.livestockFeed.allAnimals', 'All Animals')}</option>
                <option value="cattle">{t('tools.livestockFeed.cattle', 'Cattle')}</option>
                <option value="sheep">{t('tools.livestockFeed.sheep', 'Sheep')}</option>
                <option value="goat">{t('tools.livestockFeed.goat', 'Goat')}</option>
                <option value="pig">{t('tools.livestockFeed.pig', 'Pig')}</option>
                <option value="chicken">{t('tools.livestockFeed.chicken', 'Chicken')}</option>
                <option value="turkey">{t('tools.livestockFeed.turkey', 'Turkey')}</option>
                <option value="horse">{t('tools.livestockFeed.horse', 'Horse')}</option>
                <option value="duck">{t('tools.livestockFeed.duck', 'Duck')}</option>
              </select>
              <select
                value={filterPurpose}
                onChange={(e) => setFilterPurpose(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.livestockFeed.allPurposes', 'All Purposes')}</option>
                <option value="maintenance">{t('tools.livestockFeed.maintenance', 'Maintenance')}</option>
                <option value="growth">{t('tools.livestockFeed.growth', 'Growth')}</option>
                <option value="lactation">{t('tools.livestockFeed.lactation', 'Lactation')}</option>
                <option value="breeding">{t('tools.livestockFeed.breeding', 'Breeding')}</option>
                <option value="finishing">{t('tools.livestockFeed.finishing', 'Finishing')}</option>
                <option value="show">{t('tools.livestockFeed.show', 'Show')}</option>
              </select>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
              {filteredSchedules.length === 0 ? (
                <div
                  className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.livestockFeed.noFeedSchedulesFound', 'No feed schedules found')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.livestockFeed.addFirstSchedule', 'Add First Schedule')}
                  </button>
                </div>
              ) : (
                filteredSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${!schedule.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{getAnimalIcon(schedule.animalType)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{schedule.groupName}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {schedule.headCount} head | {schedule.feedType}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPurposeColor(schedule.purpose)}`}>
                            {schedule.purpose.charAt(0).toUpperCase() + schedule.purpose.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {schedule.ageGroup}
                          </span>
                          {!schedule.isActive && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              {t('tools.livestockFeed.inactive', 'Inactive')}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.livestockFeed.daily', 'Daily:')}</span>
                            <span className="ml-2 font-medium">{schedule.dailyAmount} {schedule.amountUnit}/head</span>
                          </div>
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.livestockFeed.feedings', 'Feedings:')}</span>
                            <span className="ml-2 font-medium">{schedule.feedingsPerDay}x/day</span>
                          </div>
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.livestockFeed.water', 'Water:')}</span>
                            <span className="ml-2 font-medium">{schedule.waterRequirement} {schedule.waterUnit}/head</span>
                          </div>
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.livestockFeed.times', 'Times:')}</span>
                            <span className="ml-2 font-medium">{schedule.feedingTimes.join(', ')}</span>
                          </div>
                        </div>
                        {schedule.supplements.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {schedule.supplements.map((supp, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                              >
                                {supp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-lg font-bold text-green-600">${schedule.dailyCost.toFixed(2)}/day</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          ${(schedule.dailyCost * 30).toFixed(2)}/month
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLogFeeding(schedule)}
                            className={`p-2 rounded-lg ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            } transition-colors text-blue-600`}
                            title={t('tools.livestockFeed.logFeeding3', 'Log Feeding')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </button>
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

        {activeTab === 'log' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.livestockFeed.recentFeedingLogs', 'Recent Feeding Logs')}</h2>
            {feedingLogs.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.livestockFeed.noFeedingLogsRecordedYet', 'No feeding logs recorded yet. Click "Log Feeding" on a schedule to add entries.')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-3 px-4">{t('tools.livestockFeed.dateTime', 'Date/Time')}</th>
                      <th className="text-left py-3 px-4">{t('tools.livestockFeed.group', 'Group')}</th>
                      <th className="text-left py-3 px-4">{t('tools.livestockFeed.amount', 'Amount')}</th>
                      <th className="text-left py-3 px-4">{t('tools.livestockFeed.fedBy', 'Fed By')}</th>
                      <th className="text-left py-3 px-4">{t('tools.livestockFeed.observations', 'Observations')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedingLogs.map((log) => {
                      const schedule = schedules.find((s) => s.id === log.scheduleId);
                      return (
                        <tr key={log.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="py-3 px-4">{log.date} {log.time}</td>
                          <td className="py-3 px-4">{schedule?.groupName || 'Unknown'}</td>
                          <td className="py-3 px-4">{log.amountFed} {log.amountUnit}</td>
                          <td className="py-3 px-4">{log.fedBy}</td>
                          <td className="py-3 px-4">{log.observations || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.livestockFeed.feedInventory', 'Feed Inventory')}</h2>
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.livestockFeed.feedInventoryTrackingComingSoon', 'Feed inventory tracking coming soon. Track feed types, quantities, and reorder points.')}
            </p>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.livestockFeed.costByAnimalType', 'Cost by Animal Type')}</h2>
              <div className="space-y-4">
                {animalStats.map((stat) => (
                  <div key={stat.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getAnimalIcon(stat.type)}</span>
                      <div>
                        <p className="font-medium capitalize">{stat.type}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.count} head</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">${stat.dailyCost.toFixed(2)}/day</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.livestockFeed.costSummary', 'Cost Summary')}</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('tools.livestockFeed.dailyFeedCost', 'Daily Feed Cost:')}</span>
                  <span className="font-bold text-green-600">${stats.totalDailyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.livestockFeed.weeklyCost', 'Weekly Cost:')}</span>
                  <span className="font-bold">${(stats.totalDailyCost * 7).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.livestockFeed.monthlyCost2', 'Monthly Cost:')}</span>
                  <span className="font-bold">${stats.monthlyCost.toFixed(2)}</span>
                </div>
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('tools.livestockFeed.annualEstimate', 'Annual Estimate:')}</span>
                    <span className="font-bold text-xl text-blue-600">${(stats.totalDailyCost * 365).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.livestockFeed.costPerAnimalDay', 'Cost per Animal/Day:')}</span>
                  <span className="font-bold">
                    ${stats.totalAnimals > 0 ? (stats.totalDailyCost / stats.totalAnimals).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
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
            <h2 className="text-xl font-bold mb-4">{editingSchedule ? t('tools.livestockFeed.editSchedule', 'Edit Schedule') : t('tools.livestockFeed.addFeedSchedule', 'Add Feed Schedule')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.animalType', 'Animal Type')}</label>
                  <select
                    value={formData.animalType}
                    onChange={(e) => setFormData({ ...formData, animalType: e.target.value as FeedSchedule['animalType'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="cattle">{t('tools.livestockFeed.cattle2', 'Cattle')}</option>
                    <option value="sheep">{t('tools.livestockFeed.sheep2', 'Sheep')}</option>
                    <option value="goat">{t('tools.livestockFeed.goat2', 'Goat')}</option>
                    <option value="pig">{t('tools.livestockFeed.pig2', 'Pig')}</option>
                    <option value="chicken">{t('tools.livestockFeed.chicken2', 'Chicken')}</option>
                    <option value="turkey">{t('tools.livestockFeed.turkey2', 'Turkey')}</option>
                    <option value="horse">{t('tools.livestockFeed.horse2', 'Horse')}</option>
                    <option value="duck">{t('tools.livestockFeed.duck2', 'Duck')}</option>
                    <option value="other">{t('tools.livestockFeed.other', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.groupName', 'Group Name')}</label>
                  <input
                    type="text"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.headCount', 'Head Count')}</label>
                  <input
                    type="number"
                    value={formData.headCount}
                    onChange={(e) => {
                      const headCount = parseInt(e.target.value) || 0;
                      updateCosts({ ...formData, headCount });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.feedType', 'Feed Type')}</label>
                  <input
                    type="text"
                    value={formData.feedType}
                    onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.feedBrand', 'Feed Brand')}</label>
                  <input
                    type="text"
                    value={formData.feedBrand}
                    onChange={(e) => setFormData({ ...formData, feedBrand: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.dailyAmountPerHead', 'Daily Amount per Head')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.dailyAmount}
                      onChange={(e) => {
                        const dailyAmount = parseFloat(e.target.value) || 0;
                        updateCosts({ ...formData, dailyAmount });
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      step="0.1"
                      min="0"
                    />
                    <select
                      value={formData.amountUnit}
                      onChange={(e) => setFormData({ ...formData, amountUnit: e.target.value as FeedSchedule['amountUnit'] })}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                      <option value="oz">oz</option>
                      <option value="cups">cups</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.feedingsPerDay', 'Feedings per Day')}</label>
                  <input
                    type="number"
                    value={formData.feedingsPerDay}
                    onChange={(e) => setFormData({ ...formData, feedingsPerDay: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="1"
                    max="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.waterRequirementPerHead', 'Water Requirement per Head')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.waterRequirement}
                      onChange={(e) => setFormData({ ...formData, waterRequirement: parseFloat(e.target.value) || 0 })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      step="0.1"
                      min="0"
                    />
                    <select
                      value={formData.waterUnit}
                      onChange={(e) => setFormData({ ...formData, waterUnit: e.target.value as FeedSchedule['waterUnit'] })}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="gallons">gallons</option>
                      <option value="liters">liters</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.costPerUnit', 'Cost per Unit ($)')}</label>
                  <input
                    type="number"
                    value={formData.costPerUnit}
                    onChange={(e) => {
                      const costPerUnit = parseFloat(e.target.value) || 0;
                      updateCosts({ ...formData, costPerUnit });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.dailyCostAuto', 'Daily Cost (auto)')}</label>
                  <input
                    type="number"
                    value={formData.dailyCost}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.purpose', 'Purpose')}</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as FeedSchedule['purpose'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="maintenance">{t('tools.livestockFeed.maintenance2', 'Maintenance')}</option>
                    <option value="growth">{t('tools.livestockFeed.growth2', 'Growth')}</option>
                    <option value="lactation">{t('tools.livestockFeed.lactation2', 'Lactation')}</option>
                    <option value="breeding">{t('tools.livestockFeed.breeding2', 'Breeding')}</option>
                    <option value="finishing">{t('tools.livestockFeed.finishing2', 'Finishing')}</option>
                    <option value="show">{t('tools.livestockFeed.show2', 'Show')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.ageGroup', 'Age Group')}</label>
                  <select
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as FeedSchedule['ageGroup'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="newborn">{t('tools.livestockFeed.newborn', 'Newborn')}</option>
                    <option value="young">{t('tools.livestockFeed.young', 'Young')}</option>
                    <option value="adult">{t('tools.livestockFeed.adult', 'Adult')}</option>
                    <option value="senior">{t('tools.livestockFeed.senior', 'Senior')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.feedingTimes', 'Feeding Times')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="time"
                    value={feedingTimeInput}
                    onChange={(e) => setFeedingTimeInput(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addFeedingTime}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('tools.livestockFeed.add', 'Add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.feedingTimes || []).map((time, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      {time}
                      <button type="button" onClick={() => removeFeedingTime(time)} className="text-red-500 hover:text-red-700">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.supplements', 'Supplements')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={supplementInput}
                    onChange={(e) => setSupplementInput(e.target.value)}
                    placeholder={t('tools.livestockFeed.addSupplementsCommaSeparated', 'Add supplements (comma separated)')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addSupplement}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('tools.livestockFeed.add2', 'Add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.supplements || []).map((supp, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      {supp}
                      <button type="button" onClick={() => removeSupplement(supp)} className="text-red-500 hover:text-red-700">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm">{t('tools.livestockFeed.activeSchedule', 'Active Schedule')}</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.notes', 'Notes')}</label>
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
                  {t('tools.livestockFeed.cancel', 'Cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {editingSchedule ? t('tools.livestockFeed.update', 'Update') : t('tools.livestockFeed.addSchedule2', 'Add Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Feeding Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}
          >
            <h2 className="text-xl font-bold mb-4">{t('tools.livestockFeed.logFeeding', 'Log Feeding')}</h2>
            <form onSubmit={submitLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.date', 'Date')}</label>
                  <input
                    type="date"
                    value={logFormData.date}
                    onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.time', 'Time')}</label>
                  <input
                    type="time"
                    value={logFormData.time}
                    onChange={(e) => setLogFormData({ ...logFormData, time: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.fedBy2', 'Fed By')}</label>
                <input
                  type="text"
                  value={logFormData.fedBy}
                  onChange={(e) => setLogFormData({ ...logFormData, fedBy: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.amountFed', 'Amount Fed')}</label>
                <input
                  type="number"
                  value={logFormData.amountFed}
                  onChange={(e) => setLogFormData({ ...logFormData, amountFed: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  step="0.1"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.livestockFeed.observations2', 'Observations')}</label>
                <textarea
                  value={logFormData.observations}
                  onChange={(e) => setLogFormData({ ...logFormData, observations: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.livestockFeed.cancel2', 'Cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {t('tools.livestockFeed.logFeeding2', 'Log Feeding')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestockFeedTool;
