import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';

interface YieldRecord {
  id: string;
  harvestDate: string;
  season: string;
  year: number;
  cropName: string;
  variety: string;
  fieldName: string;
  fieldSize: number;
  sizeUnit: 'acres' | 'hectares' | 'sqft';
  totalYield: number;
  yieldUnit: 'bushels' | 'tons' | 'lbs' | 'kg' | 'boxes' | 'cwt';
  yieldPerAcre: number;
  moistureContent: number;
  qualityGrade: string;
  testWeight: number;
  pricePerUnit: number;
  totalRevenue: number;
  productionCost: number;
  netProfit: number;
  weatherConditions: string;
  soilType: string;
  irrigationType: string;
  fertilizerUsed: string;
  notes: string;
}

const generateSampleData = (): YieldRecord[] => [
  {
    id: '1',
    harvestDate: '2024-10-05',
    season: 'Fall',
    year: 2024,
    cropName: 'Corn',
    variety: 'Pioneer P1197',
    fieldName: 'North Field',
    fieldSize: 80,
    sizeUnit: 'acres',
    totalYield: 14400,
    yieldUnit: 'bushels',
    yieldPerAcre: 180,
    moistureContent: 15.2,
    qualityGrade: 'Grade 2',
    testWeight: 56,
    pricePerUnit: 4.85,
    totalRevenue: 69840,
    productionCost: 42000,
    netProfit: 27840,
    weatherConditions: 'Good growing season, adequate rainfall',
    soilType: 'Loam',
    irrigationType: 'Rain-fed',
    fertilizerUsed: '150 lbs N/acre',
    notes: 'Best yield in 5 years',
  },
  {
    id: '2',
    harvestDate: '2024-10-18',
    season: 'Fall',
    year: 2024,
    cropName: 'Soybeans',
    variety: 'Asgrow AG46X6',
    fieldName: 'South Field',
    fieldSize: 60,
    sizeUnit: 'acres',
    totalYield: 3600,
    yieldUnit: 'bushels',
    yieldPerAcre: 60,
    moistureContent: 13.0,
    qualityGrade: 'Grade 1',
    testWeight: 60,
    pricePerUnit: 12.50,
    totalRevenue: 45000,
    productionCost: 24000,
    netProfit: 21000,
    weatherConditions: 'Dry spell in August affected pods',
    soilType: 'Clay loam',
    irrigationType: 'Rain-fed',
    fertilizerUsed: 'Minimal N, 40-60-60 starter',
    notes: 'Slightly below average due to drought',
  },
  {
    id: '3',
    harvestDate: '2024-09-20',
    season: 'Fall',
    year: 2024,
    cropName: 'Apples',
    variety: 'Honeycrisp',
    fieldName: 'East Orchard',
    fieldSize: 15,
    sizeUnit: 'acres',
    totalYield: 12000,
    yieldUnit: 'boxes',
    yieldPerAcre: 800,
    moistureContent: 0,
    qualityGrade: 'Extra Fancy',
    testWeight: 0,
    pricePerUnit: 35,
    totalRevenue: 420000,
    productionCost: 180000,
    netProfit: 240000,
    weatherConditions: 'Ideal conditions for fruit development',
    soilType: 'Sandy loam',
    irrigationType: 'Drip irrigation',
    fertilizerUsed: 'Organic compost, foliar feeds',
    notes: 'Premium quality, high demand',
  },
];

const columnConfig: ColumnConfig[] = [
  { key: 'harvestDate', header: 'Date', width: 12 },
  { key: 'cropName', header: 'Crop', width: 12 },
  { key: 'variety', header: 'Variety', width: 15 },
  { key: 'fieldName', header: 'Field', width: 12 },
  { key: 'totalYield', header: 'Total Yield', width: 12 },
  { key: 'yieldPerAcre', header: 'Yield/Acre', width: 10 },
  { key: 'qualityGrade', header: 'Grade', width: 10 },
  { key: 'pricePerUnit', header: 'Price', width: 10 },
  { key: 'netProfit', header: 'Net Profit', width: 12 },
];

