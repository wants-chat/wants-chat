'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Beaker,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  Clock,
  User,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Thermometer,
  Calendar,
  Hash,
  Package,
  ClipboardList,
  FlaskConical,
  Printer,
} from 'lucide-react';

// Types
interface Ingredient {
  name: string;
  ndc: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  unit: string;
  manufacturer: string;
}

interface CompoundRecord {
  id: string;
  rxNumber: string;
  compoundName: string;
  formulaNumber: string;
  patientName: string;
  prescriberName: string;
  dateCompounded: string;
  beyondUseDate: string;
  lotNumber: string;
  quantityPrepared: number;
  unit: string;
  dosageForm: 'capsule' | 'cream' | 'ointment' | 'solution' | 'suspension' | 'suppository' | 'troche' | 'gel' | 'other';
  ingredients: Ingredient[];
  equipmentUsed: string[];
  preparationSteps: string;
  qualityChecks: {
    appearance: boolean;
    weight: boolean;
    ph: boolean;
    particulates: boolean;
  };
  finalWeight: number;
  theoreticalWeight: number;
  percentYield: number;
  storageConditions: string;
  specialInstructions: string;
  preparedBy: string;
  checkedBy: string;
  pharmacistVerified: string;
  status: 'in_progress' | 'pending_verification' | 'verified' | 'dispensed' | 'discarded';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MasterFormula {
  id: string;
  formulaNumber: string;
  compoundName: string;
  dosageForm: string;
  defaultIngredients: { name: string; quantity: number; unit: string }[];
  defaultQuantity: number;
  defaultUnit: string;
  preparationSteps: string;
  storageConditions: string;
  beyondUseDays: number;
  specialInstructions: string;
  createdAt: string;
}

const DOSAGE_FORMS = [
  { value: 'capsule', label: 'Capsule' },
  { value: 'cream', label: 'Cream' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'solution', label: 'Solution' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'suppository', label: 'Suppository' },
  { value: 'troche', label: 'Troche/Lozenge' },
  { value: 'gel', label: 'Gel' },
  { value: 'other', label: 'Other' },
];

const COMMON_EQUIPMENT = [
  'Electronic Balance',
  'Mortar & Pestle',
  'Ointment Slab',
  'Spatulas',
  'Graduated Cylinder',
  'Beakers',
  'Capsule Machine',
  'Mold (suppository)',
  'pH Meter',
  'Homogenizer',
  'Hot Plate',
  'Refrigerator',
];

const STATUS_OPTIONS = [
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'pending_verification', label: 'Pending Verification', color: 'bg-orange-500' },
  { value: 'verified', label: 'Verified', color: 'bg-green-500' },
  { value: 'dispensed', label: 'Dispensed', color: 'bg-blue-500' },
  { value: 'discarded', label: 'Discarded', color: 'bg-red-500' },
];

