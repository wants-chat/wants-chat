import React, { useState, useEffect } from 'react';
import { Settings, Wrench, AlertTriangle, CheckCircle2, Plus, Trash2, Sparkles, Loader2, Edit2, Calendar, DollarSign, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'calibration' | 'upgrade';
  description: string;
  cost: number;
  technician: string;
}

interface StudioEquipment {
  id: string;
  name: string;
  category: 'microphone' | 'preamp' | 'compressor' | 'eq' | 'console' | 'monitors' | 'interface' | 'instrument' | 'cables' | 'headphones' | 'software' | 'other';
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair' | 'out-of-service';
  warrantyExpiry: string;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceHistory: MaintenanceRecord[];
  notes: string;
  isInsured: boolean;
  insurancePolicy: string;
  createdAt: string;
}

const categories = [
  { value: 'microphone', label: 'Microphones' },
  { value: 'preamp', label: 'Preamps' },
  { value: 'compressor', label: 'Compressors' },
  { value: 'eq', label: 'EQs' },
  { value: 'console', label: 'Mixing Consoles' },
  { value: 'monitors', label: 'Monitors/Speakers' },
  { value: 'interface', label: 'Audio Interfaces' },
  { value: 'instrument', label: 'Instruments' },
  { value: 'cables', label: 'Cables/Accessories' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'software', label: 'Software/Plugins' },
  { value: 'other', label: 'Other' },
];

const conditions = [
  { value: 'excellent', label: 'Excellent', color: 'text-green-500 bg-green-500/10' },
  { value: 'good', label: 'Good', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'fair', label: 'Fair', color: 'text-yellow-500 bg-yellow-500/10' },
  { value: 'needs-repair', label: 'Needs Repair', color: 'text-orange-500 bg-orange-500/10' },
  { value: 'out-of-service', label: 'Out of Service', color: 'text-red-500 bg-red-500/10' },
];

const locations = [
  'Studio A - Live Room', 'Studio A - Control Room', 'Studio B - Live Room', 'Studio B - Control Room',
  'Vocal Booth', 'Mixing Suite', 'Mastering Room', 'Podcast Suite', 'Storage', 'Loaner/Rental'
];

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Equipment Name', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
  { key: 'purchasePrice', header: 'Purchase Price', type: 'currency' },
  { key: 'currentValue', header: 'Current Value', type: 'currency' },
  { key: 'lastMaintenance', header: 'Last Maintenance', type: 'date' },
  { key: 'warrantyExpiry', header: 'Warranty Expires', type: 'date' },
];

interface EquipmentLogStudioToolProps {
  uiConfig?: UIConfig;
}

