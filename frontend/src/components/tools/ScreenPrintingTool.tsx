'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Printer,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Package,
  Palette,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  Image,
  Layers,
  DollarSign,
  Droplets,
  ClipboardCheck,
  FileCheck,
  ShoppingCart,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Save,
  Download,
  Upload,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types
interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  garmentType: string;
  garmentColor: string;
  garmentSize: string[];
  quantity: number;
  colors: number;
  printLocations: PrintLocation[];
  artworkStatus: 'pending' | 'submitted' | 'approved' | 'revision';
  artworkFile?: string;
  artworkNotes: string;
  screenStatus: 'not_started' | 'in_progress' | 'completed';
  colorSeparationNotes: string;
  proofStatus: 'not_sent' | 'sent' | 'approved' | 'revision_requested';
  proofApprovalDate?: string;
  isRushOrder: boolean;
  rushDeadline?: string;
  dueDate: string;
  status: 'quote' | 'confirmed' | 'in_production' | 'quality_check' | 'completed' | 'shipped';
  qualityChecklist: QualityCheckItem[];
  pricePerUnit: number;
  totalPrice: number;
  isReorder: boolean;
  originalOrderId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PrintLocation {
  location: string;
  width: number;
  height: number;
  colors: string[];
}

interface QualityCheckItem {
  id: string;
  item: string;
  checked: boolean;
  checkedBy?: string;
  checkedAt?: string;
}

interface GarmentInventory {
  id: string;
  type: string;
  brand: string;
  color: string;
  sizes: { size: string; quantity: number }[];
  costPerUnit: number;
  supplier: string;
  reorderPoint: number;
  lastRestocked: string;
}

interface InkInventory {
  id: string;
  name: string;
  brand: string;
  color: string;
  type: 'plastisol' | 'water_based' | 'discharge' | 'specialty';
  quantity: number;
  unit: string;
  costPerUnit: number;
  reorderPoint: number;
  supplier: string;
}

interface PricingTier {
  id: string;
  minQuantity: number;
  maxQuantity: number;
  pricePerPrint: number;
  setupFee: number;
  additionalColorFee: number;
}

interface ProductionSlot {
  id: string;
  orderId: string;
  date: string;
  startTime: string;
  endTime: string;
  pressNumber: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
}

// Constants
const GARMENT_TYPES = [
  'T-Shirt', 'Long Sleeve', 'Hoodie', 'Sweatshirt', 'Tank Top', 'Polo',
  'Jersey', 'Jacket', 'Shorts', 'Pants', 'Apron', 'Tote Bag', 'Hat'
];

const PRINT_LOCATIONS = [
  'Front Center', 'Front Left Chest', 'Front Right Chest', 'Back Center',
  'Back Neck', 'Left Sleeve', 'Right Sleeve', 'Full Front', 'Full Back'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const DEFAULT_QUALITY_CHECKLIST: QualityCheckItem[] = [
  { id: '1', item: 'Artwork alignment verified', checked: false },
  { id: '2', item: 'Color accuracy checked', checked: false },
  { id: '3', item: 'Print adhesion tested', checked: false },
  { id: '4', item: 'No ink bleeding or ghosting', checked: false },
  { id: '5', item: 'Correct garment size and color', checked: false },
  { id: '6', item: 'Print location matches specs', checked: false },
  { id: '7', item: 'No defects or imperfections', checked: false },
  { id: '8', item: 'Quantity count verified', checked: false },
];

// Column configurations for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'garmentType', header: 'Garment Type', type: 'string' },
  { key: 'garmentColor', header: 'Garment Color', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'colors', header: 'Colors', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'pricePerUnit', header: 'Price/Unit', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'isRushOrder', header: 'Rush Order', type: 'boolean' },
  { key: 'artworkStatus', header: 'Artwork Status', type: 'string' },
  { key: 'proofStatus', header: 'Proof Status', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const GARMENT_INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'costPerUnit', header: 'Cost/Unit', type: 'currency' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'reorderPoint', header: 'Reorder Point', type: 'number' },
  { key: 'lastRestocked', header: 'Last Restocked', type: 'date' },
];

const INK_INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'costPerUnit', header: 'Cost/Unit', type: 'currency' },
  { key: 'reorderPoint', header: 'Reorder Point', type: 'number' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
];

const PRICING_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'minQuantity', header: 'Min Quantity', type: 'number' },
  { key: 'maxQuantity', header: 'Max Quantity', type: 'number' },
  { key: 'pricePerPrint', header: 'Price/Print', type: 'currency' },
  { key: 'setupFee', header: 'Setup Fee', type: 'currency' },
  { key: 'additionalColorFee', header: 'Additional Color Fee', type: 'currency' },
];

// Combined data structure for backend sync
interface ShopData {
  id: string;
  orders: Order[];
  garmentInventory: GarmentInventory[];
  inkInventory: InkInventory[];
  pricingTiers: PricingTier[];
  productionSlots: ProductionSlot[];
}

// Column configuration for the combined shop data (used for sync metadata)
const SHOP_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'ordersCount', header: 'Orders', type: 'number' },
  { key: 'garmentInventoryCount', header: 'Garments', type: 'number' },
  { key: 'inkInventoryCount', header: 'Inks', type: 'number' },
  { key: 'pricingTiersCount', header: 'Pricing Tiers', type: 'number' },
  { key: 'productionSlotsCount', header: 'Production Slots', type: 'number' },
];

const SHOP_DATA_ID = 'screen-printing-shop-data';

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

interface ScreenPrintingToolProps {
  uiConfig?: UIConfig;
}

