'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Sprout,
  MapPin,
  Calendar,
  Droplets,
  Sun,
  CloudRain,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  Search,
  Filter,
  Leaf,
  Wheat,
  TreeDeciduous,
  Info,
  AlertTriangle,
  ThermometerSun,
  Wind
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface CropTrackerToolProps {
  uiConfig?: UIConfig;
}

type GrowthStage = 'planning' | 'planted' | 'germinating' | 'growing' | 'flowering' | 'harvesting' | 'harvested';
type CropCategory = 'vegetables' | 'fruits' | 'grains' | 'legumes' | 'herbs' | 'other';
type InputType = 'seeds' | 'fertilizer' | 'pesticide' | 'water' | 'other';
type ActiveTab = 'crops' | 'fields' | 'inputs' | 'harvest' | 'reports';

interface Field {
  id: string;
  name: string;
  size: number; // acres
  soilType: string;
  notes: string;
  createdAt: string;
}

interface Crop {
  id: string;
  name: string;
  variety: string;
  category: CropCategory;
  fieldId: string;
  area: number; // acres planted
  plantingDate: string;
  expectedHarvestDate: string;
  stage: GrowthStage;
  expectedYield: number;
  actualYield?: number;
  yieldUnit: string;
  season: string;
  year: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CropInput {
  id: string;
  cropId: string;
  type: InputType;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  date: string;
  notes: string;
}

interface WeatherNote {
  id: string;
  cropId: string;
  date: string;
  condition: string;
  temperature?: number;
  rainfall?: number;
  notes: string;
}

interface CropCost {
  id: string;
  cropId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

interface CropTrackerData {
  crops: Crop[];
  fields: Field[];
  inputs: CropInput[];
  weatherNotes: WeatherNote[];
  costs: CropCost[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const stageColors: Record<GrowthStage, { bg: string; text: string }> = {
  planning: { bg: 'bg-gray-500/20', text: 'text-gray-500' },
  planted: { bg: 'bg-amber-500/20', text: 'text-amber-500' },
  germinating: { bg: 'bg-lime-500/20', text: 'text-lime-500' },
  growing: { bg: 'bg-green-500/20', text: 'text-green-500' },
  flowering: { bg: 'bg-pink-500/20', text: 'text-pink-500' },
  harvesting: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
  harvested: { bg: 'bg-teal-500/20', text: 'text-teal-500' },
};

const stageOrder: GrowthStage[] = ['planning', 'planted', 'germinating', 'growing', 'flowering', 'harvesting', 'harvested'];

const categoryIcons: Record<CropCategory, React.ReactNode> = {
  vegetables: <Leaf className="w-4 h-4" />,
  fruits: <TreeDeciduous className="w-4 h-4" />,
  grains: <Wheat className="w-4 h-4" />,
  legumes: <Sprout className="w-4 h-4" />,
  herbs: <Leaf className="w-4 h-4" />,
  other: <Sprout className="w-4 h-4" />,
};

const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky', 'Mixed'];
const costCategories = ['Labor', 'Equipment', 'Seeds', 'Fertilizer', 'Pesticides', 'Irrigation', 'Transportation', 'Storage', 'Other'];

// Column configurations for export
const cropColumns: ColumnConfig[] = [
  { key: 'name', header: 'Crop Name', type: 'string' },
  { key: 'variety', header: 'Variety', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'area', header: 'Area (acres)', type: 'number' },
  { key: 'plantingDate', header: 'Planting Date', type: 'date' },
  { key: 'expectedHarvestDate', header: 'Expected Harvest', type: 'date' },
  { key: 'stage', header: 'Growth Stage', type: 'string' },
  { key: 'expectedYield', header: 'Expected Yield', type: 'number' },
  { key: 'actualYield', header: 'Actual Yield', type: 'number' },
  { key: 'yieldUnit', header: 'Yield Unit', type: 'string' },
  { key: 'season', header: 'Season', type: 'string' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const generateSampleData = (): CropTrackerData => {
  const currentYear = new Date().getFullYear();

  const fields: Field[] = [
    { id: generateId(), name: 'North Field', size: 50, soilType: 'Loamy', notes: 'Good drainage, near irrigation', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'South Field', size: 75, soilType: 'Clay', notes: 'Heavy soil, needs amendment', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'East Orchard', size: 25, soilType: 'Sandy', notes: 'Fruit trees section', createdAt: new Date().toISOString() },
  ];

  const crops: Crop[] = [
    {
      id: generateId(),
      name: 'Corn',
      variety: 'Sweet Corn Golden Bantam',
      category: 'grains',
      fieldId: fields[0].id,
      area: 30,
      plantingDate: `${currentYear}-04-15`,
      expectedHarvestDate: `${currentYear}-08-20`,
      stage: 'growing',
      expectedYield: 150,
      yieldUnit: 'bushels/acre',
      season: 'Spring',
      year: currentYear,
      notes: 'Planted in rows with 30-inch spacing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Tomatoes',
      variety: 'Roma VF',
      category: 'vegetables',
      fieldId: fields[1].id,
      area: 10,
      plantingDate: `${currentYear}-05-01`,
      expectedHarvestDate: `${currentYear}-08-15`,
      stage: 'flowering',
      expectedYield: 25,
      yieldUnit: 'tons/acre',
      season: 'Spring',
      year: currentYear,
      notes: 'Staked tomatoes, drip irrigation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Apples',
      variety: 'Honeycrisp',
      category: 'fruits',
      fieldId: fields[2].id,
      area: 20,
      plantingDate: `${currentYear - 3}-03-20`,
      expectedHarvestDate: `${currentYear}-09-15`,
      stage: 'growing',
      expectedYield: 400,
      yieldUnit: 'bushels/acre',
      season: 'Spring',
      year: currentYear,
      notes: 'Established orchard, 4th year',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const inputs: CropInput[] = [
    { id: generateId(), cropId: crops[0].id, type: 'seeds', name: 'Golden Bantam Seed', quantity: 50, unit: 'lbs', cost: 250, date: `${currentYear}-04-10`, notes: 'Organic certified' },
    { id: generateId(), cropId: crops[0].id, type: 'fertilizer', name: 'NPK 10-10-10', quantity: 500, unit: 'lbs', cost: 180, date: `${currentYear}-04-14`, notes: 'Pre-plant application' },
    { id: generateId(), cropId: crops[1].id, type: 'water', name: 'Irrigation', quantity: 1000, unit: 'gallons', cost: 50, date: `${currentYear}-05-15`, notes: 'Weekly drip irrigation' },
  ];

  const weatherNotes: WeatherNote[] = [
    { id: generateId(), cropId: crops[0].id, date: `${currentYear}-05-10`, condition: 'Sunny', temperature: 75, rainfall: 0, notes: 'Good growing conditions' },
    { id: generateId(), cropId: crops[1].id, date: `${currentYear}-05-20`, condition: 'Rainy', temperature: 68, rainfall: 1.5, notes: 'Heavy rain, checked drainage' },
  ];

  const costs: CropCost[] = [
    { id: generateId(), cropId: crops[0].id, category: 'Labor', description: 'Planting crew', amount: 1500, date: `${currentYear}-04-15` },
    { id: generateId(), cropId: crops[0].id, category: 'Equipment', description: 'Tractor rental', amount: 800, date: `${currentYear}-04-14` },
    { id: generateId(), cropId: crops[1].id, category: 'Labor', description: 'Transplanting', amount: 600, date: `${currentYear}-05-01` },
  ];

  return { crops, fields, inputs, weatherNotes, costs };
};

export const CropTrackerTool: React.FC<CropTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('crops');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<GrowthStage | 'all'>('all');
  const [filterField, setFilterField] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<CropCategory | 'all'>('all');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use hook for crops with backend sync
  const {
    data: crops,
    addItem: addCrop,
    updateItem: updateCrop,
    deleteItem: deleteCrop,
    exportCSV: exportCropsCSV,
    exportExcel: exportCropsExcel,
    exportJSON: exportCropsJSON,
    exportPDF: exportCropsPDF,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Crop>('crop-tracker', [], cropColumns);

  // Data states (local storage)
  const [fields, setFields] = useState<Field[]>([]);
  const [inputs, setInputs] = useState<CropInput[]>([]);
  const [weatherNotes, setWeatherNotes] = useState<WeatherNote[]>([]);
  const [costs, setCosts] = useState<CropCost[]>([]);

  // Form states
  const [showCropForm, setShowCropForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showInputForm, setShowInputForm] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [showWeatherForm, setShowWeatherForm] = useState(false);
  const [editingCropId, setEditingCropId] = useState<string | null>(null);

  // Form data
  const [cropForm, setCropForm] = useState<Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    variety: '',
    category: 'vegetables',
    fieldId: '',
    area: 0,
    plantingDate: '',
    expectedHarvestDate: '',
    stage: 'planning',
    expectedYield: 0,
    yieldUnit: 'bushels/acre',
    season: 'Spring',
    year: new Date().getFullYear(),
    notes: '',
  });

  const [fieldForm, setFieldForm] = useState<Omit<Field, 'id' | 'createdAt'>>({
    name: '',
    size: 0,
    soilType: 'Loamy',
    notes: '',
  });

  const [inputForm, setInputForm] = useState<Omit<CropInput, 'id'>>({
    cropId: '',
    type: 'seeds',
    name: '',
    quantity: 0,
    unit: '',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [costForm, setCostForm] = useState<Omit<CropCost, 'id'>>({
    cropId: '',
    category: 'Labor',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const [weatherForm, setWeatherForm] = useState<Omit<WeatherNote, 'id'>>({
    cropId: '',
    date: new Date().toISOString().split('T')[0],
    condition: 'Sunny',
    temperature: undefined,
    rainfall: undefined,
    notes: '',
  });

  // Load other data from localStorage (not crops, which are handled by useToolData)
  useEffect(() => {
    const saved = localStorage.getItem('crop-tracker-data');
    if (saved) {
      try {
        const data: CropTrackerData = JSON.parse(saved);
        setFields(data.fields || []);
        setInputs(data.inputs || []);
        setWeatherNotes(data.weatherNotes || []);
        setCosts(data.costs || []);
      } catch (e) {
        console.error('Error loading crop tracker data:', e);
      }
    }
  }, []);

  // Save other data to localStorage (crops are handled by useToolData)
  useEffect(() => {
    const data: CropTrackerData = { crops, fields, inputs, weatherNotes, costs };
    localStorage.setItem('crop-tracker-data', JSON.stringify(data));
  }, [fields, inputs, weatherNotes, costs]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description) {
        setCropForm(prev => ({
          ...prev,
          name: params.title || prev.name,
          notes: params.description || prev.notes,
        }));
        setShowCropForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig, isPrefilled]);

  // Load sample data
  const loadSampleData = () => {
    const sample = generateSampleData();
    sample.crops.forEach(crop => addCrop(crop));
    setFields(sample.fields);
    setInputs(sample.inputs);
    setWeatherNotes(sample.weatherNotes);
    setCosts(sample.costs);
  };

  // Filtered crops
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      const matchesSearch = searchQuery === '' ||
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = filterStage === 'all' || crop.stage === filterStage;
      const matchesField = filterField === 'all' || crop.fieldId === filterField;
      const matchesCategory = filterCategory === 'all' || crop.category === filterCategory;
      const matchesYear = crop.year === filterYear;
      return matchesSearch && matchesStage && matchesField && matchesCategory && matchesYear;
    });
  }, [crops, searchQuery, filterStage, filterField, filterCategory, filterYear]);

  // CRUD handlers
  const handleAddCrop = () => {
    if (!cropForm.name || !cropForm.fieldId) return;
    const now = new Date().toISOString();
    if (editingCropId) {
      updateCrop(editingCropId, { ...cropForm, updatedAt: now });
      setEditingCropId(null);
    } else {
      addCrop({ ...cropForm, id: generateId(), createdAt: now, updatedAt: now });
    }
    resetCropForm();
  };

  const handleEditCrop = (crop: Crop) => {
    setCropForm({
      name: crop.name,
      variety: crop.variety,
      category: crop.category,
      fieldId: crop.fieldId,
      area: crop.area,
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      stage: crop.stage,
      expectedYield: crop.expectedYield,
      actualYield: crop.actualYield,
      yieldUnit: crop.yieldUnit,
      season: crop.season,
      year: crop.year,
      notes: crop.notes,
    });
    setEditingCropId(crop.id);
    setShowCropForm(true);
  };

  const handleDeleteCrop = (id: string) => {
    deleteCrop(id);
    setInputs(inputs.filter(i => i.cropId !== id));
    setWeatherNotes(weatherNotes.filter(w => w.cropId !== id));
    setCosts(costs.filter(c => c.cropId !== id));
  };

  const handleUpdateStage = (id: string, stage: GrowthStage) => {
    updateCrop(id, { stage, updatedAt: new Date().toISOString() });
  };

  const resetCropForm = () => {
    setCropForm({
      name: '',
      variety: '',
      category: 'vegetables',
      fieldId: '',
      area: 0,
      plantingDate: '',
      expectedHarvestDate: '',
      stage: 'planning',
      expectedYield: 0,
      yieldUnit: 'bushels/acre',
      season: 'Spring',
      year: new Date().getFullYear(),
      notes: '',
    });
    setShowCropForm(false);
    setEditingCropId(null);
  };

  const handleAddField = () => {
    if (!fieldForm.name) return;
    setFields([...fields, { ...fieldForm, id: generateId(), createdAt: new Date().toISOString() }]);
    setFieldForm({ name: '', size: 0, soilType: 'Loamy', notes: '' });
    setShowFieldForm(false);
  };

  const handleDeleteField = (id: string) => {
    const cropsInField = crops.filter(c => c.fieldId === id);
    if (cropsInField.length > 0) {
      setValidationMessage('Cannot delete field with active crops. Please remove or reassign crops first.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setFields(fields.filter(f => f.id !== id));
  };

  const handleAddInput = () => {
    if (!inputForm.cropId || !inputForm.name) return;
    setInputs([...inputs, { ...inputForm, id: generateId() }]);
    setInputForm({ cropId: '', type: 'seeds', name: '', quantity: 0, unit: '', cost: 0, date: new Date().toISOString().split('T')[0], notes: '' });
    setShowInputForm(false);
  };

  const handleDeleteInput = (id: string) => {
    setInputs(inputs.filter(i => i.id !== id));
  };

  const handleAddCost = () => {
    if (!costForm.cropId || !costForm.description) return;
    setCosts([...costs, { ...costForm, id: generateId() }]);
    setCostForm({ cropId: '', category: 'Labor', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });
    setShowCostForm(false);
  };

  const handleDeleteCost = (id: string) => {
    setCosts(costs.filter(c => c.id !== id));
  };

  const handleRecordHarvest = (cropId: string, actualYield: number) => {
    setCrops(crops.map(c => c.id === cropId ? { ...c, actualYield, stage: 'harvested', updatedAt: new Date().toISOString() } : c));
  };

  // Calculations for reports
  const totalAcres = useMemo(() => fields.reduce((sum, f) => sum + f.size, 0), [fields]);
  const plantedAcres = useMemo(() => crops.filter(c => c.stage !== 'planning' && c.year === filterYear).reduce((sum, c) => sum + c.area, 0), [crops, filterYear]);
  const totalInputCosts = useMemo(() => inputs.reduce((sum, i) => sum + i.cost, 0), [inputs]);
  const totalOtherCosts = useMemo(() => costs.reduce((sum, c) => sum + c.amount, 0), [costs]);
  const totalCosts = totalInputCosts + totalOtherCosts;

  const getCropCosts = (cropId: string) => {
    const inputCost = inputs.filter(i => i.cropId === cropId).reduce((sum, i) => sum + i.cost, 0);
    const otherCost = costs.filter(c => c.cropId === cropId).reduce((sum, c) => sum + c.amount, 0);
    return inputCost + otherCost;
  };

  const getFieldName = (fieldId: string) => fields.find(f => f.id === fieldId)?.name || 'Unknown';

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'crops', label: 'Crops', icon: <Sprout className="w-4 h-4" /> },
    { id: 'fields', label: 'Fields', icon: <MapPin className="w-4 h-4" /> },
    { id: 'inputs', label: 'Inputs', icon: <Package className="w-4 h-4" /> },
    { id: 'harvest', label: 'Harvest', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const inputClass = `w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`;
  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`;
  const buttonClass = 'px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600';
  const secondaryButtonClass = `px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Sprout className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cropTracker.cropTracker', 'Crop Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.manageCropsFieldsAndHarvests', 'Manage crops, fields, and harvests')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {crops.length === 0 && fields.length === 0 && (
              <button onClick={loadSampleData} className="text-sm text-teal-500 hover:text-teal-600">
                {t('tools.cropTracker.loadSampleData', 'Load Sample Data')}
              </button>
            )}
            <WidgetEmbedButton toolSlug="crop-tracker" toolName="Crop Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={exportCropsCSV}
              onExportExcel={exportCropsExcel}
              onExportJSON={exportCropsJSON}
              onExportPDF={exportCropsPDF}
              onPrint={() => print('Crop Tracker Report')}
              onCopyToClipboard={() => copyUtil(crops, cropColumns)}
              disabled={crops.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}>
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.totalAcres', 'Total Acres')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalAcres.toFixed(1)}</p>
          </div>
          <div className={cardClass}>
            <div className="flex items-center gap-2">
              <Sprout className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Planted ({filterYear})</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plantedAcres.toFixed(1)} ac</p>
          </div>
          <div className={cardClass}>
            <div className="flex items-center gap-2">
              <Leaf className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.activeCrops', 'Active Crops')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{crops.filter(c => c.stage !== 'harvested' && c.year === filterYear).length}</p>
          </div>
          <div className={cardClass}>
            <div className="flex items-center gap-2">
              <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.totalCosts', 'Total Costs')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalCosts)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                activeTab === tab.id ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Crops Tab */}
        {activeTab === 'crops' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.cropTracker.searchCrops', 'Search crops...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <select value={filterStage} onChange={(e) => setFilterStage(e.target.value as GrowthStage | 'all')} className={inputClass} style={{ width: 'auto' }}>
                <option value="all">{t('tools.cropTracker.allStages', 'All Stages')}</option>
                {stageOrder.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <select value={filterField} onChange={(e) => setFilterField(e.target.value)} className={inputClass} style={{ width: 'auto' }}>
                <option value="all">{t('tools.cropTracker.allFields', 'All Fields')}</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))} className={inputClass} style={{ width: 'auto' }}>
                {[...new Set(crops.map(c => c.year)), new Date().getFullYear()].sort((a, b) => b - a).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {fields.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.cropTracker.addAFieldFirstBefore', 'Add a field first before creating crops')}</p>
                <button onClick={() => setActiveTab('fields')} className="mt-2 text-teal-500 hover:underline">
                  {t('tools.cropTracker.goToFields', 'Go to Fields')}
                </button>
              </div>
            ) : (
              <>
                {!showCropForm && (
                  <button
                    onClick={() => setShowCropForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.cropTracker.addCrop', 'Add Crop')}
                  </button>
                )}

                {showCropForm && (
                  <div className={`${cardClass} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {editingCropId ? t('tools.cropTracker.editCrop', 'Edit Crop') : t('tools.cropTracker.addNewCrop', 'Add New Crop')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.cropName', 'Crop Name *')}</label>
                        <input type="text" value={cropForm.name} onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.eGCorn', 'e.g., Corn')} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.variety', 'Variety')}</label>
                        <input type="text" value={cropForm.variety} onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.eGSweetCorn', 'e.g., Sweet Corn')} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.category', 'Category')}</label>
                        <select value={cropForm.category} onChange={(e) => setCropForm({ ...cropForm, category: e.target.value as CropCategory })} className={inputClass}>
                          <option value="vegetables">{t('tools.cropTracker.vegetables', 'Vegetables')}</option>
                          <option value="fruits">{t('tools.cropTracker.fruits', 'Fruits')}</option>
                          <option value="grains">{t('tools.cropTracker.grains', 'Grains')}</option>
                          <option value="legumes">{t('tools.cropTracker.legumes', 'Legumes')}</option>
                          <option value="herbs">{t('tools.cropTracker.herbs', 'Herbs')}</option>
                          <option value="other">{t('tools.cropTracker.other', 'Other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.field', 'Field *')}</label>
                        <select value={cropForm.fieldId} onChange={(e) => setCropForm({ ...cropForm, fieldId: e.target.value })} className={inputClass}>
                          <option value="">{t('tools.cropTracker.selectField', 'Select Field')}</option>
                          {fields.map(f => <option key={f.id} value={f.id}>{f.name} ({f.size} ac)</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.areaAcres', 'Area (acres)')}</label>
                        <input type="number" value={cropForm.area || ''} onChange={(e) => setCropForm({ ...cropForm, area: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.growthStage', 'Growth Stage')}</label>
                        <select value={cropForm.stage} onChange={(e) => setCropForm({ ...cropForm, stage: e.target.value as GrowthStage })} className={inputClass}>
                          {stageOrder.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.plantingDate', 'Planting Date')}</label>
                        <input type="date" value={cropForm.plantingDate} onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.expectedHarvest', 'Expected Harvest')}</label>
                        <input type="date" value={cropForm.expectedHarvestDate} onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.season', 'Season')}</label>
                        <select value={cropForm.season} onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })} className={inputClass}>
                          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.expectedYield', 'Expected Yield')}</label>
                        <input type="number" value={cropForm.expectedYield || ''} onChange={(e) => setCropForm({ ...cropForm, expectedYield: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.yieldUnit', 'Yield Unit')}</label>
                        <input type="text" value={cropForm.yieldUnit} onChange={(e) => setCropForm({ ...cropForm, yieldUnit: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.bushelsAcre', 'bushels/acre')} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.year', 'Year')}</label>
                        <input type="number" value={cropForm.year} onChange={(e) => setCropForm({ ...cropForm, year: parseInt(e.target.value) || new Date().getFullYear() })} className={inputClass} />
                      </div>
                      <div className="col-span-full">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.notes', 'Notes')}</label>
                        <textarea value={cropForm.notes} onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })} className={`${inputClass} h-20`} placeholder={t('tools.cropTracker.additionalNotes', 'Additional notes...')} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={resetCropForm} className={secondaryButtonClass}>{t('tools.cropTracker.cancel', 'Cancel')}</button>
                      <button onClick={handleAddCrop} className={buttonClass}>{editingCropId ? t('tools.cropTracker.update', 'Update') : t('tools.cropTracker.add', 'Add')} Crop</button>
                    </div>
                  </div>
                )}

                {/* Crop Cards */}
                <div className="grid gap-4">
                  {filteredCrops.map((crop) => {
                    const field = fields.find(f => f.id === crop.fieldId);
                    const daysToHarvest = crop.expectedHarvestDate ? getDaysUntil(crop.expectedHarvestDate) : null;
                    const cropCost = getCropCosts(crop.id);

                    return (
                      <div key={crop.id} className={cardClass}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stageColors[crop.stage].bg}`}>
                              {categoryIcons[crop.category]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{crop.name}</h4>
                                {crop.variety && <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({crop.variety})</span>}
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {field?.name} | {crop.area} acres | {crop.season} {crop.year}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${stageColors[crop.stage].bg} ${stageColors[crop.stage].text}`}>
                              {crop.stage.charAt(0).toUpperCase() + crop.stage.slice(1)}
                            </span>
                            <button onClick={() => handleEditCrop(crop)} className={`p-2 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} rounded-lg hover:bg-gray-200/20`}>
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteCrop(crop.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className={`mt-3 flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {crop.plantingDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Planted: {formatDate(crop.plantingDate)}</span>}
                          {daysToHarvest !== null && (
                            <span className={`flex items-center gap-1 ${daysToHarvest <= 7 ? 'text-orange-500' : ''}`}>
                              <Sun className="w-4 h-4" />
                              {daysToHarvest < 0 ? `${Math.abs(daysToHarvest)} days past harvest` : daysToHarvest === 0 ? 'Harvest today!' : `${daysToHarvest} days to harvest`}
                            </span>
                          )}
                          <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Expected: {crop.expectedYield} {crop.yieldUnit}</span>
                          {cropCost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Cost: {formatCurrency(cropCost)}</span>}
                        </div>

                        {crop.stage !== 'harvested' && (
                          <div className="mt-3 flex gap-2">
                            <select
                              value={crop.stage}
                              onChange={(e) => handleUpdateStage(crop.id, e.target.value as GrowthStage)}
                              className={`text-sm px-2 py-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                            >
                              {stageOrder.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                          </div>
                        )}

                        {crop.notes && <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{crop.notes}</p>}
                      </div>
                    );
                  })}
                </div>

                {filteredCrops.length === 0 && !showCropForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Sprout className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.cropTracker.noCropsFoundMatchingYour', 'No crops found matching your filters')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Fields Tab */}
        {activeTab === 'fields' && (
          <div className="space-y-4">
            {!showFieldForm && (
              <button
                onClick={() => setShowFieldForm(true)}
                className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
              >
                <Plus className="w-5 h-5" />
                {t('tools.cropTracker.addField2', 'Add Field')}
              </button>
            )}

            {showFieldForm && (
              <div className={`${cardClass} space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cropTracker.addNewField', 'Add New Field')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.fieldName', 'Field Name *')}</label>
                    <input type="text" value={fieldForm.name} onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.eGNorthField', 'e.g., North Field')} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.sizeAcres', 'Size (acres)')}</label>
                    <input type="number" value={fieldForm.size || ''} onChange={(e) => setFieldForm({ ...fieldForm, size: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.soilType', 'Soil Type')}</label>
                    <select value={fieldForm.soilType} onChange={(e) => setFieldForm({ ...fieldForm, soilType: e.target.value })} className={inputClass}>
                      {soilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.notes2', 'Notes')}</label>
                    <input type="text" value={fieldForm.notes} onChange={(e) => setFieldForm({ ...fieldForm, notes: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.additionalNotes2', 'Additional notes...')} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowFieldForm(false)} className={secondaryButtonClass}>{t('tools.cropTracker.cancel2', 'Cancel')}</button>
                  <button onClick={handleAddField} className={buttonClass}>{t('tools.cropTracker.addField', 'Add Field')}</button>
                </div>
              </div>
            )}

            {/* Field Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const cropsInField = crops.filter(c => c.fieldId === field.id);
                const usedAcres = cropsInField.reduce((sum, c) => sum + c.area, 0);

                return (
                  <div key={field.id} className={cardClass}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{field.name}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {field.size} acres | {field.soilType} soil
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteField(field.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p>Used: {usedAcres.toFixed(1)} / {field.size} acres ({((usedAcres / field.size) * 100).toFixed(0)}%)</p>
                      <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: `${Math.min((usedAcres / field.size) * 100, 100)}%` }} />
                      </div>
                      {cropsInField.length > 0 && (
                        <p className="mt-2">Crops: {cropsInField.map(c => c.name).join(', ')}</p>
                      )}
                    </div>
                    {field.notes && <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{field.notes}</p>}
                  </div>
                );
              })}
            </div>

            {fields.length === 0 && !showFieldForm && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.cropTracker.noFieldsAddedYetAdd', 'No fields added yet. Add your first field to get started!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Inputs Tab */}
        {activeTab === 'inputs' && (
          <div className="space-y-4">
            {crops.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.cropTracker.addCropsFirstToTrack', 'Add crops first to track inputs')}</p>
              </div>
            ) : (
              <>
                {!showInputForm && (
                  <button
                    onClick={() => setShowInputForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.cropTracker.addInput3', 'Add Input')}
                  </button>
                )}

                {showInputForm && (
                  <div className={`${cardClass} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cropTracker.addInput', 'Add Input')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.crop', 'Crop *')}</label>
                        <select value={inputForm.cropId} onChange={(e) => setInputForm({ ...inputForm, cropId: e.target.value })} className={inputClass}>
                          <option value="">{t('tools.cropTracker.selectCrop', 'Select Crop')}</option>
                          {crops.map(c => <option key={c.id} value={c.id}>{c.name} - {getFieldName(c.fieldId)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.type', 'Type')}</label>
                        <select value={inputForm.type} onChange={(e) => setInputForm({ ...inputForm, type: e.target.value as InputType })} className={inputClass}>
                          <option value="seeds">{t('tools.cropTracker.seeds', 'Seeds')}</option>
                          <option value="fertilizer">{t('tools.cropTracker.fertilizer', 'Fertilizer')}</option>
                          <option value="pesticide">{t('tools.cropTracker.pesticide', 'Pesticide')}</option>
                          <option value="water">{t('tools.cropTracker.water', 'Water')}</option>
                          <option value="other">{t('tools.cropTracker.other2', 'Other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.nameProduct', 'Name/Product *')}</label>
                        <input type="text" value={inputForm.name} onChange={(e) => setInputForm({ ...inputForm, name: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.productName', 'Product name')} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.quantity', 'Quantity')}</label>
                        <input type="number" value={inputForm.quantity || ''} onChange={(e) => setInputForm({ ...inputForm, quantity: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.unit', 'Unit')}</label>
                        <input type="text" value={inputForm.unit} onChange={(e) => setInputForm({ ...inputForm, unit: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.lbsGallonsEtc', 'lbs, gallons, etc.')} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.cost', 'Cost ($)')}</label>
                        <input type="number" value={inputForm.cost || ''} onChange={(e) => setInputForm({ ...inputForm, cost: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0.00" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.date', 'Date')}</label>
                        <input type="date" value={inputForm.date} onChange={(e) => setInputForm({ ...inputForm, date: e.target.value })} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cropTracker.notes3', 'Notes')}</label>
                        <input type="text" value={inputForm.notes} onChange={(e) => setInputForm({ ...inputForm, notes: e.target.value })} className={inputClass} placeholder={t('tools.cropTracker.additionalNotes3', 'Additional notes...')} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowInputForm(false)} className={secondaryButtonClass}>{t('tools.cropTracker.cancel3', 'Cancel')}</button>
                      <button onClick={handleAddInput} className={buttonClass}>{t('tools.cropTracker.addInput2', 'Add Input')}</button>
                    </div>
                  </div>
                )}

                {/* Inputs by crop */}
                <div className="space-y-4">
                  {crops.map((crop) => {
                    const cropInputs = inputs.filter(i => i.cropId === crop.id);
                    if (cropInputs.length === 0) return null;

                    return (
                      <div key={crop.id} className={cardClass}>
                        <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {crop.name} - {getFieldName(crop.fieldId)}
                        </h4>
                        <div className="space-y-2">
                          {cropInputs.map((input) => (
                            <div key={input.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-teal-500" />
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{input.name}</p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {input.type} | {input.quantity} {input.unit} | {formatDate(input.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(input.cost)}</span>
                                <button onClick={() => handleDeleteInput(input.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className={`mt-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Total: {formatCurrency(cropInputs.reduce((sum, i) => sum + i.cost, 0))}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {inputs.length === 0 && !showInputForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.cropTracker.noInputsRecordedYet', 'No inputs recorded yet')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Harvest Tab */}
        {activeTab === 'harvest' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cropTracker.upcomingHarvests', 'Upcoming Harvests')}</h4>

            {crops.filter(c => c.stage !== 'harvested' && c.expectedHarvestDate).sort((a, b) => new Date(a.expectedHarvestDate).getTime() - new Date(b.expectedHarvestDate).getTime()).map((crop) => {
              const daysToHarvest = getDaysUntil(crop.expectedHarvestDate);

              return (
                <div key={crop.id} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stageColors[crop.stage].bg}`}>
                        {categoryIcons[crop.category]}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{crop.name}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {getFieldName(crop.fieldId)} | {crop.area} acres
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${daysToHarvest <= 7 ? 'text-orange-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="font-medium">{formatDate(crop.expectedHarvestDate)}</p>
                      <p className="text-sm">{daysToHarvest <= 0 ? 'Ready now!' : `${daysToHarvest} days`}</p>
                    </div>
                  </div>
                  <div className={`mt-3 flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Expected: {crop.expectedYield} {crop.yieldUnit}</span>
                  </div>
                  {crop.stage === 'harvesting' && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={t('tools.cropTracker.actualYield', 'Actual yield')}
                        className={`${inputClass} w-32`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseFloat((e.target as HTMLInputElement).value);
                            if (value > 0) handleRecordHarvest(crop.id, value);
                          }
                        }}
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{crop.yieldUnit}</span>
                      <button
                        onClick={() => {
                          const input = document.querySelector(`input[placeholder={t('tools.cropTracker.actualYield2', 'Actual yield')}]`) as HTMLInputElement;
                          const value = parseFloat(input?.value || '0');
                          if (value > 0) handleRecordHarvest(crop.id, value);
                        }}
                        className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                      >
                        {t('tools.cropTracker.recordHarvest', 'Record Harvest')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <h4 className={`font-medium mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cropTracker.harvestedCrops', 'Harvested Crops')}</h4>

            {crops.filter(c => c.stage === 'harvested').map((crop) => (
              <div key={crop.id} className={cardClass}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/20">
                      <Check className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{crop.name}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getFieldName(crop.fieldId)} | {crop.area} acres | {crop.season} {crop.year}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`mt-3 grid grid-cols-3 gap-4 text-sm`}>
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.cropTracker.expected', 'Expected')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{crop.expectedYield} {crop.yieldUnit}</p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.cropTracker.actual', 'Actual')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{crop.actualYield || '-'} {crop.yieldUnit}</p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.cropTracker.variance', 'Variance')}</p>
                    <p className={`font-medium ${crop.actualYield && crop.actualYield >= crop.expectedYield ? 'text-green-500' : 'text-red-500'}`}>
                      {crop.actualYield ? ((crop.actualYield - crop.expectedYield) / crop.expectedYield * 100).toFixed(1) : '-'}%
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {crops.filter(c => c.expectedHarvestDate || c.stage === 'harvested').length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.cropTracker.noHarvestDataYetAdd', 'No harvest data yet. Add crops with expected harvest dates.')}</p>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Year Selector */}
            <div className="flex items-center gap-4">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cropTracker.reportYear', 'Report Year:')}</span>
              <select value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))} className={inputClass} style={{ width: 'auto' }}>
                {[...new Set(crops.map(c => c.year)), new Date().getFullYear()].sort((a, b) => b - a).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={cardClass}>
                <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.cropsByCategory', 'Crops by Category')}</h5>
                <div className="space-y-2">
                  {(['vegetables', 'fruits', 'grains', 'legumes', 'herbs', 'other'] as CropCategory[]).map(cat => {
                    const count = crops.filter(c => c.category === cat && c.year === filterYear).length;
                    if (count === 0) return null;
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {categoryIcons[cat]}
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={cardClass}>
                <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.cropsByStage', 'Crops by Stage')}</h5>
                <div className="space-y-2">
                  {stageOrder.map(stage => {
                    const count = crops.filter(c => c.stage === stage && c.year === filterYear).length;
                    if (count === 0) return null;
                    return (
                      <div key={stage} className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-xs ${stageColors[stage].bg} ${stageColors[stage].text}`}>
                          {stage.charAt(0).toUpperCase() + stage.slice(1)}
                        </span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={cardClass}>
                <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.costBreakdown', 'Cost Breakdown')}</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.cropTracker.inputCosts', 'Input Costs')}</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalInputCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.cropTracker.otherCosts', 'Other Costs')}</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalOtherCosts)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-600">
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropTracker.total', 'Total')}</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalCosts)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Crop Report */}
            <div className={cardClass}>
              <h5 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cropTracker.cropPerformanceReport', 'Crop Performance Report')}</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.crop2', 'Crop')}</th>
                      <th className={`text-left py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.field2', 'Field')}</th>
                      <th className={`text-right py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.acres', 'Acres')}</th>
                      <th className={`text-right py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.totalCost', 'Total Cost')}</th>
                      <th className={`text-right py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.costAcre', 'Cost/Acre')}</th>
                      <th className={`text-center py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropTracker.stage', 'Stage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.filter(c => c.year === filterYear).map((crop) => {
                      const totalCropCost = getCropCosts(crop.id);
                      const costPerAcre = crop.area > 0 ? totalCropCost / crop.area : 0;

                      return (
                        <tr key={crop.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{crop.name}</td>
                          <td className={`py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{getFieldName(crop.fieldId)}</td>
                          <td className={`py-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{crop.area}</td>
                          <td className={`py-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(totalCropCost)}</td>
                          <td className={`py-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(costPerAcre)}</td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs ${stageColors[crop.stage].bg} ${stageColors[crop.stage].text}`}>
                              {crop.stage}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {crops.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.cropTracker.addCropsToSeeReports', 'Add crops to see reports')}</p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.cropTracker.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.cropTracker.createFieldsFirstThenAdd', 'Create fields first, then add crops to those fields')}</li>
                <li>{t('tools.cropTracker.updateCropStagesAsThey', 'Update crop stages as they progress through the growing season')}</li>
                <li>{t('tools.cropTracker.trackAllInputsSeedsFertilizer', 'Track all inputs (seeds, fertilizer, water) to calculate true costs')}</li>
                <li>{t('tools.cropTracker.recordActualHarvestYieldsTo', 'Record actual harvest yields to compare against expectations')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg text-sm font-medium text-white ${isDark ? 'bg-red-600' : 'bg-red-500'} shadow-lg animate-in fade-in`}>
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default CropTrackerTool;
