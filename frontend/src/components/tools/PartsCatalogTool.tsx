'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  parseCSV,
  readFileAsText,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Package,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  DollarSign,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  Filter,
  Tag,
  Box,
  Warehouse,
  Clock,
  RefreshCw,
  FileText,
  Building,
  Loader2,
} from 'lucide-react';

// Types
interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  manufacturer: string;
  brand: string;
  oemNumber: string;
  crossReference: string[];
  unitCost: number;
  retailPrice: number;
  wholesalePrice: number;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location: string;
  weight: number;
  dimensions: string;
  compatibleVehicles: string[];
  condition: 'new' | 'refurbished' | 'used' | 'core';
  warranty: string;
  notes: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  paymentTerms: string;
  leadTime: number;
  rating: number;
  notes: string;
  isPreferred: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  items: OrderItem[];
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  orderDate: string;
  expectedDelivery: string;
  receivedDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  partId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface StockAdjustment {
  id: string;
  partId: string;
  type: 'add' | 'remove' | 'transfer' | 'adjustment' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference: string;
  performedBy: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

type TabType = 'catalog' | 'suppliers' | 'orders' | 'adjustments' | 'categories' | 'analytics';

// Tool ID for data persistence
const TOOL_ID = 'parts-catalog';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Engine', description: 'Engine parts and components', parentId: null, sortOrder: 1, isActive: true },
  { id: '2', name: 'Transmission', description: 'Transmission and drivetrain', parentId: null, sortOrder: 2, isActive: true },
  { id: '3', name: 'Brakes', description: 'Brake system components', parentId: null, sortOrder: 3, isActive: true },
  { id: '4', name: 'Suspension', description: 'Suspension and steering', parentId: null, sortOrder: 4, isActive: true },
  { id: '5', name: 'Electrical', description: 'Electrical and lighting', parentId: null, sortOrder: 5, isActive: true },
  { id: '6', name: 'Exhaust', description: 'Exhaust system parts', parentId: null, sortOrder: 6, isActive: true },
  { id: '7', name: 'Cooling', description: 'Cooling system components', parentId: null, sortOrder: 7, isActive: true },
  { id: '8', name: 'Filters', description: 'Air, oil, and fuel filters', parentId: null, sortOrder: 8, isActive: true },
  { id: '9', name: 'Fluids', description: 'Oils, lubricants, and fluids', parentId: null, sortOrder: 9, isActive: true },
  { id: '10', name: 'Body', description: 'Body panels and trim', parentId: null, sortOrder: 10, isActive: true },
  { id: '11', name: 'Interior', description: 'Interior components', parentId: null, sortOrder: 11, isActive: true },
  { id: '12', name: 'Accessories', description: 'Vehicle accessories', parentId: null, sortOrder: 12, isActive: true },
];

const PART_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'used', label: 'Used' },
  { value: 'core', label: 'Core/Exchange' },
];

// Column configurations for export
const partColumns: ColumnConfig[] = [
  { key: 'partNumber', header: 'Part Number', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'manufacturer', header: 'Manufacturer', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'oemNumber', header: 'OEM Number', type: 'string' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'retailPrice', header: 'Retail Price', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'warranty', header: 'Warranty', type: 'string' },
];

const supplierColumns: ColumnConfig[] = [
  { key: 'name', header: 'Supplier Name', type: 'string' },
  { key: 'contactPerson', header: 'Contact Person', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'paymentTerms', header: 'Payment Terms', type: 'string' },
  { key: 'leadTime', header: 'Lead Time (days)', type: 'number' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'isPreferred', header: 'Preferred', type: 'boolean' },
];

const orderColumns: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order Number', type: 'string' },
  { key: 'supplierName', header: 'Supplier', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'itemCount', header: 'Items', type: 'number' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'shipping', header: 'Shipping', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'expectedDelivery', header: 'Expected Delivery', type: 'date' },
];

interface PartsCatalogToolProps {
  uiConfig?: UIConfig;
}

