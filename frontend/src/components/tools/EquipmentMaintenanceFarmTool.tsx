import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';

interface MaintenanceRecord {
  id: string;
  equipmentName: string;
  equipmentType: 'tractor' | 'combine' | 'planter' | 'sprayer' | 'tillage' | 'harvester' | 'truck' | 'atv' | 'irrigation' | 'other';
  make: string;
  model: string;
  year: number;
  serialNumber: string;
  maintenanceType: 'preventive' | 'repair' | 'inspection' | 'service' | 'replacement' | 'overhaul';
  maintenanceDate: string;
  nextMaintenanceDate: string;
  hoursAtService: number;
  currentHours: number;
  description: string;
  partsUsed: string[];
  laborHours: number;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  performedBy: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
}

const generateSampleData = (): MaintenanceRecord[] => [
  {
    id: '1',
    equipmentName: 'John Deere 8R 410',
    equipmentType: 'tractor',
    make: 'John Deere',
    model: '8R 410',
    year: 2022,
    serialNumber: 'JD8R410-22-1234',
    maintenanceType: 'service',
    maintenanceDate: '2024-01-15',
    nextMaintenanceDate: '2024-04-15',
    hoursAtService: 500,
    currentHours: 520,
    description: '500 hour service - oil change, filters, inspection',
    partsUsed: ['Engine Oil 15L', 'Oil Filter', 'Air Filter', 'Fuel Filter'],
    laborHours: 4,
    partsCost: 450,
    laborCost: 320,
    totalCost: 770,
    performedBy: 'Mike Johnson',
    status: 'completed',
    priority: 'medium',
    notes: 'All systems operating normally',
  },
  {
    id: '2',
    equipmentName: 'Case IH 9250 Combine',
    equipmentType: 'combine',
    make: 'Case IH',
    model: '9250',
    year: 2021,
    serialNumber: 'CIH9250-21-5678',
    maintenanceType: 'preventive',
    maintenanceDate: '2024-02-01',
    nextMaintenanceDate: '2024-08-01',
    hoursAtService: 800,
    currentHours: 850,
    description: 'Pre-season inspection and maintenance',
    partsUsed: ['Belts Set', 'Bearings', 'Chains', 'Lubricants'],
    laborHours: 12,
    partsCost: 2200,
    laborCost: 960,
    totalCost: 3160,
    performedBy: 'Jim Wilson',
    status: 'completed',
    priority: 'high',
    notes: 'Ready for harvest season',
  },
  {
    id: '3',
    equipmentName: 'Sprayer - Apache AS1240',
    equipmentType: 'sprayer',
    make: 'Apache',
    model: 'AS1240',
    year: 2020,
    serialNumber: 'APA1240-20-9012',
    maintenanceType: 'repair',
    maintenanceDate: '2024-01-20',
    nextMaintenanceDate: '2024-03-20',
    hoursAtService: 450,
    currentHours: 480,
    description: 'Boom section repair - nozzle replacement',
    partsUsed: ['Spray Nozzles x12', 'Boom Gaskets', 'Check Valves'],
    laborHours: 6,
    partsCost: 380,
    laborCost: 480,
    totalCost: 860,
    performedBy: 'Mike Johnson',
    status: 'completed',
    priority: 'high',
    notes: 'Left boom section had damaged nozzles',
  },
];

const columnConfig: ColumnConfig[] = [
  { key: 'equipmentName', header: 'Equipment', width: 20 },
  { key: 'equipmentType', header: 'Type', width: 12 },
  { key: 'maintenanceType', header: 'Service Type', width: 12 },
  { key: 'maintenanceDate', header: 'Date', width: 12 },
  { key: 'nextMaintenanceDate', header: 'Next Due', width: 12 },
  { key: 'currentHours', header: 'Hours', width: 10 },
  { key: 'totalCost', header: 'Cost ($)', width: 10 },
  { key: 'status', header: 'Status', width: 10 },
  { key: 'performedBy', header: 'Technician', width: 15 },
];

