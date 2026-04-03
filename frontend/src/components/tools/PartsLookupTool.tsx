'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
} from '../../lib/toolDataUtils';
import {
  Package,
  Search,
  Plus,
  Trash2,
  Save,
  Edit3,
  ShoppingCart,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Tag,
  Warehouse,
  Sparkles,
  RefreshCw,
  Box,
  Barcode,
  Hash,
  Building2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

// Types
interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  leadTimeDays: number;
  rating: number;
}

interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  applianceTypes: string[];
  brands: string[];
  price: number;
  cost: number;
  stockQuantity: number;
  minStockLevel: number;
  location: string;
  supplierId: string;
  supplierPartNumber: string;
  imageUrl: string;
  weight: number;
  dimensions: string;
  warranty: string;
  isActive: boolean;
  lastOrdered: string;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

interface PartOrder {
  id: string;
  partId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplierId: string;
  supplierName: string;
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery: string;
  trackingNumber: string;
  notes: string;
  createdAt: string;
}

// Constants
const PART_CATEGORIES = [
  'Motors',
  'Compressors',
  'Control Boards',
  'Heating Elements',
  'Thermostats',
  'Sensors',
  'Pumps',
  'Valves',
  'Seals & Gaskets',
  'Belts',
  'Fans & Blowers',
  'Electrical Components',
  'Hoses & Tubing',
  'Filters',
  'Door Parts',
  'Ice Maker Parts',
  'Refrigeration Parts',
  'Washer Parts',
  'Dryer Parts',
  'Dishwasher Parts',
  'Oven Parts',
  'Microwave Parts',
  'HVAC Parts',
  'Other',
];

const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washing Machine',
  'Dryer',
  'Dishwasher',
  'Oven/Range',
  'Microwave',
  'Air Conditioner',
  'Freezer',
  'Ice Maker',
  'Water Heater',
  'HVAC System',
  'Universal',
];

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'ordered', label: 'Ordered', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'received', label: 'Received', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'sup-001', name: 'AppliancePro Parts', phone: '1-800-555-0101', email: 'orders@appliancepro.com', website: 'appliancepro.com', leadTimeDays: 3, rating: 4.5 },
  { id: 'sup-002', name: 'PartsDirect USA', phone: '1-800-555-0102', email: 'sales@partsdirect.com', website: 'partsdirect.com', leadTimeDays: 2, rating: 4.8 },
  { id: 'sup-003', name: 'HVAC Solutions', phone: '1-800-555-0103', email: 'orders@hvacsolutions.com', website: 'hvacsolutions.com', leadTimeDays: 4, rating: 4.2 },
  { id: 'sup-004', name: 'OEM Parts Warehouse', phone: '1-800-555-0104', email: 'support@oemparts.com', website: 'oemparts.com', leadTimeDays: 5, rating: 4.0 },
];

