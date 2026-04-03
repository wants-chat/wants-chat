'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Flower2,
  TreeDeciduous,
  Package,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Droplets,
  Sun,
  Thermometer,
  MapPin,
  Tag,
  Clock,
  BarChart3,
  RefreshCw,
  Boxes,
  Sprout,
  Leaf,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface PlantInventoryToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type PlantCategory = 'annual' | 'perennial' | 'shrub' | 'tree' | 'groundcover' | 'ornamental-grass' | 'vine' | 'bulb';
type SunRequirement = 'full-sun' | 'partial-sun' | 'partial-shade' | 'full-shade';
type WaterRequirement = 'low' | 'moderate' | 'high';
type MaterialCategory = 'mulch' | 'soil' | 'fertilizer' | 'stone' | 'edging' | 'fabric' | 'container' | 'other';
type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order';

interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: PlantCategory;
  sunRequirement: SunRequirement;
  waterRequirement: WaterRequirement;
  hardinessZoneMin: number;
  hardinessZoneMax: number;
  matureHeight: string;
  matureWidth: string;
  quantity: number;
  unitCost: number;
  sellPrice: number;
  supplier: string;
  location: string;
  stockStatus: StockStatus;
  reorderPoint: number;
  notes: string;
  lastRestocked: string;
  createdAt: string;
}

interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  unitCost: number;
  sellPrice: number;
  supplier: string;
  location: string;
  stockStatus: StockStatus;
  reorderPoint: number;
  notes: string;
  lastRestocked: string;
  createdAt: string;
}

// Constants
const PLANT_CATEGORIES: { value: PlantCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'annual', label: 'Annual', icon: <Flower2 className="w-4 h-4" /> },
  { value: 'perennial', label: 'Perennial', icon: <Flower2 className="w-4 h-4" /> },
  { value: 'shrub', label: 'Shrub', icon: <Leaf className="w-4 h-4" /> },
  { value: 'tree', label: 'Tree', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'groundcover', label: 'Groundcover', icon: <Sprout className="w-4 h-4" /> },
  { value: 'ornamental-grass', label: 'Ornamental Grass', icon: <Leaf className="w-4 h-4" /> },
  { value: 'vine', label: 'Vine', icon: <Sprout className="w-4 h-4" /> },
  { value: 'bulb', label: 'Bulb', icon: <Flower2 className="w-4 h-4" /> },
];

const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string }[] = [
  { value: 'mulch', label: 'Mulch' },
  { value: 'soil', label: 'Soil & Amendments' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'stone', label: 'Stone & Gravel' },
  { value: 'edging', label: 'Edging' },
  { value: 'fabric', label: 'Landscape Fabric' },
  { value: 'container', label: 'Containers' },
  { value: 'other', label: 'Other' },
];

const SUN_REQUIREMENTS: { value: SunRequirement; label: string; icon: React.ReactNode }[] = [
  { value: 'full-sun', label: 'Full Sun (6+ hrs)', icon: <Sun className="w-4 h-4 text-yellow-500" /> },
  { value: 'partial-sun', label: 'Partial Sun (4-6 hrs)', icon: <Sun className="w-4 h-4 text-yellow-400" /> },
  { value: 'partial-shade', label: 'Partial Shade (2-4 hrs)', icon: <Sun className="w-4 h-4 text-gray-400" /> },
  { value: 'full-shade', label: 'Full Shade (<2 hrs)', icon: <Sun className="w-4 h-4 text-gray-500" /> },
];

const WATER_REQUIREMENTS: { value: WaterRequirement; label: string; icon: React.ReactNode }[] = [
  { value: 'low', label: 'Low (Drought Tolerant)', icon: <Droplets className="w-4 h-4 text-blue-300" /> },
  { value: 'moderate', label: 'Moderate', icon: <Droplets className="w-4 h-4 text-blue-500" /> },
  { value: 'high', label: 'High', icon: <Droplets className="w-4 h-4 text-blue-700" /> },
];