export const ScreenPrintingTool: React.FC<ScreenPrintingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Default shop data structure
  const defaultShopData: ShopData[] = [{
    id: SHOP_DATA_ID,
    orders: [],
    garmentInventory: [],
    inkInventory: [],
    pricingTiers: [],
    productionSlots: [],
  }];

  // Use the useToolData hook for backend persistence
  const {
    data: shopDataArray,
    setData: setShopDataArray,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importCSV: hookImportCSV,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
  } = useToolData<ShopData>('screen-printing', defaultShopData, SHOP_DATA_COLUMNS);

  // Extract the shop data from the array (we only store one item)
  const shopData = shopDataArray[0] || defaultShopData[0];

  // Derived state from shop data
  const orders = shopData.orders;
  const garmentInventory = shopData.garmentInventory;
  const inkInventory = shopData.inkInventory;
  const pricingTiers = shopData.pricingTiers;
  const productionSlots = shopData.productionSlots;

  // Setter functions that update the shop data
  const setOrders = (updater: Order[] | ((prev: Order[]) => Order[])) => {
    setShopDataArray(prev => {
      const currentData = prev[0] || defaultShopData[0];
      const newOrders = typeof updater === 'function' ? updater(currentData.orders) : updater;
      return [{ ...currentData, orders: newOrders }];
    });
  };

  const setGarmentInventory = (updater: GarmentInventory[] | ((prev: GarmentInventory[]) => GarmentInventory[])) => {
    setShopDataArray(prev => {
      const currentData = prev[0] || defaultShopData[0];
      const newInventory = typeof updater === 'function' ? updater(currentData.garmentInventory) : updater;
      return [{ ...currentData, garmentInventory: newInventory }];
    });
  };

  const setInkInventory = (updater: InkInventory[] | ((prev: InkInventory[]) => InkInventory[])) => {
    setShopDataArray(prev => {
      const currentData = prev[0] || defaultShopData[0];
      const newInventory = typeof updater === 'function' ? updater(currentData.inkInventory) : updater;
      return [{ ...currentData, inkInventory: newInventory }];
    });
  };

  const setPricingTiers = (updater: PricingTier[] | ((prev: PricingTier[]) => PricingTier[])) => {
    setShopDataArray(prev => {
      const currentData = prev[0] || defaultShopData[0];
      const newTiers = typeof updater === 'function' ? updater(currentData.pricingTiers) : updater;
      return [{ ...currentData, pricingTiers: newTiers }];
    });
  };

  const setProductionSlots = (updater: ProductionSlot[] | ((prev: ProductionSlot[]) => ProductionSlot[])) => {
    setShopDataArray(prev => {
      const currentData = prev[0] || defaultShopData[0];
      const newSlots = typeof updater === 'function' ? updater(currentData.productionSlots) : updater;
      return [{ ...currentData, productionSlots: newSlots }];
    });
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // State
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'scheduling' | 'pricing'>('orders');

  // UI State
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showGarmentForm, setShowGarmentForm] = useState(false);
  const [showInkForm, setShowInkForm] = useState(false);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingGarment, setEditingGarment] = useState<GarmentInventory | null>(null);
  const [editingInk, setEditingInk] = useState<InkInventory | null>(null);
  const [editingPricing, setEditingPricing] = useState<PricingTier | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['orders']));

  // Form State
  const [orderForm, setOrderForm] = useState<Partial<Order>>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    garmentType: GARMENT_TYPES[0],
    garmentColor: '',
    garmentSize: [],
    quantity: 1,
    colors: 1,
    printLocations: [],
    artworkStatus: 'pending',
    artworkNotes: '',
    screenStatus: 'not_started',
    colorSeparationNotes: '',
    proofStatus: 'not_sent',
    isRushOrder: false,
    dueDate: '',
    status: 'quote',
    qualityChecklist: [...DEFAULT_QUALITY_CHECKLIST],
    pricePerUnit: 0,
    totalPrice: 0,
    isReorder: false,
    notes: '',
  });

  const [garmentForm, setGarmentForm] = useState<Partial<GarmentInventory>>({
    type: GARMENT_TYPES[0],
    brand: '',
    color: '',
    sizes: SIZES.map(s => ({ size: s, quantity: 0 })),
    costPerUnit: 0,
    supplier: '',
    reorderPoint: 10,
  });

  const [inkForm, setInkForm] = useState<Partial<InkInventory>>({
    name: '',
    brand: '',
    color: '',
    type: 'plastisol',
    quantity: 0,
    unit: 'gallons',
    costPerUnit: 0,
    reorderPoint: 5,
    supplier: '',
  });

  const [pricingForm, setPricingForm] = useState<Partial<PricingTier>>({
    minQuantity: 1,
    maxQuantity: 24,
    pricePerPrint: 5,
    setupFee: 25,
    additionalColorFee: 1,
  });

  const [scheduleForm, setScheduleForm] = useState<Partial<ProductionSlot>>({
    orderId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    pressNumber: 1,
    status: 'scheduled',
  });

  const [printLocationForm, setPrintLocationForm] = useState<PrintLocation>({
    location: PRINT_LOCATIONS[0],
    width: 10,
    height: 12,
    colors: [],
  });

  // Note: Data persistence is now handled by the useToolData hook

  // Computed values
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const lowStockGarments = useMemo(() => {
    return garmentInventory.filter(g =>
      g.sizes.some(s => s.quantity <= g.reorderPoint)
    );
  }, [garmentInventory]);

  const lowStockInks = useMemo(() => {
    return inkInventory.filter(i => i.quantity <= i.reorderPoint);
  }, [inkInventory]);

  const rushOrders = useMemo(() => {
    return orders.filter(o => o.isRushOrder && o.status !== 'completed' && o.status !== 'shipped');
  }, [orders]);

  const calculatePrice = (quantity: number, colors: number, printLocations: number) => {
    const tier = pricingTiers.find(t => quantity >= t.minQuantity && quantity <= t.maxQuantity);
    if (!tier) {
      const highestTier = pricingTiers.sort((a, b) => b.maxQuantity - a.maxQuantity)[0];
      if (highestTier && quantity > highestTier.maxQuantity) {
        const pricePerPrint = highestTier.pricePerPrint * 0.9;
        const extraColors = Math.max(0, colors - 1) * highestTier.additionalColorFee;
        return {
          perUnit: (pricePerPrint + extraColors) * printLocations,
          total: ((pricePerPrint + extraColors) * printLocations * quantity) + highestTier.setupFee,
          setupFee: highestTier.setupFee,
        };
      }
      return { perUnit: 0, total: 0, setupFee: 0 };
    }
    const extraColors = Math.max(0, colors - 1) * tier.additionalColorFee;
    const pricePerUnit = (tier.pricePerPrint + extraColors) * printLocations;
    return {
      perUnit: pricePerUnit,
      total: (pricePerUnit * quantity) + tier.setupFee,
      setupFee: tier.setupFee,
    };
  };

  // Handlers
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleAddPrintLocation = () => {
    if (printLocationForm.location) {
      setOrderForm(prev => ({
        ...prev,
        printLocations: [...(prev.printLocations || []), { ...printLocationForm }],
      }));
      setPrintLocationForm({
        location: PRINT_LOCATIONS[0],
        width: 10,
        height: 12,
        colors: [],
      });
    }
  };

  const handleRemovePrintLocation = (index: number) => {
    setOrderForm(prev => ({
      ...prev,
      printLocations: prev.printLocations?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSaveOrder = () => {
    const now = new Date().toISOString();
    const pricing = calculatePrice(
      orderForm.quantity || 1,
      orderForm.colors || 1,
      orderForm.printLocations?.length || 1
    );

    if (editingOrder) {
      setOrders(prev => prev.map(o =>
        o.id === editingOrder.id
          ? {
              ...editingOrder,
              ...orderForm,
              pricePerUnit: pricing.perUnit,
              totalPrice: pricing.total,
              updatedAt: now,
            } as Order
          : o
      ));
    } else {
      const newOrder: Order = {
        id: generateId(),
        customerName: orderForm.customerName || '',
        customerEmail: orderForm.customerEmail || '',
        customerPhone: orderForm.customerPhone || '',
        garmentType: orderForm.garmentType || GARMENT_TYPES[0],
        garmentColor: orderForm.garmentColor || '',
        garmentSize: orderForm.garmentSize || [],
        quantity: orderForm.quantity || 1,
        colors: orderForm.colors || 1,
        printLocations: orderForm.printLocations || [],
        artworkStatus: orderForm.artworkStatus || 'pending',
        artworkNotes: orderForm.artworkNotes || '',
        screenStatus: orderForm.screenStatus || 'not_started',
        colorSeparationNotes: orderForm.colorSeparationNotes || '',
        proofStatus: orderForm.proofStatus || 'not_sent',
        isRushOrder: orderForm.isRushOrder || false,
        rushDeadline: orderForm.rushDeadline,
        dueDate: orderForm.dueDate || '',
        status: orderForm.status || 'quote',
        qualityChecklist: orderForm.qualityChecklist || [...DEFAULT_QUALITY_CHECKLIST],
        pricePerUnit: pricing.perUnit,
        totalPrice: pricing.total,
        isReorder: orderForm.isReorder || false,
        originalOrderId: orderForm.originalOrderId,
        notes: orderForm.notes || '',
        createdAt: now,
        updatedAt: now,
      };
      setOrders(prev => [...prev, newOrder]);
    }

    resetOrderForm();
  };

  const resetOrderForm = () => {
    setOrderForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      garmentType: GARMENT_TYPES[0],
      garmentColor: '',
      garmentSize: [],
      quantity: 1,
      colors: 1,
      printLocations: [],
      artworkStatus: 'pending',
      artworkNotes: '',
      screenStatus: 'not_started',
      colorSeparationNotes: '',
      proofStatus: 'not_sent',
      isRushOrder: false,
      dueDate: '',
      status: 'quote',
      qualityChecklist: [...DEFAULT_QUALITY_CHECKLIST],
      pricePerUnit: 0,
      totalPrice: 0,
      isReorder: false,
      notes: '',
    });
    setEditingOrder(null);
    setShowOrderForm(false);
  };

  const handleEditOrder = (order: Order) => {
    setOrderForm(order);
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const handleReorder = (order: Order) => {
    setOrderForm({
      ...order,
      id: undefined,
      isReorder: true,
      originalOrderId: order.id,
      status: 'quote',
      artworkStatus: 'approved',
      screenStatus: 'completed',
      proofStatus: 'approved',
      qualityChecklist: [...DEFAULT_QUALITY_CHECKLIST],
      createdAt: undefined,
      updatedAt: undefined,
    });
    setShowOrderForm(true);
  };

  const handleUpdateQualityCheck = (orderId: string, checkId: string, checked: boolean) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          qualityChecklist: order.qualityChecklist.map(item =>
            item.id === checkId
              ? { ...item, checked, checkedAt: checked ? new Date().toISOString() : undefined }
              : item
          ),
          updatedAt: new Date().toISOString(),
        };
      }
      return order;
    }));
  };

  const handleSaveGarment = () => {
    const now = new Date().toISOString();
    if (editingGarment) {
      setGarmentInventory(prev => prev.map(g =>
        g.id === editingGarment.id
          ? { ...editingGarment, ...garmentForm, lastRestocked: now } as GarmentInventory
          : g
      ));
    } else {
      const newGarment: GarmentInventory = {
        id: generateId(),
        type: garmentForm.type || GARMENT_TYPES[0],
        brand: garmentForm.brand || '',
        color: garmentForm.color || '',
        sizes: garmentForm.sizes || SIZES.map(s => ({ size: s, quantity: 0 })),
        costPerUnit: garmentForm.costPerUnit || 0,
        supplier: garmentForm.supplier || '',
        reorderPoint: garmentForm.reorderPoint || 10,
        lastRestocked: now,
      };
      setGarmentInventory(prev => [...prev, newGarment]);
    }
    resetGarmentForm();
  };

  const resetGarmentForm = () => {
    setGarmentForm({
      type: GARMENT_TYPES[0],
      brand: '',
      color: '',
      sizes: SIZES.map(s => ({ size: s, quantity: 0 })),
      costPerUnit: 0,
      supplier: '',
      reorderPoint: 10,
    });
    setEditingGarment(null);
    setShowGarmentForm(false);
  };

  const handleEditGarment = (garment: GarmentInventory) => {
    setGarmentForm(garment);
    setEditingGarment(garment);
    setShowGarmentForm(true);
  };

  const handleDeleteGarment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this garment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setGarmentInventory(prev => prev.filter(g => g.id !== id));
  };

  const handleSaveInk = () => {
    if (editingInk) {
      setInkInventory(prev => prev.map(i =>
        i.id === editingInk.id ? { ...editingInk, ...inkForm } as InkInventory : i
      ));
    } else {
      const newInk: InkInventory = {
        id: generateId(),
        name: inkForm.name || '',
        brand: inkForm.brand || '',
        color: inkForm.color || '',
        type: inkForm.type || 'plastisol',
        quantity: inkForm.quantity || 0,
        unit: inkForm.unit || 'gallons',
        costPerUnit: inkForm.costPerUnit || 0,
        reorderPoint: inkForm.reorderPoint || 5,
        supplier: inkForm.supplier || '',
      };
      setInkInventory(prev => [...prev, newInk]);
    }
    resetInkForm();
  };

  const resetInkForm = () => {
    setInkForm({
      name: '',
      brand: '',
      color: '',
      type: 'plastisol',
      quantity: 0,
      unit: 'gallons',
      costPerUnit: 0,
      reorderPoint: 5,
      supplier: '',
    });
    setEditingInk(null);
    setShowInkForm(false);
  };

  const handleEditInk = (ink: InkInventory) => {
    setInkForm(ink);
    setEditingInk(ink);
    setShowInkForm(true);
  };

  const handleDeleteInk = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this ink?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setInkInventory(prev => prev.filter(i => i.id !== id));
  };

  const handleSavePricing = () => {
    if (editingPricing) {
      setPricingTiers(prev => prev.map(p =>
        p.id === editingPricing.id ? { ...editingPricing, ...pricingForm } as PricingTier : p
      ));
    } else {
      const newPricing: PricingTier = {
        id: generateId(),
        minQuantity: pricingForm.minQuantity || 1,
        maxQuantity: pricingForm.maxQuantity || 24,
        pricePerPrint: pricingForm.pricePerPrint || 5,
        setupFee: pricingForm.setupFee || 25,
        additionalColorFee: pricingForm.additionalColorFee || 1,
      };
      setPricingTiers(prev => [...prev, newPricing]);
    }
    resetPricingForm();
  };

  const resetPricingForm = () => {
    setPricingForm({
      minQuantity: 1,
      maxQuantity: 24,
      pricePerPrint: 5,
      setupFee: 25,
      additionalColorFee: 1,
    });
    setEditingPricing(null);
    setShowPricingForm(false);
  };

  const handleEditPricing = (pricing: PricingTier) => {
    setPricingForm(pricing);
    setEditingPricing(pricing);
    setShowPricingForm(true);
  };

  const handleDeletePricing = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this pricing tier?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setPricingTiers(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveSchedule = () => {
    const newSlot: ProductionSlot = {
      id: generateId(),
      orderId: scheduleForm.orderId || '',
      date: scheduleForm.date || '',
      startTime: scheduleForm.startTime || '09:00',
      endTime: scheduleForm.endTime || '17:00',
      pressNumber: scheduleForm.pressNumber || 1,
      status: scheduleForm.status || 'scheduled',
    };
    setProductionSlots(prev => [...prev, newSlot]);
    resetScheduleForm();
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      orderId: '',
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      pressNumber: 1,
      status: 'scheduled',
    });
    setShowScheduleForm(false);
  };

  const handleDeleteSchedule = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this schedule?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setProductionSlots(prev => prev.filter(s => s.id !== id));
  };

  // Get current data based on active tab for export
  const getCurrentExportData = () => {
    switch (activeTab) {
      case 'orders':
        return { data: filteredOrders, columns: ORDER_COLUMNS, filename: 'screen-printing-orders' };
      case 'inventory':
        return { data: garmentInventory, columns: GARMENT_INVENTORY_COLUMNS, filename: 'garment-inventory' };
      case 'pricing':
        return { data: pricingTiers, columns: PRICING_COLUMNS, filename: 'pricing-tiers' };
      default:
        return { data: orders, columns: ORDER_COLUMNS, filename: 'screen-printing-orders' };
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const { data, columns, filename } = getCurrentExportData();
    exportToCSV(data, columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getCurrentExportData();
    exportToExcel(data, columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getCurrentExportData();
    exportToJSON(data, { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename } = getCurrentExportData();
    await exportToPDF(data, columns, {
      filename,
      title: 'Screen Printing Shop Manager',
      subtitle: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`,
    });
  };

  const handlePrint = () => {
    const { data, columns } = getCurrentExportData();
    printData(data, columns, { title: 'Screen Printing Shop Manager' });
  };

  const handleCopyToClipboard = async () => {
    const { data, columns } = getCurrentExportData();
    return await copyUtil(data, columns);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Update the shop data with imported values
          setShopDataArray(prev => {
            const currentData = prev[0] || defaultShopData[0];
            return [{
              ...currentData,
              orders: data.orders || currentData.orders,
              garmentInventory: data.garmentInventory || currentData.garmentInventory,
              inkInventory: data.inkInventory || currentData.inkInventory,
              pricingTiers: data.pricingTiers || currentData.pricingTiers,
              productionSlots: data.productionSlots || currentData.productionSlots,
            }];
          });
          setValidationMessage('Data imported successfully!');
          setTimeout(() => setValidationMessage(null), 3000);
        } catch {
          setValidationMessage('Failed to import data. Please check the file format.');
          setTimeout(() => setValidationMessage(null), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  // Styles
  const cardClass = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg`;
  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const buttonPrimaryClass = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium shadow-lg shadow-[#0D9488]/20';
  const buttonSecondaryClass = `px-4 py-2 rounded-lg transition-colors font-medium ${
    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      quote: 'bg-gray-500',
      confirmed: 'bg-blue-500',
      in_production: 'bg-yellow-500',
      quality_check: 'bg-purple-500',
      completed: 'bg-green-500',
      shipped: 'bg-teal-500',
      pending: 'bg-orange-500',
      submitted: 'bg-blue-500',
      approved: 'bg-green-500',
      revision: 'bg-red-500',
      not_started: 'bg-gray-500',
      in_progress: 'bg-yellow-500',
      not_sent: 'bg-gray-500',
      sent: 'bg-blue-500',
      revision_requested: 'bg-red-500',
      scheduled: 'bg-blue-500',
      delayed: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={mutedTextClass}>{t('tools.screenPrinting.loadingShopData', 'Loading shop data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Printer className="w-8 h-8 text-[#0D9488]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textClass}`}>{t('tools.screenPrinting.screenPrintingShopManager', 'Screen Printing Shop Manager')}</h1>
            <p className={`text-sm ${mutedTextClass}`}>{t('tools.screenPrinting.manageOrdersInventoryAndProduction', 'Manage orders, inventory, and production')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="screen-printing" toolName="Screen Printing" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          <label className={buttonSecondaryClass + ' cursor-pointer'}>
            <Upload className="w-4 h-4 inline mr-2" />
            Import
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.screenPrinting.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      {/* Alerts */}
      {(rushOrders.length > 0 || lowStockGarments.length > 0 || lowStockInks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {rushOrders.length > 0 && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className={`font-medium ${textClass}`}>{rushOrders.length} Rush Order(s)</span>
              </div>
              <p className={`text-sm mt-1 ${mutedTextClass}`}>{t('tools.screenPrinting.requiresImmediateAttention', 'Requires immediate attention')}</p>
            </div>
          )}
          {lowStockGarments.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" />
                <span className={`font-medium ${textClass}`}>{lowStockGarments.length} Low Stock Garment(s)</span>
              </div>
              <p className={`text-sm mt-1 ${mutedTextClass}`}>{t('tools.screenPrinting.belowReorderPoint', 'Below reorder point')}</p>
            </div>
          )}
          {lowStockInks.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-yellow-500" />
                <span className={`font-medium ${textClass}`}>{lowStockInks.length} Low Stock Ink(s)</span>
              </div>
              <p className={`text-sm mt-1 ${mutedTextClass}`}>{t('tools.screenPrinting.belowReorderPoint2', 'Below reorder point')}</p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className={`flex flex-wrap gap-2 mb-6 p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg`}>
        {[
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'scheduling', label: 'Scheduling', icon: Calendar },
          { id: 'pricing', label: 'Pricing', icon: DollarSign },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
              <input
                type="text"
                placeholder={t('tools.screenPrinting.searchOrders', 'Search orders...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${mutedTextClass}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">{t('tools.screenPrinting.allStatuses', 'All Statuses')}</option>
                <option value="quote">{t('tools.screenPrinting.quote', 'Quote')}</option>
                <option value="confirmed">{t('tools.screenPrinting.confirmed', 'Confirmed')}</option>
                <option value="in_production">{t('tools.screenPrinting.inProduction', 'In Production')}</option>
                <option value="quality_check">{t('tools.screenPrinting.qualityCheck', 'Quality Check')}</option>
                <option value="completed">{t('tools.screenPrinting.completed', 'Completed')}</option>
                <option value="shipped">{t('tools.screenPrinting.shipped', 'Shipped')}</option>
              </select>
            </div>
            <button onClick={() => setShowOrderForm(true)} className={buttonPrimaryClass}>
              <Plus className="w-4 h-4" />
              {t('tools.screenPrinting.newOrder', 'New Order')}
            </button>
          </div>

          {/* Order Form Modal */}
          {showOrderForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${textClass}`}>
                    {editingOrder ? t('tools.screenPrinting.editOrder', 'Edit Order') : t('tools.screenPrinting.newOrder2', 'New Order')}
                  </h2>
                  <button onClick={resetOrderForm} className={mutedTextClass}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-medium mb-3 ${textClass}`}>{t('tools.screenPrinting.customerInformation', 'Customer Information')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.customerName', 'Customer Name *')}</label>
                        <input
                          type="text"
                          value={orderForm.customerName || ''}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.screenPrinting.johnDoe', 'John Doe')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.email', 'Email')}</label>
                        <input
                          type="email"
                          value={orderForm.customerEmail || ''}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.screenPrinting.johnExampleCom', 'john@example.com')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.phone', 'Phone')}</label>
                        <input
                          type="tel"
                          value={orderForm.customerPhone || ''}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                          className={inputClass}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-medium mb-3 ${textClass}`}>{t('tools.screenPrinting.orderDetails', 'Order Details')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.garmentType', 'Garment Type')}</label>
                        <select
                          value={orderForm.garmentType || GARMENT_TYPES[0]}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, garmentType: e.target.value }))}
                          className={inputClass}
                        >
                          {GARMENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.garmentColor', 'Garment Color')}</label>
                        <input
                          type="text"
                          value={orderForm.garmentColor || ''}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, garmentColor: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.screenPrinting.blackWhiteNavy', 'Black, White, Navy...')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.quantity', 'Quantity')}</label>
                        <input
                          type="number"
                          min="1"
                          value={orderForm.quantity || 1}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.numberOfColors', 'Number of Colors')}</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={orderForm.colors || 1}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, colors: parseInt(e.target.value) || 1 }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelClass}>{t('tools.screenPrinting.sizes', 'Sizes')}</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {SIZES.map(size => (
                          <label key={size} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={orderForm.garmentSize?.includes(size) || false}
                              onChange={(e) => {
                                const sizes = orderForm.garmentSize || [];
                                if (e.target.checked) {
                                  setOrderForm(prev => ({ ...prev, garmentSize: [...sizes, size] }));
                                } else {
                                  setOrderForm(prev => ({ ...prev, garmentSize: sizes.filter(s => s !== size) }));
                                }
                              }}
                              className="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <span className={`text-sm ${textClass}`}>{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Print Locations */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-medium mb-3 ${textClass}`}>{t('tools.screenPrinting.printLocations', 'Print Locations')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.location', 'Location')}</label>
                        <select
                          value={printLocationForm.location}
                          onChange={(e) => setPrintLocationForm(prev => ({ ...prev, location: e.target.value }))}
                          className={inputClass}
                        >
                          {PRINT_LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.widthInches', 'Width (inches)')}</label>
                        <input
                          type="number"
                          value={printLocationForm.width}
                          onChange={(e) => setPrintLocationForm(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.heightInches', 'Height (inches)')}</label>
                        <input
                          type="number"
                          value={printLocationForm.height}
                          onChange={(e) => setPrintLocationForm(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-end">
                        <button onClick={handleAddPrintLocation} className={buttonPrimaryClass}>
                          <Plus className="w-4 h-4" />
                          {t('tools.screenPrinting.add', 'Add')}
                        </button>
                      </div>
                    </div>
                    {orderForm.printLocations && orderForm.printLocations.length > 0 && (
                      <div className="space-y-2">
                        {orderForm.printLocations.map((loc, index) => (
                          <div key={index} className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <span className={textClass}>
                              {loc.location} - {loc.width}" x {loc.height}"
                            </span>
                            <button onClick={() => handleRemovePrintLocation(index)} className="text-red-500 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Artwork & Screens */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-medium mb-3 ${textClass}`}>{t('tools.screenPrinting.artworkScreens', 'Artwork & Screens')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.artworkStatus', 'Artwork Status')}</label>
                        <select
                          value={orderForm.artworkStatus || 'pending'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, artworkStatus: e.target.value as Order['artworkStatus'] }))}
                          className={inputClass}
                        >
                          <option value="pending">{t('tools.screenPrinting.pending', 'Pending')}</option>
                          <option value="submitted">{t('tools.screenPrinting.submitted', 'Submitted')}</option>
                          <option value="approved">{t('tools.screenPrinting.approved', 'Approved')}</option>
                          <option value="revision">{t('tools.screenPrinting.needsRevision', 'Needs Revision')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.screenStatus', 'Screen Status')}</label>
                        <select
                          value={orderForm.screenStatus || 'not_started'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, screenStatus: e.target.value as Order['screenStatus'] }))}
                          className={inputClass}
                        >
                          <option value="not_started">{t('tools.screenPrinting.notStarted', 'Not Started')}</option>
                          <option value="in_progress">{t('tools.screenPrinting.inProgress', 'In Progress')}</option>
                          <option value="completed">{t('tools.screenPrinting.completed2', 'Completed')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelClass}>{t('tools.screenPrinting.artworkNotes', 'Artwork Notes')}</label>
                      <textarea
                        value={orderForm.artworkNotes || ''}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, artworkNotes: e.target.value }))}
                        className={`${inputClass} h-20`}
                        placeholder={t('tools.screenPrinting.notesAboutTheArtwork', 'Notes about the artwork...')}
                      />
                    </div>
                    <div className="mt-4">
                      <label className={labelClass}>{t('tools.screenPrinting.colorSeparationNotes', 'Color Separation Notes')}</label>
                      <textarea
                        value={orderForm.colorSeparationNotes || ''}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, colorSeparationNotes: e.target.value }))}
                        className={`${inputClass} h-20`}
                        placeholder={t('tools.screenPrinting.notesAboutColorSeparationsHalftones', 'Notes about color separations, halftones, etc...')}
                      />
                    </div>
                  </div>

                  {/* Proof & Status */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-medium mb-3 ${textClass}`}>{t('tools.screenPrinting.proofOrderStatus', 'Proof & Order Status')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.proofStatus', 'Proof Status')}</label>
                        <select
                          value={orderForm.proofStatus || 'not_sent'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, proofStatus: e.target.value as Order['proofStatus'] }))}
                          className={inputClass}
                        >
                          <option value="not_sent">{t('tools.screenPrinting.notSent', 'Not Sent')}</option>
                          <option value="sent">{t('tools.screenPrinting.sent', 'Sent')}</option>
                          <option value="approved">{t('tools.screenPrinting.approved2', 'Approved')}</option>
                          <option value="revision_requested">{t('tools.screenPrinting.revisionRequested', 'Revision Requested')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.orderStatus', 'Order Status')}</label>
                        <select
                          value={orderForm.status || 'quote'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, status: e.target.value as Order['status'] }))}
                          className={inputClass}
                        >
                          <option value="quote">{t('tools.screenPrinting.quote2', 'Quote')}</option>
                          <option value="confirmed">{t('tools.screenPrinting.confirmed2', 'Confirmed')}</option>
                          <option value="in_production">{t('tools.screenPrinting.inProduction2', 'In Production')}</option>
                          <option value="quality_check">{t('tools.screenPrinting.qualityCheck2', 'Quality Check')}</option>
                          <option value="completed">{t('tools.screenPrinting.completed3', 'Completed')}</option>
                          <option value="shipped">{t('tools.screenPrinting.shipped2', 'Shipped')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.screenPrinting.dueDate', 'Due Date')}</label>
                        <input
                          type="date"
                          value={orderForm.dueDate || ''}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={orderForm.isRushOrder || false}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, isRushOrder: e.target.checked }))}
                          className="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span className={`font-medium ${textClass}`}>{t('tools.screenPrinting.rushOrder', 'Rush Order')}</span>
                      </label>
                      {orderForm.isRushOrder && (
                        <div>
                          <input
                            type="date"
                            value={orderForm.rushDeadline || ''}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, rushDeadline: e.target.value }))}
                            className={inputClass}
                            placeholder={t('tools.screenPrinting.rushDeadline', 'Rush Deadline')}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reorder */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={orderForm.isReorder || false}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, isReorder: e.target.checked }))}
                        className="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={`font-medium ${textClass}`}>{t('tools.screenPrinting.thisIsAReorder', 'This is a reorder')}</span>
                    </label>
                    {orderForm.isReorder && (
                      <div className="mt-2">
                        <label className={labelClass}>{t('tools.screenPrinting.originalOrderId', 'Original Order ID')}</label>
                        <input
                          type="text"
                          value={orderForm.originalOrderId || ''}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, originalOrderId: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.screenPrinting.enterOriginalOrderId', 'Enter original order ID')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={labelClass}>{t('tools.screenPrinting.additionalNotes', 'Additional Notes')}</label>
                    <textarea
                      value={orderForm.notes || ''}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      className={`${inputClass} h-20`}
                      placeholder={t('tools.screenPrinting.anyAdditionalNotes', 'Any additional notes...')}
                    />
                  </div>

                  {/* Price Preview */}
                  {pricingTiers.length > 0 && (
                    <div className={`p-4 rounded-lg ${isDark ? t('tools.screenPrinting.bg0d948820', 'bg-[#0D9488]/20') : t('tools.screenPrinting.bg0d948810', 'bg-[#0D9488]/10')}`}>
                      <h3 className={`font-medium mb-2 ${textClass}`}>{t('tools.screenPrinting.priceEstimate', 'Price Estimate')}</h3>
                      {(() => {
                        const price = calculatePrice(
                          orderForm.quantity || 1,
                          orderForm.colors || 1,
                          orderForm.printLocations?.length || 1
                        );
                        return (
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className={mutedTextClass}>{t('tools.screenPrinting.perUnit', 'Per Unit')}</p>
                              <p className={`text-lg font-bold ${textClass}`}>{formatCurrency(price.perUnit)}</p>
                            </div>
                            <div>
                              <p className={mutedTextClass}>{t('tools.screenPrinting.setupFee', 'Setup Fee')}</p>
                              <p className={`text-lg font-bold ${textClass}`}>{formatCurrency(price.setupFee)}</p>
                            </div>
                            <div>
                              <p className={mutedTextClass}>{t('tools.screenPrinting.total', 'Total')}</p>
                              <p className={`text-lg font-bold text-[#0D9488]`}>{formatCurrency(price.total)}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <button onClick={resetOrderForm} className={buttonSecondaryClass}>
                      {t('tools.screenPrinting.cancel5', 'Cancel')}
                    </button>
                    <button
                      onClick={handleSaveOrder}
                      disabled={!orderForm.customerName}
                      className={`${buttonPrimaryClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Save className="w-4 h-4" />
                      {editingOrder ? t('tools.screenPrinting.updateOrder', 'Update Order') : t('tools.screenPrinting.createOrder', 'Create Order')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`${cardClass} p-8 text-center`}>
                  <ShoppingCart className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                  <p className={mutedTextClass}>{t('tools.screenPrinting.noOrdersFoundCreateYour', 'No orders found. Create your first order!')}</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className={`${cardClass} p-4 cursor-pointer transition-all hover:shadow-lg ${
                      selectedOrder?.id === order.id ? 'ring-2 ring-[#0D9488]' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${textClass}`}>{order.customerName}</h3>
                          {order.isRushOrder && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {t('tools.screenPrinting.rush', 'Rush')}
                            </span>
                          )}
                          {order.isReorder && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              {t('tools.screenPrinting.reorder', 'Reorder')}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${mutedTextClass}`}>
                          {order.quantity}x {order.garmentType} - {order.colors} color(s)
                        </p>
                        <p className={`text-xs ${mutedTextClass}`}>ID: {order.id}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <p className={`text-sm font-medium mt-1 ${textClass}`}>{formatCurrency(order.totalPrice)}</p>
                        <p className={`text-xs ${mutedTextClass}`}>Due: {formatDate(order.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditOrder(order); }}
                        className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${mutedTextClass}`} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                        className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <RefreshCw className={`w-4 h-4 ${mutedTextClass}`} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                        className={`p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Detail / Quality Check Panel */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className={`${cardClass} p-4 sticky top-4`}>
                  <h3 className={`font-bold mb-4 ${textClass}`}>{t('tools.screenPrinting.orderDetails2', 'Order Details')}</h3>

                  <div className="space-y-4">
                    {/* Status Overview */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${mutedTextClass}`}>{t('tools.screenPrinting.artwork', 'Artwork')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusColor(selectedOrder.artworkStatus)}`}>
                          {selectedOrder.artworkStatus}
                        </span>
                      </div>
                      <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${mutedTextClass}`}>{t('tools.screenPrinting.screens', 'Screens')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusColor(selectedOrder.screenStatus)}`}>
                          {selectedOrder.screenStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${mutedTextClass}`}>{t('tools.screenPrinting.proof', 'Proof')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusColor(selectedOrder.proofStatus)}`}>
                          {selectedOrder.proofStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${mutedTextClass}`}>{t('tools.screenPrinting.order', 'Order')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Print Locations */}
                    {selectedOrder.printLocations.length > 0 && (
                      <div>
                        <p className={`text-sm font-medium mb-2 ${textClass}`}>{t('tools.screenPrinting.printLocations2', 'Print Locations')}</p>
                        {selectedOrder.printLocations.map((loc, i) => (
                          <div key={i} className={`text-sm p-2 rounded mb-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className={textClass}>{loc.location}</span>
                            <span className={mutedTextClass}> - {loc.width}" x {loc.height}"</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Color Separation Notes */}
                    {selectedOrder.colorSeparationNotes && (
                      <div>
                        <p className={`text-sm font-medium mb-1 ${textClass}`}>{t('tools.screenPrinting.colorSeparationNotes2', 'Color Separation Notes')}</p>
                        <p className={`text-sm p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${mutedTextClass}`}>
                          {selectedOrder.colorSeparationNotes}
                        </p>
                      </div>
                    )}

                    {/* Quality Checklist */}
                    <div>
                      <p className={`text-sm font-medium mb-2 flex items-center gap-2 ${textClass}`}>
                        <ClipboardCheck className="w-4 h-4" />
                        {t('tools.screenPrinting.qualityChecklist', 'Quality Checklist')}
                      </p>
                      <div className="space-y-1">
                        {selectedOrder.qualityChecklist.map(item => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={(e) => handleUpdateQualityCheck(selectedOrder.id, item.id, e.target.checked)}
                              className="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <span className={`text-sm ${item.checked ? 'line-through ' + mutedTextClass : textClass}`}>
                              {item.item}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-sm ${mutedTextClass}`}>
                          {selectedOrder.qualityChecklist.filter(i => i.checked).length}/{selectedOrder.qualityChecklist.length} completed
                        </span>
                        {selectedOrder.qualityChecklist.every(i => i.checked) && (
                          <span className="text-green-500 text-sm flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('tools.screenPrinting.allChecksPassed', 'All checks passed')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`${cardClass} p-8 text-center`}>
                  <FileCheck className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                  <p className={mutedTextClass}>{t('tools.screenPrinting.selectAnOrderToView', 'Select an order to view details and quality checklist')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Garment Inventory Section */}
          <div className={cardClass}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSection('garments')}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0D9488]" />
                <h2 className={`text-lg font-bold ${textClass}`}>{t('tools.screenPrinting.blankGarmentInventory', 'Blank Garment Inventory')}</h2>
                <span className={`text-sm ${mutedTextClass}`}>({garmentInventory.length} items)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowGarmentForm(true); }}
                  className={buttonPrimaryClass}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.screenPrinting.addGarment', 'Add Garment')}
                </button>
                {expandedSections.has('garments') ? (
                  <ChevronUp className={mutedTextClass} />
                ) : (
                  <ChevronDown className={mutedTextClass} />
                )}
              </div>
            </div>

            {expandedSections.has('garments') && (
              <div className="px-4 pb-4">
                {garmentInventory.length === 0 ? (
                  <p className={`text-center py-8 ${mutedTextClass}`}>{t('tools.screenPrinting.noGarmentsInInventoryAdd', 'No garments in inventory. Add your first item!')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.type', 'Type')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.brand', 'Brand')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.color', 'Color')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.stock', 'Stock')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.cost', 'Cost')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {garmentInventory.map(garment => {
                          const totalStock = garment.sizes.reduce((sum, s) => sum + s.quantity, 0);
                          const isLowStock = garment.sizes.some(s => s.quantity <= garment.reorderPoint);
                          return (
                            <tr key={garment.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className={`py-2 px-2 ${textClass}`}>{garment.type}</td>
                              <td className={`py-2 px-2 ${textClass}`}>{garment.brand}</td>
                              <td className={`py-2 px-2 ${textClass}`}>{garment.color}</td>
                              <td className="py-2 px-2">
                                <span className={`flex items-center gap-1 ${isLowStock ? 'text-red-500' : textClass}`}>
                                  {isLowStock && <AlertTriangle className="w-4 h-4" />}
                                  {totalStock}
                                </span>
                              </td>
                              <td className={`py-2 px-2 ${textClass}`}>{formatCurrency(garment.costPerUnit)}</td>
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditGarment(garment)}
                                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                  >
                                    <Edit2 className={`w-4 h-4 ${mutedTextClass}`} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGarment(garment.id)}
                                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
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
              </div>
            )}
          </div>

          {/* Garment Form Modal */}
          {showGarmentForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`${cardClass} w-full max-w-2xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${textClass}`}>
                    {editingGarment ? t('tools.screenPrinting.editGarment', 'Edit Garment') : t('tools.screenPrinting.addGarment2', 'Add Garment')}
                  </h2>
                  <button onClick={resetGarmentForm} className={mutedTextClass}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.type2', 'Type')}</label>
                      <select
                        value={garmentForm.type || GARMENT_TYPES[0]}
                        onChange={(e) => setGarmentForm(prev => ({ ...prev, type: e.target.value }))}
                        className={inputClass}
                      >
                        {GARMENT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.brand2', 'Brand')}</label>
                      <input
                        type="text"
                        value={garmentForm.brand || ''}
                        onChange={(e) => setGarmentForm(prev => ({ ...prev, brand: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.screenPrinting.gildanNextLevelEtc', 'Gildan, Next Level, etc.')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.color2', 'Color')}</label>
                      <input
                        type="text"
                        value={garmentForm.color || ''}
                        onChange={(e) => setGarmentForm(prev => ({ ...prev, color: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.screenPrinting.blackWhiteNavy2', 'Black, White, Navy...')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.costPerUnit', 'Cost Per Unit')}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={garmentForm.costPerUnit || 0}
                        onChange={(e) => setGarmentForm(prev => ({ ...prev, costPerUnit: parseFloat(e.target.value) || 0 }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.supplier', 'Supplier')}</label>
                      <input
                        type="text"
                        value={garmentForm.supplier || ''}
                        onChange={(e) => setGarmentForm(prev => ({ ...prev, supplier: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.reorderPoint', 'Reorder Point')}</label>
                      <input
                        type="number"
                        value={garmentForm.reorderPoint || 10}
                        onChange={(e) => setGarmentForm(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 10 }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.screenPrinting.stockBySize', 'Stock by Size')}</label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {(garmentForm.sizes || []).map((s, i) => (
                        <div key={s.size}>
                          <label className={`text-xs ${mutedTextClass}`}>{s.size}</label>
                          <input
                            type="number"
                            min="0"
                            value={s.quantity}
                            onChange={(e) => {
                              const newSizes = [...(garmentForm.sizes || [])];
                              newSizes[i] = { ...newSizes[i], quantity: parseInt(e.target.value) || 0 };
                              setGarmentForm(prev => ({ ...prev, sizes: newSizes }));
                            }}
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={resetGarmentForm} className={buttonSecondaryClass}>{t('tools.screenPrinting.cancel', 'Cancel')}</button>
                    <button onClick={handleSaveGarment} className={buttonPrimaryClass}>
                      <Save className="w-4 h-4" />
                      {editingGarment ? t('tools.screenPrinting.update', 'Update') : t('tools.screenPrinting.add2', 'Add')} Garment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ink Inventory Section */}
          <div className={cardClass}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSection('inks')}
            >
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-[#0D9488]" />
                <h2 className={`text-lg font-bold ${textClass}`}>{t('tools.screenPrinting.inkInventory', 'Ink Inventory')}</h2>
                <span className={`text-sm ${mutedTextClass}`}>({inkInventory.length} items)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInkForm(true); }}
                  className={buttonPrimaryClass}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.screenPrinting.addInk', 'Add Ink')}
                </button>
                {expandedSections.has('inks') ? (
                  <ChevronUp className={mutedTextClass} />
                ) : (
                  <ChevronDown className={mutedTextClass} />
                )}
              </div>
            </div>

            {expandedSections.has('inks') && (
              <div className="px-4 pb-4">
                {inkInventory.length === 0 ? (
                  <p className={`text-center py-8 ${mutedTextClass}`}>{t('tools.screenPrinting.noInkInInventoryAdd', 'No ink in inventory. Add your first item!')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.name', 'Name')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.brand3', 'Brand')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.color3', 'Color')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.type3', 'Type')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.quantity2', 'Quantity')}</th>
                          <th className={`text-left py-2 px-2 text-sm font-medium ${mutedTextClass}`}>{t('tools.screenPrinting.actions2', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inkInventory.map(ink => {
                          const isLowStock = ink.quantity <= ink.reorderPoint;
                          return (
                            <tr key={ink.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className={`py-2 px-2 ${textClass}`}>{ink.name}</td>
                              <td className={`py-2 px-2 ${textClass}`}>{ink.brand}</td>
                              <td className={`py-2 px-2 ${textClass}`}>{ink.color}</td>
                              <td className={`py-2 px-2 ${textClass} capitalize`}>{ink.type.replace('_', ' ')}</td>
                              <td className="py-2 px-2">
                                <span className={`flex items-center gap-1 ${isLowStock ? 'text-red-500' : textClass}`}>
                                  {isLowStock && <AlertTriangle className="w-4 h-4" />}
                                  {ink.quantity} {ink.unit}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditInk(ink)}
                                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                  >
                                    <Edit2 className={`w-4 h-4 ${mutedTextClass}`} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInk(ink.id)}
                                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
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
              </div>
            )}
          </div>

          {/* Ink Form Modal */}
          {showInkForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`${cardClass} w-full max-w-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${textClass}`}>
                    {editingInk ? t('tools.screenPrinting.editInk', 'Edit Ink') : t('tools.screenPrinting.addInk2', 'Add Ink')}
                  </h2>
                  <button onClick={resetInkForm} className={mutedTextClass}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.name2', 'Name')}</label>
                      <input
                        type="text"
                        value={inkForm.name || ''}
                        onChange={(e) => setInkForm(prev => ({ ...prev, name: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.screenPrinting.inkName', 'Ink name...')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.brand4', 'Brand')}</label>
                      <input
                        type="text"
                        value={inkForm.brand || ''}
                        onChange={(e) => setInkForm(prev => ({ ...prev, brand: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.screenPrinting.unionWilflexEtc', 'Union, Wilflex, etc.')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.color4', 'Color')}</label>
                      <input
                        type="text"
                        value={inkForm.color || ''}
                        onChange={(e) => setInkForm(prev => ({ ...prev, color: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.screenPrinting.pms185Red', 'PMS 185 Red...')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.type4', 'Type')}</label>
                      <select
                        value={inkForm.type || 'plastisol'}
                        onChange={(e) => setInkForm(prev => ({ ...prev, type: e.target.value as InkInventory['type'] }))}
                        className={inputClass}
                      >
                        <option value="plastisol">{t('tools.screenPrinting.plastisol', 'Plastisol')}</option>
                        <option value="water_based">{t('tools.screenPrinting.waterBased', 'Water-Based')}</option>
                        <option value="discharge">{t('tools.screenPrinting.discharge', 'Discharge')}</option>
                        <option value="specialty">{t('tools.screenPrinting.specialty', 'Specialty')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.quantity3', 'Quantity')}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={inkForm.quantity || 0}
                        onChange={(e) => setInkForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.unit', 'Unit')}</label>
                      <select
                        value={inkForm.unit || 'gallons'}
                        onChange={(e) => setInkForm(prev => ({ ...prev, unit: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="gallons">{t('tools.screenPrinting.gallons', 'Gallons')}</option>
                        <option value="quarts">{t('tools.screenPrinting.quarts', 'Quarts')}</option>
                        <option value="pints">{t('tools.screenPrinting.pints', 'Pints')}</option>
                        <option value="liters">{t('tools.screenPrinting.liters', 'Liters')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.costPerUnit2', 'Cost Per Unit')}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={inkForm.costPerUnit || 0}
                        onChange={(e) => setInkForm(prev => ({ ...prev, costPerUnit: parseFloat(e.target.value) || 0 }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.reorderPoint2', 'Reorder Point')}</label>
                      <input
                        type="number"
                        value={inkForm.reorderPoint || 5}
                        onChange={(e) => setInkForm(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 5 }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.screenPrinting.supplier2', 'Supplier')}</label>
                    <input
                      type="text"
                      value={inkForm.supplier || ''}
                      onChange={(e) => setInkForm(prev => ({ ...prev, supplier: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={resetInkForm} className={buttonSecondaryClass}>{t('tools.screenPrinting.cancel2', 'Cancel')}</button>
                    <button onClick={handleSaveInk} className={buttonPrimaryClass}>
                      <Save className="w-4 h-4" />
                      {editingInk ? t('tools.screenPrinting.update2', 'Update') : t('tools.screenPrinting.add3', 'Add')} Ink
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scheduling Tab */}
      {activeTab === 'scheduling' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${textClass}`}>{t('tools.screenPrinting.productionSchedule', 'Production Schedule')}</h2>
            <button onClick={() => setShowScheduleForm(true)} className={buttonPrimaryClass}>
              <Plus className="w-4 h-4" />
              {t('tools.screenPrinting.scheduleProduction2', 'Schedule Production')}
            </button>
          </div>

          {/* Schedule Form Modal */}
          {showScheduleForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`${cardClass} w-full max-w-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.screenPrinting.scheduleProduction', 'Schedule Production')}</h2>
                  <button onClick={resetScheduleForm} className={mutedTextClass}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.screenPrinting.order2', 'Order')}</label>
                    <select
                      value={scheduleForm.orderId || ''}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, orderId: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">{t('tools.screenPrinting.selectAnOrder', 'Select an order...')}</option>
                      {orders.filter(o => o.status === 'confirmed' || o.status === 'in_production').map(order => (
                        <option key={order.id} value={order.id}>
                          {order.customerName} - {order.quantity}x {order.garmentType}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.date', 'Date')}</label>
                      <input
                        type="date"
                        value={scheduleForm.date || ''}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.pressNumber', 'Press Number')}</label>
                      <input
                        type="number"
                        min="1"
                        value={scheduleForm.pressNumber || 1}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, pressNumber: parseInt(e.target.value) || 1 }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.startTime', 'Start Time')}</label>
                      <input
                        type="time"
                        value={scheduleForm.startTime || '09:00'}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.endTime', 'End Time')}</label>
                      <input
                        type="time"
                        value={scheduleForm.endTime || '17:00'}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={resetScheduleForm} className={buttonSecondaryClass}>{t('tools.screenPrinting.cancel3', 'Cancel')}</button>
                    <button
                      onClick={handleSaveSchedule}
                      disabled={!scheduleForm.orderId || !scheduleForm.date}
                      className={`${buttonPrimaryClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.screenPrinting.schedule', 'Schedule')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule List */}
          {productionSlots.length === 0 ? (
            <div className={`${cardClass} p-8 text-center`}>
              <Calendar className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
              <p className={mutedTextClass}>{t('tools.screenPrinting.noProductionScheduledScheduleYour', 'No production scheduled. Schedule your first job!')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productionSlots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(slot => {
                const order = orders.find(o => o.id === slot.orderId);
                return (
                  <div key={slot.id} className={cardClass}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(slot.status)}`}>
                          {slot.status}
                        </span>
                        <span className={`text-sm ${mutedTextClass}`}>Press #{slot.pressNumber}</span>
                      </div>
                      <p className={`font-medium ${textClass}`}>{order?.customerName || 'Unknown Order'}</p>
                      <p className={`text-sm ${mutedTextClass}`}>
                        {order ? `${order.quantity}x ${order.garmentType}` : 'Order not found'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className={`w-4 h-4 ${mutedTextClass}`} />
                        <span className={`text-sm ${textClass}`}>{formatDate(slot.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${mutedTextClass}`} />
                        <span className={`text-sm ${textClass}`}>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleDeleteSchedule(slot.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${textClass}`}>{t('tools.screenPrinting.quantityPricingTiers', 'Quantity Pricing Tiers')}</h2>
            <button onClick={() => setShowPricingForm(true)} className={buttonPrimaryClass}>
              <Plus className="w-4 h-4" />
              {t('tools.screenPrinting.addTier', 'Add Tier')}
            </button>
          </div>

          {/* Pricing Form Modal */}
          {showPricingForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`${cardClass} w-full max-w-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${textClass}`}>
                    {editingPricing ? t('tools.screenPrinting.editPricingTier', 'Edit Pricing Tier') : t('tools.screenPrinting.addPricingTier', 'Add Pricing Tier')}
                  </h2>
                  <button onClick={resetPricingForm} className={mutedTextClass}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.minQuantity', 'Min Quantity')}</label>
                      <input
                        type="number"
                        min="1"
                        value={pricingForm.minQuantity || 1}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 1 }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.maxQuantity', 'Max Quantity')}</label>
                      <input
                        type="number"
                        min="1"
                        value={pricingForm.maxQuantity || 24}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) || 24 }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.pricePerPrint', 'Price Per Print')}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricingForm.pricePerPrint || 5}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, pricePerPrint: parseFloat(e.target.value) || 5 }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.screenPrinting.setupFee2', 'Setup Fee')}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricingForm.setupFee || 25}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, setupFee: parseFloat(e.target.value) || 25 }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>{t('tools.screenPrinting.additionalColorFeePerColor', 'Additional Color Fee (per color)')}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricingForm.additionalColorFee || 1}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, additionalColorFee: parseFloat(e.target.value) || 1 }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={resetPricingForm} className={buttonSecondaryClass}>{t('tools.screenPrinting.cancel4', 'Cancel')}</button>
                    <button onClick={handleSavePricing} className={buttonPrimaryClass}>
                      <Save className="w-4 h-4" />
                      {editingPricing ? t('tools.screenPrinting.update3', 'Update') : t('tools.screenPrinting.add4', 'Add')} Tier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tiers List */}
          {pricingTiers.length === 0 ? (
            <div className={`${cardClass} p-8 text-center`}>
              <DollarSign className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
              <p className={mutedTextClass}>{t('tools.screenPrinting.noPricingTiersSetUp', 'No pricing tiers set up. Add your first tier!')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricingTiers.sort((a, b) => a.minQuantity - b.minQuantity).map(tier => (
                <div key={tier.id} className={cardClass}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-bold text-lg ${textClass}`}>
                        {tier.minQuantity} - {tier.maxQuantity} pcs
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditPricing(tier)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${mutedTextClass}`} />
                        </button>
                        <button
                          onClick={() => handleDeletePricing(tier.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={mutedTextClass}>{t('tools.screenPrinting.pricePerPrint2', 'Price per print:')}</span>
                        <span className={`font-medium ${textClass}`}>{formatCurrency(tier.pricePerPrint)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={mutedTextClass}>{t('tools.screenPrinting.setupFee3', 'Setup fee:')}</span>
                        <span className={`font-medium ${textClass}`}>{formatCurrency(tier.setupFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={mutedTextClass}>{t('tools.screenPrinting.addLColorFee', 'Add\'l color fee:')}</span>
                        <span className={`font-medium ${textClass}`}>{formatCurrency(tier.additionalColorFee)}/color</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price Calculator */}
          {pricingTiers.length > 0 && (
            <div className={cardClass}>
              <div className="p-4">
                <h3 className={`font-bold mb-4 ${textClass}`}>{t('tools.screenPrinting.priceCalculator', 'Price Calculator')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.screenPrinting.quantity4', 'Quantity')}</label>
                    <input
                      type="number"
                      id="calc-qty"
                      defaultValue={24}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.screenPrinting.colors', 'Colors')}</label>
                    <input
                      type="number"
                      id="calc-colors"
                      defaultValue={1}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.screenPrinting.printLocations3', 'Print Locations')}</label>
                    <input
                      type="number"
                      id="calc-locations"
                      defaultValue={1}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const qty = parseInt((document.getElementById('calc-qty') as HTMLInputElement).value) || 1;
                        const colors = parseInt((document.getElementById('calc-colors') as HTMLInputElement).value) || 1;
                        const locations = parseInt((document.getElementById('calc-locations') as HTMLInputElement).value) || 1;
                        const price = calculatePrice(qty, colors, locations);
                        setValidationMessage(`Per Unit: ${formatCurrency(price.perUnit)} | Setup: ${formatCurrency(price.setupFee)} | Total: ${formatCurrency(price.total)}`);
                        setTimeout(() => setValidationMessage(null), 5000);
                      }}
                      className={buttonPrimaryClass}
                    >
                      {t('tools.screenPrinting.calculate', 'Calculate')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-8 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${textClass}`}>{t('tools.screenPrinting.aboutScreenPrintingShopManager', 'About Screen Printing Shop Manager')}</h3>
        <p className={`text-sm ${mutedTextClass}`}>
          {t('tools.screenPrinting.aComprehensiveToolForManaging', 'A comprehensive tool for managing screen printing shop operations. Track orders from intake to delivery, manage garment and ink inventory, schedule production, set quantity-based pricing tiers, and perform quality control checks. All data is stored locally in your browser and can be exported/imported for backup.')}
        </p>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${
          validationMessage.includes('successfully')
            ? 'bg-green-500'
            : validationMessage.includes('Failed')
            ? 'bg-red-500'
            : 'bg-blue-500'
        }`}>
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ScreenPrintingTool;