const YieldTrackerTool: React.FC = () => {
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
  } = useToolData<YieldRecord>('yield-tracker', generateSampleData(), columnConfig);

  const [activeTab, setActiveTab] = useState<'records' | 'analytics' | 'comparison' | 'reports'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<YieldRecord | null>(null);

  const [formData, setFormData] = useState<Partial<YieldRecord>>({
    harvestDate: new Date().toISOString().split('T')[0],
    season: 'Fall',
    year: new Date().getFullYear(),
    cropName: '',
    variety: '',
    fieldName: '',
    fieldSize: 0,
    sizeUnit: 'acres',
    totalYield: 0,
    yieldUnit: 'bushels',
    yieldPerAcre: 0,
    moistureContent: 0,
    qualityGrade: '',
    testWeight: 0,
    pricePerUnit: 0,
    totalRevenue: 0,
    productionCost: 0,
    netProfit: 0,
    weatherConditions: '',
    soilType: '',
    irrigationType: '',
    fertilizerUsed: '',
    notes: '',
  });

  const years = useMemo(() => {
    const uniqueYears = [...new Set(records.map((r) => r.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [records]);

  const crops = useMemo(() => {
    return [...new Set(records.map((r) => r.cropName))];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.variety.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = filterYear === 'all' || record.year === parseInt(filterYear);
      const matchesCrop = filterCrop === 'all' || record.cropName === filterCrop;
      return matchesSearch && matchesYear && matchesCrop;
    });
  }, [records, searchTerm, filterYear, filterCrop]);

  const stats = useMemo(() => {
    const totalRevenue = records.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalCost = records.reduce((sum, r) => sum + r.productionCost, 0);
    const totalProfit = records.reduce((sum, r) => sum + r.netProfit, 0);
    const avgYieldPerAcre = records.length > 0
      ? records.reduce((sum, r) => sum + r.yieldPerAcre, 0) / records.length
      : 0;
    const totalAcres = records.reduce((sum, r) => sum + r.fieldSize, 0);

    return { totalRevenue, totalCost, totalProfit, avgYieldPerAcre, totalAcres };
  }, [records]);

  const cropAnalytics = useMemo(() => {
    const cropMap = new Map<string, { yield: number; acres: number; revenue: number; profit: number; count: number }>();

    records.forEach((r) => {
      const existing = cropMap.get(r.cropName) || { yield: 0, acres: 0, revenue: 0, profit: 0, count: 0 };
      cropMap.set(r.cropName, {
        yield: existing.yield + r.totalYield,
        acres: existing.acres + r.fieldSize,
        revenue: existing.revenue + r.totalRevenue,
        profit: existing.profit + r.netProfit,
        count: existing.count + 1,
      });
    });

    return Array.from(cropMap.entries()).map(([crop, data]) => ({
      crop,
      ...data,
      avgYieldPerAcre: data.acres > 0 ? data.yield / data.acres : 0,
      profitPerAcre: data.acres > 0 ? data.profit / data.acres : 0,
    }));
  }, [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateItem(editingRecord.id, formData);
    } else {
      addItem({
        ...formData,
        id: Date.now().toString(),
      } as YieldRecord);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      harvestDate: new Date().toISOString().split('T')[0],
      season: 'Fall',
      year: new Date().getFullYear(),
      cropName: '',
      variety: '',
      fieldName: '',
      fieldSize: 0,
      sizeUnit: 'acres',
      totalYield: 0,
      yieldUnit: 'bushels',
      yieldPerAcre: 0,
      moistureContent: 0,
      qualityGrade: '',
      testWeight: 0,
      pricePerUnit: 0,
      totalRevenue: 0,
      productionCost: 0,
      netProfit: 0,
      weatherConditions: '',
      soilType: '',
      irrigationType: '',
      fertilizerUsed: '',
      notes: '',
    });
    setEditingRecord(null);
    setShowAddModal(false);
  };

  const handleEdit = (record: YieldRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowAddModal(true);
  };

  // Auto-calculate derived fields
  const updateCalculations = (data: Partial<YieldRecord>) => {
    const fieldSize = data.fieldSize || 0;
    const totalYield = data.totalYield || 0;
    const pricePerUnit = data.pricePerUnit || 0;
    const productionCost = data.productionCost || 0;

    const yieldPerAcre = fieldSize > 0 ? totalYield / fieldSize : 0;
    const totalRevenue = totalYield * pricePerUnit;
    const netProfit = totalRevenue - productionCost;

    setFormData({
      ...data,
      yieldPerAcre: Math.round(yieldPerAcre * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
    });
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
              <span>📈</span>
              {t('tools.yieldTracker.yieldTracker', 'Yield Tracker')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.yieldTracker.trackAndAnalyzeCropYields', 'Track and analyze crop yields and profitability')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="yield-tracker" toolName="Yield Tracker" />

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
              {t('tools.yieldTracker.recordYield', 'Record Yield')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.totalRevenue', 'Total Revenue')}</p>
            <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.totalCost', 'Total Cost')}</p>
            <p className="text-2xl font-bold text-red-600">${stats.totalCost.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.netProfit', 'Net Profit')}</p>
            <p className="text-2xl font-bold text-blue-600">${stats.totalProfit.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.avgYieldAcre', 'Avg Yield/Acre')}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.avgYieldPerAcre.toFixed(1)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.totalAcres', 'Total Acres')}</p>
            <p className="text-2xl font-bold text-orange-600">{stats.totalAcres}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto">
          {[
            { id: 'records', label: 'Yield Records', icon: '📋' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'comparison', label: 'Crop Comparison', icon: '📉' },
            { id: 'reports', label: 'Reports', icon: '📄' },
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
        {activeTab === 'records' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('tools.yieldTracker.searchByCropFieldOr', 'Search by crop, field, or variety...')}
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
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.yieldTracker.allYears', 'All Years')}</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.yieldTracker.allCrops', 'All Crops')}</option>
                {crops.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
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
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.yieldTracker.noYieldRecordsFound', 'No yield records found')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.yieldTracker.recordFirstYield', 'Record First Yield')}
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
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">🌾</span>
                          <div>
                            <h3 className="font-semibold text-lg">{record.cropName} - {record.variety}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {record.fieldName} ({record.fieldSize} {record.sizeUnit}) | {record.season} {record.year}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.yieldTracker.totalYield', 'Total Yield')}</p>
                            <p className="font-semibold">{record.totalYield.toLocaleString()} {record.yieldUnit}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.yieldTracker.yieldAcre', 'Yield/Acre')}</p>
                            <p className="font-semibold">{record.yieldPerAcre.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.yieldTracker.quality', 'Quality')}</p>
                            <p className="font-semibold">{record.qualityGrade}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.yieldTracker.priceUnit', 'Price/Unit')}</p>
                            <p className="font-semibold">${record.pricePerUnit.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.yieldTracker.moisture', 'Moisture')}</p>
                            <p className="font-semibold">{record.moistureContent}%</p>
                          </div>
                        </div>
                        {record.notes && (
                          <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(record.harvestDate).toLocaleDateString()}
                        </p>
                        <div className="text-right">
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.revenue', 'Revenue')}</p>
                          <p className="text-lg font-bold text-green-600">${record.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.netProfit2', 'Net Profit')}</p>
                          <p className={`text-lg font-bold ${record.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ${record.netProfit.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2">
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

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.yieldTracker.yieldTrendsByCrop', 'Yield Trends by Crop')}</h2>
              <div className="space-y-4">
                {cropAnalytics.map((crop) => (
                  <div key={crop.crop} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{crop.crop}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {crop.avgYieldPerAcre.toFixed(1)} avg/acre
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: `${Math.min((crop.avgYieldPerAcre / Math.max(...cropAnalytics.map((c) => c.avgYieldPerAcre))) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.yieldTracker.profitabilityAnalysis', 'Profitability Analysis')}</h2>
              <div className="space-y-4">
                {cropAnalytics
                  .sort((a, b) => b.profitPerAcre - a.profitPerAcre)
                  .map((crop) => (
                    <div key={crop.crop} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{crop.crop}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {crop.count} records | {crop.acres} acres
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${crop.profitPerAcre >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${crop.profitPerAcre.toFixed(2)}/acre
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          ${crop.profit.toLocaleString()} total
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.yieldTracker.cropPerformanceComparison', 'Crop Performance Comparison')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-3 px-4">{t('tools.yieldTracker.crop', 'Crop')}</th>
                    <th className="text-right py-3 px-4">{t('tools.yieldTracker.records', 'Records')}</th>
                    <th className="text-right py-3 px-4">{t('tools.yieldTracker.totalAcres2', 'Total Acres')}</th>
                    <th className="text-right py-3 px-4">{t('tools.yieldTracker.avgYieldAcre2', 'Avg Yield/Acre')}</th>
                    <th className="text-right py-3 px-4">{t('tools.yieldTracker.totalRevenue2', 'Total Revenue')}</th>
                    <th className="text-right py-3 px-4">{t('tools.yieldTracker.totalProfit', 'Total Profit')}</th>
                    <th className="text-right py-3 px-4">{t('tools.yieldTracker.profitAcre', 'Profit/Acre')}</th>
                  </tr>
                </thead>
                <tbody>
                  {cropAnalytics.map((crop) => (
                    <tr key={crop.crop} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">{crop.crop}</td>
                      <td className="py-3 px-4 text-right">{crop.count}</td>
                      <td className="py-3 px-4 text-right">{crop.acres}</td>
                      <td className="py-3 px-4 text-right">{crop.avgYieldPerAcre.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-green-600">${crop.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={crop.profit >= 0 ? 'text-blue-600' : 'text-red-600'}>
                          ${crop.profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={crop.profitPerAcre >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${crop.profitPerAcre.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.yieldTracker.seasonSummary', 'Season Summary')}</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('tools.yieldTracker.totalHarvests', 'Total Harvests:')}</span>
                  <span className="font-bold">{records.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.yieldTracker.totalAcresHarvested', 'Total Acres Harvested:')}</span>
                  <span className="font-bold">{stats.totalAcres}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.yieldTracker.totalRevenue3', 'Total Revenue:')}</span>
                  <span className="font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.yieldTracker.totalProductionCost', 'Total Production Cost:')}</span>
                  <span className="font-bold text-red-600">${stats.totalCost.toLocaleString()}</span>
                </div>
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('tools.yieldTracker.netProfit3', 'Net Profit:')}</span>
                    <span className={`font-bold text-xl ${stats.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${stats.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.yieldTracker.topPerformers', 'Top Performers')}</h2>
              <div className="space-y-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.highestYieldPerAcre', 'Highest Yield per Acre')}</p>
                  {records.length > 0 && (
                    <p className="font-semibold">
                      {records.reduce((a, b) => (a.yieldPerAcre > b.yieldPerAcre ? a : b)).cropName} -{' '}
                      {records.reduce((a, b) => (a.yieldPerAcre > b.yieldPerAcre ? a : b)).yieldPerAcre.toFixed(1)} bu/acre
                    </p>
                  )}
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.mostProfitable', 'Most Profitable')}</p>
                  {records.length > 0 && (
                    <p className="font-semibold">
                      {records.reduce((a, b) => (a.netProfit > b.netProfit ? a : b)).cropName} -{' '}
                      ${records.reduce((a, b) => (a.netProfit > b.netProfit ? a : b)).netProfit.toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.yieldTracker.bestQualityGrade', 'Best Quality Grade')}</p>
                  {records.length > 0 && (
                    <p className="font-semibold">
                      {records.find((r) => r.qualityGrade === 'Grade 1' || r.qualityGrade === 'Extra Fancy')?.cropName || 'N/A'} -{' '}
                      {records.find((r) => r.qualityGrade === 'Grade 1' || r.qualityGrade === 'Extra Fancy')?.qualityGrade || 'N/A'}
                    </p>
                  )}
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
            className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } p-6`}
          >
            <h2 className="text-xl font-bold mb-4">{editingRecord ? t('tools.yieldTracker.editYieldRecord', 'Edit Yield Record') : t('tools.yieldTracker.recordYield2', 'Record Yield')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.harvestDate', 'Harvest Date')}</label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.season', 'Season')}</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="Spring">{t('tools.yieldTracker.spring', 'Spring')}</option>
                    <option value="Summer">{t('tools.yieldTracker.summer', 'Summer')}</option>
                    <option value="Fall">{t('tools.yieldTracker.fall', 'Fall')}</option>
                    <option value="Winter">{t('tools.yieldTracker.winter', 'Winter')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.year', 'Year')}</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.cropName', 'Crop Name')}</label>
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
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.variety', 'Variety')}</label>
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
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.fieldName', 'Field Name')}</label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.fieldSize', 'Field Size')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.fieldSize}
                      onChange={(e) => {
                        const fieldSize = parseFloat(e.target.value) || 0;
                        updateCalculations({ ...formData, fieldSize });
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="0"
                    />
                    <select
                      value={formData.sizeUnit}
                      onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value as YieldRecord['sizeUnit'] })}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="acres">{t('tools.yieldTracker.acres', 'Acres')}</option>
                      <option value="hectares">{t('tools.yieldTracker.hectares', 'Hectares')}</option>
                      <option value="sqft">{t('tools.yieldTracker.sqFt', 'Sq Ft')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.totalYield2', 'Total Yield')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.totalYield}
                      onChange={(e) => {
                        const totalYield = parseFloat(e.target.value) || 0;
                        updateCalculations({ ...formData, totalYield });
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="0"
                    />
                    <select
                      value={formData.yieldUnit}
                      onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value as YieldRecord['yieldUnit'] })}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="bushels">{t('tools.yieldTracker.bushels', 'Bushels')}</option>
                      <option value="tons">{t('tools.yieldTracker.tons', 'Tons')}</option>
                      <option value="lbs">{t('tools.yieldTracker.lbs', 'Lbs')}</option>
                      <option value="kg">Kg</option>
                      <option value="boxes">{t('tools.yieldTracker.boxes', 'Boxes')}</option>
                      <option value="cwt">{t('tools.yieldTracker.cwt', 'CWT')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.yieldPerAcreAuto', 'Yield Per Acre (auto)')}</label>
                  <input
                    type="number"
                    value={formData.yieldPerAcre}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.qualityGrade', 'Quality Grade')}</label>
                  <input
                    type="text"
                    value={formData.qualityGrade}
                    onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.moisture2', 'Moisture %')}</label>
                  <input
                    type="number"
                    value={formData.moistureContent}
                    onChange={(e) => setFormData({ ...formData, moistureContent: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.testWeight', 'Test Weight')}</label>
                  <input
                    type="number"
                    value={formData.testWeight}
                    onChange={(e) => setFormData({ ...formData, testWeight: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.pricePerUnit', 'Price Per Unit ($)')}</label>
                  <input
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={(e) => {
                      const pricePerUnit = parseFloat(e.target.value) || 0;
                      updateCalculations({ ...formData, pricePerUnit });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.productionCost', 'Production Cost ($)')}</label>
                  <input
                    type="number"
                    value={formData.productionCost}
                    onChange={(e) => {
                      const productionCost = parseFloat(e.target.value) || 0;
                      updateCalculations({ ...formData, productionCost });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.totalRevenueAuto', 'Total Revenue (auto)')}</label>
                  <input
                    type="number"
                    value={formData.totalRevenue}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.netProfitAuto', 'Net Profit (auto)')}</label>
                  <input
                    type="number"
                    value={formData.netProfit}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.soilType', 'Soil Type')}</label>
                  <input
                    type="text"
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.irrigationType', 'Irrigation Type')}</label>
                  <input
                    type="text"
                    value={formData.irrigationType}
                    onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.fertilizerUsed', 'Fertilizer Used')}</label>
                  <input
                    type="text"
                    value={formData.fertilizerUsed}
                    onChange={(e) => setFormData({ ...formData, fertilizerUsed: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.weatherConditions', 'Weather Conditions')}</label>
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
                <label className="block text-sm font-medium mb-1">{t('tools.yieldTracker.notes', 'Notes')}</label>
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
                  {t('tools.yieldTracker.cancel', 'Cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {editingRecord ? t('tools.yieldTracker.update', 'Update') : t('tools.yieldTracker.recordYield3', 'Record Yield')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YieldTrackerTool;