const EquipmentMaintenanceFarmTool: React.FC = () => {
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
  } = useToolData<MaintenanceRecord>('equipment-maintenance-farm', generateSampleData(), columnConfig);

  const [activeTab, setActiveTab] = useState<'records' | 'equipment' | 'schedule' | 'costs'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
    equipmentName: '',
    equipmentType: 'tractor',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    serialNumber: '',
    maintenanceType: 'service',
    maintenanceDate: new Date().toISOString().split('T')[0],
    nextMaintenanceDate: '',
    hoursAtService: 0,
    currentHours: 0,
    description: '',
    partsUsed: [],
    laborHours: 0,
    partsCost: 0,
    laborCost: 0,
    totalCost: 0,
    performedBy: '',
    status: 'scheduled',
    priority: 'medium',
    notes: '',
  });

  const [partsInput, setPartsInput] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || record.equipmentType === filterType;
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [records, searchTerm, filterType, filterStatus]);

  const stats = useMemo(() => {
    const totalCost = records.reduce((sum, r) => sum + r.totalCost, 0);
    const overdueCount = records.filter((r) => r.status === 'overdue').length;
    const scheduledCount = records.filter((r) => r.status === 'scheduled').length;
    const uniqueEquipment = new Set(records.map((r) => r.equipmentName)).size;

    // Find upcoming maintenance (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingCount = records.filter((r) => {
      const nextDate = new Date(r.nextMaintenanceDate);
      return nextDate >= today && nextDate <= thirtyDaysFromNow;
    }).length;

    return { totalCost, overdueCount, scheduledCount, uniqueEquipment, upcomingCount };
  }, [records]);

  const equipmentSummary = useMemo(() => {
    const equipmentMap = new Map<string, { records: number; totalCost: number; currentHours: number; lastService: string }>();

    records.forEach((r) => {
      const existing = equipmentMap.get(r.equipmentName);
      if (!existing || new Date(r.maintenanceDate) > new Date(existing.lastService)) {
        equipmentMap.set(r.equipmentName, {
          records: (existing?.records || 0) + 1,
          totalCost: (existing?.totalCost || 0) + r.totalCost,
          currentHours: r.currentHours,
          lastService: r.maintenanceDate,
        });
      } else {
        equipmentMap.set(r.equipmentName, {
          ...existing,
          records: existing.records + 1,
          totalCost: existing.totalCost + r.totalCost,
        });
      }
    });

    return Array.from(equipmentMap.entries()).map(([name, data]) => ({
      name,
      ...data,
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
      } as MaintenanceRecord);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      equipmentName: '',
      equipmentType: 'tractor',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      serialNumber: '',
      maintenanceType: 'service',
      maintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: '',
      hoursAtService: 0,
      currentHours: 0,
      description: '',
      partsUsed: [],
      laborHours: 0,
      partsCost: 0,
      laborCost: 0,
      totalCost: 0,
      performedBy: '',
      status: 'scheduled',
      priority: 'medium',
      notes: '',
    });
    setPartsInput('');
    setEditingRecord(null);
    setShowAddModal(false);
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setPartsInput(record.partsUsed.join(', '));
    setShowAddModal(true);
  };

  const addPart = () => {
    if (partsInput.trim()) {
      const items = partsInput.split(',').map((item) => item.trim()).filter(Boolean);
      setFormData({
        ...formData,
        partsUsed: [...new Set([...(formData.partsUsed || []), ...items])],
      });
      setPartsInput('');
    }
  };

  const removePart = (part: string) => {
    setFormData({
      ...formData,
      partsUsed: (formData.partsUsed || []).filter((p) => p !== part),
    });
  };

  const updateCosts = (data: Partial<MaintenanceRecord>) => {
    const partsCost = data.partsCost || 0;
    const laborCost = data.laborCost || 0;
    setFormData({
      ...data,
      totalCost: partsCost + laborCost,
    });
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tractor':
        return '🚜';
      case 'combine':
        return '🌾';
      case 'planter':
        return '🌱';
      case 'sprayer':
        return '💧';
      case 'tillage':
        return '⚙️';
      case 'harvester':
        return '🌿';
      case 'truck':
        return '🚛';
      case 'atv':
        return '🏍️';
      case 'irrigation':
        return '🚿';
      default:
        return '🔧';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'repair':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'inspection':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'service':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'replacement':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'overhaul':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
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
              <span>🔧</span>
              {t('tools.equipmentMaintenanceFarm.farmEquipmentMaintenance', 'Farm Equipment Maintenance')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.equipmentMaintenanceFarm.trackAndScheduleFarmEquipment', 'Track and schedule farm equipment maintenance')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="equipment-maintenance-farm" toolName="Equipment Maintenance Farm" />

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
              {t('tools.equipmentMaintenanceFarm.addRecord', 'Add Record')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentMaintenanceFarm.totalCost', 'Total Cost')}</p>
            <p className="text-2xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentMaintenanceFarm.overdue', 'Overdue')}</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentMaintenanceFarm.scheduled', 'Scheduled')}</p>
            <p className="text-2xl font-bold text-blue-600">{stats.scheduledCount}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentMaintenanceFarm.dueSoon', 'Due Soon')}</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.upcomingCount}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentMaintenanceFarm.equipment', 'Equipment')}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.uniqueEquipment}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto">
          {[
            { id: 'records', label: 'Maintenance Records', icon: '📋' },
            { id: 'equipment', label: 'Equipment List', icon: '🚜' },
            { id: 'schedule', label: 'Schedule', icon: '📅' },
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
        {activeTab === 'records' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('tools.equipmentMaintenanceFarm.searchEquipment', 'Search equipment...')}
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.equipmentMaintenanceFarm.allTypes', 'All Types')}</option>
                <option value="tractor">{t('tools.equipmentMaintenanceFarm.tractor', 'Tractor')}</option>
                <option value="combine">{t('tools.equipmentMaintenanceFarm.combine', 'Combine')}</option>
                <option value="planter">{t('tools.equipmentMaintenanceFarm.planter', 'Planter')}</option>
                <option value="sprayer">{t('tools.equipmentMaintenanceFarm.sprayer', 'Sprayer')}</option>
                <option value="tillage">{t('tools.equipmentMaintenanceFarm.tillage', 'Tillage')}</option>
                <option value="truck">{t('tools.equipmentMaintenanceFarm.truck', 'Truck')}</option>
                <option value="other">{t('tools.equipmentMaintenanceFarm.other', 'Other')}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.equipmentMaintenanceFarm.allStatus', 'All Status')}</option>
                <option value="scheduled">{t('tools.equipmentMaintenanceFarm.scheduled2', 'Scheduled')}</option>
                <option value="in-progress">{t('tools.equipmentMaintenanceFarm.inProgress', 'In Progress')}</option>
                <option value="completed">{t('tools.equipmentMaintenanceFarm.completed', 'Completed')}</option>
                <option value="overdue">{t('tools.equipmentMaintenanceFarm.overdue2', 'Overdue')}</option>
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
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentMaintenanceFarm.noMaintenanceRecordsFound', 'No maintenance records found')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.equipmentMaintenanceFarm.addFirstRecord', 'Add First Record')}
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
                          <span className="text-2xl">{getEquipmentIcon(record.equipmentType)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{record.equipmentName}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {record.make} {record.model} ({record.year}) | SN: {record.serialNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMaintenanceTypeColor(record.maintenanceType)}`}>
                            {record.maintenanceType.charAt(0).toUpperCase() + record.maintenanceType.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.priority)}`}>
                            {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          {record.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentMaintenanceFarm.hours', 'Hours:')}</span>
                            <span className="ml-2 font-medium">{record.currentHours}</span>
                          </div>
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentMaintenanceFarm.labor', 'Labor:')}</span>
                            <span className="ml-2 font-medium">{record.laborHours}h</span>
                          </div>
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentMaintenanceFarm.by', 'By:')}</span>
                            <span className="ml-2 font-medium">{record.performedBy}</span>
                          </div>
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentMaintenanceFarm.next', 'Next:')}</span>
                            <span className="ml-2 font-medium">{new Date(record.nextMaintenanceDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {record.partsUsed.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {record.partsUsed.map((part, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(record.maintenanceDate).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-bold text-green-600">${record.totalCost.toLocaleString()}</p>
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

        {activeTab === 'equipment' && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">{t('tools.equipmentMaintenanceFarm.equipmentSummary', 'Equipment Summary')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-3 px-4">{t('tools.equipmentMaintenanceFarm.equipment2', 'Equipment')}</th>
                    <th className="text-right py-3 px-4">{t('tools.equipmentMaintenanceFarm.records', 'Records')}</th>
                    <th className="text-right py-3 px-4">{t('tools.equipmentMaintenanceFarm.currentHours', 'Current Hours')}</th>
                    <th className="text-right py-3 px-4">{t('tools.equipmentMaintenanceFarm.lastService', 'Last Service')}</th>
                    <th className="text-right py-3 px-4">{t('tools.equipmentMaintenanceFarm.totalCost2', 'Total Cost')}</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentSummary.map((eq) => (
                    <tr key={eq.name} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">{eq.name}</td>
                      <td className="py-3 px-4 text-right">{eq.records}</td>
                      <td className="py-3 px-4 text-right">{eq.currentHours} hrs</td>
                      <td className="py-3 px-4 text-right">{new Date(eq.lastService).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right text-green-600">${eq.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-red-500">!</span> Overdue
              </h2>
              <div className="space-y-3">
                {records.filter((r) => r.status === 'overdue').length === 0 ? (
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentMaintenanceFarm.noOverdueMaintenance', 'No overdue maintenance')}</p>
                ) : (
                  records
                    .filter((r) => r.status === 'overdue')
                    .map((r) => (
                      <div key={r.id} className={`p-3 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <p className="font-medium">{r.equipmentName}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{r.maintenanceType}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.equipmentMaintenanceFarm.upcoming30Days', 'Upcoming (30 days)')}</h2>
              <div className="space-y-3">
                {records
                  .filter((r) => {
                    const nextDate = new Date(r.nextMaintenanceDate);
                    const today = new Date();
                    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return nextDate >= today && nextDate <= thirtyDaysFromNow;
                  })
                  .sort((a, b) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime())
                  .map((r) => (
                    <div key={r.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{r.equipmentName}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{r.maintenanceType}</p>
                        </div>
                        <p className="text-sm font-medium">{new Date(r.nextMaintenanceDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.equipmentMaintenanceFarm.costByMaintenanceType', 'Cost by Maintenance Type')}</h2>
              <div className="space-y-3">
                {['preventive', 'repair', 'service', 'inspection', 'replacement', 'overhaul'].map((type) => {
                  const cost = records
                    .filter((r) => r.maintenanceType === type)
                    .reduce((sum, r) => sum + r.totalCost, 0);
                  const percentage = stats.totalCost > 0 ? (cost / stats.totalCost) * 100 : 0;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="capitalize">{type}</span>
                        <span className="font-medium">${cost.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">{t('tools.equipmentMaintenanceFarm.costBreakdown', 'Cost Breakdown')}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{t('tools.equipmentMaintenanceFarm.partsCost', 'Parts Cost')}</span>
                  <span className="font-bold text-lg">${records.reduce((sum, r) => sum + r.partsCost, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('tools.equipmentMaintenanceFarm.laborCost', 'Labor Cost')}</span>
                  <span className="font-bold text-lg">${records.reduce((sum, r) => sum + r.laborCost, 0).toLocaleString()}</span>
                </div>
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{t('tools.equipmentMaintenanceFarm.totalCost3', 'Total Cost')}</span>
                    <span className="font-bold text-xl text-green-600">${stats.totalCost.toLocaleString()}</span>
                  </div>
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
            <h2 className="text-xl font-bold mb-4">{editingRecord ? t('tools.equipmentMaintenanceFarm.editRecord', 'Edit Record') : t('tools.equipmentMaintenanceFarm.addMaintenanceRecord', 'Add Maintenance Record')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.equipmentName', 'Equipment Name')}</label>
                  <input
                    type="text"
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.equipmentType', 'Equipment Type')}</label>
                  <select
                    value={formData.equipmentType}
                    onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value as MaintenanceRecord['equipmentType'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="tractor">{t('tools.equipmentMaintenanceFarm.tractor2', 'Tractor')}</option>
                    <option value="combine">{t('tools.equipmentMaintenanceFarm.combine2', 'Combine')}</option>
                    <option value="planter">{t('tools.equipmentMaintenanceFarm.planter2', 'Planter')}</option>
                    <option value="sprayer">{t('tools.equipmentMaintenanceFarm.sprayer2', 'Sprayer')}</option>
                    <option value="tillage">{t('tools.equipmentMaintenanceFarm.tillage2', 'Tillage')}</option>
                    <option value="harvester">{t('tools.equipmentMaintenanceFarm.harvester', 'Harvester')}</option>
                    <option value="truck">{t('tools.equipmentMaintenanceFarm.truck2', 'Truck')}</option>
                    <option value="atv">{t('tools.equipmentMaintenanceFarm.atv', 'ATV')}</option>
                    <option value="irrigation">{t('tools.equipmentMaintenanceFarm.irrigation', 'Irrigation')}</option>
                    <option value="other">{t('tools.equipmentMaintenanceFarm.other2', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.make', 'Make')}</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.model', 'Model')}</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.year', 'Year')}</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.serialNumber', 'Serial Number')}</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.maintenanceType', 'Maintenance Type')}</label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as MaintenanceRecord['maintenanceType'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="preventive">{t('tools.equipmentMaintenanceFarm.preventive', 'Preventive')}</option>
                    <option value="repair">{t('tools.equipmentMaintenanceFarm.repair', 'Repair')}</option>
                    <option value="inspection">{t('tools.equipmentMaintenanceFarm.inspection', 'Inspection')}</option>
                    <option value="service">{t('tools.equipmentMaintenanceFarm.service', 'Service')}</option>
                    <option value="replacement">{t('tools.equipmentMaintenanceFarm.replacement', 'Replacement')}</option>
                    <option value="overhaul">{t('tools.equipmentMaintenanceFarm.overhaul', 'Overhaul')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceRecord['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="scheduled">{t('tools.equipmentMaintenanceFarm.scheduled3', 'Scheduled')}</option>
                    <option value="in-progress">{t('tools.equipmentMaintenanceFarm.inProgress2', 'In Progress')}</option>
                    <option value="completed">{t('tools.equipmentMaintenanceFarm.completed2', 'Completed')}</option>
                    <option value="overdue">{t('tools.equipmentMaintenanceFarm.overdue3', 'Overdue')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.maintenanceDate', 'Maintenance Date')}</label>
                  <input
                    type="date"
                    value={formData.maintenanceDate}
                    onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.nextMaintenance', 'Next Maintenance')}</label>
                  <input
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.hoursAtService', 'Hours at Service')}</label>
                  <input
                    type="number"
                    value={formData.hoursAtService}
                    onChange={(e) => setFormData({ ...formData, hoursAtService: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.currentHours2', 'Current Hours')}</label>
                  <input
                    type="number"
                    value={formData.currentHours}
                    onChange={(e) => setFormData({ ...formData, currentHours: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.description', 'Description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.partsUsed', 'Parts Used')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={partsInput}
                    onChange={(e) => setPartsInput(e.target.value)}
                    placeholder={t('tools.equipmentMaintenanceFarm.addPartsCommaSeparated', 'Add parts (comma separated)')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addPart}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('tools.equipmentMaintenanceFarm.add', 'Add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.partsUsed || []).map((part, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      {part}
                      <button type="button" onClick={() => removePart(part)} className="text-red-500 hover:text-red-700">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.laborHours', 'Labor Hours')}</label>
                  <input
                    type="number"
                    value={formData.laborHours}
                    onChange={(e) => setFormData({ ...formData, laborHours: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    step="0.5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.partsCost2', 'Parts Cost ($)')}</label>
                  <input
                    type="number"
                    value={formData.partsCost}
                    onChange={(e) => {
                      const partsCost = parseFloat(e.target.value) || 0;
                      updateCosts({ ...formData, partsCost });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.laborCost2', 'Labor Cost ($)')}</label>
                  <input
                    type="number"
                    value={formData.laborCost}
                    onChange={(e) => {
                      const laborCost = parseFloat(e.target.value) || 0;
                      updateCosts({ ...formData, laborCost });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.totalCostAuto', 'Total Cost (auto)')}</label>
                  <input
                    type="number"
                    value={formData.totalCost}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.performedBy', 'Performed By')}</label>
                  <input
                    type="text"
                    value={formData.performedBy}
                    onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.priority', 'Priority')}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenanceRecord['priority'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="low">{t('tools.equipmentMaintenanceFarm.low', 'Low')}</option>
                    <option value="medium">{t('tools.equipmentMaintenanceFarm.medium', 'Medium')}</option>
                    <option value="high">{t('tools.equipmentMaintenanceFarm.high', 'High')}</option>
                    <option value="urgent">{t('tools.equipmentMaintenanceFarm.urgent', 'Urgent')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.equipmentMaintenanceFarm.notes', 'Notes')}</label>
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
                  {t('tools.equipmentMaintenanceFarm.cancel', 'Cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {editingRecord ? t('tools.equipmentMaintenanceFarm.update', 'Update') : t('tools.equipmentMaintenanceFarm.addRecord2', 'Add Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentMaintenanceFarmTool;