// Column configuration
const COMPOUND_COLUMNS: ColumnConfig[] = [
  { key: 'rxNumber', header: 'Rx #', type: 'string' },
  { key: 'compoundName', header: 'Compound', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'dateCompounded', header: 'Date Compounded', type: 'date' },
  { key: 'beyondUseDate', header: 'BUD', type: 'date' },
  { key: 'lotNumber', header: 'Lot #', type: 'string' },
  { key: 'quantityPrepared', header: 'Quantity', type: 'number' },
  { key: 'dosageForm', header: 'Form', type: 'string' },
  { key: 'preparedBy', header: 'Prepared By', type: 'string' },
  { key: 'pharmacistVerified', header: 'Verified By', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

interface CompoundingLogToolProps {
  uiConfig?: UIConfig;
}

export const CompoundingLogTool = ({ uiConfig }: CompoundingLogToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  const {
    data: compounds,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CompoundRecord>('compounding-log', [], COMPOUND_COLUMNS);

  const {
    data: formulas,
    addItem: addFormula,
    deleteItem: deleteFormula,
  } = useToolData<MasterFormula>('master-formulas', [], []);

  // State
  const [activeTab, setActiveTab] = useState<'log' | 'formulas' | 'new'>('log');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState<CompoundRecord | null>(null);

  const defaultForm: Omit<CompoundRecord, 'id' | 'createdAt' | 'updatedAt'> = {
    rxNumber: '',
    compoundName: '',
    formulaNumber: '',
    patientName: '',
    prescriberName: '',
    dateCompounded: new Date().toISOString().split('T')[0],
    beyondUseDate: '',
    lotNumber: '',
    quantityPrepared: 0,
    unit: 'g',
    dosageForm: 'cream',
    ingredients: [],
    equipmentUsed: [],
    preparationSteps: '',
    qualityChecks: {
      appearance: false,
      weight: false,
      ph: false,
      particulates: false,
    },
    finalWeight: 0,
    theoreticalWeight: 0,
    percentYield: 0,
    storageConditions: 'Room temperature',
    specialInstructions: '',
    preparedBy: '',
    checkedBy: '',
    pharmacistVerified: '',
    status: 'in_progress',
    notes: '',
  };

  const [form, setForm] = useState(defaultForm);
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: '',
    ndc: '',
    lotNumber: '',
    expirationDate: '',
    quantity: 0,
    unit: 'g',
    manufacturer: '',
  });

  // Generate lot number
  const generateLotNumber = () => {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const seq = compounds.filter(c => c.dateCompounded === form.dateCompounded).length + 1;
    return `CPD${y}${m}${d}-${seq.toString().padStart(3, '0')}`;
  };

  // Calculate BUD
  const calculateBUD = (dosageForm: string, days: number = 14) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.dosageForm) {
        setForm(prev => ({ ...prev, dosageForm: params.dosageForm }));
        hasChanges = true;
      }
      if (params.status) {
        setStatusFilter(params.status);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate percent yield
  useEffect(() => {
    if (form.theoreticalWeight > 0 && form.finalWeight > 0) {
      const yield_pct = (form.finalWeight / form.theoreticalWeight) * 100;
      setForm(prev => ({ ...prev, percentYield: Math.round(yield_pct * 10) / 10 }));
    }
  }, [form.theoreticalWeight, form.finalWeight]);

  // Add ingredient
  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) return;
    setForm({
      ...form,
      ingredients: [...form.ingredients, { ...newIngredient }],
    });
    setNewIngredient({
      name: '',
      ndc: '',
      lotNumber: '',
      expirationDate: '',
      quantity: 0,
      unit: 'g',
      manufacturer: '',
    });
  };

  // Remove ingredient
  const removeIngredient = (index: number) => {
    setForm({
      ...form,
      ingredients: form.ingredients.filter((_, i) => i !== index),
    });
  };

  // Toggle equipment
  const toggleEquipment = (equip: string) => {
    if (form.equipmentUsed.includes(equip)) {
      setForm({ ...form, equipmentUsed: form.equipmentUsed.filter(e => e !== equip) });
    } else {
      setForm({ ...form, equipmentUsed: [...form.equipmentUsed, equip] });
    }
  };

  // Submit
  const handleSubmit = () => {
    const now = new Date().toISOString();
    const lotNumber = form.lotNumber || generateLotNumber();
    const beyondUseDate = form.beyondUseDate || calculateBUD(form.dosageForm);

    if (editingId) {
      updateItem(editingId, {
        ...form,
        lotNumber,
        beyondUseDate,
        updatedAt: now,
      });
      setEditingId(null);
    } else {
      const newRecord: CompoundRecord = {
        ...form,
        id: crypto.randomUUID(),
        lotNumber,
        beyondUseDate,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newRecord);
    }

    setForm(defaultForm);
    setActiveTab('log');
  };

  // Filter
  const filteredCompounds = useMemo(() => {
    return compounds.filter(c => {
      const matchesSearch =
        c.compoundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [compounds, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      todayCompounded: compounds.filter(c => c.dateCompounded === today).length,
      pendingVerification: compounds.filter(c => c.status === 'pending_verification').length,
      totalFormulas: formulas.length,
      avgYield: compounds.length > 0
        ? Math.round(compounds.reduce((sum, c) => sum + (c.percentYield || 100), 0) / compounds.length)
        : 0,
    };
  }, [compounds, formulas]);

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
            <Beaker className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('tools.compoundingLog.title', 'Compounding Log')}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.compoundingLog.description', 'USP 795/797/800 Compliant Documentation')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="compounding-log" toolName="Compounding Log" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
          />
          <ExportDropdown
            onExportCSV={exportCSV}
            onExportExcel={exportExcel}
            onExportJSON={exportJSON}
            onExportPDF={exportPDF}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compoundingLog.today', 'Today')}</p>
                <p className="text-2xl font-bold text-teal-500">{stats.todayCompounded}</p>
              </div>
              <FlaskConical className="w-8 h-8 text-teal-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compoundingLog.pending', 'Pending')}</p>
                <p className="text-2xl font-bold text-orange-500">{stats.pendingVerification}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compoundingLog.formulas', 'Formulas')}</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalFormulas}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compoundingLog.avgYield', 'Avg Yield')}</p>
                <p className="text-2xl font-bold text-green-500">{stats.avgYield}%</p>
              </div>
              <Scale className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'log', label: t('tools.compoundingLog.tabs.log', 'Compounding Log'), icon: ClipboardList },
          { id: 'new', label: t('tools.compoundingLog.tabs.new', 'New Compound'), icon: Plus },
          { id: 'formulas', label: t('tools.compoundingLog.tabs.formulas', 'Master Formulas'), icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              if (tab.id === 'new' && !editingId) {
                setForm(defaultForm);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-teal-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log Tab */}
      {activeTab === 'log' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>{t('tools.compoundingLog.compoundingRecords', 'Compounding Records')}</CardTitle>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">{t('tools.compoundingLog.allStatus', 'All Status')}</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.compoundingLog.search', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : filteredCompounds.length === 0 ? (
              <div className="text-center py-12">
                <Beaker className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No compounding records</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3 px-3">Date</th>
                      <th className="text-left py-3 px-3">Lot #</th>
                      <th className="text-left py-3 px-3">Compound</th>
                      <th className="text-left py-3 px-3">Patient</th>
                      <th className="text-left py-3 px-3">Qty</th>
                      <th className="text-left py-3 px-3">BUD</th>
                      <th className="text-left py-3 px-3">Status</th>
                      <th className="text-left py-3 px-3">Prepared</th>
                      <th className="text-left py-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompounds.map(compound => {
                      const statusOpt = STATUS_OPTIONS.find(s => s.value === compound.status);
                      return (
                        <tr key={compound.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="py-3 px-3">{compound.dateCompounded}</td>
                          <td className="py-3 px-3 font-mono text-xs">{compound.lotNumber}</td>
                          <td className="py-3 px-3">
                            <div className="font-medium">{compound.compoundName}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {compound.dosageForm}
                            </div>
                          </td>
                          <td className="py-3 px-3">{compound.patientName}</td>
                          <td className="py-3 px-3">{compound.quantityPrepared} {compound.unit}</td>
                          <td className="py-3 px-3">{compound.beyondUseDate}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded text-xs text-white ${statusOpt?.color}`}>
                              {statusOpt?.label}
                            </span>
                          </td>
                          <td className="py-3 px-3">{compound.preparedBy}</td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingId(compound.id);
                                  setForm(compound);
                                  setActiveTab('new');
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowPrint(compound)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title="Print Label"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem(compound.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Compound Tab */}
      {activeTab === 'new' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Compound' : 'New Compound'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Rx Number</label>
                  <input
                    type="text"
                    value={form.rxNumber}
                    onChange={(e) => setForm({ ...form, rxNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Compound Name *</label>
                  <input
                    type="text"
                    value={form.compoundName}
                    onChange={(e) => setForm({ ...form, compoundName: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., Hydrocortisone 2% Cream"
                  />
                </div>
                <div>
                  <label className={labelClass}>Dosage Form *</label>
                  <select
                    value={form.dosageForm}
                    onChange={(e) => setForm({ ...form, dosageForm: e.target.value as CompoundRecord['dosageForm'] })}
                    className={inputClass}
                  >
                    {DOSAGE_FORMS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Patient Name *</label>
                  <input
                    type="text"
                    value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prescriber</label>
                  <input
                    type="text"
                    value={form.prescriberName}
                    onChange={(e) => setForm({ ...form, prescriberName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Date Compounded *</label>
                  <input
                    type="date"
                    value={form.dateCompounded}
                    onChange={(e) => setForm({ ...form, dateCompounded: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Beyond Use Date</label>
                  <input
                    type="date"
                    value={form.beyondUseDate}
                    onChange={(e) => setForm({ ...form, beyondUseDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Ingredients
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={newIngredient.quantity || ''}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    className={inputClass}
                  >
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="mcg">mcg</option>
                    <option value="units">units</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Lot #"
                    value={newIngredient.lotNumber}
                    onChange={(e) => setNewIngredient({ ...newIngredient, lotNumber: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="date"
                    placeholder="Exp"
                    value={newIngredient.expirationDate}
                    onChange={(e) => setNewIngredient({ ...newIngredient, expirationDate: e.target.value })}
                    className={inputClass}
                  />
                  <button
                    onClick={addIngredient}
                    disabled={!newIngredient.name || !newIngredient.quantity}
                    className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {form.ingredients.length > 0 && (
                  <div className={`rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {form.ingredients.map((ing, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 ${idx > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{ing.name}</span>
                          <span>{ing.quantity} {ing.unit}</span>
                          {ing.lotNumber && <span className="text-xs text-gray-500">Lot: {ing.lotNumber}</span>}
                          {ing.expirationDate && <span className="text-xs text-gray-500">Exp: {ing.expirationDate}</span>}
                        </div>
                        <button onClick={() => removeIngredient(idx)} className="text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipment */}
              <div>
                <h3 className="font-semibold mb-3">Equipment Used</h3>
                <div className="flex flex-wrap gap-2">
                  {COMMON_EQUIPMENT.map(equip => (
                    <button
                      key={equip}
                      onClick={() => toggleEquipment(equip)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        form.equipmentUsed.includes(equip)
                          ? 'bg-teal-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {equip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preparation Steps */}
              <div>
                <label className={labelClass}>Preparation Steps</label>
                <textarea
                  value={form.preparationSteps}
                  onChange={(e) => setForm({ ...form, preparationSteps: e.target.value })}
                  className={`${inputClass} h-24`}
                  placeholder="1. Weigh all ingredients...&#10;2. Mix in mortar...&#10;3. Add to base..."
                />
              </div>

              {/* Quality Checks & Weights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Quality Checks</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'appearance', label: 'Appearance Check' },
                      { key: 'weight', label: 'Weight Verification' },
                      { key: 'ph', label: 'pH Check (if applicable)' },
                      { key: 'particulates', label: 'Particulate Check' },
                    ].map(check => (
                      <label key={check.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.qualityChecks[check.key as keyof typeof form.qualityChecks]}
                          onChange={(e) => setForm({
                            ...form,
                            qualityChecks: { ...form.qualityChecks, [check.key]: e.target.checked }
                          })}
                          className="rounded"
                        />
                        {check.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Quantity Prepared *</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={form.quantityPrepared}
                          onChange={(e) => setForm({ ...form, quantityPrepared: parseFloat(e.target.value) || 0 })}
                          className={`${inputClass} flex-1`}
                          min="0"
                        />
                        <select
                          value={form.unit}
                          onChange={(e) => setForm({ ...form, unit: e.target.value })}
                          className={`${inputClass} w-20`}
                        >
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="caps">caps</option>
                          <option value="supp">supp</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Theoretical Weight</label>
                      <input
                        type="number"
                        value={form.theoreticalWeight}
                        onChange={(e) => setForm({ ...form, theoreticalWeight: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Final Weight</label>
                      <input
                        type="number"
                        value={form.finalWeight}
                        onChange={(e) => setForm({ ...form, finalWeight: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>% Yield</label>
                      <input
                        type="text"
                        value={form.percentYield ? `${form.percentYield}%` : '-'}
                        className={inputClass}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Storage Conditions</label>
                  <select
                    value={form.storageConditions}
                    onChange={(e) => setForm({ ...form, storageConditions: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Room temperature">Room Temperature (20-25°C)</option>
                    <option value="Refrigerate">Refrigerate (2-8°C)</option>
                    <option value="Freeze">Freeze (-20°C)</option>
                    <option value="Protect from light">Room Temp, Protect from Light</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Special Instructions</label>
                  <input
                    type="text"
                    value={form.specialInstructions}
                    onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                    className={inputClass}
                    placeholder="Shake well before use..."
                  />
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Prepared By *</label>
                  <input
                    type="text"
                    value={form.preparedBy}
                    onChange={(e) => setForm({ ...form, preparedBy: e.target.value.toUpperCase() })}
                    className={inputClass}
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className={labelClass}>Checked By</label>
                  <input
                    type="text"
                    value={form.checkedBy}
                    onChange={(e) => setForm({ ...form, checkedBy: e.target.value.toUpperCase() })}
                    className={inputClass}
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className={labelClass}>Pharmacist Verified</label>
                  <input
                    type="text"
                    value={form.pharmacistVerified}
                    onChange={(e) => setForm({ ...form, pharmacistVerified: e.target.value.toUpperCase() })}
                    className={inputClass}
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as CompoundRecord['status'] })}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`${inputClass} h-20`}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setForm(defaultForm);
                    setEditingId(null);
                    setActiveTab('log');
                  }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.compoundName || !form.patientName || !form.preparedBy}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {editingId ? 'Update' : 'Save'} Record
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulas Tab */}
      {activeTab === 'formulas' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle>Master Formulas</CardTitle>
          </CardHeader>
          <CardContent>
            {formulas.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  No master formulas saved yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formulas.map(formula => (
                  <div key={formula.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{formula.compoundName}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Formula: {formula.formulaNumber} | {formula.dosageForm}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteFormula(formula.id)}
                        className="text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Print Label Modal */}
      {showPrint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Compounding Label</h3>
              <button onClick={() => setShowPrint(null)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`border-2 border-dashed p-4 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <p className="font-bold text-lg">{showPrint.compoundName}</p>
              <p className="text-sm mt-2">For: {showPrint.patientName}</p>
              <p className="text-sm">Rx: {showPrint.rxNumber}</p>
              <div className="mt-3 text-sm">
                <p>Qty: {showPrint.quantityPrepared} {showPrint.unit}</p>
                <p>Lot: {showPrint.lotNumber}</p>
                <p>Date: {showPrint.dateCompounded}</p>
                <p className="font-semibold">BUD: {showPrint.beyondUseDate}</p>
              </div>
              <p className="mt-3 text-sm">{showPrint.storageConditions}</p>
              {showPrint.specialInstructions && (
                <p className="mt-2 text-sm italic">{showPrint.specialInstructions}</p>
              )}
            </div>
            <button
              onClick={() => window.print()}
              className="w-full mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              <Printer className="w-4 h-4 inline mr-2" />
              Print Label
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompoundingLogTool;