export const EquipmentLogStudioTool: React.FC<EquipmentLogStudioToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const emptyMaintenance: MaintenanceRecord = {
    id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'routine',
    description: '',
    cost: 0,
    technician: '',
  };

  const emptyForm: Omit<StudioEquipment, 'id' | 'createdAt'> = {
    name: '',
    category: 'microphone',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    location: locations[0],
    condition: 'excellent',
    warrantyExpiry: '',
    lastMaintenance: '',
    nextMaintenance: '',
    maintenanceHistory: [],
    notes: '',
    isInsured: false,
    insurancePolicy: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [newMaintenance, setNewMaintenance] = useState(emptyMaintenance);

  const {
    data: equipment,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<StudioEquipment>('studio-equipment-log', [], COLUMNS);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.name || params.equipmentName) {
        setFormData(prev => ({ ...prev, name: (params.name || params.equipmentName) as string }));
        hasChanges = true;
      }
      if (params.brand) {
        setFormData(prev => ({ ...prev, brand: params.brand as string }));
        hasChanges = true;
      }
      if (params.model) {
        setFormData(prev => ({ ...prev, model: params.model as string }));
        hasChanges = true;
      }
      if (params.category) {
        setFormData(prev => ({ ...prev, category: params.category as StudioEquipment['category'] }));
        hasChanges = true;
      }
      if (params.serialNumber) {
        setFormData(prev => ({ ...prev, serialNumber: params.serialNumber as string }));
        hasChanges = true;
      }
      if (params.purchasePrice || params.price) {
        setFormData(prev => ({ ...prev, purchasePrice: (params.purchasePrice || params.price) as number }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
        setShowForm(true);
      }
    }
  }, [uiConfig?.params]);

  const addMaintenanceRecord = () => {
    if (!newMaintenance.description) return;
    const record: MaintenanceRecord = { ...newMaintenance, id: Date.now().toString() };
    setFormData({
      ...formData,
      maintenanceHistory: [...formData.maintenanceHistory, record],
      lastMaintenance: newMaintenance.date
    });
    setNewMaintenance(emptyMaintenance);
  };

  const removeMaintenanceRecord = (recordId: string) => {
    setFormData({ ...formData, maintenanceHistory: formData.maintenanceHistory.filter(r => r.id !== recordId) });
  };

  const saveEquipment = () => {
    if (!formData.name || !formData.brand) return;

    if (editingId) {
      updateItem(editingId, formData);
      setEditingId(null);
    } else {
      const newEquipment: StudioEquipment = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addItem(newEquipment);
    }
    setShowForm(false);
    setFormData(emptyForm);
  };

  const handleEdit = (item: StudioEquipment) => {
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand,
      model: item.model,
      serialNumber: item.serialNumber,
      purchaseDate: item.purchaseDate,
      purchasePrice: item.purchasePrice,
      currentValue: item.currentValue,
      location: item.location,
      condition: item.condition,
      warrantyExpiry: item.warrantyExpiry,
      lastMaintenance: item.lastMaintenance,
      nextMaintenance: item.nextMaintenance,
      maintenanceHistory: item.maintenanceHistory,
      notes: item.notes,
      isInsured: item.isInsured,
      insurancePolicy: item.insurancePolicy,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const updateCondition = (id: string, condition: StudioEquipment['condition']) => {
    updateItem(id, { condition });
  };

  const filteredEquipment = equipment.filter(e => {
    const matchesCondition = filter === 'all' || e.condition === filter;
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesSearch = searchTerm === '' ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCondition && matchesCategory && matchesSearch;
  });

  const stats = {
    total: equipment.length,
    excellent: equipment.filter(e => e.condition === 'excellent').length,
    needsRepair: equipment.filter(e => ['needs-repair', 'out-of-service'].includes(e.condition)).length,
    totalValue: equipment.reduce((sum, e) => sum + e.currentValue, 0),
    totalPurchaseValue: equipment.reduce((sum, e) => sum + e.purchasePrice, 0),
    maintenanceDue: equipment.filter(e => {
      if (!e.nextMaintenance) return false;
      return new Date(e.nextMaintenance) <= new Date();
    }).length,
  };

  const conditionColors: Record<string, string> = {
    excellent: 'bg-green-500/10 text-green-500 border-green-500/20',
    good: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    fair: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'needs-repair': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'out-of-service': 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const inputClass = `w-full p-3 rounded-lg border ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;
  const cardClass = `p-4 rounded-xl border ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'} shadow-sm`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.equipmentLogStudio.studioEquipmentLog', 'Studio Equipment Log')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.equipmentLogStudio.trackAndMaintainStudioGear', 'Track and maintain studio gear inventory')}</p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.equipmentLogStudio.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Package className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentLogStudio.totalItems', 'Total Items')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentLogStudio.excellent', 'Excellent')}</p>
              <p className="text-xl font-bold text-green-500">{stats.excellent}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentLogStudio.needsRepair', 'Needs Repair')}</p>
              <p className="text-xl font-bold text-orange-500">{stats.needsRepair}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Wrench className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentLogStudio.maintenanceDue', 'Maintenance Due')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.maintenanceDue}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentLogStudio.totalValue', 'Total Value')}</p>
              <p className="text-xl font-bold text-purple-500">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentLogStudio.costBasis', 'Cost Basis')}</p>
              <p className="text-xl font-bold text-blue-500">${stats.totalPurchaseValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder={t('tools.equipmentLogStudio.searchEquipment', 'Search equipment...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.equipmentLogStudio.allCategories', 'All Categories')}</option>
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.equipmentLogStudio.allConditions', 'All Conditions')}</option>
            {conditions.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="equipment-log-studio" toolName="Equipment Log Studio" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'studio-equipment' })}
            onExportExcel={() => exportExcel({ filename: 'studio-equipment' })}
            onExportJSON={() => exportJSON({ filename: 'studio-equipment' })}
            onExportPDF={() => exportPDF({
              filename: 'studio-equipment',
              title: 'Studio Equipment Inventory',
              subtitle: `${stats.total} items - $${stats.totalValue.toLocaleString()} value`
            })}
            onPrint={() => print('Studio Equipment Inventory')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
            disabled={equipment.length === 0}
          />
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.equipmentLogStudio.addEquipment', 'Add Equipment')}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.equipmentLogStudio.editEquipment', 'Edit Equipment') : t('tools.equipmentLogStudio.addEquipment2', 'Add Equipment')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.equipmentName', 'Equipment Name *')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder={t('tools.equipmentLogStudio.eGNeumannU87', 'e.g., Neumann U87')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.brand', 'Brand *')}</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className={inputClass}
                placeholder={t('tools.equipmentLogStudio.eGNeumann', 'e.g., Neumann')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.model', 'Model')}</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className={inputClass}
                placeholder={t('tools.equipmentLogStudio.eGU87Ai', 'e.g., U87 Ai')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.serialNumber', 'Serial Number')}</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className={inputClass}
                placeholder="S/N"
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.category', 'Category')}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as StudioEquipment['category'] })}
                className={inputClass}
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.location', 'Location')}</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputClass}
              >
                {locations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.condition', 'Condition')}</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as StudioEquipment['condition'] })}
                className={inputClass}
              >
                {conditions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.purchaseDate', 'Purchase Date')}</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.purchasePrice', 'Purchase Price ($)')}</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.currentValue', 'Current Value ($)')}</label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.warrantyExpires', 'Warranty Expires')}</label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.equipmentLogStudio.nextMaintenance', 'Next Maintenance')}</label>
              <input
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isInsured}
                  onChange={(e) => setFormData({ ...formData, isInsured: e.target.checked })}
                  className="w-5 h-5 rounded text-[#0D9488]"
                />
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.equipmentLogStudio.insured', 'Insured')}</span>
              </label>
              {formData.isInsured && (
                <input
                  type="text"
                  value={formData.insurancePolicy}
                  onChange={(e) => setFormData({ ...formData, insurancePolicy: e.target.value })}
                  className={`${inputClass} flex-1`}
                  placeholder={t('tools.equipmentLogStudio.policyNumber', 'Policy number')}
                />
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div className="mt-6">
            <label className={labelClass}>Maintenance History ({formData.maintenanceHistory.length})</label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
              <input
                type="date"
                value={newMaintenance.date}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                className={inputClass}
              />
              <select
                value={newMaintenance.type}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as MaintenanceRecord['type'] })}
                className={inputClass}
              >
                <option value="routine">{t('tools.equipmentLogStudio.routine', 'Routine')}</option>
                <option value="repair">{t('tools.equipmentLogStudio.repair', 'Repair')}</option>
                <option value="calibration">{t('tools.equipmentLogStudio.calibration', 'Calibration')}</option>
                <option value="upgrade">{t('tools.equipmentLogStudio.upgrade', 'Upgrade')}</option>
              </select>
              <input
                type="text"
                placeholder={t('tools.equipmentLogStudio.description', 'Description')}
                value={newMaintenance.description}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                placeholder={t('tools.equipmentLogStudio.cost', 'Cost ($)')}
                value={newMaintenance.cost || ''}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
              <button
                onClick={addMaintenanceRecord}
                disabled={!newMaintenance.description}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.maintenanceHistory.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.maintenanceHistory.map(record => (
                  <div key={record.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{record.date}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      record.type === 'repair' ? 'bg-orange-500/20 text-orange-400' :
                      record.type === 'calibration' ? 'bg-blue-500/20 text-blue-400' :
                      record.type === 'upgrade' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>{record.type}</span>
                    <span className={`flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.description}</span>
                    {record.cost > 0 && (
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>${record.cost}</span>
                    )}
                    <button onClick={() => removeMaintenanceRecord(record.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.equipmentLogStudio.notes', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
              placeholder={t('tools.equipmentLogStudio.equipmentNotesSpecialHandlingInstructions', 'Equipment notes, special handling instructions...')}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveEquipment}
              disabled={!formData.name || !formData.brand}
              className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? t('tools.equipmentLogStudio.updateEquipment', 'Update Equipment') : t('tools.equipmentLogStudio.saveEquipment', 'Save Equipment')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#252525] text-white hover:bg-[#333]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {t('tools.equipmentLogStudio.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Equipment List */}
      <div className="space-y-4">
        {filteredEquipment.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <Settings className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.equipmentLogStudio.noEquipmentFound', 'No equipment found')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-[#0D9488] hover:underline"
            >
              {t('tools.equipmentLogStudio.addYourFirstPieceOf', 'Add your first piece of equipment')}
            </button>
          </div>
        ) : (
          filteredEquipment.map(item => (
            <div key={item.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.brand} {item.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${conditionColors[item.condition]}`}>
                      {conditions.find(c => c.value === item.condition)?.label}
                    </span>
                    {item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date() && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        {t('tools.equipmentLogStudio.warrantyExpired', 'Warranty Expired')}
                      </span>
                    )}
                    {item.nextMaintenance && new Date(item.nextMaintenance) <= new Date() && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        {t('tools.equipmentLogStudio.maintenanceDue2', 'Maintenance Due')}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.model} {item.serialNumber && `• S/N: ${item.serialNumber}`}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {categories.find(c => c.value === item.category)?.label} • {item.location}
                  </p>
                  {item.purchaseDate && (
                    <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar className="w-3 h-3" /> Purchased: {item.purchaseDate}
                    </p>
                  )}

                  {/* Expandable Maintenance History */}
                  {selectedEquipment === item.id && item.maintenanceHistory.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentLogStudio.maintenanceHistory', 'Maintenance History')}</h5>
                      {item.maintenanceHistory.map(record => (
                        <div key={record.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{record.date}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            record.type === 'repair' ? 'bg-orange-500/20 text-orange-400' :
                            record.type === 'calibration' ? 'bg-blue-500/20 text-blue-400' :
                            record.type === 'upgrade' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>{record.type}</span>
                          <span className={`flex-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.description}</span>
                          {record.cost > 0 && (
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>${record.cost}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-[#0D9488]">
                    ${item.currentValue.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.condition}
                      onChange={(e) => updateCondition(item.id, e.target.value as StudioEquipment['condition'])}
                      className={`text-xs p-1 rounded ${isDark ? 'bg-[#333] border-[#444] text-white' : 'bg-white border-gray-200'}`}
                    >
                      {conditions.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSelectedEquipment(selectedEquipment === item.id ? null : item.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                    >
                      <Wrench className="w-4 h-4 text-[#0D9488]" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4 text-[#0D9488]" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EquipmentLogStudioTool;
