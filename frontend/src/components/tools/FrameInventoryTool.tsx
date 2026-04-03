'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Glasses,
  Plus,
  Trash2,
  Search,
  Filter,
  Package,
  DollarSign,
  Tag,
  Edit2,
  X,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Image,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

interface FrameInventoryToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Frame {
  id: string;
  sku: string;
  brand: string;
  model: string;
  color: string;
  size: string;
  material: 'metal' | 'plastic' | 'titanium' | 'acetate' | 'wood' | 'mixed';
  rimType: 'full-rim' | 'semi-rimless' | 'rimless';
  gender: 'men' | 'women' | 'unisex' | 'kids';
  category: 'eyeglasses' | 'sunglasses' | 'sport' | 'safety' | 'reading';
  wholesaleCost: number;
  retailPrice: number;
  quantity: number;
  reorderLevel: number;
  location: string;
  supplier: string;
  imageUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  terms: string;
  leadTime: number;
  createdAt: string;
}

// Constants
const BRANDS = [
  'Ray-Ban',
  'Oakley',
  'Gucci',
  'Prada',
  'Tom Ford',
  'Versace',
  'Coach',
  'Michael Kors',
  'Nike',
  'Luxottica',
  'Essilor',
  'Warby Parker',
  'Zenni',
  'Other',
];

const MATERIALS = [
  { value: 'metal', label: 'Metal' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'titanium', label: 'Titanium' },
  { value: 'acetate', label: 'Acetate' },
  { value: 'wood', label: 'Wood' },
  { value: 'mixed', label: 'Mixed Materials' },
];

const RIM_TYPES = [
  { value: 'full-rim', label: 'Full Rim' },
  { value: 'semi-rimless', label: 'Semi-Rimless' },
  { value: 'rimless', label: 'Rimless' },
];

const GENDERS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Kids' },
];

const CATEGORIES = [
  { value: 'eyeglasses', label: 'Eyeglasses' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'sport', label: 'Sport/Performance' },
  { value: 'safety', label: 'Safety Glasses' },
  { value: 'reading', label: 'Reading Glasses' },
];

// Column configuration for exports
const FRAME_COLUMNS: ColumnConfig[] = [
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'material', header: 'Material', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'wholesaleCost', header: 'Wholesale Cost', type: 'currency' },
  { key: 'retailPrice', header: 'Retail Price', type: 'currency' },
  { key: 'quantity', header: 'Qty', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
];

