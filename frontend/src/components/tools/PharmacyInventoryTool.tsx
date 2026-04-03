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
  Package,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  Pill,
  Calendar,
  TrendingDown,
  TrendingUp,
  FileText,
} from 'lucide-react';

// Types
interface InventoryItem {
  id: string;
  drugName: string;
  genericName: string;
  ndc: string;
  manufacturer: string;
  strength: string;
  dosageForm: string;
  packageSize: string;
  unitOfMeasure: string;
  quantityOnHand: number;
  reorderPoint: number;
  reorderQuantity: number;
  awpPrice: number;
  acquisitionCost: number;
  lastPurchaseDate: string;
  expirationDate: string;
  lotNumber: string;
  location: string;
  supplier: string;
  isControlled: boolean;
  schedule: string;
  isRefrigerated: boolean;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'discontinued';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  items: {
    drugName: string;
    ndc: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  receivedDate: string;
  receivedBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'in_stock', label: 'In Stock', color: 'bg-green-500' },
  { value: 'low_stock', label: 'Low Stock', color: 'bg-yellow-500' },
  { value: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-500' },
  { value: 'on_order', label: 'On Order', color: 'bg-blue-500' },
  { value: 'discontinued', label: 'Discontinued', color: 'bg-gray-500' },
];

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Solution', 'Suspension', 'Cream', 'Ointment', 'Injection', 'Patch', 'Inhaler', 'Other'];
const SUPPLIERS = ['McKesson', 'Cardinal Health', 'AmerisourceBergen', 'Morris & Dickson', 'HD Smith', 'Other'];

// Column configurations
const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'drugName', header: 'Drug Name', type: 'string' },
  { key: 'ndc', header: 'NDC', type: 'string' },
  { key: 'manufacturer', header: 'Manufacturer', type: 'string' },
  { key: 'quantityOnHand', header: 'Qty On Hand', type: 'number' },
  { key: 'reorderPoint', header: 'Reorder Point', type: 'number' },
  { key: 'acquisitionCost', header: 'Cost', type: 'currency' },
  { key: 'expirationDate', header: 'Expiration', type: 'date' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const PO_COLUMNS: ColumnConfig[] = [
  { key: 'poNumber', header: 'PO #', type: 'string' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

interface PharmacyInventoryToolProps {
  uiConfig?: UIConfig;
}

export const PharmacyInventoryTool = ({
  uiConfig }: PharmacyInventoryToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: inventory,
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
  } = useToolData<InventoryItem>('pharmacy-inventory', [], INVENTORY_COLUMNS);

  const {
    data: orders,
    addItem: addOrder,
    updateItem: updateOrder,
    deleteItem: deleteOrder,
  } = useToolData<PurchaseOrder>('pharmacy-orders', [], PO_COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'reorder' | 'expiring'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const defaultForm: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
    drugName: '',
    genericName: '',
    ndc: '',
    manufacturer: '',
    strength: '',
    dosageForm: 'Tablet',
    packageSize: '',
    unitOfMeasure: 'EA',
    quantityOnHand: 0,
    reorderPoint: 10,
    reorderQuantity: 100,
    awpPrice: 0,
    acquisitionCost: 0,
    lastPurchaseDate: '',
    expirationDate: '',
    lotNumber: '',
    location: '',
    supplier: 'McKesson',
    isControlled: false,
    schedule: '',
    isRefrigerated: false,
    status: 'in_stock',
    notes: '',
  };

  const [form, setForm] = useState(defaultForm);

  const defaultOrderForm: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'> = {
    poNumber: '',
    supplier: 'McKesson',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
    status: 'draft',
    receivedDate: '',
    receivedBy: '',
    notes: '',
  };

  const [orderForm, setOrderForm] = useState(defaultOrderForm);

  // Generate PO number
  const generatePONumber = () => {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const seq = orders.filter(o => o.orderDate === orderForm.orderDate).length + 1;
    return `PO${y}${m}${d}-${seq.toString().padStart(3, '0')}`;
  };

  // Auto-update status based on quantity
  useEffect(() => {
    if (form.quantityOnHand <= 0) {
      setForm(prev => ({ ...prev, status: 'out_of_stock' }));
    } else if (form.quantityOnHand <= form.reorderPoint) {
      setForm(prev => ({ ...prev, status: 'low_stock' }));
    } else {
      setForm(prev => ({ ...prev, status: 'in_stock' }));
    }
  }, [form.quantityOnHand, form.reorderPoint]);

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch =
        item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ndc.includes(searchTerm) ||
        item.genericName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchTerm, statusFilter]);

  // Items needing reorder
  const needsReorder = useMemo(() => {
    return inventory.filter(item =>
      item.quantityOnHand <= item.reorderPoint && item.status !== 'discontinued'
    );
  }, [inventory]);

  // Expiring items (within 90 days)
  const expiringItems = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 90);
    return inventory.filter(item => {
      if (!item.expirationDate) return false;
      return new Date(item.expirationDate) <= cutoff;
    }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  }, [inventory]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantityOnHand * item.acquisitionCost), 0);
    return {
      totalItems: inventory.length,
      lowStock: inventory.filter(i => i.status === 'low_stock').length,
      outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
      expiringSoon: expiringItems.length,
      totalValue,
      pendingOrders: orders.filter(o => o.status === 'submitted' || o.status === 'shipped').length,
    };
  }, [inventory, expiringItems, orders]);

  // Submit inventory item
  const handleSubmit = () => {
    const now = new Date().toISOString();

    if (editingId) {
      updateItem(editingId, { ...form, updatedAt: now });
      setEditingId(null);
    } else {
      const newItem: InventoryItem = {
        ...form,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      addItem(newItem);
    }

    setForm(defaultForm);
    setShowForm(false);
  };

  // Add items to order from reorder list
  const addToOrder = (items: InventoryItem[]) => {
    const orderItems = items.map(item => ({
      drugName: item.drugName,
      ndc: item.ndc,
      quantity: item.reorderQuantity,
      unitCost: item.acquisitionCost,
      total: item.reorderQuantity * item.acquisitionCost,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0);

    setOrderForm({
      ...defaultOrderForm,
      poNumber: generatePONumber(),
      items: orderItems,
      subtotal,
      total: subtotal,
    });
    setShowOrderForm(true);
  };

  // Submit order
  const handleOrderSubmit = () => {
    const now = new Date().toISOString();
    const newOrder: PurchaseOrder = {
      ...orderForm,
      id: crypto.randomUUID(),
      poNumber: orderForm.poNumber || generatePONumber(),
      createdAt: now,
      updatedAt: now,
    };
    addOrder(newOrder);
    setOrderForm(defaultOrderForm);
    setShowOrderForm(false);
    setActiveTab('orders');
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
            <Package className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('tools.pharmacyInventory.pharmacyInventory', 'Pharmacy Inventory')}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.pharmacyInventory.drugInventoryAndPurchaseOrder', 'Drug inventory and purchase order management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="pharmacy-inventory" toolName="Pharmacy Inventory" />

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
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-6">
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pharmacyInventory.totalItems', 'Total Items')}</p>
            <p className="text-2xl font-bold text-indigo-500">{stats.totalItems}</p>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pharmacyInventory.lowStock', 'Low Stock')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pharmacyInventory.outOfStock', 'Out of Stock')}</p>
            <p className="text-2xl font-bold text-red-500">{stats.outOfStock}</p>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pharmacyInventory.expiringSoon', 'Expiring Soon')}</p>
            <p className="text-2xl font-bold text-orange-500">{stats.expiringSoon}</p>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pharmacyInventory.pendingOrders', 'Pending Orders')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pharmacyInventory.totalValue', 'Total Value')}</p>
            <p className="text-xl font-bold text-green-500">${stats.totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart, badge: stats.pendingOrders },
          { id: 'reorder', label: 'Needs Reorder', icon: TrendingDown, badge: needsReorder.length },
          { id: 'expiring', label: 'Expiring', icon: Calendar, badge: expiringItems.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-red-500 text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>{t('tools.pharmacyInventory.drugInventory', 'Drug Inventory')}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">{t('tools.pharmacyInventory.allStatus', 'All Status')}</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.pharmacyInventory.search', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingId(null);
                    setForm(defaultForm);
                  }}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.pharmacyInventory.addItem', 'Add Item')}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <div className="space-y-6">
                <h3 className="font-semibold">{editingId ? t('tools.pharmacyInventory.editItem', 'Edit Item') : t('tools.pharmacyInventory.addNewItem', 'Add New Item')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.pharmacyInventory.drugName', 'Drug Name *')}</label>
                    <input
                      type="text"
                      value={form.drugName}
                      onChange={(e) => setForm({ ...form, drugName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.genericName', 'Generic Name')}</label>
                    <input
                      type="text"
                      value={form.genericName}
                      onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.ndc', 'NDC *')}</label>
                    <input
                      type="text"
                      value={form.ndc}
                      onChange={(e) => setForm({ ...form, ndc: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pharmacyInventory.xxxxxXxxxXx', 'XXXXX-XXXX-XX')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.manufacturer', 'Manufacturer')}</label>
                    <input
                      type="text"
                      value={form.manufacturer}
                      onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.strength', 'Strength')}</label>
                    <input
                      type="text"
                      value={form.strength}
                      onChange={(e) => setForm({ ...form, strength: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pharmacyInventory.eG10mg', 'e.g., 10mg')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.dosageForm', 'Dosage Form')}</label>
                    <select
                      value={form.dosageForm}
                      onChange={(e) => setForm({ ...form, dosageForm: e.target.value })}
                      className={inputClass}
                    >
                      {DOSAGE_FORMS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.packageSize', 'Package Size')}</label>
                    <input
                      type="text"
                      value={form.packageSize}
                      onChange={(e) => setForm({ ...form, packageSize: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.supplier', 'Supplier')}</label>
                    <select
                      value={form.supplier}
                      onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                      className={inputClass}
                    >
                      {SUPPLIERS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.qtyOnHand', 'Qty On Hand *')}</label>
                    <input
                      type="number"
                      value={form.quantityOnHand}
                      onChange={(e) => setForm({ ...form, quantityOnHand: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.reorderPoint', 'Reorder Point')}</label>
                    <input
                      type="number"
                      value={form.reorderPoint}
                      onChange={(e) => setForm({ ...form, reorderPoint: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.reorderQty', 'Reorder Qty')}</label>
                    <input
                      type="number"
                      value={form.reorderQuantity}
                      onChange={(e) => setForm({ ...form, reorderQuantity: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.acquisitionCost', 'Acquisition Cost')}</label>
                    <input
                      type="number"
                      value={form.acquisitionCost}
                      onChange={(e) => setForm({ ...form, acquisitionCost: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.awpPrice', 'AWP Price')}</label>
                    <input
                      type="number"
                      value={form.awpPrice}
                      onChange={(e) => setForm({ ...form, awpPrice: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.lotNumber', 'Lot Number')}</label>
                    <input
                      type="text"
                      value={form.lotNumber}
                      onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.expirationDate', 'Expiration Date')}</label>
                    <input
                      type="date"
                      value={form.expirationDate}
                      onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.location', 'Location')}</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pharmacyInventory.eGShelfA3', 'e.g., Shelf A-3')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pharmacyInventory.status', 'Status')}</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as InventoryItem['status'] })}
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isControlled}
                      onChange={(e) => setForm({ ...form, isControlled: e.target.checked })}
                      className="rounded"
                    />
                    {t('tools.pharmacyInventory.controlledSubstance', 'Controlled Substance')}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isRefrigerated}
                      onChange={(e) => setForm({ ...form, isRefrigerated: e.target.checked })}
                      className="rounded"
                    />
                    {t('tools.pharmacyInventory.requiresRefrigeration', 'Requires Refrigeration')}
                  </label>
                  {form.isControlled && (
                    <div className="flex items-center gap-2">
                      <span>{t('tools.pharmacyInventory.schedule', 'Schedule:')}</span>
                      <select
                        value={form.schedule}
                        onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                        className={`${inputClass} w-24`}
                      >
                        <option value="">-</option>
                        <option value="II">II</option>
                        <option value="III">{t('tools.pharmacyInventory.iii', 'III')}</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>{t('tools.pharmacyInventory.notes', 'Notes')}</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={`${inputClass} h-20`}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    {t('tools.pharmacyInventory.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.drugName || !form.ndc}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    {editingId ? t('tools.pharmacyInventory.update', 'Update') : t('tools.pharmacyInventory.save', 'Save')} Item
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.pharmacyInventory.noInventoryItems', 'No inventory items')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.drug', 'Drug')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.ndc2', 'NDC')}</th>
                      <th className="text-right py-3 px-3">{t('tools.pharmacyInventory.qty', 'Qty')}</th>
                      <th className="text-right py-3 px-3">{t('tools.pharmacyInventory.reorderPt', 'Reorder Pt')}</th>
                      <th className="text-right py-3 px-3">{t('tools.pharmacyInventory.cost', 'Cost')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.expiration', 'Expiration')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.location2', 'Location')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.status2', 'Status')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => {
                      const statusOpt = STATUS_OPTIONS.find(s => s.value === item.status);
                      const isExpiringSoon = item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                      return (
                        <tr key={item.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="py-3 px-3">
                            <div className="font-medium">{item.drugName}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.strength} {item.dosageForm}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-xs">{item.ndc}</td>
                          <td className={`py-3 px-3 text-right font-bold ${
                            item.quantityOnHand <= 0 ? 'text-red-500' :
                            item.quantityOnHand <= item.reorderPoint ? 'text-yellow-500' : ''
                          }`}>
                            {item.quantityOnHand}
                          </td>
                          <td className="py-3 px-3 text-right">{item.reorderPoint}</td>
                          <td className="py-3 px-3 text-right">${item.acquisitionCost.toFixed(2)}</td>
                          <td className={`py-3 px-3 ${isExpiringSoon ? 'text-orange-500 font-medium' : ''}`}>
                            {item.expirationDate || '-'}
                          </td>
                          <td className="py-3 px-3">{item.location || '-'}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded text-xs text-white ${statusOpt?.color}`}>
                              {statusOpt?.label}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setForm(item);
                                  setShowForm(true);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
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

      {/* Reorder Tab */}
      {activeTab === 'reorder' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-yellow-500" />
                Items Needing Reorder ({needsReorder.length})
              </CardTitle>
              {needsReorder.length > 0 && (
                <button
                  onClick={() => addToOrder(needsReorder)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t('tools.pharmacyInventory.createOrderForAll', 'Create Order for All')}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {needsReorder.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.pharmacyInventory.allItemsAdequatelyStocked', 'All items adequately stocked')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needsReorder.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div>
                      <div className="font-medium">{item.drugName}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        NDC: {item.ndc} | Current: {item.quantityOnHand} | Reorder at: {item.reorderPoint}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Order: {item.reorderQuantity}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Est: ${(item.reorderQuantity * item.acquisitionCost).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => addToOrder([item])}
                        className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                      >
                        {t('tools.pharmacyInventory.order', 'Order')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expiring Tab */}
      {activeTab === 'expiring' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Expiring Within 90 Days ({expiringItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringItems.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.pharmacyInventory.noItemsExpiringSoon', 'No items expiring soon')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.drug2', 'Drug')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.ndc3', 'NDC')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.lot', 'Lot #')}</th>
                      <th className="text-right py-3 px-3">{t('tools.pharmacyInventory.qty2', 'Qty')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.expiration2', 'Expiration')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.daysLeft', 'Days Left')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringItems.map(item => {
                      const daysLeft = Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={item.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="py-3 px-3 font-medium">{item.drugName}</td>
                          <td className="py-3 px-3 font-mono text-xs">{item.ndc}</td>
                          <td className="py-3 px-3">{item.lotNumber || '-'}</td>
                          <td className="py-3 px-3 text-right">{item.quantityOnHand}</td>
                          <td className="py-3 px-3">{item.expirationDate}</td>
                          <td className={`py-3 px-3 font-bold ${
                            daysLeft <= 30 ? 'text-red-500' : daysLeft <= 60 ? 'text-orange-500' : 'text-yellow-500'
                          }`}>
                            {daysLeft} days
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

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('tools.pharmacyInventory.purchaseOrders', 'Purchase Orders')}</CardTitle>
              <button
                onClick={() => {
                  setOrderForm({ ...defaultOrderForm, poNumber: generatePONumber() });
                  setShowOrderForm(true);
                }}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.pharmacyInventory.newOrder', 'New Order')}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.pharmacyInventory.noPurchaseOrders', 'No purchase orders')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.po', 'PO #')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.supplier2', 'Supplier')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.date', 'Date')}</th>
                      <th className="text-right py-3 px-3">{t('tools.pharmacyInventory.items', 'Items')}</th>
                      <th className="text-right py-3 px-3">{t('tools.pharmacyInventory.total', 'Total')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.status3', 'Status')}</th>
                      <th className="text-left py-3 px-3">{t('tools.pharmacyInventory.actions2', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3 px-3 font-mono">{order.poNumber}</td>
                        <td className="py-3 px-3">{order.supplier}</td>
                        <td className="py-3 px-3">{order.orderDate}</td>
                        <td className="py-3 px-3 text-right">{order.items.length}</td>
                        <td className="py-3 px-3 text-right font-medium">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-3">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrder(order.id, {
                              status: e.target.value as PurchaseOrder['status'],
                              updatedAt: new Date().toISOString()
                            })}
                            className={`px-2 py-1 rounded text-xs ${
                              order.status === 'received' ? 'bg-green-500 text-white' :
                              order.status === 'shipped' ? 'bg-blue-500 text-white' :
                              order.status === 'cancelled' ? 'bg-red-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}
                          >
                            <option value="draft">{t('tools.pharmacyInventory.draft', 'Draft')}</option>
                            <option value="submitted">{t('tools.pharmacyInventory.submitted', 'Submitted')}</option>
                            <option value="confirmed">{t('tools.pharmacyInventory.confirmed', 'Confirmed')}</option>
                            <option value="shipped">{t('tools.pharmacyInventory.shipped', 'Shipped')}</option>
                            <option value="received">{t('tools.pharmacyInventory.received', 'Received')}</option>
                            <option value="cancelled">{t('tools.pharmacyInventory.cancelled', 'Cancelled')}</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-lg p-6 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{t('tools.pharmacyInventory.createPurchaseOrder', 'Create Purchase Order')}</h3>
              <button onClick={() => setShowOrderForm(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.pharmacyInventory.poNumber', 'PO Number')}</label>
                  <input type="text" value={orderForm.poNumber} className={inputClass} readOnly />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.pharmacyInventory.supplier3', 'Supplier')}</label>
                  <select
                    value={orderForm.supplier}
                    onChange={(e) => setOrderForm({ ...orderForm, supplier: e.target.value })}
                    className={inputClass}
                  >
                    {SUPPLIERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.pharmacyInventory.items2', 'Items')}</label>
                <div className={`rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  {orderForm.items.map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 ${idx > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                      <div>
                        <div className="font-medium">{item.drugName}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          NDC: {item.ndc}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{item.quantity} x ${item.unitCost.toFixed(2)}</div>
                        <div className="font-medium">${item.total.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">{t('tools.pharmacyInventory.total2', 'Total:')}</span>
                <span className="text-xl font-bold">${orderForm.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowOrderForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  {t('tools.pharmacyInventory.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleOrderSubmit}
                  disabled={orderForm.items.length === 0}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                >
                  {t('tools.pharmacyInventory.createOrder', 'Create Order')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyInventoryTool;