export const PartsCatalogTool: React.FC<PartsCatalogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use useToolData hook for each data type with backend sync
  const partsData = useToolData<Part>(
    `${TOOL_ID}-parts`,
    [],
    partColumns,
    { autoSave: true }
  );

  const suppliersData = useToolData<Supplier>(
    `${TOOL_ID}-suppliers`,
    [],
    supplierColumns,
    { autoSave: true }
  );

  const ordersData = useToolData<PurchaseOrder>(
    `${TOOL_ID}-orders`,
    [],
    orderColumns,
    { autoSave: true }
  );

  const adjustmentsData = useToolData<StockAdjustment>(
    `${TOOL_ID}-adjustments`,
    [],
    [],
    { autoSave: true }
  );

  const categoriesData = useToolData<Category>(
    `${TOOL_ID}-categories`,
    DEFAULT_CATEGORIES,
    [],
    { autoSave: true }
  );

  // Extract data from hooks
  const parts = partsData.data;
  const suppliers = suppliersData.data;
  const purchaseOrders = ordersData.data;
  const adjustments = adjustmentsData.data;
  const categories = categoriesData.data;

  // Combined sync status
  const isLoading = partsData.isLoading || suppliersData.isLoading || ordersData.isLoading;
  const isSaving = partsData.isSaving || suppliersData.isSaving || ordersData.isSaving;
  const isSynced = partsData.isSynced && suppliersData.isSynced && ordersData.isSynced;
  const lastSaved = partsData.lastSaved;
  const syncError = partsData.syncError || suppliersData.syncError || ordersData.syncError;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  // Form states
  const [showPartForm, setShowPartForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [selectedPartForAdjustment, setSelectedPartForAdjustment] = useState<Part | null>(null);

  // Part form
  const [partForm, setPartForm] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    manufacturer: '',
    brand: '',
    oemNumber: '',
    crossReference: '',
    unitCost: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    quantity: 0,
    minStock: 5,
    maxStock: 100,
    reorderPoint: 10,
    location: '',
    weight: 0,
    dimensions: '',
    compatibleVehicles: '',
    condition: 'new' as Part['condition'],
    warranty: '',
    notes: '',
    imageUrl: '',
    isActive: true,
  });

  // Supplier form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    website: '',
    paymentTerms: 'Net 30',
    leadTime: 7,
    rating: 5,
    notes: '',
    isPreferred: false,
  });

  // Order form
  const [orderForm, setOrderForm] = useState({
    supplierId: '',
    items: [] as OrderItem[],
    tax: 0,
    shipping: 0,
    expectedDelivery: '',
    notes: '',
  });

  // Adjustment form
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'add' as StockAdjustment['type'],
    quantity: 0,
    reason: '',
    reference: '',
    performedBy: '',
  });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        // Restore all saved form fields
        if (params.partForm) setPartForm(params.partForm);
        if (params.supplierForm) setSupplierForm(params.supplierForm);
        if (params.orderForm) setOrderForm(params.orderForm);
        if (params.adjustmentForm) setAdjustmentForm(params.adjustmentForm);
        if (params.activeTab) setActiveTab(params.activeTab);
        if (params.searchTerm) setSearchTerm(params.searchTerm);
        if (params.categoryFilter) setCategoryFilter(params.categoryFilter);
        if (params.stockFilter) setStockFilter(params.stockFilter);
        if (params.conditionFilter) setConditionFilter(params.conditionFilter);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Normal prefill
        if (params.partNumber) {
          setPartForm((prev) => ({ ...prev, partNumber: String(params.partNumber) }));
          setIsPrefilled(true);
        }
        if (params.name || params.partName) {
          setPartForm((prev) => ({ ...prev, name: String(params.name || params.partName) }));
          setIsPrefilled(true);
        }
        if (params.category) {
          setPartForm((prev) => ({ ...prev, category: String(params.category) }));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Force sync all data
  const forceSync = useCallback(async () => {
    const results = await Promise.all([
      partsData.forceSync(),
      suppliersData.forceSync(),
      ordersData.forceSync(),
      adjustmentsData.forceSync(),
      categoriesData.forceSync(),
    ]);
    return results.every(Boolean);
  }, [partsData, suppliersData, ordersData, adjustmentsData, categoriesData]);

  // Generate order number
  const generateOrderNumber = () => {
    const prefix = 'PO';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${date}-${random}`;
  };

  // Part handlers
  const handleSavePart = () => {
    if (!partForm.partNumber.trim() || !partForm.name.trim()) return;

    const now = new Date().toISOString();
    const newPart: Part = {
      id: editingPart?.id || Date.now().toString(),
      ...partForm,
      crossReference: partForm.crossReference.split(',').map((s) => s.trim()).filter(Boolean),
      compatibleVehicles: partForm.compatibleVehicles.split(',').map((s) => s.trim()).filter(Boolean),
      createdAt: editingPart?.createdAt || now,
      updatedAt: now,
    };

    // Add metadata for gallery saves
    const partWithMetadata = {
      ...newPart,
      metadata: {
        toolId: 'parts-catalog',
        partForm: { ...partForm },
        activeTab,
        searchTerm,
        categoryFilter,
        stockFilter,
        conditionFilter,
      },
    };

    if (editingPart) {
      partsData.updateItem(editingPart.id, partWithMetadata as Part);
    } else {
      partsData.addItem(partWithMetadata as Part);
    }

    // Call onSaveCallback if provided (for gallery saves)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    resetPartForm();
  };

  const resetPartForm = () => {
    setPartForm({
      partNumber: '',
      name: '',
      description: '',
      category: '',
      subcategory: '',
      manufacturer: '',
      brand: '',
      oemNumber: '',
      crossReference: '',
      unitCost: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      quantity: 0,
      minStock: 5,
      maxStock: 100,
      reorderPoint: 10,
      location: '',
      weight: 0,
      dimensions: '',
      compatibleVehicles: '',
      condition: 'new',
      warranty: '',
      notes: '',
      imageUrl: '',
      isActive: true,
    });
    setEditingPart(null);
    setShowPartForm(false);
  };

  const handleEditPart = (part: Part) => {
    setPartForm({
      partNumber: part.partNumber,
      name: part.name,
      description: part.description,
      category: part.category,
      subcategory: part.subcategory,
      manufacturer: part.manufacturer,
      brand: part.brand,
      oemNumber: part.oemNumber,
      crossReference: part.crossReference.join(', '),
      unitCost: part.unitCost,
      retailPrice: part.retailPrice,
      wholesalePrice: part.wholesalePrice,
      quantity: part.quantity,
      minStock: part.minStock,
      maxStock: part.maxStock,
      reorderPoint: part.reorderPoint,
      location: part.location,
      weight: part.weight,
      dimensions: part.dimensions,
      compatibleVehicles: part.compatibleVehicles.join(', '),
      condition: part.condition,
      warranty: part.warranty,
      notes: part.notes,
      imageUrl: part.imageUrl,
      isActive: part.isActive,
    });
    setEditingPart(part);
    setShowPartForm(true);
  };

  const handleDeletePart = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Part',
      message: 'Delete this part from the catalog?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    partsData.deleteItem(id);
  };

  // Supplier handlers
  const handleSaveSupplier = () => {
    if (!supplierForm.name.trim()) return;

    const now = new Date().toISOString();
    const newSupplier: Supplier = {
      id: editingSupplier?.id || Date.now().toString(),
      ...supplierForm,
      createdAt: editingSupplier?.createdAt || now,
      updatedAt: now,
    };

    if (editingSupplier) {
      suppliersData.updateItem(editingSupplier.id, newSupplier);
    } else {
      suppliersData.addItem(newSupplier);
    }

    resetSupplierForm();
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      website: '',
      paymentTerms: 'Net 30',
      leadTime: 7,
      rating: 5,
      notes: '',
      isPreferred: false,
    });
    setEditingSupplier(null);
    setShowSupplierForm(false);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      zipCode: supplier.zipCode,
      country: supplier.country,
      website: supplier.website,
      paymentTerms: supplier.paymentTerms,
      leadTime: supplier.leadTime,
      rating: supplier.rating,
      notes: supplier.notes,
      isPreferred: supplier.isPreferred,
    });
    setEditingSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Supplier',
      message: 'Delete this supplier?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    suppliersData.deleteItem(id);
  };

  // Stock adjustment handler
  const handleSaveAdjustment = () => {
    if (!selectedPartForAdjustment || adjustmentForm.quantity === 0) return;

    const part = selectedPartForAdjustment;
    let newQuantity = part.quantity;

    switch (adjustmentForm.type) {
      case 'add':
        newQuantity = part.quantity + adjustmentForm.quantity;
        break;
      case 'remove':
      case 'transfer':
        newQuantity = Math.max(0, part.quantity - adjustmentForm.quantity);
        break;
      case 'adjustment':
        newQuantity = adjustmentForm.quantity;
        break;
      case 'return':
        newQuantity = part.quantity + adjustmentForm.quantity;
        break;
    }

    const adjustment: StockAdjustment = {
      id: Date.now().toString(),
      partId: part.id,
      type: adjustmentForm.type,
      quantity: adjustmentForm.quantity,
      previousQuantity: part.quantity,
      newQuantity,
      reason: adjustmentForm.reason,
      reference: adjustmentForm.reference,
      performedBy: adjustmentForm.performedBy,
      createdAt: new Date().toISOString(),
    };

    adjustmentsData.addItem(adjustment);
    partsData.updateItem(part.id, { ...part, quantity: newQuantity, updatedAt: new Date().toISOString() });

    setAdjustmentForm({
      type: 'add',
      quantity: 0,
      reason: '',
      reference: '',
      performedBy: '',
    });
    setSelectedPartForAdjustment(null);
    setShowAdjustmentForm(false);
  };

  // Purchase order handlers
  const handleSaveOrder = () => {
    if (!orderForm.supplierId || orderForm.items.length === 0) return;

    const subtotal = orderForm.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + orderForm.tax + orderForm.shipping;

    const now = new Date().toISOString();
    const newOrder: PurchaseOrder = {
      id: editingOrder?.id || Date.now().toString(),
      orderNumber: editingOrder?.orderNumber || generateOrderNumber(),
      supplierId: orderForm.supplierId,
      items: orderForm.items,
      status: editingOrder?.status || 'draft',
      subtotal,
      tax: orderForm.tax,
      shipping: orderForm.shipping,
      total,
      orderDate: now.split('T')[0],
      expectedDelivery: orderForm.expectedDelivery,
      receivedDate: '',
      notes: orderForm.notes,
      createdAt: editingOrder?.createdAt || now,
      updatedAt: now,
    };

    if (editingOrder) {
      ordersData.updateItem(editingOrder.id, newOrder);
    } else {
      ordersData.addItem(newOrder);
    }

    resetOrderForm();
  };

  const resetOrderForm = () => {
    setOrderForm({
      supplierId: '',
      items: [],
      tax: 0,
      shipping: 0,
      expectedDelivery: '',
      notes: '',
    });
    setEditingOrder(null);
    setShowOrderForm(false);
  };

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        searchTerm === '' ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.oemNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && part.quantity <= part.reorderPoint && part.quantity > 0) ||
        (stockFilter === 'out' && part.quantity === 0);

      const matchesCondition = conditionFilter === 'all' || part.condition === conditionFilter;

      return matchesSearch && matchesCategory && matchesStock && matchesCondition && part.isActive;
    });
  }, [parts, searchTerm, categoryFilter, stockFilter, conditionFilter]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalParts = parts.length;
    const totalValue = parts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
    const retailValue = parts.reduce((sum, p) => sum + p.quantity * p.retailPrice, 0);
    const lowStockCount = parts.filter((p) => p.quantity <= p.reorderPoint && p.quantity > 0).length;
    const outOfStockCount = parts.filter((p) => p.quantity === 0).length;
    const uniqueCategories = new Set(parts.map((p) => p.category)).size;
    const avgMarkup = parts.length > 0
      ? parts.reduce((sum, p) => sum + (p.retailPrice - p.unitCost) / p.unitCost * 100, 0) / parts.length
      : 0;

    const topCategories = Object.entries(
      parts.reduce<Record<string, number>>((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + p.quantity * p.unitCost;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalParts,
      totalValue,
      retailValue,
      lowStockCount,
      outOfStockCount,
      uniqueCategories,
      avgMarkup,
      topCategories,
      potentialProfit: retailValue - totalValue,
    };
  }, [parts]);

  // Add item to order
  const addItemToOrder = (part: Part) => {
    const existingItem = orderForm.items.find((item) => item.partId === part.id);
    if (existingItem) {
      setOrderForm((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.partId === part.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitCost }
            : item
        ),
      }));
    } else {
      setOrderForm((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            partId: part.id,
            partNumber: part.partNumber,
            partName: part.name,
            quantity: 1,
            unitCost: part.unitCost,
            total: part.unitCost,
          },
        ],
      }));
    }
  };

  // Get stock status
  const getStockStatus = (part: Part) => {
    if (part.quantity === 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (part.quantity <= part.reorderPoint) return { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    if (part.quantity >= part.maxStock) return { label: 'Overstocked', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    return { label: 'In Stock', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.partsCatalog.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partsCatalog.partsCatalog', 'Parts Catalog')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.partsCatalog.manageAutoPartsInventoryAnd', 'Manage auto parts inventory and suppliers')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="parts-catalog" toolName="Parts Catalog" />

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
                onExportCSV={() => exportToCSV(filteredParts, partColumns, { filename: 'parts-catalog' })}
                onExportExcel={() => exportToExcel(filteredParts, partColumns, { filename: 'parts-catalog' })}
                onExportJSON={() => exportToJSON(filteredParts, { filename: 'parts-catalog' })}
                onExportPDF={async () =>
                  await exportToPDF(filteredParts, partColumns, {
                    filename: 'parts-catalog',
                    title: 'Parts Catalog Report',
                    subtitle: `${filteredParts.length} parts | Total Value: ${formatCurrency(analytics.totalValue)}`,
                  })
                }
                onPrint={() => printData(filteredParts, partColumns, { title: 'Parts Catalog' })}
                onCopyToClipboard={async () => await copyUtil(filteredParts, partColumns, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'catalog', label: 'Catalog', icon: <Package className="w-4 h-4" /> },
              { id: 'suppliers', label: 'Suppliers', icon: <Truck className="w-4 h-4" /> },
              { id: 'orders', label: 'Purchase Orders', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'adjustments', label: 'Stock Adjustments', icon: <RefreshCw className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
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

        {/* Loading State */}
        {isLoading && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
            <Loader2 className={`w-8 h-8 animate-spin mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsCatalog.loadingCatalogData', 'Loading catalog data...')}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Catalog Tab */}
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          placeholder={t('tools.partsCatalog.searchParts', 'Search parts...')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                        />
                      </div>
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.partsCatalog.allCategories', 'All Categories')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value as any)}
                      className={`px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.partsCatalog.allStockLevels', 'All Stock Levels')}</option>
                      <option value="low">{t('tools.partsCatalog.lowStock', 'Low Stock')}</option>
                      <option value="out">{t('tools.partsCatalog.outOfStock', 'Out of Stock')}</option>
                    </select>
                    <button
                      onClick={() => setShowPartForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      {t('tools.partsCatalog.addPart', 'Add Part')}
                    </button>
                  </div>
                </div>

                {/* Parts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredParts.map((part) => {
                    const stockStatus = getStockStatus(part);
                    return (
                      <div
                        key={part.id}
                        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border-l-4 ${
                          stockStatus.color === 'text-red-500'
                            ? 'border-red-500'
                            : stockStatus.color === 'text-orange-500'
                            ? 'border-orange-500'
                            : 'border-green-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {part.partNumber}
                            </p>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {part.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {part.manufacturer} {part.brand && `- ${part.brand}`}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedPartForAdjustment(part);
                                setShowAdjustmentForm(true);
                              }}
                              className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                              title={t('tools.partsCatalog.adjustStock2', 'Adjust Stock')}
                            >
                              <RefreshCw className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            </button>
                            <button
                              onClick={() => handleEditPart(part)}
                              className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            </button>
                            <button
                              onClick={() => handleDeletePart(part.id)}
                              className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsCatalog.cost', 'Cost:')}</span>
                            <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(part.unitCost)}
                            </span>
                          </div>
                          <div>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsCatalog.retail', 'Retail:')}</span>
                            <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(part.retailPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Box className={`w-4 h-4 ${stockStatus.color}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {part.quantity} units
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </div>

                        {part.location && (
                          <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Warehouse className="w-3 h-3 inline mr-1" />
                            {part.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredParts.length === 0 && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                    <Package className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.partsCatalog.noPartsFound', 'No parts found')}
                    </h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.partsCatalog.addYourFirstPartOr', 'Add your first part or adjust filters')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowSupplierForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.partsCatalog.addSupplier', 'Add Supplier')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {supplier.name}
                            </h3>
                            {supplier.isPreferred && (
                              <span className="px-2 py-0.5 bg-[#0D9488] text-white text-xs rounded-full">
                                {t('tools.partsCatalog.preferred', 'Preferred')}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {supplier.contactPerson}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>{supplier.email}</p>
                        <p>{supplier.phone}</p>
                        <p>{supplier.city}, {supplier.state}</p>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-sm">
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Lead Time: {supplier.leadTime} days
                        </span>
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Rating: {supplier.rating}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {suppliers.length === 0 && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                    <Truck className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.partsCatalog.noSuppliersYet', 'No suppliers yet')}
                    </h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.partsCatalog.addYourFirstSupplierTo', 'Add your first supplier to start ordering parts')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-[#0D9488]" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsCatalog.totalParts', 'Total Parts')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.totalParts}
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsCatalog.inventoryValue', 'Inventory Value')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(analytics.totalValue)}
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsCatalog.lowStock2', 'Low Stock')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.lowStockCount}
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsCatalog.avgMarkup', 'Avg Markup')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.avgMarkup.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Top Categories */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.partsCatalog.topCategoriesByValue', 'Top Categories by Value')}
                  </h3>
                  <div className="space-y-3">
                    {analytics.topCategories.map(([category, value], index) => (
                      <div key={category} className="flex items-center gap-3">
                        <span className={`w-6 text-center font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {category}
                            </span>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatCurrency(value)}
                            </span>
                          </div>
                          <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className="h-full rounded-full bg-[#0D9488]"
                              style={{ width: `${(value / analytics.totalValue) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.partsCatalog.newOrder', 'New Order')}
                  </button>
                </div>

                {purchaseOrders.length === 0 ? (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                    <ShoppingCart className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.partsCatalog.noPurchaseOrders', 'No purchase orders')}
                    </h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.partsCatalog.createYourFirstPurchaseOrder', 'Create your first purchase order')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchaseOrders.map((order) => {
                      const supplier = suppliers.find((s) => s.id === order.supplierId);
                      return (
                        <div
                          key={order.id}
                          className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {order.orderNumber}
                              </p>
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {supplier?.name || 'Unknown Supplier'}
                              </h3>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {order.items.length} items | {formatCurrency(order.total)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'received' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Stock Adjustments Tab */}
            {activeTab === 'adjustments' && (
              <div className="space-y-6">
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partsCatalog.date', 'Date')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partsCatalog.part', 'Part')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partsCatalog.type', 'Type')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partsCatalog.qty', 'Qty')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partsCatalog.before', 'Before')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partsCatalog.after', 'After')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partsCatalog.reason', 'Reason')}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {adjustments.slice(0, 20).map((adj) => {
                          const part = parts.find((p) => p.id === adj.partId);
                          return (
                            <tr key={adj.id}>
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {new Date(adj.createdAt).toLocaleDateString()}
                              </td>
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {part?.name || 'Unknown'}
                              </td>
                              <td className={`px-4 py-3 text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {adj.type}
                              </td>
                              <td className={`px-4 py-3 text-sm font-medium ${
                                adj.type === 'add' || adj.type === 'return' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {adj.type === 'add' || adj.type === 'return' ? '+' : '-'}{adj.quantity}
                              </td>
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {adj.previousQuantity}
                              </td>
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {adj.newQuantity}
                              </td>
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {adj.reason}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {adjustments.length === 0 && (
                    <div className="p-8 text-center">
                      <RefreshCw className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partsCatalog.noStockAdjustmentsYet', 'No stock adjustments yet')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Part Form Modal */}
        {showPartForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingPart ? t('tools.partsCatalog.editPart', 'Edit Part') : t('tools.partsCatalog.addNewPart', 'Add New Part')}
                </h2>
                <button onClick={resetPartForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.partNumber', 'Part Number *')}
                    </label>
                    <input
                      type="text"
                      value={partForm.partNumber}
                      onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.partsCatalog.eGBrk001', 'e.g., BRK-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.partName', 'Part Name *')}
                    </label>
                    <input
                      type="text"
                      value={partForm.name}
                      onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.partsCatalog.eGBrakePadSet', 'e.g., Brake Pad Set')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.category', 'Category')}
                    </label>
                    <select
                      value={partForm.category}
                      onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.partsCatalog.selectCategory', 'Select Category')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.manufacturer', 'Manufacturer')}
                    </label>
                    <input
                      type="text"
                      value={partForm.manufacturer}
                      onChange={(e) => setPartForm({ ...partForm, manufacturer: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.condition', 'Condition')}
                    </label>
                    <select
                      value={partForm.condition}
                      onChange={(e) => setPartForm({ ...partForm, condition: e.target.value as Part['condition'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {PART_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.unitCost', 'Unit Cost')}
                    </label>
                    <input
                      type="number"
                      value={partForm.unitCost}
                      onChange={(e) => setPartForm({ ...partForm, unitCost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.retailPrice', 'Retail Price')}
                    </label>
                    <input
                      type="number"
                      value={partForm.retailPrice}
                      onChange={(e) => setPartForm({ ...partForm, retailPrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.quantity', 'Quantity')}
                    </label>
                    <input
                      type="number"
                      value={partForm.quantity}
                      onChange={(e) => setPartForm({ ...partForm, quantity: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.reorderPoint', 'Reorder Point')}
                    </label>
                    <input
                      type="number"
                      value={partForm.reorderPoint}
                      onChange={(e) => setPartForm({ ...partForm, reorderPoint: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsCatalog.location', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={partForm.location}
                    onChange={(e) => setPartForm({ ...partForm, location: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.partsCatalog.eGAisle3Shelf', 'e.g., Aisle 3, Shelf B')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsCatalog.notes', 'Notes')}
                  </label>
                  <textarea
                    value={partForm.notes}
                    onChange={(e) => setPartForm({ ...partForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button
                  onClick={resetPartForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.partsCatalog.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSavePart}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]"
                >
                  {editingPart ? t('tools.partsCatalog.updatePart', 'Update Part') : t('tools.partsCatalog.addPart2', 'Add Part')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Form Modal */}
        {showSupplierForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingSupplier ? t('tools.partsCatalog.editSupplier', 'Edit Supplier') : t('tools.partsCatalog.addNewSupplier', 'Add New Supplier')}
                </h2>
                <button onClick={resetSupplierForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.companyName', 'Company Name *')}
                    </label>
                    <input
                      type="text"
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.contactPerson', 'Contact Person')}
                    </label>
                    <input
                      type="text"
                      value={supplierForm.contactPerson}
                      onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={supplierForm.city}
                      onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.state', 'State')}
                    </label>
                    <input
                      type="text"
                      value={supplierForm.state}
                      onChange={(e) => setSupplierForm({ ...supplierForm, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsCatalog.leadTimeDays', 'Lead Time (days)')}
                    </label>
                    <input
                      type="number"
                      value={supplierForm.leadTime}
                      onChange={(e) => setSupplierForm({ ...supplierForm, leadTime: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPreferred"
                    checked={supplierForm.isPreferred}
                    onChange={(e) => setSupplierForm({ ...supplierForm, isPreferred: e.target.checked })}
                    className="w-4 h-4 text-[#0D9488] rounded"
                  />
                  <label htmlFor="isPreferred" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsCatalog.markAsPreferredSupplier', 'Mark as preferred supplier')}
                  </label>
                </div>
              </div>
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button
                  onClick={resetSupplierForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.partsCatalog.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveSupplier}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]"
                >
                  {editingSupplier ? t('tools.partsCatalog.updateSupplier', 'Update Supplier') : t('tools.partsCatalog.addSupplier2', 'Add Supplier')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {showAdjustmentForm && selectedPartForAdjustment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partsCatalog.adjustStock', 'Adjust Stock')}
                </h2>
                <button
                  onClick={() => {
                    setShowAdjustmentForm(false);
                    setSelectedPartForAdjustment(null);
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedPartForAdjustment.name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Stock: {selectedPartForAdjustment.quantity} units
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsCatalog.adjustmentType', 'Adjustment Type')}
                  </label>
                  <select
                    value={adjustmentForm.type}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value as StockAdjustment['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="add">{t('tools.partsCatalog.addStock', 'Add Stock')}</option>
                    <option value="remove">{t('tools.partsCatalog.removeStock', 'Remove Stock')}</option>
                    <option value="adjustment">{t('tools.partsCatalog.setExactQuantity', 'Set Exact Quantity')}</option>
                    <option value="transfer">{t('tools.partsCatalog.transferOut', 'Transfer Out')}</option>
                    <option value="return">{t('tools.partsCatalog.returnRefund', 'Return/Refund')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsCatalog.quantity2', 'Quantity')}
                  </label>
                  <input
                    type="number"
                    value={adjustmentForm.quantity}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsCatalog.reason2', 'Reason')}
                  </label>
                  <input
                    type="text"
                    value={adjustmentForm.reason}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.partsCatalog.eGInventoryCountDamage', 'e.g., Inventory count, Damage, etc.')}
                  />
                </div>
              </div>
              <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button
                  onClick={() => {
                    setShowAdjustmentForm(false);
                    setSelectedPartForAdjustment(null);
                  }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.partsCatalog.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveAdjustment}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]"
                >
                  {t('tools.partsCatalog.applyAdjustment', 'Apply Adjustment')}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PartsCatalogTool;
