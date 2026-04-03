'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  FlaskConical,
  Package,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Shield,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  FileText,
  ExternalLink,
  Clock,
  Beaker,
  ShieldAlert,
  Archive,
  BarChart3,
  Sparkles,
} from 'lucide-react';

// Types
interface Chemical {
  id: string;
  name: string;
  activeIngredient: string;
  concentration: string;
  epaRegistration: string;
  manufacturer: string;
  category: 'insecticide' | 'rodenticide' | 'herbicide' | 'fungicide' | 'repellent' | 'other';
  formulation: 'liquid' | 'granular' | 'dust' | 'bait' | 'aerosol' | 'concentrate';
  signalWord: 'danger' | 'warning' | 'caution' | 'none';
  targetPests: string[];
  applicationMethods: string[];
  quantity: number;
  unit: string;
  minStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier: string;
  supplierContact: string;
  lotNumber: string;
  manufactureDate: string;
  expirationDate: string;
  storageLocation: string;
  storageRequirements: string;
  safetyDataSheet: string;
  ppeRequired: string[];
  reentryInterval: number;
  restrictedUse: boolean;
  notes: string;
  lastUpdated: string;
  createdAt: string;
}

interface InventoryTransaction {
  id: string;
  chemicalId: string;
  type: 'purchase' | 'usage' | 'adjustment' | 'disposal' | 'return';
  quantity: number;
  date: string;
  technicianId: string;
  technicianName: string;
  jobId: string;
  notes: string;
  costPerUnit: number;
  totalCost: number;
  createdAt: string;
}

// Column configuration for exports
const CHEMICAL_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'activeIngredient', header: 'Active Ingredient', type: 'string' },
  { key: 'epaRegistration', header: 'EPA Registration', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'formulation', header: 'Formulation', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'costPerUnit', header: 'Cost/Unit', type: 'currency' },
  { key: 'expirationDate', header: 'Expiration', type: 'date' },
  { key: 'storageLocation', header: 'Location', type: 'string' },
  { key: 'restrictedUse', header: 'Restricted Use', type: 'boolean' },
];