const STATUS_COLORS: Record<StockStatus, string> = {
  'in-stock': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'low-stock': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'out-of-stock': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'on-order': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

// Column configuration for exports
const PLANT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Plant Name', type: 'string' },
  { key: 'scientificName', header: 'Scientific Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'sellPrice', header: 'Sell Price', type: 'currency' },
  { key: 'stockStatus', header: 'Status', type: 'string' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
];

const MATERIAL_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Material Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'sellPrice', header: 'Sell Price', type: 'currency' },
  { key: 'stockStatus', header: 'Status', type: 'string' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStockStatus = (quantity: number, reorderPoint: number): StockStatus => {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= reorderPoint) return 'low-stock';
  return 'in-stock';
};

// Main Component
export const PlantInventoryTool: React.FC<PlantInventoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: plants,
    addItem: addPlantToBackend,
    updateItem: updatePlantBackend,
    deleteItem: deletePlantBackend,
    isSynced: plantsSynced,
    isSaving: plantsSaving,
    lastSaved: plantsLastSaved,
    syncError: plantsSyncError,
    forceSync: forcePlantsSync,
  } = useToolData<Plant>('plant-inventory-plants', [], PLANT_COLUMNS);

  const {
    data: materials,
    addItem: addMaterialToBackend,
    updateItem: updateMaterialBackend,
    deleteItem: deleteMaterialBackend,
    isSynced: materialsSynced,
    isSaving: materialsSaving,
    lastSaved: materialsLastSaved,
    syncError: materialsSyncError,
    forceSync: forceMaterialsSync,
  } = useToolData<Material>('plant-inventory-materials', [], MATERIAL_COLUMNS);

  // Dialog hooks
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Local UI State
  const [activeTab, setActiveTab] = useState<'plants' | 'materials' | 'dashboard'>('plants');
  const [showPlantForm, setShowPlantForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Form states
  const [newPlant, setNewPlant] = useState<Partial<Plant>>({
    name: '',
    scientificName: '',
    category: 'perennial',
    sunRequirement: 'partial-sun',
    waterRequirement: 'moderate',
    hardinessZoneMin: 5,
    hardinessZoneMax: 9,
    matureHeight: '',
    matureWidth: '',
    quantity: 0,
    unitCost: 0,
    sellPrice: 0,
    supplier: '',
    location: '',
    reorderPoint: 5,
    notes: '',
  });

  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: '',
    category: 'mulch',
    quantity: 0,
    unit: 'cubic yard',
    unitCost: 0,
    sellPrice: 0,
    supplier: '',
    location: '',
    reorderPoint: 10,
    notes: '',
  });

  // Filtered data
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      const matchesSearch = searchTerm === '' ||
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || plant.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || plant.stockStatus === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [plants, searchTerm, filterCategory, filterStatus]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = searchTerm === '' ||
        material.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || material.stockStatus === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materials, searchTerm, filterCategory, filterStatus]);

  // Dashboard stats
  const stats = useMemo(() => {
    const totalPlantValue = plants.reduce((sum, p) => sum + (p.quantity * p.unitCost), 0);
    const totalMaterialValue = materials.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0);
    const lowStockPlants = plants.filter(p => p.stockStatus === 'low-stock' || p.stockStatus === 'out-of-stock').length;
    const lowStockMaterials = materials.filter(m => m.stockStatus === 'low-stock' || m.stockStatus === 'out-of-stock').length;

    return {
      totalPlants: plants.length,
      totalMaterials: materials.length,
      totalInventoryValue: totalPlantValue + totalMaterialValue,
      lowStockItems: lowStockPlants + lowStockMaterials,
      plantsByCategory: PLANT_CATEGORIES.map(cat => ({
        category: cat.label,
        count: plants.filter(p => p.category === cat.value).length,
      })),
    };
  }, [plants, materials]);

  // Add plant
  const handleAddPlant = () => {
    if (!newPlant.name) {
      setValidationMessage('Please enter a plant name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const plant: Plant = {
      id: generateId(),
      name: newPlant.name || '',
      scientificName: newPlant.scientificName || '',
      category: newPlant.category || 'perennial',
      sunRequirement: newPlant.sunRequirement || 'partial-sun',
      waterRequirement: newPlant.waterRequirement || 'moderate',
      hardinessZoneMin: newPlant.hardinessZoneMin || 5,
      hardinessZoneMax: newPlant.hardinessZoneMax || 9,
      matureHeight: newPlant.matureHeight || '',
      matureWidth: newPlant.matureWidth || '',
      quantity: newPlant.quantity || 0,
      unitCost: newPlant.unitCost || 0,
      sellPrice: newPlant.sellPrice || 0,
      supplier: newPlant.supplier || '',
      location: newPlant.location || '',
      stockStatus: getStockStatus(newPlant.quantity || 0, newPlant.reorderPoint || 5),
      reorderPoint: newPlant.reorderPoint || 5,
      notes: newPlant.notes || '',
      lastRestocked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    addPlantToBackend(plant);
    setShowPlantForm(false);
    resetPlantForm();
  };

  // Add material
  const handleAddMaterial = () => {
    if (!newMaterial.name) {
      setValidationMessage('Please enter a material name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const material: Material = {
      id: generateId(),
      name: newMaterial.name || '',
      category: newMaterial.category || 'mulch',
      quantity: newMaterial.quantity || 0,
      unit: newMaterial.unit || 'cubic yard',
      unitCost: newMaterial.unitCost || 0,
      sellPrice: newMaterial.sellPrice || 0,
      supplier: newMaterial.supplier || '',
      location: newMaterial.location || '',
      stockStatus: getStockStatus(newMaterial.quantity || 0, newMaterial.reorderPoint || 10),
      reorderPoint: newMaterial.reorderPoint || 10,
      notes: newMaterial.notes || '',
      lastRestocked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    addMaterialToBackend(material);
    setShowMaterialForm(false);
    resetMaterialForm();
  };

  // Update quantity
  const updatePlantQuantity = (id: string, newQuantity: number) => {
    const plant = plants.find(p => p.id === id);
    if (plant) {
      updatePlantBackend(id, {
        quantity: newQuantity,
        stockStatus: getStockStatus(newQuantity, plant.reorderPoint),
        lastRestocked: new Date().toISOString(),
      });
    }
  };

  const updateMaterialQuantity = (id: string, newQuantity: number) => {
    const material = materials.find(m => m.id === id);
    if (material) {
      updateMaterialBackend(id, {
        quantity: newQuantity,
        stockStatus: getStockStatus(newQuantity, material.reorderPoint),
        lastRestocked: new Date().toISOString(),
      });
    }
  };

  // Delete handlers
  const handleDeletePlant = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Plant',
      message: 'Are you sure you want to delete this plant? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePlantBackend(id);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteMaterialBackend(id);
    }
  };

  // Reset forms
  const resetPlantForm = () => {
    setNewPlant({
      name: '',
      scientificName: '',
      category: 'perennial',
      sunRequirement: 'partial-sun',
      waterRequirement: 'moderate',
      hardinessZoneMin: 5,
      hardinessZoneMax: 9,
      matureHeight: '',
      matureWidth: '',
      quantity: 0,
      unitCost: 0,
      sellPrice: 0,
      supplier: '',
      location: '',
      reorderPoint: 5,
      notes: '',
    });
  };

  const resetMaterialForm = () => {
    setNewMaterial({
      name: '',
      category: 'mulch',
      quantity: 0,
      unit: 'cubic yard',
      unitCost: 0,
      sellPrice: 0,
      supplier: '',
      location: '',
      reorderPoint: 10,
      notes: '',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg z-40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{validationMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flower2 className="w-7 h-7 text-green-600" />
            {t('tools.plantInventory.plantMaterialInventory', 'Plant & Material Inventory')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('tools.plantInventory.trackPlantsMaterialsAndLandscaping', 'Track plants, materials, and landscaping supplies')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="plant-inventory" toolName="Plant Inventory" />

          <SyncStatus
            isSynced={plantsSynced && materialsSynced}
            isSaving={plantsSaving || materialsSaving}
            lastSaved={plantsLastSaved || materialsLastSaved}
            error={plantsSyncError || materialsSyncError}
          />
          <ExportDropdown
            data={activeTab === 'plants' ? filteredPlants : filteredMaterials}
            columns={activeTab === 'plants' ? PLANT_COLUMNS : MATERIAL_COLUMNS}
            filename={activeTab === 'plants' ? 'plant-inventory' : 'material-inventory'}
            title={activeTab === 'plants' ? t('tools.plantInventory.plantInventory', 'Plant Inventory') : t('tools.plantInventory.materialInventory', 'Material Inventory')}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['plants', 'materials', 'dashboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
            }}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Flower2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.plantInventory.plantTypes', 'Plant Types')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPlants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.plantInventory.materials', 'Materials')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMaterials}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.plantInventory.inventoryValue', 'Inventory Value')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalInventoryValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.plantInventory.lowStockItems', 'Low Stock Items')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alerts */}
          {stats.lowStockItems > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  {t('tools.plantInventory.lowStockAlerts', 'Low Stock Alerts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plants.filter(p => p.stockStatus === 'low-stock' || p.stockStatus === 'out-of-stock').map(plant => (
                    <div key={plant.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Flower2 className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{plant.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {plant.quantity} | Reorder at: {plant.reorderPoint}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[plant.stockStatus]}`}>
                        {plant.stockStatus}
                      </span>
                    </div>
                  ))}
                  {materials.filter(m => m.stockStatus === 'low-stock' || m.stockStatus === 'out-of-stock').map(material => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {material.quantity} {material.unit} | Reorder at: {material.reorderPoint}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[material.stockStatus]}`}>
                        {material.stockStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Plants Tab */}
      {activeTab === 'plants' && (
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.plantInventory.searchPlants', 'Search plants...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.plantInventory.allCategories', 'All Categories')}</option>
                {PLANT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.plantInventory.allStatus', 'All Status')}</option>
                <option value="in-stock">{t('tools.plantInventory.inStock', 'In Stock')}</option>
                <option value="low-stock">{t('tools.plantInventory.lowStock', 'Low Stock')}</option>
                <option value="out-of-stock">{t('tools.plantInventory.outOfStock', 'Out of Stock')}</option>
                <option value="on-order">{t('tools.plantInventory.onOrder', 'On Order')}</option>
              </select>
            </div>
            <button
              onClick={() => setShowPlantForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.plantInventory.addPlant2', 'Add Plant')}
            </button>
          </div>

          {/* Plants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlants.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Flower2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('tools.plantInventory.noPlantsFound', 'No plants found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredPlants.map((plant) => (
                <Card key={plant.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{plant.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{plant.scientificName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[plant.stockStatus]}`}>
                        {plant.stockStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {PLANT_CATEGORIES.find(c => c.value === plant.category)?.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Boxes className="w-4 h-4" />
                          Qty: {plant.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {SUN_REQUIREMENTS.find(s => s.value === plant.sunRequirement)?.icon}
                          {SUN_REQUIREMENTS.find(s => s.value === plant.sunRequirement)?.label.split(' ')[0]} Sun
                        </span>
                        <span className="flex items-center gap-1">
                          {WATER_REQUIREMENTS.find(w => w.value === plant.waterRequirement)?.icon}
                          {WATER_REQUIREMENTS.find(w => w.value === plant.waterRequirement)?.label.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-4 h-4" />
                          Zones {plant.hardinessZoneMin}-{plant.hardinessZoneMax}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(plant.sellPrice)}
                        </span>
                      </div>
                      {plant.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {plant.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <input
                        type="number"
                        min="0"
                        value={plant.quantity}
                        onChange={(e) => updatePlantQuantity(plant.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleDeletePlant(plant.id)}
                        className="ml-auto p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.plantInventory.searchMaterials', 'Search materials...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.plantInventory.allCategories2', 'All Categories')}</option>
                {MATERIAL_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.plantInventory.allStatus2', 'All Status')}</option>
                <option value="in-stock">{t('tools.plantInventory.inStock2', 'In Stock')}</option>
                <option value="low-stock">{t('tools.plantInventory.lowStock2', 'Low Stock')}</option>
                <option value="out-of-stock">{t('tools.plantInventory.outOfStock2', 'Out of Stock')}</option>
                <option value="on-order">{t('tools.plantInventory.onOrder2', 'On Order')}</option>
              </select>
            </div>
            <button
              onClick={() => setShowMaterialForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.plantInventory.addMaterial2', 'Add Material')}
            </button>
          </div>

          {/* Materials Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.plantInventory.material', 'Material')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.plantInventory.category', 'Category')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.plantInventory.quantity', 'Quantity')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.plantInventory.unitCost', 'Unit Cost')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.plantInventory.sellPrice', 'Sell Price')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.plantInventory.status', 'Status')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.plantInventory.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('tools.plantInventory.noMaterialsFound', 'No materials found')}
                        </td>
                      </tr>
                    ) : (
                      filteredMaterials.map((material) => (
                        <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                              {material.supplier && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{material.supplier}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {MATERIAL_CATEGORIES.find(c => c.value === material.category)?.label}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={material.quantity}
                              onChange={(e) => updateMaterialQuantity(material.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="ml-1 text-gray-500 dark:text-gray-400">{material.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(material.unitCost)}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(material.sellPrice)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[material.stockStatus]}`}>
                              {material.stockStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Plant Modal */}
      {showPlantForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.plantInventory.addPlant', 'Add Plant')}</CardTitle>
              <button onClick={() => setShowPlantForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.plantName', 'Plant Name *')}</label>
                  <input
                    type="text"
                    value={newPlant.name}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.plantInventory.eGBlackEyedSusan', 'e.g., Black-Eyed Susan')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.scientificName', 'Scientific Name')}</label>
                  <input
                    type="text"
                    value={newPlant.scientificName}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, scientificName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.plantInventory.eGRudbeckiaHirta', 'e.g., Rudbeckia hirta')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.category2', 'Category')}</label>
                  <select
                    value={newPlant.category}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, category: e.target.value as PlantCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {PLANT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.sunRequirement', 'Sun Requirement')}</label>
                  <select
                    value={newPlant.sunRequirement}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, sunRequirement: e.target.value as SunRequirement }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {SUN_REQUIREMENTS.map(sun => (
                      <option key={sun.value} value={sun.value}>{sun.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.waterRequirement', 'Water Requirement')}</label>
                  <select
                    value={newPlant.waterRequirement}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, waterRequirement: e.target.value as WaterRequirement }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {WATER_REQUIREMENTS.map(water => (
                      <option key={water.value} value={water.value}>{water.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.zoneMin', 'Zone Min')}</label>
                    <input
                      type="number"
                      min="1"
                      max="13"
                      value={newPlant.hardinessZoneMin}
                      onChange={(e) => setNewPlant(prev => ({ ...prev, hardinessZoneMin: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.zoneMax', 'Zone Max')}</label>
                    <input
                      type="number"
                      min="1"
                      max="13"
                      value={newPlant.hardinessZoneMax}
                      onChange={(e) => setNewPlant(prev => ({ ...prev, hardinessZoneMax: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.quantity2', 'Quantity')}</label>
                  <input
                    type="number"
                    min="0"
                    value={newPlant.quantity}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.unitCost2', 'Unit Cost ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPlant.unitCost}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.sellPrice2', 'Sell Price ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPlant.sellPrice}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, sellPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.supplier', 'Supplier')}</label>
                  <input
                    type="text"
                    value={newPlant.supplier}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.location', 'Location')}</label>
                  <input
                    type="text"
                    value={newPlant.location}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.plantInventory.eGGreenhouseARow', 'e.g., Greenhouse A, Row 3')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.notes', 'Notes')}</label>
                <textarea
                  value={newPlant.notes}
                  onChange={(e) => setNewPlant(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowPlantForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.plantInventory.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddPlant}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.plantInventory.addPlant3', 'Add Plant')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Material Modal */}
      {showMaterialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.plantInventory.addMaterial', 'Add Material')}</CardTitle>
              <button onClick={() => setShowMaterialForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.materialName', 'Material Name *')}</label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('tools.plantInventory.eGHardwoodMulch', 'e.g., Hardwood Mulch')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.category3', 'Category')}</label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, category: e.target.value as MaterialCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {MATERIAL_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.unit', 'Unit')}</label>
                  <input
                    type="text"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.plantInventory.eGCubicYardBag', 'e.g., cubic yard, bag, ton')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.quantity3', 'Quantity')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.unitCost3', 'Unit Cost ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMaterial.unitCost}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.sellPrice3', 'Sell Price ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMaterial.sellPrice}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, sellPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.supplier2', 'Supplier')}</label>
                  <input
                    type="text"
                    value={newMaterial.supplier}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.location2', 'Location')}</label>
                  <input
                    type="text"
                    value={newMaterial.location}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.plantInventory.notes2', 'Notes')}</label>
                <textarea
                  value={newMaterial.notes}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowMaterialForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.plantInventory.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddMaterial}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.plantInventory.addMaterial3', 'Add Material')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default PlantInventoryTool;
