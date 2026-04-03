'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Camera,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Search,
  Tag,
  Calendar,
  MapPin,
  Settings,
  Shield,
  Sparkles,
  ExternalLink,
  FileText,
  TrendingUp,
  History,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface EquipmentTrackerToolProps {
  uiConfig?: UIConfig;
}

// Types
type EquipmentCategory = 'camera' | 'lens' | 'lighting' | 'audio' | 'tripod' | 'accessory' | 'storage' | 'computer' | 'drone' | 'other';
type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs-repair' | 'retired';
type MaintenanceType = 'cleaning' | 'repair' | 'calibration' | 'firmware' | 'inspection' | 'replacement';

interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  category: EquipmentCategory;
  condition: EquipmentCondition;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  warrantyExpiry: string | null;
  insurancePolicy: string;
  location: string;
  notes: string;
  isRented: boolean;
  rentalCostPerDay: number;
  shutterCount?: number; // For cameras
  usageHours: number;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  performedBy: string;
  date: string;
  notes: string;
  createdAt: string;
}

interface RentalLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  clientName: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalCost: number;
  isReturned: boolean;
  returnCondition: string;
  notes: string;
  createdAt: string;
}

// Constants
const CATEGORIES: { value: EquipmentCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: 'camera', label: 'Cameras', icon: Camera },
  { value: 'lens', label: 'Lenses', icon: Camera },
  { value: 'lighting', label: 'Lighting', icon: Camera },
  { value: 'audio', label: 'Audio', icon: Camera },
  { value: 'tripod', label: 'Tripods & Stands', icon: Camera },
  { value: 'accessory', label: 'Accessories', icon: Camera },
  { value: 'storage', label: 'Storage', icon: Camera },
  { value: 'computer', label: 'Computers', icon: Camera },
  { value: 'drone', label: 'Drones', icon: Camera },
  { value: 'other', label: 'Other', icon: Package },
];

const CONDITION_COLORS: Record<EquipmentCondition, { bg: string; text: string }> = {
  excellent: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  good: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  fair: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  'needs-repair': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  retired: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
};

// Column configurations for exports
const EQUIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
  { key: 'purchasePrice', header: 'Purchase Price', type: 'currency' },
  { key: 'currentValue', header: 'Current Value', type: 'currency' },
  { key: 'warrantyExpiry', header: 'Warranty Expiry', type: 'date' },
  { key: 'location', header: 'Location', type: 'string' },
];