const TRANSACTION_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'chemicalName', header: 'Chemical', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Default data
const defaultChemicals: Chemical[] = [
  {
    id: '1',
    name: 'Termidor SC',
    activeIngredient: 'Fipronil',
    concentration: '9.1%',
    epaRegistration: '7969-210',
    manufacturer: 'BASF',
    category: 'insecticide',
    formulation: 'concentrate',
    signalWord: 'caution',
    targetPests: ['Termites', 'Ants', 'Cockroaches'],
    applicationMethods: ['Trench', 'Rod', 'Foam injection'],
    quantity: 48,
    unit: 'oz',
    minStock: 24,
    reorderPoint: 36,
    costPerUnit: 4.50,
    supplier: 'Univar Solutions',
    supplierContact: 'sales@univar.com',
    lotNumber: 'TER-2024-001',
    manufactureDate: '2024-01-15',
    expirationDate: '2027-01-15',
    storageLocation: 'Chemical Storage A',
    storageRequirements: 'Store in cool, dry place. Keep away from heat.',
    safetyDataSheet: 'https://sds.basf.com/termidor',
    ppeRequired: ['Chemical-resistant gloves', 'Eye protection', 'Long sleeves'],
    reentryInterval: 24,
    restrictedUse: false,
    notes: 'Primary termite control product',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Contrac Blox',
    activeIngredient: 'Bromadiolone',
    concentration: '0.005%',
    epaRegistration: '12455-79',
    manufacturer: 'Bell Laboratories',
    category: 'rodenticide',
    formulation: 'bait',
    signalWord: 'caution',
    targetPests: ['Mice', 'Rats'],
    applicationMethods: ['Bait station placement'],
    quantity: 180,
    unit: 'blocks',
    minStock: 50,
    reorderPoint: 100,
    costPerUnit: 0.85,
    supplier: 'SiteOne Landscape Supply',
    supplierContact: 'orders@siteone.com',
    lotNumber: 'CB-2024-023',
    manufactureDate: '2024-02-01',
    expirationDate: '2026-02-01',
    storageLocation: 'Chemical Storage B',
    storageRequirements: 'Keep dry. Store in tamper-resistant container.',
    safetyDataSheet: 'https://sds.belllabs.com/contrac',
    ppeRequired: ['Gloves'],
    reentryInterval: 0,
    restrictedUse: false,
    notes: 'Use in tamper-resistant stations only',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const defaultTransactions: InventoryTransaction[] = [];

interface ChemicalInventoryToolProps {
  uiConfig?: UIConfig;
}

export const ChemicalInventoryTool = ({ uiConfig }: ChemicalInventoryToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use useToolData for backend sync
  const {
    data: chemicals,
    setData: setChemicals,
    addItem: addChemical,
    updateItem: updateChemical,
    deleteItem: deleteChemical,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Chemical>('pest-chemical-inventory', defaultChemicals, CHEMICAL_COLUMNS);

  const {
    data: transactions,
    addItem: addTransaction,
  } = useToolData<InventoryTransaction>('pest-chemical-transactions', defaultTransactions, TRANSACTION_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions' | 'alerts' | 'reports'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out' | 'expiring'>('all');
  const [showAddChemical, setShowAddChemical] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Form states
  const [chemicalForm, setChemicalForm] = useState<Partial<Chemical>>({
    category: 'insecticide',
    formulation: 'concentrate',
    signalWord: 'caution',
    targetPests: [],
    applicationMethods: [],
    ppeRequired: [],
    restrictedUse: false,
    quantity: 0,
    minStock: 0,
    reorderPoint: 0,
    costPerUnit: 0,
    reentryInterval: 0,
  });

  const [transactionForm, setTransactionForm] = useState<Partial<InventoryTransaction>>({
    type: 'usage',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.productName || params.chemicalName) {
        setIsPrefilled(true);
        setChemicalForm(prev => ({
          ...prev,
          name: params.productName || params.chemicalName || '',
        }));
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const lowStockItems = useMemo(() => {
    return chemicals.filter(c => c.quantity <= c.reorderPoint && c.quantity > 0);
  }, [chemicals]);

  const outOfStockItems = useMemo(() => {
    return chemicals.filter(c => c.quantity === 0);
  }, [chemicals]);

  const expiringItems = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return chemicals.filter(c => {
      const expDate = new Date(c.expirationDate);
      return expDate <= thirtyDaysFromNow && expDate > new Date();
    });
  }, [chemicals]);

  const expiredItems = useMemo(() => {
    return chemicals.filter(c => new Date(c.expirationDate) <= new Date());
  }, [chemicals]);

  const filteredChemicals = useMemo(() => {
    return chemicals.filter(chem => {
      const matchesSearch = searchTerm === '' ||
        chem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chem.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chem.epaRegistration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chem.targetPests.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = filterCategory === 'all' || chem.category === filterCategory;

      let matchesStock = true;
      if (filterStock === 'low') {
        matchesStock = chem.quantity <= chem.reorderPoint && chem.quantity > 0;
      } else if (filterStock === 'out') {
        matchesStock = chem.quantity === 0;
      } else if (filterStock === 'expiring') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expDate = new Date(chem.expirationDate);
        matchesStock = expDate <= thirtyDaysFromNow;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [chemicals, searchTerm, filterCategory, filterStock]);

  const stats = useMemo(() => {
    const totalValue = chemicals.reduce((sum, c) => sum + (c.quantity * c.costPerUnit), 0);
    const restrictedItems = chemicals.filter(c => c.restrictedUse).length;

    return {
      totalItems: chemicals.length,
      totalValue,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      expiring: expiringItems.length,
      expired: expiredItems.length,
      restrictedItems,
    };
  }, [chemicals, lowStockItems, outOfStockItems, expiringItems, expiredItems]);

  // Handlers
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleDeleteChemical = async (chemicalId: string) => {
    const chemical = chemicals.find(c => c.id === chemicalId);
    if (!chemical) return;

    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${chemical.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      deleteChemical(chemicalId);
    }
  };

  const handleAddChemical = useCallback(() => {
    if (!chemicalForm.name || !chemicalForm.epaRegistration) {
      setValidationMessage('Please fill in required fields (Name, EPA Registration)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newChemical: Chemical = {
      id: generateId(),
      name: chemicalForm.name || '',
      activeIngredient: chemicalForm.activeIngredient || '',
      concentration: chemicalForm.concentration || '',
      epaRegistration: chemicalForm.epaRegistration || '',
      manufacturer: chemicalForm.manufacturer || '',
      category: chemicalForm.category || 'insecticide',
      formulation: chemicalForm.formulation || 'concentrate',
      signalWord: chemicalForm.signalWord || 'caution',
      targetPests: chemicalForm.targetPests || [],
      applicationMethods: chemicalForm.applicationMethods || [],
      quantity: chemicalForm.quantity || 0,
      unit: chemicalForm.unit || 'oz',
      minStock: chemicalForm.minStock || 0,
      reorderPoint: chemicalForm.reorderPoint || 0,
      costPerUnit: chemicalForm.costPerUnit || 0,
      supplier: chemicalForm.supplier || '',
      supplierContact: chemicalForm.supplierContact || '',
      lotNumber: chemicalForm.lotNumber || '',
      manufactureDate: chemicalForm.manufactureDate || '',
      expirationDate: chemicalForm.expirationDate || '',
      storageLocation: chemicalForm.storageLocation || '',
      storageRequirements: chemicalForm.storageRequirements || '',
      safetyDataSheet: chemicalForm.safetyDataSheet || '',
      ppeRequired: chemicalForm.ppeRequired || [],
      reentryInterval: chemicalForm.reentryInterval || 0,
      restrictedUse: chemicalForm.restrictedUse || false,
      notes: chemicalForm.notes || '',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    addChemical(newChemical);
    setShowAddChemical(false);
    resetChemicalForm();
  }, [chemicalForm, addChemical]);

  const handleAddTransaction = useCallback(() => {
    if (!transactionForm.chemicalId || !transactionForm.quantity || !transactionForm.type) {
      setValidationMessage('Please fill in required fields (Chemical, Type, Quantity)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const chemical = chemicals.find(c => c.id === transactionForm.chemicalId);
    if (!chemical) return;

    const newTransaction: InventoryTransaction = {
      id: generateId(),
      chemicalId: transactionForm.chemicalId || '',
      type: transactionForm.type || 'usage',
      quantity: transactionForm.quantity || 0,
      date: transactionForm.date || new Date().toISOString().split('T')[0],
      technicianId: transactionForm.technicianId || '',
      technicianName: transactionForm.technicianName || '',
      jobId: transactionForm.jobId || '',
      notes: transactionForm.notes || '',
      costPerUnit: chemical.costPerUnit,
      totalCost: (transactionForm.quantity || 0) * chemical.costPerUnit,
      createdAt: new Date().toISOString(),
    };

    addTransaction(newTransaction);

    // Update chemical quantity
    let newQuantity = chemical.quantity;
    if (transactionForm.type === 'purchase') {
      newQuantity += transactionForm.quantity || 0;
    } else if (transactionForm.type === 'usage' || transactionForm.type === 'disposal') {
      newQuantity -= transactionForm.quantity || 0;
    } else if (transactionForm.type === 'adjustment') {
      newQuantity = transactionForm.quantity || 0;
    }
    newQuantity = Math.max(0, newQuantity);

    updateChemical(chemical.id, { quantity: newQuantity, lastUpdated: new Date().toISOString() });

    setShowAddTransaction(false);
    setSelectedChemical(null);
    resetTransactionForm();
  }, [transactionForm, chemicals, addTransaction, updateChemical]);

  const resetChemicalForm = () => {
    setChemicalForm({
      category: 'insecticide',
      formulation: 'concentrate',
      signalWord: 'caution',
      targetPests: [],
      applicationMethods: [],
      ppeRequired: [],
      restrictedUse: false,
      quantity: 0,
      minStock: 0,
      reorderPoint: 0,
      costPerUnit: 0,
      reentryInterval: 0,
    });
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      type: 'usage',
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStockStatus = (chemical: Chemical) => {
    if (chemical.quantity === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' };
    if (chemical.quantity <= chemical.minStock) return { label: 'Critical', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' };
    if (chemical.quantity <= chemical.reorderPoint) return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' };
    return { label: 'In Stock', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' };
  };

  const getExpirationStatus = (expirationDate: string) => {
    const exp = new Date(expirationDate);
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    if (exp <= now) return { label: 'Expired', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' };
    if (exp <= thirtyDays) return { label: 'Expiring Soon', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' };
    return null;
  };

  const getSignalWordColor = (signalWord: string) => {
    switch (signalWord) {
      case 'danger': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'warning': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'caution': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(chemicals, CHEMICAL_COLUMNS, { filename: 'pest-chemical-inventory' });
  };

  const handleExportExcel = () => {
    exportToExcel(chemicals, CHEMICAL_COLUMNS, { filename: 'pest-chemical-inventory' });
  };

  const handleExportJSON = () => {
    exportToJSON(chemicals, { filename: 'pest-chemical-inventory' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(chemicals, CHEMICAL_COLUMNS, {
      filename: 'pest-chemical-inventory',
      title: 'Pest Control Chemical Inventory',
      subtitle: `${chemicals.length} products | Total Value: ${formatCurrency(stats.totalValue)}`,
    });
  };

  const handlePrint = () => {
    printData(chemicals, CHEMICAL_COLUMNS, { title: 'Pest Control Chemical Inventory' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(chemicals, CHEMICAL_COLUMNS, 'tab');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.chemicalInventory.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.chemicalInventory.chemicalInventory', 'Chemical Inventory')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.chemicalInventory.managePestControlChemicalsAnd', 'Manage pest control chemicals and products')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="chemical-inventory" toolName="Chemical Inventory" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalItems}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chemicalInventory.products', 'Products')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-[#0D9488]`}>
                {formatCurrency(stats.totalValue)}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chemicalInventory.totalValue', 'Total Value')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-yellow-500`}>
                {stats.lowStock}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chemicalInventory.lowStock', 'Low Stock')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-red-500`}>
                {stats.outOfStock}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chemicalInventory.outOfStock', 'Out of Stock')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-orange-500`}>
                {stats.expiring}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chemicalInventory.expiringSoon', 'Expiring Soon')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-red-500`}>
                {stats.expired}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chemicalInventory.expired', 'Expired')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-purple-500`}>
                {stats.restrictedItems}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chemicalInventory.restricted', 'Restricted')}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
              { id: 'transactions', label: 'Transactions', icon: <RefreshCw className="w-4 h-4" /> },
              { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'alerts' && (stats.lowStock + stats.expiring + stats.expired) > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {stats.lowStock + stats.expiring + stats.expired}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.chemicalInventory.searchByNameIngredientEpa', 'Search by name, ingredient, EPA number, target pest...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            >
              <option value="all">{t('tools.chemicalInventory.allCategories', 'All Categories')}</option>
              <option value="insecticide">{t('tools.chemicalInventory.insecticide', 'Insecticide')}</option>
              <option value="rodenticide">{t('tools.chemicalInventory.rodenticide', 'Rodenticide')}</option>
              <option value="herbicide">{t('tools.chemicalInventory.herbicide', 'Herbicide')}</option>
              <option value="fungicide">{t('tools.chemicalInventory.fungicide', 'Fungicide')}</option>
              <option value="repellent">{t('tools.chemicalInventory.repellent', 'Repellent')}</option>
              <option value="other">{t('tools.chemicalInventory.other', 'Other')}</option>
            </select>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value as typeof filterStock)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            >
              <option value="all">{t('tools.chemicalInventory.allStock', 'All Stock')}</option>
              <option value="low">{t('tools.chemicalInventory.lowStock2', 'Low Stock')}</option>
              <option value="out">{t('tools.chemicalInventory.outOfStock2', 'Out of Stock')}</option>
              <option value="expiring">{t('tools.chemicalInventory.expiringSoon2', 'Expiring Soon')}</option>
            </select>
            <button
              onClick={() => setShowAddChemical(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('tools.chemicalInventory.addProduct', 'Add Product')}
            </button>
          </div>
        </div>

        {/* Inventory Tab Content */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {filteredChemicals.map((chemical) => {
              const stockStatus = getStockStatus(chemical);
              const expStatus = getExpirationStatus(chemical.expirationDate);

              return (
                <div
                  key={chemical.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}
                >
                  {/* Item Header */}
                  <div
                    className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    onClick={() => toggleItemExpanded(chemical.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Beaker className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {chemical.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                            {expStatus && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${expStatus.color}`}>
                                {expStatus.label}
                              </span>
                            )}
                            {chemical.restrictedUse && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30">
                                {t('tools.chemicalInventory.restrictedUse', 'Restricted Use')}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase ${getSignalWordColor(chemical.signalWord)}`}>
                              {chemical.signalWord}
                            </span>
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {chemical.activeIngredient} {chemical.concentration} | EPA: {chemical.epaRegistration}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {chemical.quantity} {chemical.unit} in stock | {chemical.storageLocation}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(chemical.quantity * chemical.costPerUnit)}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatCurrency(chemical.costPerUnit)}/{chemical.unit}
                          </div>
                        </div>
                        {expandedItems.has(chemical.id) ? (
                          <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItems.has(chemical.id) && (
                    <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Product Details */}
                        <div className="space-y-4">
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.chemicalInventory.productDetails', 'Product Details')}
                          </h4>
                          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div>Manufacturer: <span className="font-medium">{chemical.manufacturer}</span></div>
                            <div>Category: <span className="font-medium capitalize">{chemical.category}</span></div>
                            <div>Formulation: <span className="font-medium capitalize">{chemical.formulation}</span></div>
                            <div>Target Pests: <span className="font-medium">{chemical.targetPests.join(', ') || 'N/A'}</span></div>
                            <div>Lot Number: <span className="font-medium">{chemical.lotNumber}</span></div>
                            <div>Mfg Date: <span className="font-medium">{formatDate(chemical.manufactureDate)}</span></div>
                            <div>Exp Date: <span className="font-medium">{formatDate(chemical.expirationDate)}</span></div>
                          </div>
                        </div>

                        {/* Stock & Pricing */}
                        <div className="space-y-4">
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.chemicalInventory.stockPricing', 'Stock & Pricing')}
                          </h4>
                          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div>Current Stock: <span className="font-medium">{chemical.quantity} {chemical.unit}</span></div>
                            <div>Min Stock: <span className="font-medium">{chemical.minStock} {chemical.unit}</span></div>
                            <div>Reorder Point: <span className="font-medium">{chemical.reorderPoint} {chemical.unit}</span></div>
                            <div>Cost/Unit: <span className="font-medium">{formatCurrency(chemical.costPerUnit)}</span></div>
                            <div>Total Value: <span className="font-medium">{formatCurrency(chemical.quantity * chemical.costPerUnit)}</span></div>
                            <div>Supplier: <span className="font-medium">{chemical.supplier}</span></div>
                          </div>
                        </div>

                        {/* Safety & Storage */}
                        <div className="space-y-4">
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.chemicalInventory.safetyStorage', 'Safety & Storage')}
                          </h4>
                          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div>Storage: <span className="font-medium">{chemical.storageLocation}</span></div>
                            <div>Re-entry: <span className="font-medium">{chemical.reentryInterval} hours</span></div>
                            <div>PPE: <span className="font-medium">{chemical.ppeRequired.join(', ') || 'N/A'}</span></div>
                            {chemical.safetyDataSheet && (
                              <a
                                href={chemical.safetyDataSheet}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[#0D9488] hover:underline"
                              >
                                <FileText className="w-4 h-4" />
                                View SDS
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex gap-2`}>
                        <button
                          onClick={() => { setSelectedChemical(chemical); setShowAddTransaction(true); }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {t('tools.chemicalInventory.recordTransaction', 'Record Transaction')}
                        </button>
                        <button
                          onClick={() => handleDeleteChemical(chemical.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredChemicals.length === 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
                <FlaskConical className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.chemicalInventory.noProductsFound', 'No products found')}
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.chemicalInventory.addYourFirstChemicalProduct', 'Add your first chemical product to the inventory.')}
                </p>
                <button
                  onClick={() => setShowAddChemical(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.chemicalInventory.addProduct2', 'Add Product')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingDown className="w-5 h-5 text-yellow-500" />
                  Low Stock Items ({lowStockItems.length})
                </h3>
                <div className="space-y-2">
                  {lowStockItems.map(item => (
                    <div key={item.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'} flex justify-between items-center`}>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.quantity} {item.unit} remaining (Reorder at: {item.reorderPoint})
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedChemical(item); setTransactionForm({ ...transactionForm, type: 'purchase', chemicalId: item.id }); setShowAddTransaction(true); }}
                        className="px-3 py-1 bg-[#0D9488] text-white rounded-lg text-sm"
                      >
                        {t('tools.chemicalInventory.orderMore', 'Order More')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring Soon */}
            {expiringItems.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5 text-orange-500" />
                  Expiring Soon ({expiringItems.length})
                </h3>
                <div className="space-y-2">
                  {expiringItems.map(item => (
                    <div key={item.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'} flex justify-between items-center`}>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Expires: {formatDate(item.expirationDate)} | {item.quantity} {item.unit} remaining
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expired */}
            {expiredItems.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Expired Products ({expiredItems.length})
                </h3>
                <div className="space-y-2">
                  {expiredItems.map(item => (
                    <div key={item.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-red-50'} flex justify-between items-center`}>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Expired: {formatDate(item.expirationDate)} | {item.quantity} {item.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedChemical(item); setTransactionForm({ ...transactionForm, type: 'disposal', quantity: item.quantity, chemicalId: item.id }); setShowAddTransaction(true); }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                      >
                        {t('tools.chemicalInventory.logDisposal', 'Log Disposal')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.lowStock + stats.expiring + stats.expired === 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
                <Shield className={`w-12 h-12 mx-auto mb-4 text-green-500`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.chemicalInventory.allClear', 'All Clear!')}
                </h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  {t('tools.chemicalInventory.noInventoryAlertsAtThis', 'No inventory alerts at this time.')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add Chemical Modal */}
        {showAddChemical && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.chemicalInventory.addChemicalProduct', 'Add Chemical Product')}
                </h3>
                <button
                  onClick={() => { setShowAddChemical(false); resetChemicalForm(); }}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.productName', 'Product Name *')}
                    </label>
                    <input
                      type="text"
                      value={chemicalForm.name || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder={t('tools.chemicalInventory.eGTermidorSc', 'e.g., Termidor SC')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.epaRegistration', 'EPA Registration *')}
                    </label>
                    <input
                      type="text"
                      value={chemicalForm.epaRegistration || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, epaRegistration: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder="e.g., 7969-210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.activeIngredient', 'Active Ingredient')}
                    </label>
                    <input
                      type="text"
                      value={chemicalForm.activeIngredient || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, activeIngredient: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.concentration', 'Concentration')}
                    </label>
                    <input
                      type="text"
                      value={chemicalForm.concentration || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, concentration: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder="e.g., 9.1%"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.manufacturer', 'Manufacturer')}
                    </label>
                    <input
                      type="text"
                      value={chemicalForm.manufacturer || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, manufacturer: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.category', 'Category')}
                    </label>
                    <select
                      value={chemicalForm.category || 'insecticide'}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, category: e.target.value as Chemical['category'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="insecticide">{t('tools.chemicalInventory.insecticide2', 'Insecticide')}</option>
                      <option value="rodenticide">{t('tools.chemicalInventory.rodenticide2', 'Rodenticide')}</option>
                      <option value="herbicide">{t('tools.chemicalInventory.herbicide2', 'Herbicide')}</option>
                      <option value="fungicide">{t('tools.chemicalInventory.fungicide2', 'Fungicide')}</option>
                      <option value="repellent">{t('tools.chemicalInventory.repellent2', 'Repellent')}</option>
                      <option value="other">{t('tools.chemicalInventory.other2', 'Other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.formulation', 'Formulation')}
                    </label>
                    <select
                      value={chemicalForm.formulation || 'concentrate'}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, formulation: e.target.value as Chemical['formulation'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="liquid">{t('tools.chemicalInventory.liquid', 'Liquid')}</option>
                      <option value="granular">{t('tools.chemicalInventory.granular', 'Granular')}</option>
                      <option value="dust">{t('tools.chemicalInventory.dust', 'Dust')}</option>
                      <option value="bait">{t('tools.chemicalInventory.bait', 'Bait')}</option>
                      <option value="aerosol">{t('tools.chemicalInventory.aerosol', 'Aerosol')}</option>
                      <option value="concentrate">{t('tools.chemicalInventory.concentrate', 'Concentrate')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.signalWord', 'Signal Word')}
                    </label>
                    <select
                      value={chemicalForm.signalWord || 'caution'}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, signalWord: e.target.value as Chemical['signalWord'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="danger">{t('tools.chemicalInventory.danger', 'Danger')}</option>
                      <option value="warning">{t('tools.chemicalInventory.warning', 'Warning')}</option>
                      <option value="caution">{t('tools.chemicalInventory.caution', 'Caution')}</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chemicalForm.restrictedUse || false}
                        onChange={(e) => setChemicalForm({ ...chemicalForm, restrictedUse: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.chemicalInventory.restrictedUse2', 'Restricted Use')}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.quantity', 'Quantity')}
                    </label>
                    <input
                      type="number"
                      value={chemicalForm.quantity || 0}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, quantity: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.unit', 'Unit')}
                    </label>
                    <input
                      type="text"
                      value={chemicalForm.unit || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, unit: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder={t('tools.chemicalInventory.ozLbsGal', 'oz, lbs, gal')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.minStock', 'Min Stock')}
                    </label>
                    <input
                      type="number"
                      value={chemicalForm.minStock || 0}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, minStock: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.reorderPoint', 'Reorder Point')}
                    </label>
                    <input
                      type="number"
                      value={chemicalForm.reorderPoint || 0}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, reorderPoint: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.costUnit', 'Cost/Unit')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={chemicalForm.costPerUnit || 0}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, costPerUnit: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.manufactureDate', 'Manufacture Date')}
                    </label>
                    <input
                      type="date"
                      value={chemicalForm.manufactureDate || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, manufactureDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.expirationDate', 'Expiration Date')}
                    </label>
                    <input
                      type="date"
                      value={chemicalForm.expirationDate || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, expirationDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.storageLocation', 'Storage Location')}
                    </label>
                    <input
                      type="text"
                      value={chemicalForm.storageLocation || ''}
                      onChange={(e) => setChemicalForm({ ...chemicalForm, storageLocation: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-inherit">
                <button
                  onClick={() => { setShowAddChemical(false); resetChemicalForm(); }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.chemicalInventory.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddChemical}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.chemicalInventory.addProduct3', 'Add Product')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Transaction Modal */}
        {showAddTransaction && selectedChemical && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Record Transaction - {selectedChemical.name}
                </h3>
                <button
                  onClick={() => { setShowAddTransaction(false); setSelectedChemical(null); resetTransactionForm(); }}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Stock: <span className="font-medium">{selectedChemical.quantity} {selectedChemical.unit}</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.chemicalInventory.transactionType', 'Transaction Type *')}
                  </label>
                  <select
                    value={transactionForm.type || 'usage'}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as InventoryTransaction['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  >
                    <option value="usage">{t('tools.chemicalInventory.usage', 'Usage')}</option>
                    <option value="purchase">{t('tools.chemicalInventory.purchase', 'Purchase')}</option>
                    <option value="disposal">{t('tools.chemicalInventory.disposal', 'Disposal')}</option>
                    <option value="adjustment">{t('tools.chemicalInventory.adjustment', 'Adjustment')}</option>
                    <option value="return">{t('tools.chemicalInventory.return', 'Return')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.quantity2', 'Quantity *')}
                    </label>
                    <input
                      type="number"
                      value={transactionForm.quantity || 0}
                      onChange={(e) => setTransactionForm({ ...transactionForm, quantity: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.chemicalInventory.date', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={transactionForm.date || ''}
                      onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.chemicalInventory.notes', 'Notes')}
                  </label>
                  <textarea
                    value={transactionForm.notes || ''}
                    onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    placeholder={t('tools.chemicalInventory.transactionNotes', 'Transaction notes...')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => { setShowAddTransaction(false); setSelectedChemical(null); resetTransactionForm(); }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.chemicalInventory.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddTransaction}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.chemicalInventory.recordTransaction2', 'Record Transaction')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-600 text-white rounded-lg shadow-lg z-40">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ChemicalInventoryTool;