// Column configurations
const PART_COLUMNS: ColumnConfig[] = [
  { key: 'partNumber', header: 'Part #', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'stockQuantity', header: 'In Stock', type: 'number' },
  { key: 'minStockLevel', header: 'Min Level', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'partNumber', header: 'Part #', type: 'string' },
  { key: 'partName', header: 'Part Name', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'supplierName', header: 'Supplier', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'expectedDelivery', header: 'Expected Delivery', type: 'date' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const generatePartNumber = () => `PT-${Date.now().toString(36).toUpperCase()}`;
const generateOrderId = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

const createEmptyPart = (): Part => ({
  id: generateId(),
  partNumber: generatePartNumber(),
  name: '',
  description: '',
  category: '',
  applianceTypes: [],
  brands: [],
  price: 0,
  cost: 0,
  stockQuantity: 0,
  minStockLevel: 5,
  location: '',
  supplierId: '',
  supplierPartNumber: '',
  imageUrl: '',
  weight: 0,
  dimensions: '',
  warranty: '',
  isActive: true,
  lastOrdered: '',
  lastRestocked: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

interface PartsLookupToolProps {
  uiConfig?: UIConfig;
}

export const PartsLookupTool = ({ uiConfig }: PartsLookupToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for parts
  const {
    data: parts,
    addItem: addPart,
    updateItem: updatePart,
    deleteItem: deletePart,
    isSaving: partsSaving,
    isSynced: partsSynced,
    lastSaved: partsLastSaved,
    syncError: partsSyncError,
    forceSync: forcePartsSync,
  } = useToolData<Part>('appliance-parts', [], PART_COLUMNS);

  // Use the useToolData hook for orders
  const {
    data: orders,
    addItem: addOrder,
    updateItem: updateOrder,
    deleteItem: deleteOrder,
    isSaving: ordersSaving,
    isSynced: ordersSynced,
    lastSaved: ordersLastSaved,
    syncError: ordersSyncError,
    forceSync: forceOrdersSync,
  } = useToolData<PartOrder>('appliance-part-orders', [], ORDER_COLUMNS);

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'add-part' | 'edit-part'>('inventory');
  const [currentPart, setCurrentPart] = useState<Part>(createEmptyPart());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [newBrand, setNewBrand] = useState('');

  // Cart for ordering parts
  const [cart, setCart] = useState<Array<{ part: Part; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        // Restore all saved form fields
        if (params.searchQuery) setSearchQuery(params.searchQuery);
        if (params.categoryFilter) setCategoryFilter(params.categoryFilter);
        if (params.stockFilter) setStockFilter(params.stockFilter);
        if (params.orderStatusFilter) setOrderStatusFilter(params.orderStatusFilter);
        if (params.currentPart) setCurrentPart(params.currentPart);
        if (params.activeTab) setActiveTab(params.activeTab);
        if (params.newBrand) setNewBrand(params.newBrand);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Normal prefill
        if (params.searchQuery) {
          setSearchQuery(params.searchQuery);
        }
        if (params.partNumber || params.partName) {
          const newPart = createEmptyPart();
          if (params.partNumber) newPart.partNumber = params.partNumber;
          if (params.partName) newPart.name = params.partName;
          if (params.category) newPart.category = params.category;
          setCurrentPart(newPart);
          setActiveTab('add-part');
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        !searchQuery.trim() ||
        part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;

      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = part.stockQuantity > 0 && part.stockQuantity <= part.minStockLevel;
      } else if (stockFilter === 'out') {
        matchesStock = part.stockQuantity === 0;
      }

      return matchesSearch && matchesCategory && matchesStock && part.isActive;
    });
  }, [parts, searchQuery, categoryFilter, stockFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return orderStatusFilter === 'all' || order.status === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalParts = parts.filter((p) => p.isActive).length;
    const lowStock = parts.filter((p) => p.isActive && p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length;
    const outOfStock = parts.filter((p) => p.isActive && p.stockQuantity === 0).length;
    const pendingOrders = orders.filter((o) => ['pending', 'ordered', 'shipped'].includes(o.status)).length;
    const totalInventoryValue = parts.reduce((sum, p) => sum + p.stockQuantity * p.cost, 0);
    return { totalParts, lowStock, outOfStock, pendingOrders, totalInventoryValue };
  }, [parts, orders]);

  // Handlers
  const handleSavePart = () => {
    const updatedPart = {
      ...currentPart,
      updatedAt: new Date().toISOString(),
      metadata: {
        toolId: 'parts-lookup',
        searchQuery,
        categoryFilter,
        stockFilter,
        orderStatusFilter,
        currentPart: { ...currentPart },
        activeTab,
      },
    };
    const existingPart = parts.find((p) => p.id === currentPart.id);

    if (existingPart) {
      updatePart(currentPart.id, updatedPart as Part);
    } else {
      addPart(updatedPart as Part);
    }

    // Call onSaveCallback if provided (for gallery saves)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    setCurrentPart(createEmptyPart());
    setActiveTab('inventory');
  };

  const handleEditPart = (part: Part) => {
    setCurrentPart(part);
    setActiveTab('edit-part');
  };

  const handleDeletePart = async (partId: string) => {
    const confirmed = await confirm({
      title: 'Delete Part',
      message: 'Are you sure you want to delete this part?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePart(partId);
    }
  };

  const handleAddToCart = (part: Part) => {
    const existing = cart.find((item) => item.part.id === part.id);
    if (existing) {
      setCart(cart.map((item) => (item.part.id === part.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { part, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (partId: string) => {
    setCart(cart.filter((item) => item.part.id !== partId));
  };

  const handleUpdateCartQuantity = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(partId);
    } else {
      setCart(cart.map((item) => (item.part.id === partId ? { ...item, quantity } : item)));
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedSupplier || cart.length === 0) return;

    const supplier = DEFAULT_SUPPLIERS.find((s) => s.id === selectedSupplier);
    if (!supplier) return;

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + supplier.leadTimeDays);

    cart.forEach((item) => {
      const order: PartOrder = {
        id: generateOrderId(),
        partId: item.part.id,
        partNumber: item.part.partNumber,
        partName: item.part.name,
        quantity: item.quantity,
        unitCost: item.part.cost,
        totalCost: item.part.cost * item.quantity,
        supplierId: supplier.id,
        supplierName: supplier.name,
        status: 'pending',
        orderDate: new Date().toISOString(),
        expectedDelivery: expectedDelivery.toISOString(),
        actualDelivery: '',
        trackingNumber: '',
        notes: '',
        createdAt: new Date().toISOString(),
      };
      addOrder(order);

      // Update part's lastOrdered
      const part = parts.find((p) => p.id === item.part.id);
      if (part) {
        updatePart(part.id, { ...part, lastOrdered: new Date().toISOString() });
      }
    });

    setCart([]);
    setShowCart(false);
    setSelectedSupplier('');
    setActiveTab('orders');
  };

  const handleUpdateOrderStatus = (orderId: string, status: PartOrder['status']) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updates: Partial<PartOrder> = { status };
    if (status === 'received') {
      updates.actualDelivery = new Date().toISOString();

      // Update part stock
      const part = parts.find((p) => p.id === order.partId);
      if (part) {
        updatePart(part.id, {
          ...part,
          stockQuantity: part.stockQuantity + order.quantity,
          lastRestocked: new Date().toISOString(),
        });
      }
    }

    updateOrder(orderId, { ...order, ...updates });
  };

  const toggleApplianceType = (type: string) => {
    const types = currentPart.applianceTypes.includes(type)
      ? currentPart.applianceTypes.filter((t) => t !== type)
      : [...currentPart.applianceTypes, type];
    setCurrentPart({ ...currentPart, applianceTypes: types });
  };

  const handleAddBrand = () => {
    if (!newBrand.trim() || currentPart.brands.includes(newBrand.trim())) return;
    setCurrentPart({ ...currentPart, brands: [...currentPart.brands, newBrand.trim()] });
    setNewBrand('');
  };

  const handleRemoveBrand = (brand: string) => {
    setCurrentPart({ ...currentPart, brands: currentPart.brands.filter((b) => b !== brand) });
  };

  const getStockStatusColor = (part: Part) => {
    if (part.stockQuantity === 0) {
      return isDark ? 'text-red-400' : 'text-red-600';
    }
    if (part.stockQuantity <= part.minStockLevel) {
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    }
    return isDark ? 'text-green-400' : 'text-green-600';
  };

  const getOrderStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ordered: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200',
      received: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
      cancelled: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[status] || colorMap.pending;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.part.cost * item.quantity, 0);

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.partsLookup.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.partsLookup.partsLookupOrdering', 'Parts Lookup & Ordering')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.partsLookup.searchPartsManageInventoryAnd', 'Search parts, manage inventory, and place orders')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="relative p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
                <WidgetEmbedButton toolSlug="parts-lookup" toolName="Parts Lookup" />

                <SyncStatus
                  isSynced={partsSynced && ordersSynced}
                  isSaving={partsSaving || ordersSaving}
                  lastSaved={partsLastSaved || ordersLastSaved}
                  syncError={partsSyncError || ordersSyncError}
                  onForceSync={() => {
                    forcePartsSync();
                    forceOrdersSync();
                  }}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={() => exportToCSV(parts, PART_COLUMNS, { filename: 'parts-inventory' })}
                  onExportExcel={() => exportToExcel(parts, PART_COLUMNS, { filename: 'parts-inventory' })}
                  onExportJSON={() => exportToJSON(parts, { filename: 'parts-inventory' })}
                  onExportPDF={async () =>
                    await exportToPDF(parts, PART_COLUMNS, {
                      filename: 'parts-inventory',
                      title: 'Parts Inventory',
                      subtitle: `${parts.length} parts`,
                    })
                  }
                  onPrint={() => printData(parts, PART_COLUMNS, { title: 'Parts Inventory' })}
                  onCopyToClipboard={async () => await copyUtil(parts, PART_COLUMNS, 'tab')}
                  showImport={false}
                  theme={theme}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {[
            { label: 'Total Parts', value: stats.totalParts, icon: <Box className="w-5 h-5" /> },
            { label: 'Low Stock', value: stats.lowStock, icon: <AlertTriangle className="w-5 h-5 text-yellow-500" /> },
            { label: 'Out of Stock', value: stats.outOfStock, icon: <XCircle className="w-5 h-5 text-red-500" /> },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: <Truck className="w-5 h-5 text-blue-500" /> },
            { label: 'Inventory Value', value: `$${stats.totalInventoryValue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-green-500" /> },
          ].map((stat) => (
            <Card key={stat.label} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {stat.icon}
                  <div>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <div className={`relative w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl p-6 overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partsLookup.orderCart', 'Order Cart')}</h2>
                <button onClick={() => setShowCart(false)} className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsLookup.cartIsEmpty', 'Cart is empty')}</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.part.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.part.name}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.part.partNumber}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>${item.part.cost.toFixed(2)} each</p>
                          </div>
                          <button onClick={() => handleRemoveFromCart(item.part.id)} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateCartQuantity(item.part.id, item.quantity - 1)}
                            className={`px-2 py-1 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}
                          >
                            -
                          </button>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQuantity(item.part.id, item.quantity + 1)}
                            className={`px-2 py-1 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}
                          >
                            +
                          </button>
                          <span className={`ml-auto font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${(item.part.cost * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between mb-4">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partsLookup.total', 'Total:')}</span>
                      <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>${cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>{t('tools.partsLookup.selectSupplier', 'Select Supplier')}</label>
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">{t('tools.partsLookup.chooseSupplier', 'Choose supplier...')}</option>
                        {DEFAULT_SUPPLIERS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.leadTimeDays} day lead time)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={!selectedSupplier}
                      className="w-full px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      {t('tools.partsLookup.placeOrder', 'Place Order')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6">
          {[
            { id: 'inventory', label: 'Parts Inventory', icon: <Warehouse className="w-4 h-4" /> },
            { id: 'orders', label: 'Orders', icon: <Truck className="w-4 h-4" /> },
            { id: 'add-part', label: 'Add Part', icon: <Plus className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'add-part') {
                  setCurrentPart(createEmptyPart());
                }
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id || (activeTab === 'edit-part' && tab.id === 'add-part')
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

        {/* Inventory View */}
        {activeTab === 'inventory' && (
          <Card className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.partsLookup.searchByPartNumberName', 'Search by part number, name, or description...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass} style={{ width: 'auto' }}>
                  <option value="all">{t('tools.partsLookup.allCategories', 'All Categories')}</option>
                  {PART_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)} className={inputClass} style={{ width: 'auto' }}>
                  <option value="all">{t('tools.partsLookup.allStockLevels', 'All Stock Levels')}</option>
                  <option value="low">{t('tools.partsLookup.lowStock', 'Low Stock')}</option>
                  <option value="out">{t('tools.partsLookup.outOfStock', 'Out of Stock')}</option>
                </select>
              </div>

              {/* Parts Grid */}
              {filteredParts.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.partsLookup.noPartsFound', 'No parts found')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredParts.map((part) => (
                    <div
                      key={part.id}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {part.partNumber}
                          </span>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{part.name}</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          {part.category}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {part.description.substring(0, 80)}{part.description.length > 80 && '...'}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${part.price.toFixed(2)}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Cost: ${part.cost.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${getStockStatusColor(part)}`}>
                            {part.stockQuantity} in stock
                          </p>
                          {part.stockQuantity <= part.minStockLevel && (
                            <p className="text-xs text-yellow-500">Min: {part.minStockLevel}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(part)}
                          className="flex-1 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] text-sm flex items-center justify-center gap-1"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {t('tools.partsLookup.order', 'Order')}
                        </button>
                        <button
                          onClick={() => handleEditPart(part)}
                          className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="px-3 py-2 rounded-lg bg-red-500/20 text-red-500"
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

        {/* Orders View */}
        {activeTab === 'orders' && (
          <Card className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              {/* Filter */}
              <div className="flex gap-4 mb-6">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.partsLookup.allStatuses', 'All Statuses')}</option>
                  {ORDER_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.partsLookup.noOrdersFound', 'No orders found')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {order.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getOrderStatusColor(order.status)}`}>
                              {ORDER_STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                            </span>
                          </div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {order.partName} ({order.partNumber})
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Qty: {order.quantity} @ ${order.unitCost.toFixed(2)} = ${order.totalCost.toFixed(2)}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Supplier: {order.supplierName}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                              Ordered: {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                              Expected: {new Date(order.expectedDelivery).toLocaleDateString()}
                            </span>
                            {order.trackingNumber && (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                Tracking: {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        {order.status !== 'received' && order.status !== 'cancelled' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as PartOrder['status'])}
                            className={`${inputClass} w-auto`}
                          >
                            {ORDER_STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Part Form */}
        {(activeTab === 'add-part' || activeTab === 'edit-part') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Basic Info */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partsLookup.partInformation', 'Part Information')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.partsLookup.partNumber', 'Part Number')}</label>
                    <input
                      type="text"
                      value={currentPart.partNumber}
                      onChange={(e) => setCurrentPart({ ...currentPart, partNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partsLookup.category', 'Category *')}</label>
                    <select
                      value={currentPart.category}
                      onChange={(e) => setCurrentPart({ ...currentPart, category: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.partsLookup.selectCategory', 'Select category...')}</option>
                      {PART_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partsLookup.partName', 'Part Name *')}</label>
                  <input
                    type="text"
                    value={currentPart.name}
                    onChange={(e) => setCurrentPart({ ...currentPart, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.partsLookup.eGRefrigeratorCompressor', 'e.g., Refrigerator Compressor')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partsLookup.description', 'Description')}</label>
                  <textarea
                    value={currentPart.description}
                    onChange={(e) => setCurrentPart({ ...currentPart, description: e.target.value })}
                    className={`${inputClass} min-h-20`}
                    placeholder={t('tools.partsLookup.partDescription', 'Part description...')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partsLookup.compatibleApplianceTypes', 'Compatible Appliance Types')}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {APPLIANCE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleApplianceType(type)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          currentPart.applianceTypes.includes(type)
                            ? 'bg-[#0D9488] text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partsLookup.compatibleBrands', 'Compatible Brands')}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder={t('tools.partsLookup.addBrand', 'Add brand...')}
                      className={inputClass}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                    />
                    <button onClick={handleAddBrand} className="px-3 py-2 bg-[#0D9488] text-white rounded-lg">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPart.brands.map((brand) => (
                      <span
                        key={brand}
                        className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {brand}
                        <button onClick={() => handleRemoveBrand(brand)} className="hover:text-red-500">
                          <XCircle className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <div className="space-y-6">
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.partsLookup.pricingInventory', 'Pricing & Inventory')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.partsLookup.costPrice', 'Cost Price ($)')}</label>
                      <input
                        type="number"
                        value={currentPart.cost}
                        onChange={(e) => setCurrentPart({ ...currentPart, cost: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.partsLookup.sellPrice', 'Sell Price ($)')}</label>
                      <input
                        type="number"
                        value={currentPart.price}
                        onChange={(e) => setCurrentPart({ ...currentPart, price: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.partsLookup.stockQuantity', 'Stock Quantity')}</label>
                      <input
                        type="number"
                        value={currentPart.stockQuantity}
                        onChange={(e) => setCurrentPart({ ...currentPart, stockQuantity: parseInt(e.target.value) || 0 })}
                        className={inputClass}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.partsLookup.minStockLevel', 'Min Stock Level')}</label>
                      <input
                        type="number"
                        value={currentPart.minStockLevel}
                        onChange={(e) => setCurrentPart({ ...currentPart, minStockLevel: parseInt(e.target.value) || 0 })}
                        className={inputClass}
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partsLookup.storageLocation', 'Storage Location')}</label>
                    <input
                      type="text"
                      value={currentPart.location}
                      onChange={(e) => setCurrentPart({ ...currentPart, location: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.partsLookup.eGShelfA3', 'e.g., Shelf A-3, Bin 12')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.partsLookup.supplierSpecifications', 'Supplier & Specifications')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.partsLookup.preferredSupplier', 'Preferred Supplier')}</label>
                    <select
                      value={currentPart.supplierId}
                      onChange={(e) => setCurrentPart({ ...currentPart, supplierId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.partsLookup.selectSupplier2', 'Select supplier...')}</option>
                      {DEFAULT_SUPPLIERS.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partsLookup.supplierPartNumber', 'Supplier Part Number')}</label>
                    <input
                      type="text"
                      value={currentPart.supplierPartNumber}
                      onChange={(e) => setCurrentPart({ ...currentPart, supplierPartNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.partsLookup.weightLbs', 'Weight (lbs)')}</label>
                      <input
                        type="number"
                        value={currentPart.weight}
                        onChange={(e) => setCurrentPart({ ...currentPart, weight: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.partsLookup.dimensions', 'Dimensions')}</label>
                      <input
                        type="text"
                        value={currentPart.dimensions}
                        onChange={(e) => setCurrentPart({ ...currentPart, dimensions: e.target.value })}
                        className={inputClass}
                        placeholder="L x W x H"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partsLookup.warranty', 'Warranty')}</label>
                    <input
                      type="text"
                      value={currentPart.warranty}
                      onChange={(e) => setCurrentPart({ ...currentPart, warranty: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.partsLookup.eG1YearManufacturer', 'e.g., 1 Year Manufacturer Warranty')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSavePart}
                  disabled={!currentPart.name || !currentPart.category}
                  className="flex-1 px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {activeTab === 'add-part' ? t('tools.partsLookup.addPart', 'Add Part') : t('tools.partsLookup.saveChanges', 'Save Changes')}
                </button>
                <button
                  onClick={() => {
                    setCurrentPart(createEmptyPart());
                    setActiveTab('inventory');
                  }}
                  className={`px-4 py-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.partsLookup.cancel', 'Cancel')}
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

export default PartsLookupTool;