const MAINTENANCE_COLUMNS: ColumnConfig[] = [
  { key: 'equipmentName', header: 'Equipment', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'performedBy', header: 'Performed By', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isWarrantyExpiringSoon = (warrantyExpiry: string | null) => {
  if (!warrantyExpiry) return false;
  const expiryDate = new Date(warrantyExpiry);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
};

const isMaintenanceDue = (nextMaintenanceDate: string | null) => {
  if (!nextMaintenanceDate) return false;
  const dueDate = new Date(nextMaintenanceDate);
  const now = new Date();
  return dueDate <= now;
};

// Main Component
export const EquipmentTrackerTool: React.FC<EquipmentTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: equipment,
    addItem: addEquipment,
    updateItem: updateEquipment,
    deleteItem: deleteEquipment,
    isSynced: equipmentSynced,
    isSaving: equipmentSaving,
    lastSaved: equipmentLastSaved,
    syncError: equipmentSyncError,
    forceSync: forceEquipmentSync,
  } = useToolData<Equipment>('camera-equipment', [], EQUIPMENT_COLUMNS);

  const {
    data: maintenanceLogs,
    addItem: addMaintenanceLog,
    deleteItem: deleteMaintenanceLog,
  } = useToolData<MaintenanceLog>('equipment-maintenance', [], MAINTENANCE_COLUMNS);

  const {
    data: rentalLogs,
    addItem: addRentalLog,
    updateItem: updateRentalLog,
    deleteItem: deleteRentalLog,
  } = useToolData<RentalLog>('equipment-rentals', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'equipment' | 'maintenance' | 'rentals' | 'alerts'>('equipment');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    category: 'camera',
    condition: 'excellent',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    currentValue: 0,
    warrantyExpiry: null,
    insurancePolicy: '',
    location: 'Studio',
    notes: '',
    isRented: false,
    rentalCostPerDay: 0,
    usageHours: 0,
    lastMaintenanceDate: null,
    nextMaintenanceDate: null,
    tags: [],
  });

  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceLog>>({
    equipmentId: '',
    type: 'cleaning',
    description: '',
    cost: 0,
    performedBy: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.name || params.brand) {
        setNewEquipment({
          ...newEquipment,
          name: params.name || '',
          brand: params.brand || '',
          model: params.model || '',
          category: params.category || 'camera',
        });
        setShowEquipmentForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [equipment, searchTerm, selectedCategory, selectedCondition]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = equipment.reduce((sum, e) => sum + e.currentValue, 0);
    const needsRepair = equipment.filter(e => e.condition === 'needs-repair').length;
    const warrantiesExpiring = equipment.filter(e => isWarrantyExpiringSoon(e.warrantyExpiry)).length;
    const maintenanceDue = equipment.filter(e => isMaintenanceDue(e.nextMaintenanceDate)).length;
    const maintenanceCosts = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

    return {
      totalItems: equipment.length,
      totalValue,
      needsRepair,
      warrantiesExpiring,
      maintenanceDue,
      maintenanceCosts,
    };
  }, [equipment, maintenanceLogs]);

  // Alerts
  const alerts = useMemo(() => {
    const items: { type: 'warning' | 'error' | 'info'; message: string; equipmentId: string }[] = [];

    equipment.forEach(e => {
      if (e.condition === 'needs-repair') {
        items.push({ type: 'error', message: `${e.name} needs repair`, equipmentId: e.id });
      }
      if (isWarrantyExpiringSoon(e.warrantyExpiry)) {
        items.push({ type: 'warning', message: `${e.name} warranty expiring soon (${formatDate(e.warrantyExpiry)})`, equipmentId: e.id });
      }
      if (isMaintenanceDue(e.nextMaintenanceDate)) {
        items.push({ type: 'warning', message: `${e.name} maintenance is due`, equipmentId: e.id });
      }
    });

    return items;
  }, [equipment]);

  // Add equipment
  const handleAddEquipment = () => {
    if (!newEquipment.name || !newEquipment.brand) {
      setValidationMessage('Please enter equipment name and brand');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const item: Equipment = {
      id: generateId(),
      name: newEquipment.name || '',
      brand: newEquipment.brand || '',
      model: newEquipment.model || '',
      serialNumber: newEquipment.serialNumber || '',
      category: newEquipment.category as EquipmentCategory || 'camera',
      condition: newEquipment.condition as EquipmentCondition || 'excellent',
      purchaseDate: newEquipment.purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: newEquipment.purchasePrice || 0,
      currentValue: newEquipment.currentValue || newEquipment.purchasePrice || 0,
      warrantyExpiry: newEquipment.warrantyExpiry || null,
      insurancePolicy: newEquipment.insurancePolicy || '',
      location: newEquipment.location || 'Studio',
      notes: newEquipment.notes || '',
      isRented: newEquipment.isRented || false,
      rentalCostPerDay: newEquipment.rentalCostPerDay || 0,
      usageHours: newEquipment.usageHours || 0,
      lastMaintenanceDate: newEquipment.lastMaintenanceDate || null,
      nextMaintenanceDate: newEquipment.nextMaintenanceDate || null,
      tags: newEquipment.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEquipment(item);
    setShowEquipmentForm(false);
    resetEquipmentForm();
  };

  // Update equipment
  const handleUpdateEquipment = () => {
    if (!editingEquipment) return;

    updateEquipment(editingEquipment.id, {
      ...editingEquipment,
      updatedAt: new Date().toISOString(),
    });
    setEditingEquipment(null);
  };

  // Add maintenance log
  const handleAddMaintenance = () => {
    if (!newMaintenance.equipmentId || !newMaintenance.description) {
      setValidationMessage('Please select equipment and enter description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const equipmentItem = equipment.find(e => e.id === newMaintenance.equipmentId);

    const log: MaintenanceLog = {
      id: generateId(),
      equipmentId: newMaintenance.equipmentId || '',
      equipmentName: equipmentItem?.name || '',
      type: newMaintenance.type as MaintenanceType || 'cleaning',
      description: newMaintenance.description || '',
      cost: newMaintenance.cost || 0,
      performedBy: newMaintenance.performedBy || '',
      date: newMaintenance.date || new Date().toISOString().split('T')[0],
      notes: newMaintenance.notes || '',
      createdAt: new Date().toISOString(),
    };

    addMaintenanceLog(log);

    // Update equipment's last maintenance date
    if (equipmentItem) {
      updateEquipment(equipmentItem.id, {
        lastMaintenanceDate: log.date,
        updatedAt: new Date().toISOString(),
      });
    }

    setShowMaintenanceForm(false);
    resetMaintenanceForm();
  };

  // Reset forms
  const resetEquipmentForm = () => {
    setNewEquipment({
      name: '',
      brand: '',
      model: '',
      serialNumber: '',
      category: 'camera',
      condition: 'excellent',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      currentValue: 0,
      warrantyExpiry: null,
      insurancePolicy: '',
      location: 'Studio',
      notes: '',
      isRented: false,
      rentalCostPerDay: 0,
      usageHours: 0,
      lastMaintenanceDate: null,
      nextMaintenanceDate: null,
      tags: [],
    });
  };

  const resetMaintenanceForm = () => {
    setNewMaintenance({
      equipmentId: '',
      type: 'cleaning',
      description: '',
      cost: 0,
      performedBy: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.equipmentTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.equipmentTracker.equipmentTracker', 'Equipment Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.equipmentTracker.trackCameraGearMaintenanceAnd', 'Track camera gear, maintenance, and rentals')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="equipment-tracker" toolName="Equipment Tracker" />

              <SyncStatus
                isSynced={equipmentSynced}
                isSaving={equipmentSaving}
                lastSaved={equipmentLastSaved}
                syncError={equipmentSyncError}
                onForceSync={forceEquipmentSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredEquipment, EQUIPMENT_COLUMNS, 'camera-equipment')}
                onExportExcel={() => exportToExcel(filteredEquipment, EQUIPMENT_COLUMNS, 'camera-equipment')}
                onExportJSON={() => exportToJSON(filteredEquipment, 'camera-equipment')}
                onExportPDF={() => exportToPDF(filteredEquipment, EQUIPMENT_COLUMNS, 'Camera Equipment Report', 'camera-equipment')}
                onCopy={() => copyUtil(filteredEquipment, EQUIPMENT_COLUMNS)}
                onPrint={() => printData(filteredEquipment, EQUIPMENT_COLUMNS, 'Camera Equipment Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentTracker.totalItems', 'Total Items')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalItems}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentTracker.totalValue', 'Total Value')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentTracker.needsRepair', 'Needs Repair')}</p>
              <p className={`text-2xl font-bold text-red-500`}>{stats.needsRepair}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentTracker.warrantyExpiring', 'Warranty Expiring')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.warrantiesExpiring}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentTracker.maintenanceDue', 'Maintenance Due')}</p>
              <p className={`text-2xl font-bold text-orange-500`}>{stats.maintenanceDue}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentTracker.maintenanceCosts', 'Maintenance Costs')}</p>
              <p className={`text-2xl font-bold text-purple-500`}>{formatCurrency(stats.maintenanceCosts)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['equipment', 'maintenance', 'rentals', 'alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize relative ${
                  activeTab === tab
                    ? 'border-b-2 border-[#0D9488] text-[#0D9488]'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
                {tab === 'alerts' && alerts.length > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Equipment Tab */}
            {activeTab === 'equipment' && (
              <div>
                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <button
                    onClick={() => setShowEquipmentForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.equipmentTracker.addEquipment', 'Add Equipment')}
                  </button>
                  <input
                    type="text"
                    placeholder={t('tools.equipmentTracker.searchEquipment', 'Search equipment...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="all">{t('tools.equipmentTracker.allCategories', 'All Categories')}</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="all">{t('tools.equipmentTracker.allConditions', 'All Conditions')}</option>
                    <option value="excellent">{t('tools.equipmentTracker.excellent', 'Excellent')}</option>
                    <option value="good">{t('tools.equipmentTracker.good', 'Good')}</option>
                    <option value="fair">{t('tools.equipmentTracker.fair', 'Fair')}</option>
                    <option value="needs-repair">{t('tools.equipmentTracker.needsRepair2', 'Needs Repair')}</option>
                    <option value="retired">{t('tools.equipmentTracker.retired', 'Retired')}</option>
                  </select>
                </div>

                {/* Equipment List */}
                <div className="space-y-4">
                  {filteredEquipment.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.equipmentTracker.noEquipmentFoundAddYour', 'No equipment found. Add your first piece of gear!')}</p>
                    </div>
                  ) : (
                    filteredEquipment.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${CONDITION_COLORS[item.condition].bg}`}>
                              <Camera className={`w-5 h-5 ${CONDITION_COLORS[item.condition].text}`} />
                            </div>
                            <div>
                              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.name}
                              </h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.brand} {item.model}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                {item.serialNumber && (
                                  <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Tag className="w-4 h-4" />
                                    {item.serialNumber}
                                  </span>
                                )}
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <MapPin className="w-4 h-4" />
                                  {item.location}
                                </span>
                                {item.warrantyExpiry && (
                                  <span className={`flex items-center gap-1 ${
                                    isWarrantyExpiringSoon(item.warrantyExpiry)
                                      ? 'text-yellow-500'
                                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    <Shield className="w-4 h-4" />
                                    Warranty: {formatDate(item.warrantyExpiry)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(item.currentValue)}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Purchased: {formatCurrency(item.purchasePrice)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs capitalize ${CONDITION_COLORS[item.condition].bg} ${CONDITION_COLORS[item.condition].text}`}>
                              {item.condition.replace('-', ' ')}
                            </span>
                            <button
                              onClick={() => setEditingEquipment(item)}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Delete Equipment',
                                  message: 'Delete this equipment?',
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'danger'
                                });
                                if (confirmed) {
                                  deleteEquipment(item.id);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div>
                <div className="flex justify-between mb-6">
                  <button
                    onClick={() => setShowMaintenanceForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.equipmentTracker.logMaintenance', 'Log Maintenance')}
                  </button>
                </div>

                <div className="space-y-4">
                  {maintenanceLogs.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.equipmentTracker.noMaintenanceLogsYet', 'No maintenance logs yet')}</p>
                    </div>
                  ) : (
                    maintenanceLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {log.equipmentName}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {log.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs capitalize ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                              }`}>
                                {log.type}
                              </span>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {formatDate(log.date)}
                              </span>
                              {log.performedBy && (
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                  By: {log.performedBy}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium ${log.cost > 0 ? 'text-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {log.cost > 0 ? formatCurrency(log.cost) : 'No Cost'}
                            </span>
                            <button
                              onClick={() => deleteMaintenanceLog(log.id)}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Rentals Tab */}
            {activeTab === 'rentals' && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.equipmentTracker.equipmentRentalTrackingComingSoon', 'Equipment rental tracking coming soon')}</p>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div>
                {alerts.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>{t('tools.equipmentTracker.allEquipmentIsInGood', 'All equipment is in good condition!')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg flex items-center gap-3 ${
                          alert.type === 'error'
                            ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                            : alert.type === 'warning'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.type === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : alert.type === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                        <span className={`flex-1 ${
                          alert.type === 'error'
                            ? 'text-red-800 dark:text-red-200'
                            : alert.type === 'warning'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'text-blue-800 dark:text-blue-200'
                        }`}>
                          {alert.message}
                        </span>
                        <button
                          onClick={() => {
                            const eq = equipment.find(e => e.id === alert.equipmentId);
                            if (eq) setEditingEquipment(eq);
                          }}
                          className={`text-sm font-medium ${
                            alert.type === 'error'
                              ? 'text-red-600 dark:text-red-400'
                              : alert.type === 'warning'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-blue-600 dark:text-blue-400'
                          } hover:underline`}
                        >
                          {t('tools.equipmentTracker.view', 'View')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Equipment Form Modal */}
        {(showEquipmentForm || editingEquipment) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingEquipment ? t('tools.equipmentTracker.editEquipment', 'Edit Equipment') : t('tools.equipmentTracker.addNewEquipment', 'Add New Equipment')}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.name', 'Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingEquipment?.name || newEquipment.name}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, name: e.target.value });
                        } else {
                          setNewEquipment({ ...newEquipment, name: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.brand', 'Brand *')}
                    </label>
                    <input
                      type="text"
                      value={editingEquipment?.brand || newEquipment.brand}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, brand: e.target.value });
                        } else {
                          setNewEquipment({ ...newEquipment, brand: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.model', 'Model')}
                    </label>
                    <input
                      type="text"
                      value={editingEquipment?.model || newEquipment.model}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, model: e.target.value });
                        } else {
                          setNewEquipment({ ...newEquipment, model: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.serialNumber', 'Serial Number')}
                    </label>
                    <input
                      type="text"
                      value={editingEquipment?.serialNumber || newEquipment.serialNumber}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, serialNumber: e.target.value });
                        } else {
                          setNewEquipment({ ...newEquipment, serialNumber: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.category', 'Category')}
                    </label>
                    <select
                      value={editingEquipment?.category || newEquipment.category}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, category: e.target.value as EquipmentCategory });
                        } else {
                          setNewEquipment({ ...newEquipment, category: e.target.value as EquipmentCategory });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.condition', 'Condition')}
                    </label>
                    <select
                      value={editingEquipment?.condition || newEquipment.condition}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, condition: e.target.value as EquipmentCondition });
                        } else {
                          setNewEquipment({ ...newEquipment, condition: e.target.value as EquipmentCondition });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="excellent">{t('tools.equipmentTracker.excellent2', 'Excellent')}</option>
                      <option value="good">{t('tools.equipmentTracker.good2', 'Good')}</option>
                      <option value="fair">{t('tools.equipmentTracker.fair2', 'Fair')}</option>
                      <option value="needs-repair">{t('tools.equipmentTracker.needsRepair3', 'Needs Repair')}</option>
                      <option value="retired">{t('tools.equipmentTracker.retired2', 'Retired')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.purchaseDate', 'Purchase Date')}
                    </label>
                    <input
                      type="date"
                      value={editingEquipment?.purchaseDate || newEquipment.purchaseDate}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, purchaseDate: e.target.value });
                        } else {
                          setNewEquipment({ ...newEquipment, purchaseDate: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.purchasePrice', 'Purchase Price')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingEquipment?.purchasePrice || newEquipment.purchasePrice}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, purchasePrice: parseFloat(e.target.value) });
                        } else {
                          setNewEquipment({ ...newEquipment, purchasePrice: parseFloat(e.target.value) });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.currentValue', 'Current Value')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingEquipment?.currentValue || newEquipment.currentValue}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, currentValue: parseFloat(e.target.value) });
                        } else {
                          setNewEquipment({ ...newEquipment, currentValue: parseFloat(e.target.value) });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.warrantyExpiry', 'Warranty Expiry')}
                    </label>
                    <input
                      type="date"
                      value={editingEquipment?.warrantyExpiry || newEquipment.warrantyExpiry || ''}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, warrantyExpiry: e.target.value || null });
                        } else {
                          setNewEquipment({ ...newEquipment, warrantyExpiry: e.target.value || null });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={editingEquipment?.location || newEquipment.location}
                      onChange={(e) => {
                        if (editingEquipment) {
                          setEditingEquipment({ ...editingEquipment, location: e.target.value });
                        } else {
                          setNewEquipment({ ...newEquipment, location: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.equipmentTracker.notes', 'Notes')}
                  </label>
                  <textarea
                    rows={3}
                    value={editingEquipment?.notes || newEquipment.notes}
                    onChange={(e) => {
                      if (editingEquipment) {
                        setEditingEquipment({ ...editingEquipment, notes: e.target.value });
                      } else {
                        setNewEquipment({ ...newEquipment, notes: e.target.value });
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEquipmentForm(false);
                    setEditingEquipment(null);
                    resetEquipmentForm();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.equipmentTracker.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingEquipment ? handleUpdateEquipment : handleAddEquipment}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {editingEquipment ? t('tools.equipmentTracker.updateEquipment', 'Update Equipment') : t('tools.equipmentTracker.addEquipment2', 'Add Equipment')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Form Modal */}
        {showMaintenanceForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.equipmentTracker.logMaintenance2', 'Log Maintenance')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.equipmentTracker.equipment', 'Equipment *')}
                  </label>
                  <select
                    value={newMaintenance.equipmentId}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, equipmentId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.equipmentTracker.selectEquipment', 'Select Equipment')}</option>
                    {equipment.map(e => (
                      <option key={e.id} value={e.id}>{e.name} - {e.brand} {e.model}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.type', 'Type')}
                    </label>
                    <select
                      value={newMaintenance.type}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as MaintenanceType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="cleaning">{t('tools.equipmentTracker.cleaning', 'Cleaning')}</option>
                      <option value="repair">{t('tools.equipmentTracker.repair', 'Repair')}</option>
                      <option value="calibration">{t('tools.equipmentTracker.calibration', 'Calibration')}</option>
                      <option value="firmware">{t('tools.equipmentTracker.firmwareUpdate', 'Firmware Update')}</option>
                      <option value="inspection">{t('tools.equipmentTracker.inspection', 'Inspection')}</option>
                      <option value="replacement">{t('tools.equipmentTracker.partReplacement', 'Part Replacement')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.date', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={newMaintenance.date}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.equipmentTracker.description', 'Description *')}
                  </label>
                  <textarea
                    rows={3}
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.cost', 'Cost')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newMaintenance.cost}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentTracker.performedBy', 'Performed By')}
                    </label>
                    <input
                      type="text"
                      value={newMaintenance.performedBy}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, performedBy: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowMaintenanceForm(false);
                    resetMaintenanceForm();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.equipmentTracker.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddMaintenance}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.equipmentTracker.logMaintenance3', 'Log Maintenance')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default EquipmentTrackerTool;