const SUPPLIER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Supplier Name', type: 'string' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'leadTime', header: 'Lead Time (days)', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateSku = () => `FRM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Main Component
export const FrameInventoryTool: React.FC<FrameInventoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: frames,
    addItem: addFrameToBackend,
    updateItem: updateFrameBackend,
    deleteItem: deleteFrameBackend,
    isSynced: framesSynced,
    isSaving: framesSaving,
    lastSaved: framesLastSaved,
    syncError: framesSyncError,
    forceSync: forceFramesSync,
  } = useToolData<Frame>('frame-inventory', [], FRAME_COLUMNS);

  const {
    data: suppliers,
    addItem: addSupplierToBackend,
    updateItem: updateSupplierBackend,
    deleteItem: deleteSupplierBackend,
  } = useToolData<Supplier>('frame-suppliers', [], SUPPLIER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers' | 'analytics'>('inventory');
  const [showFrameForm, setShowFrameForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingFrameId, setEditingFrameId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMaterial, setFilterMaterial] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState(false);

  // New frame form state
  const [newFrame, setNewFrame] = useState<Partial<Frame>>({
    sku: '',
    brand: '',
    model: '',
    color: '',
    size: '',
    material: 'plastic',
    rimType: 'full-rim',
    gender: 'unisex',
    category: 'eyeglasses',
    wholesaleCost: 0,
    retailPrice: 0,
    quantity: 0,
    reorderLevel: 5,
    location: '',
    supplier: '',
    notes: '',
    isActive: true,
  });

  // New supplier form state
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    terms: 'Net 30',
    leadTime: 7,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.brand || params.model || params.frameData) {
        setNewFrame({
          ...newFrame,
          brand: params.brand || '',
          model: params.model || '',
          color: params.color || '',
        });
        setShowFrameForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add frame
  const addFrame = () => {
    if (!newFrame.brand || !newFrame.model) {
      setValidationMessage('Please fill in required fields (Brand, Model)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const frame: Frame = {
      id: generateId(),
      sku: newFrame.sku || generateSku(),
      brand: newFrame.brand || '',
      model: newFrame.model || '',
      color: newFrame.color || '',
      size: newFrame.size || '',
      material: (newFrame.material as Frame['material']) || 'plastic',
      rimType: (newFrame.rimType as Frame['rimType']) || 'full-rim',
      gender: (newFrame.gender as Frame['gender']) || 'unisex',
      category: (newFrame.category as Frame['category']) || 'eyeglasses',
      wholesaleCost: newFrame.wholesaleCost || 0,
      retailPrice: newFrame.retailPrice || 0,
      quantity: newFrame.quantity || 0,
      reorderLevel: newFrame.reorderLevel || 5,
      location: newFrame.location || '',
      supplier: newFrame.supplier || '',
      notes: newFrame.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingFrameId) {
      updateFrameBackend(editingFrameId, frame);
      setEditingFrameId(null);
    } else {
      addFrameToBackend(frame);
    }

    setShowFrameForm(false);
    resetFrameForm();
  };

  const resetFrameForm = () => {
    setNewFrame({
      sku: '',
      brand: '',
      model: '',
      color: '',
      size: '',
      material: 'plastic',
      rimType: 'full-rim',
      gender: 'unisex',
      category: 'eyeglasses',
      wholesaleCost: 0,
      retailPrice: 0,
      quantity: 0,
      reorderLevel: 5,
      location: '',
      supplier: '',
      notes: '',
      isActive: true,
    });
  };

  // Edit frame
  const editFrame = (frame: Frame) => {
    setNewFrame(frame);
    setEditingFrameId(frame.id);
    setShowFrameForm(true);
  };

  // Delete frame
  const deleteFrame = async (frameId: string) => {
    const confirmed = await confirm({
      title: 'Delete Frame',
      message: 'Are you sure you want to delete this frame?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteFrameBackend(frameId);
    }
  };

  // Add supplier
  const addSupplier = () => {
    if (!newSupplier.name) {
      setValidationMessage('Please enter supplier name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const supplier: Supplier = {
      id: generateId(),
      name: newSupplier.name || '',
      contactName: newSupplier.contactName || '',
      email: newSupplier.email || '',
      phone: newSupplier.phone || '',
      address: newSupplier.address || '',
      terms: newSupplier.terms || 'Net 30',
      leadTime: newSupplier.leadTime || 7,
      createdAt: new Date().toISOString(),
    };

    addSupplierToBackend(supplier);
    setShowSupplierForm(false);
    setNewSupplier({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      terms: 'Net 30',
      leadTime: 7,
    });
  };

  // Delete supplier
  const deleteSupplier = async (supplierId: string) => {
    const confirmed = await confirm({
      title: 'Delete Supplier',
      message: 'Are you sure you want to delete this supplier?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteSupplierBackend(supplierId);
    }
  };

  // Filtered frames
  const filteredFrames = useMemo(() => {
    return frames.filter((frame) => {
      const matchesSearch =
        searchTerm === '' ||
        frame.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        frame.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        frame.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        frame.color.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === 'all' || frame.brand === filterBrand;
      const matchesCategory = filterCategory === 'all' || frame.category === filterCategory;
      const matchesMaterial = filterMaterial === 'all' || frame.material === filterMaterial;
      const matchesLowStock = !showLowStock || frame.quantity <= frame.reorderLevel;
      return matchesSearch && matchesBrand && matchesCategory && matchesMaterial && matchesLowStock;
    });
  }, [frames, searchTerm, filterBrand, filterCategory, filterMaterial, showLowStock]);

  // Analytics
  const analytics = useMemo(() => {
    const totalInventory = frames.reduce((sum, f) => sum + f.quantity, 0);
    const totalValue = frames.reduce((sum, f) => sum + f.quantity * f.wholesaleCost, 0);
    const totalRetailValue = frames.reduce((sum, f) => sum + f.quantity * f.retailPrice, 0);
    const lowStockCount = frames.filter((f) => f.quantity <= f.reorderLevel).length;
    const outOfStockCount = frames.filter((f) => f.quantity === 0).length;

    const byBrand = frames.reduce((acc, f) => {
      acc[f.brand] = (acc[f.brand] || 0) + f.quantity;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = frames.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + f.quantity;
      return acc;
    }, {} as Record<string, number>);

    const avgMargin = frames.length > 0
      ? frames.reduce((sum, f) => sum + ((f.retailPrice - f.wholesaleCost) / f.retailPrice) * 100, 0) / frames.length
      : 0;

    return {
      totalFrames: frames.length,
      totalInventory,
      totalValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalValue,
      lowStockCount,
      outOfStockCount,
      avgMargin,
      byBrand: Object.entries(byBrand).sort((a, b) => b[1] - a[1]).slice(0, 5),
      byCategory: Object.entries(byCategory),
    };
  }, [frames]);

  const uniqueBrands = useMemo(() => {
    return [...new Set(frames.map((f) => f.brand))].filter(Boolean);
  }, [frames]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.frameInventory.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Glasses className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.frameInventory.frameInventory', 'Frame Inventory')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.frameInventory.manageEyeglassFramesStockLevels', 'Manage eyeglass frames, stock levels, and suppliers')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="frame-inventory" toolName="Frame Inventory" />

              <SyncStatus
                isSynced={framesSynced}
                isSaving={framesSaving}
                lastSaved={framesLastSaved}
                syncError={framesSyncError}
                onForceSync={forceFramesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(frames, FRAME_COLUMNS, { filename: 'frame-inventory' })}
                onExportExcel={() => exportToExcel(frames, FRAME_COLUMNS, { filename: 'frame-inventory' })}
                onExportJSON={() => exportToJSON(frames, { filename: 'frame-inventory' })}
                onExportPDF={async () => {
                  await exportToPDF(frames, FRAME_COLUMNS, {
                    filename: 'frame-inventory',
                    title: 'Frame Inventory Report',
                    subtitle: `${frames.length} frames | Total Value: ${formatCurrency(analytics.totalValue)}`,
                  });
                }}
                onPrint={() => printData(frames, FRAME_COLUMNS, { title: 'Frame Inventory' })}
                onCopyToClipboard={async () => await copyUtil(frames, FRAME_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
              { id: 'suppliers', label: 'Suppliers', icon: <Tag className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
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
              </button>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        {analytics.lowStockCount > 0 && activeTab === 'inventory' && (
          <div className={`${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${theme === 'dark' ? 'border-yellow-700' : 'border-yellow-200'} rounded-lg p-4 mb-6`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                {analytics.lowStockCount} frame(s) at or below reorder level
                {analytics.outOfStockCount > 0 && `, ${analytics.outOfStockCount} out of stock`}
              </span>
              <button
                onClick={() => setShowLowStock(!showLowStock)}
                className={`ml-auto text-sm ${showLowStock ? 'text-yellow-600' : 'text-yellow-700'} hover:underline`}
              >
                {showLowStock ? t('tools.frameInventory.showAll', 'Show All') : t('tools.frameInventory.showLowStockOnly', 'Show Low Stock Only')}
              </button>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.frameInventory.searchFrames', 'Search frames...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.frameInventory.allBrands', 'All Brands')}</option>
                  {uniqueBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.frameInventory.allCategories', 'All Categories')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFrameForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.frameInventory.addFrame', 'Add Frame')}
                </button>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFrames.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center col-span-full`}>
                  <Glasses className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.frameInventory.noFramesFoundAddYour', 'No frames found. Add your first frame to get started.')}
                  </p>
                </div>
              ) : (
                filteredFrames.map((frame) => (
                  <div
                    key={frame.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden ${
                      frame.quantity <= frame.reorderLevel ? 'ring-2 ring-yellow-500' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {frame.sku}
                            </span>
                            {frame.quantity <= frame.reorderLevel && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                                {t('tools.frameInventory.lowStock', 'Low Stock')}
                              </span>
                            )}
                          </div>
                          <h3 className={`font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {frame.brand}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {frame.model}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => editFrame(frame)}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => deleteFrame(frame.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frameInventory.color', 'Color:')}</span>
                          <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {frame.color || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frameInventory.size', 'Size:')}</span>
                          <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {frame.size || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frameInventory.material', 'Material:')}</span>
                          <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {MATERIALS.find((m) => m.value === frame.material)?.label}
                          </span>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frameInventory.type', 'Type:')}</span>
                          <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {RIM_TYPES.find((r) => r.value === frame.rimType)?.label}
                          </span>
                        </div>
                      </div>

                      <div className={`border-t pt-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(frame.retailPrice)}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              Cost: {formatCurrency(frame.wholesaleCost)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              frame.quantity === 0
                                ? 'text-red-500'
                                : frame.quantity <= frame.reorderLevel
                                ? 'text-yellow-500'
                                : theme === 'dark'
                                ? 'text-green-400'
                                : 'text-green-600'
                            }`}>
                              {frame.quantity}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {t('tools.frameInventory.inStock', 'in stock')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.frameInventory.supplierDirectory', 'Supplier Directory')}
              </h2>
              <button
                onClick={() => setShowSupplierForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.frameInventory.addSupplier', 'Add Supplier')}
              </button>
            </div>

            <div className="grid gap-4">
              {suppliers.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <Tag className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.frameInventory.noSuppliersYetAddYour', 'No suppliers yet. Add your first supplier to get started.')}
                  </p>
                </div>
              ) : (
                suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                          <Tag className="w-5 h-5 text-[#0D9488]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {supplier.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {supplier.contactName} | {supplier.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Terms: {supplier.terms}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Lead Time: {supplier.leadTime} days
                          </p>
                        </div>
                        <button
                          onClick={() => deleteSupplier(supplier.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.frameInventory.totalSkus', 'Total SKUs')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalFrames}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <Glasses className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.frameInventory.totalUnits', 'Total Units')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalInventory}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.frameInventory.inventoryValue', 'Inventory Value')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.totalValue)}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.frameInventory.potentialProfit', 'Potential Profit')}</h3>
              </div>
              <p className={`text-3xl font-bold text-green-500`}>
                {formatCurrency(analytics.potentialProfit)}
              </p>
            </div>

            {/* By Brand */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 md:col-span-2`}>
              <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.frameInventory.topBrandsByQuantity', 'Top Brands by Quantity')}
              </h3>
              <div className="space-y-3">
                {analytics.byBrand.map(([brand, count]) => (
                  <div key={brand} className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{brand}</span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '100px' }}>
                        <div
                          className="h-2 rounded bg-[#0D9488]"
                          style={{ width: `${(count / analytics.totalInventory) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 md:col-span-2`}>
              <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.frameInventory.byCategory', 'By Category')}
              </h3>
              <div className="space-y-3">
                {analytics.byCategory.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {CATEGORIES.find((c) => c.value === category)?.label || category}
                    </span>
                    <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Frame Form Modal */}
        {showFrameForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingFrameId ? t('tools.frameInventory.editFrame', 'Edit Frame') : t('tools.frameInventory.addNewFrame', 'Add New Frame')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowFrameForm(false);
                      setEditingFrameId(null);
                      resetFrameForm();
                    }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.brand', 'Brand *')}
                      </label>
                      <select
                        value={newFrame.brand}
                        onChange={(e) => setNewFrame({ ...newFrame, brand: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.frameInventory.selectBrand', 'Select Brand...')}</option>
                        {BRANDS.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.model', 'Model *')}
                      </label>
                      <input
                        type="text"
                        value={newFrame.model}
                        onChange={(e) => setNewFrame({ ...newFrame, model: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.color2', 'Color')}
                      </label>
                      <input
                        type="text"
                        value={newFrame.color}
                        onChange={(e) => setNewFrame({ ...newFrame, color: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.size2', 'Size')}
                      </label>
                      <input
                        type="text"
                        placeholder="52-18-140"
                        value={newFrame.size}
                        onChange={(e) => setNewFrame({ ...newFrame, size: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.category', 'Category')}
                      </label>
                      <select
                        value={newFrame.category}
                        onChange={(e) => setNewFrame({ ...newFrame, category: e.target.value as Frame['category'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.material2', 'Material')}
                      </label>
                      <select
                        value={newFrame.material}
                        onChange={(e) => setNewFrame({ ...newFrame, material: e.target.value as Frame['material'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {MATERIALS.map((mat) => (
                          <option key={mat.value} value={mat.value}>
                            {mat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.rimType', 'Rim Type')}
                      </label>
                      <select
                        value={newFrame.rimType}
                        onChange={(e) => setNewFrame({ ...newFrame, rimType: e.target.value as Frame['rimType'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {RIM_TYPES.map((rim) => (
                          <option key={rim.value} value={rim.value}>
                            {rim.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.gender', 'Gender')}
                      </label>
                      <select
                        value={newFrame.gender}
                        onChange={(e) => setNewFrame({ ...newFrame, gender: e.target.value as Frame['gender'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {GENDERS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.wholesaleCost', 'Wholesale Cost ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newFrame.wholesaleCost}
                        onChange={(e) => setNewFrame({ ...newFrame, wholesaleCost: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.retailPrice', 'Retail Price ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newFrame.retailPrice}
                        onChange={(e) => setNewFrame({ ...newFrame, retailPrice: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.quantity', 'Quantity')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newFrame.quantity}
                        onChange={(e) => setNewFrame({ ...newFrame, quantity: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.reorderLevel', 'Reorder Level')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newFrame.reorderLevel}
                        onChange={(e) => setNewFrame({ ...newFrame, reorderLevel: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.location', 'Location')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('tools.frameInventory.shelfA1', 'Shelf A-1')}
                        value={newFrame.location}
                        onChange={(e) => setNewFrame({ ...newFrame, location: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.frameInventory.notes', 'Notes')}
                    </label>
                    <textarea
                      value={newFrame.notes}
                      onChange={(e) => setNewFrame({ ...newFrame, notes: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowFrameForm(false);
                      setEditingFrameId(null);
                      resetFrameForm();
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.frameInventory.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addFrame}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {editingFrameId ? t('tools.frameInventory.updateFrame', 'Update Frame') : t('tools.frameInventory.addFrame2', 'Add Frame')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Form Modal */}
        {showSupplierForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.frameInventory.addSupplier2', 'Add Supplier')}
                  </h2>
                  <button
                    onClick={() => setShowSupplierForm(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.frameInventory.supplierName', 'Supplier Name *')}
                    </label>
                    <input
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.contactName', 'Contact Name')}
                      </label>
                      <input
                        type="text"
                        value={newSupplier.contactName}
                        onChange={(e) => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.frameInventory.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.terms', 'Terms')}
                      </label>
                      <input
                        type="text"
                        value={newSupplier.terms}
                        onChange={(e) => setNewSupplier({ ...newSupplier, terms: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.frameInventory.leadTimeDays', 'Lead Time (days)')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newSupplier.leadTime}
                        onChange={(e) => setNewSupplier({ ...newSupplier, leadTime: parseInt(e.target.value) || 7 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowSupplierForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.frameInventory.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addSupplier}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.frameInventory.addSupplier3', 'Add Supplier')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrameInventoryTool;
