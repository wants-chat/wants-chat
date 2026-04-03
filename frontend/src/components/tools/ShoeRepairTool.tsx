'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
  Footprints,
  User,
  Package,
  Wrench,
  DollarSign,
  Warehouse,
  Clock,
  Calendar,
  FileText,
  Key,
  Briefcase,
  ShoppingBag,
  Calculator,
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isRecurring: boolean;
  notes: string;
  createdAt: string;
}

interface RepairItem {
  id: string;
  customerId: string;
  itemType: 'shoes' | 'boots' | 'sandals' | 'heels' | 'sneakers' | 'leather_bag' | 'belt' | 'wallet' | 'jacket' | 'other';
  brand: string;
  color: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  repairTypes: string[];
  beforeNotes: string;
  afterNotes: string;
  estimatedCost: number;
  actualCost: number;
  status: 'received' | 'in-progress' | 'ready' | 'picked-up';
  receivedDate: string;
  estimatedPickupDate: string;
  actualPickupDate: string;
  photos: string[];
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'heels' | 'soles' | 'polish' | 'dye' | 'leather' | 'zippers' | 'laces' | 'keys' | 'care_products' | 'other';
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier: string;
}

interface KeyCuttingOrder {
  id: string;
  customerId: string;
  keyType: string;
  quantity: number;
  price: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface ProductSale {
  id: string;
  customerId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: string;
}

// Repair types with pricing
const REPAIR_TYPES = [
  { id: 'heel_replacement', name: 'Heel Replacement', basePrice: 25 },
  { id: 'sole_replacement', name: 'Sole Replacement', basePrice: 45 },
  { id: 'half_sole', name: 'Half Sole', basePrice: 30 },
  { id: 'heel_tip', name: 'Heel Tip Replacement', basePrice: 10 },
  { id: 'stretch', name: 'Stretch/Expand', basePrice: 20 },
  { id: 'shine', name: 'Shine/Polish', basePrice: 8 },
  { id: 'deep_clean', name: 'Deep Clean', basePrice: 15 },
  { id: 'zipper_repair', name: 'Zipper Repair', basePrice: 25 },
  { id: 'zipper_replace', name: 'Zipper Replacement', basePrice: 40 },
  { id: 'stitching', name: 'Stitching/Sewing', basePrice: 15 },
  { id: 'dyeing', name: 'Dyeing/Color Restoration', basePrice: 35 },
  { id: 'conditioning', name: 'Leather Conditioning', basePrice: 20 },
  { id: 'waterproofing', name: 'Waterproofing', basePrice: 15 },
  { id: 'insole', name: 'Insole Replacement', basePrice: 18 },
  { id: 'laces', name: 'Lace Replacement', basePrice: 5 },
];

const ITEM_TYPES = [
  { value: 'shoes', label: 'Dress Shoes' },
  { value: 'boots', label: 'Boots' },
  { value: 'sandals', label: 'Sandals' },
  { value: 'heels', label: 'High Heels' },
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'leather_bag', label: 'Leather Bag' },
  { value: 'belt', label: 'Belt' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'jacket', label: 'Leather Jacket' },
  { value: 'other', label: 'Other' },
];

const INVENTORY_CATEGORIES = [
  { value: 'heels', label: 'Heels' },
  { value: 'soles', label: 'Soles' },
  { value: 'polish', label: 'Polish' },
  { value: 'dye', label: 'Dye' },
  { value: 'leather', label: 'Leather' },
  { value: 'zippers', label: 'Zippers' },
  { value: 'laces', label: 'Laces' },
  { value: 'keys', label: 'Key Blanks' },
  { value: 'care_products', label: 'Care Products' },
  { value: 'other', label: 'Other' },
];

// Column configurations for export
const REPAIR_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'itemType', header: 'Item Type', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'repairTypes', header: 'Repairs', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
  { key: 'receivedDate', header: 'Received Date', type: 'date' },
  { key: 'estimatedPickupDate', header: 'Est. Pickup', type: 'date' },
  { key: 'beforeNotes', header: 'Before Notes', type: 'string' },
  { key: 'afterNotes', header: 'After Notes', type: 'string' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Customer ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'isRecurring', header: 'Recurring Customer', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created Date', type: 'date' },
];

const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Item ID', type: 'string' },
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'minQuantity', header: 'Min Quantity', type: 'number' },
  { key: 'unitPrice', header: 'Unit Price', type: 'currency' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
];

const KEY_ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'keyType', header: 'Key Type', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'price', header: 'Price per Key', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Date', type: 'date' },
];

const PRODUCT_SALE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Sale ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'productName', header: 'Product', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unitPrice', header: 'Unit Price', type: 'currency' },
  { key: 'totalPrice', header: 'Total', type: 'currency' },
  { key: 'saleDate', header: 'Sale Date', type: 'date' },
];

// Combined data interface for sync
interface ShoeRepairData {
  id: string;
  customers: Customer[];
  repairItems: RepairItem[];
  inventory: InventoryItem[];
  keyCuttingOrders: KeyCuttingOrder[];
  productSales: ProductSale[];
}

// Column config for the combined data (used for sync metadata)
const COMBINED_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customers', header: 'Customers', type: 'string' },
  { key: 'repairItems', header: 'Repair Items', type: 'string' },
  { key: 'inventory', header: 'Inventory', type: 'string' },
  { key: 'keyCuttingOrders', header: 'Key Orders', type: 'string' },
  { key: 'productSales', header: 'Product Sales', type: 'string' },
];

interface ShoeRepairToolProps {
  uiConfig?: UIConfig;
}

export const ShoeRepairTool: React.FC<ShoeRepairToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Default data structure
  const defaultData: ShoeRepairData[] = [{
    id: 'shoe-repair-data',
    customers: [],
    repairItems: [],
    inventory: [],
    keyCuttingOrders: [],
    productSales: [],
  }];

  // Use the useToolData hook for backend persistence
  const {
    data: syncedData,
    setData: setSyncedData,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importCSV: hookImportCSV,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ShoeRepairData>('shoe-repair-tool', defaultData, COMBINED_COLUMNS);

  // Extract data from synced data - ensure we always have an object with all arrays
  const shopData = syncedData[0] || defaultData[0];
  const customers = shopData.customers || [];
  const repairItems = shopData.repairItems || [];
  const inventory = shopData.inventory || [];
  const keyCuttingOrders = shopData.keyCuttingOrders || [];
  const productSales = shopData.productSales || [];

  // Helper function to update synced data
  const updateShopData = useCallback((updates: Partial<ShoeRepairData>) => {
    setSyncedData([{
      ...shopData,
      ...updates,
    }]);
  }, [shopData, setSyncedData]);

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
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'inventory' | 'keys' | 'products' | 'reports'>('orders');

  // Form states
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingRepair, setEditingRepair] = useState<RepairItem | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Customer form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    isRecurring: false,
    notes: ''
  });

  // Repair form
  const [repairForm, setRepairForm] = useState({
    customerId: '',
    itemType: 'shoes' as RepairItem['itemType'],
    brand: '',
    color: '',
    condition: 'good' as RepairItem['condition'],
    repairTypes: [] as string[],
    beforeNotes: '',
    estimatedPickupDate: ''
  });

  // Inventory form
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'soles' as InventoryItem['category'],
    quantity: 0,
    minQuantity: 5,
    unitPrice: 0,
    supplier: ''
  });

  // Key form
  const [keyForm, setKeyForm] = useState({
    customerId: '',
    keyType: '',
    quantity: 1,
    price: 5
  });

  // Product sale form
  const [productForm, setProductForm] = useState({
    customerId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0
  });

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Customer functions
  const handleSaveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) {
      setValidationMessage('Name and phone are required');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingCustomer) {
      updateShopData({
        customers: customers.map(c =>
          c.id === editingCustomer.id
            ? { ...c, ...customerForm }
            : c
        )
      });
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        ...customerForm,
        createdAt: new Date().toISOString()
      };
      updateShopData({ customers: [...customers, newCustomer] });
    }

    resetCustomerForm();
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      isRecurring: false,
      notes: ''
    });
    setEditingCustomer(null);
    setShowCustomerForm(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      isRecurring: customer.isRecurring,
      notes: customer.notes
    });
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this customer?');
    if (confirmed) {
      updateShopData({ customers: customers.filter(c => c.id !== id) });
    }
  };

  // Repair functions
  const calculateEstimatedCost = (repairTypes: string[]) => {
    return repairTypes.reduce((total, typeId) => {
      const repair = REPAIR_TYPES.find(r => r.id === typeId);
      return total + (repair?.basePrice || 0);
    }, 0);
  };

  const handleSaveRepair = () => {
    if (!repairForm.customerId || repairForm.repairTypes.length === 0) {
      setValidationMessage('Customer and at least one repair type are required');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const estimatedCost = calculateEstimatedCost(repairForm.repairTypes);

    if (editingRepair) {
      updateShopData({
        repairItems: repairItems.map(r =>
          r.id === editingRepair.id
            ? {
                ...r,
                ...repairForm,
                estimatedCost
              }
            : r
        )
      });
    } else {
      const newRepair: RepairItem = {
        id: generateId(),
        ...repairForm,
        afterNotes: '',
        estimatedCost,
        actualCost: 0,
        status: 'received',
        receivedDate: new Date().toISOString(),
        actualPickupDate: '',
        photos: []
      };
      updateShopData({ repairItems: [...repairItems, newRepair] });
    }

    resetRepairForm();
  };

  const resetRepairForm = () => {
    setRepairForm({
      customerId: '',
      itemType: 'shoes',
      brand: '',
      color: '',
      condition: 'good',
      repairTypes: [],
      beforeNotes: '',
      estimatedPickupDate: ''
    });
    setEditingRepair(null);
    setShowRepairForm(false);
  };

  const handleEditRepair = (repair: RepairItem) => {
    setRepairForm({
      customerId: repair.customerId,
      itemType: repair.itemType,
      brand: repair.brand,
      color: repair.color,
      condition: repair.condition,
      repairTypes: repair.repairTypes,
      beforeNotes: repair.beforeNotes,
      estimatedPickupDate: repair.estimatedPickupDate
    });
    setEditingRepair(repair);
    setShowRepairForm(true);
  };

  const handleUpdateStatus = (id: string, status: RepairItem['status']) => {
    updateShopData({
      repairItems: repairItems.map(r =>
        r.id === id
          ? {
              ...r,
              status,
              actualPickupDate: status === 'picked-up' ? new Date().toISOString() : r.actualPickupDate
            }
          : r
      )
    });
  };

  const handleUpdateActualCost = (id: string, actualCost: number) => {
    updateShopData({
      repairItems: repairItems.map(r =>
        r.id === id ? { ...r, actualCost } : r
      )
    });
  };

  const handleUpdateAfterNotes = (id: string, afterNotes: string) => {
    updateShopData({
      repairItems: repairItems.map(r =>
        r.id === id ? { ...r, afterNotes } : r
      )
    });
  };

  const handleDeleteRepair = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this repair order?');
    if (confirmed) {
      updateShopData({ repairItems: repairItems.filter(r => r.id !== id) });
    }
  };

  // Inventory functions
  const handleSaveInventory = () => {
    if (!inventoryForm.name) {
      setValidationMessage('Item name is required');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingInventory) {
      updateShopData({
        inventory: inventory.map(i =>
          i.id === editingInventory.id
            ? { ...i, ...inventoryForm }
            : i
        )
      });
    } else {
      const newItem: InventoryItem = {
        id: generateId(),
        ...inventoryForm
      };
      updateShopData({ inventory: [...inventory, newItem] });
    }

    resetInventoryForm();
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      name: '',
      category: 'soles',
      quantity: 0,
      minQuantity: 5,
      unitPrice: 0,
      supplier: ''
    });
    setEditingInventory(null);
    setShowInventoryForm(false);
  };

  const handleEditInventory = (item: InventoryItem) => {
    setInventoryForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unitPrice: item.unitPrice,
      supplier: item.supplier
    });
    setEditingInventory(item);
    setShowInventoryForm(true);
  };

  const handleDeleteInventory = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this inventory item?');
    if (confirmed) {
      updateShopData({ inventory: inventory.filter(i => i.id !== id) });
    }
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    updateShopData({
      inventory: inventory.map(i =>
        i.id === id
          ? { ...i, quantity: Math.max(0, i.quantity + change) }
          : i
      )
    });
  };

  // Key cutting functions
  const handleSaveKey = () => {
    if (!keyForm.customerId || !keyForm.keyType) {
      setValidationMessage('Customer and key type are required');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newOrder: KeyCuttingOrder = {
      id: generateId(),
      ...keyForm,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setKeyCuttingOrders(prev => [...prev, newOrder]);
    resetKeyForm();
  };

  const resetKeyForm = () => {
    setKeyForm({
      customerId: '',
      keyType: '',
      quantity: 1,
      price: 5
    });
    setShowKeyForm(false);
  };

  const handleCompleteKey = (id: string) => {
    setKeyCuttingOrders(prev => prev.map(k =>
      k.id === id ? { ...k, status: 'completed' } : k
    ));
  };

  const handleDeleteKey = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this key order?');
    if (confirmed) {
      setKeyCuttingOrders(prev => prev.filter(k => k.id !== id));
    }
  };

  // Product sale functions
  const handleSaveProduct = () => {
    if (!productForm.productName) {
      setValidationMessage('Product name is required');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newSale: ProductSale = {
      id: generateId(),
      customerId: productForm.customerId,
      productName: productForm.productName,
      quantity: productForm.quantity,
      unitPrice: productForm.unitPrice,
      totalPrice: productForm.quantity * productForm.unitPrice,
      saleDate: new Date().toISOString()
    };
    setProductSales(prev => [...prev, newSale]);
    resetProductForm();
  };

  const resetProductForm = () => {
    setProductForm({
      customerId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0
    });
    setShowProductForm(false);
  };

  const handleDeleteProductSale = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this sale?');
    if (confirmed) {
      setProductSales(prev => prev.filter(p => p.id !== id));
    }
  };

  // Filtered data
  const filteredRepairs = useMemo(() => {
    return repairItems.filter(repair => {
      const customer = customers.find(c => c.id === repair.customerId);
      const matchesSearch = !searchTerm ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [repairItems, customers, searchTerm, statusFilter]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.minQuantity);
  }, [inventory]);

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = repairItems
      .filter(r => r.status === 'picked-up')
      .reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0) +
      keyCuttingOrders
        .filter(k => k.status === 'completed')
        .reduce((sum, k) => sum + (k.price * k.quantity), 0) +
      productSales.reduce((sum, p) => sum + p.totalPrice, 0);

    const pendingOrders = repairItems.filter(r => r.status !== 'picked-up').length;
    const readyForPickup = repairItems.filter(r => r.status === 'ready').length;
    const recurringCustomers = customers.filter(c => c.isRecurring).length;

    return { totalRevenue, pendingOrders, readyForPickup, recurringCustomers };
  }, [repairItems, keyCuttingOrders, productSales, customers]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Walk-in';
  };

  const getStatusColor = (status: RepairItem['status']) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'picked-up': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Export helpers - prepare data based on active tab
  const getExportData = (): { data: Record<string, any>[]; columns: ColumnConfig[]; filename: string; title: string } => {
    switch (activeTab) {
      case 'orders':
        return {
          data: filteredRepairs.map(repair => ({
            ...repair,
            customerName: getCustomerName(repair.customerId),
            repairTypes: repair.repairTypes.map(rt => REPAIR_TYPES.find(r => r.id === rt)?.name || rt).join(', '),
            itemType: ITEM_TYPES.find(t => t.value === repair.itemType)?.label || repair.itemType,
          })),
          columns: REPAIR_COLUMNS,
          filename: 'shoe_repair_orders',
          title: 'Shoe Repair Orders',
        };
      case 'customers':
        return {
          data: customers,
          columns: CUSTOMER_COLUMNS,
          filename: 'shoe_repair_customers',
          title: 'Customers',
        };
      case 'inventory':
        return {
          data: inventory.map(item => ({
            ...item,
            category: INVENTORY_CATEGORIES.find(c => c.value === item.category)?.label || item.category,
          })),
          columns: INVENTORY_COLUMNS,
          filename: 'shoe_repair_inventory',
          title: 'Materials Inventory',
        };
      case 'keys':
        return {
          data: keyCuttingOrders.map(order => ({
            ...order,
            customerName: getCustomerName(order.customerId),
            total: order.quantity * order.price,
          })),
          columns: KEY_ORDER_COLUMNS,
          filename: 'key_cutting_orders',
          title: 'Key Cutting Orders',
        };
      case 'products':
        return {
          data: productSales.map(sale => ({
            ...sale,
            customerName: getCustomerName(sale.customerId),
          })),
          columns: PRODUCT_SALE_COLUMNS,
          filename: 'product_sales',
          title: 'Product Sales',
        };
      default:
        return {
          data: [],
          columns: [],
          filename: 'export',
          title: 'Export',
        };
    }
  };

  const handleExportCSV = () => {
    const { data, columns, filename } = getExportData();
    if (data.length === 0) return;
    exportToCSV(data, columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getExportData();
    if (data.length === 0) return;
    exportToExcel(data, columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getExportData();
    if (data.length === 0) return;
    exportToJSON(data, { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename, title } = getExportData();
    if (data.length === 0) return;
    await exportToPDF(data, columns, { filename, title, orientation: 'landscape' });
  };

  const handlePrint = () => {
    const { data, columns, title } = getExportData();
    if (data.length === 0) return;
    printData(data, columns, { title });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const { data, columns } = getExportData();
    if (data.length === 0) return false;
    return copyUtil(data, columns);
  };

  const hasExportData = () => {
    switch (activeTab) {
      case 'orders': return filteredRepairs.length > 0;
      case 'customers': return customers.length > 0;
      case 'inventory': return inventory.length > 0;
      case 'keys': return keyCuttingOrders.length > 0;
      case 'products': return productSales.length > 0;
      default: return false;
    }
  };

  const inputClassName = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const labelClassName = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`;

  const cardClassName = `rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClassName} p-6 mb-6`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Footprints className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.shoeRepair.shoeRepairShopManager', 'Shoe Repair Shop Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.shoeRepair.completeCobblerShopManagementSystem', 'Complete cobbler shop management system')}
                </p>
              </div>
            </div>
            {activeTab !== 'reports' && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                disabled={!hasExportData()}
                showImport={false}
                theme={theme}
              />
            )}
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.shoeRepair.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shoeRepair.totalRevenue', 'Total Revenue')}</div>
              <div className="text-2xl font-bold text-[#0D9488]">${stats.totalRevenue.toFixed(2)}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shoeRepair.pendingOrders', 'Pending Orders')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.pendingOrders}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shoeRepair.readyForPickup', 'Ready for Pickup')}</div>
              <div className="text-2xl font-bold text-green-500">{stats.readyForPickup}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shoeRepair.recurringCustomers', 'Recurring Customers')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.recurringCustomers}</div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{t('tools.shoeRepair.lowStockAlert', 'Low Stock Alert:')}</span>
                <span>{lowStockItems.map(i => i.name).join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={`${cardClassName} mb-6`}>
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'orders', label: 'Repair Orders', icon: Wrench },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'inventory', label: 'Inventory', icon: Warehouse },
              { id: 'keys', label: 'Key Cutting', icon: Key },
              { id: 'products', label: 'Product Sales', icon: ShoppingBag },
              { id: 'reports', label: 'Reports', icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={cardClassName}>
          {/* Repair Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.shoeRepair.searchByCustomerOrBrand', 'Search by customer or brand...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClassName} pl-10`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={inputClassName}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.shoeRepair.allStatus', 'All Status')}</option>
                  <option value="received">{t('tools.shoeRepair.received', 'Received')}</option>
                  <option value="in-progress">{t('tools.shoeRepair.inProgress', 'In Progress')}</option>
                  <option value="ready">{t('tools.shoeRepair.ready', 'Ready')}</option>
                  <option value="picked-up">{t('tools.shoeRepair.pickedUp', 'Picked Up')}</option>
                </select>
                <button
                  onClick={() => setShowRepairForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.shoeRepair.newOrder', 'New Order')}
                </button>
              </div>

              {/* Repair Form Modal */}
              {showRepairForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {editingRepair ? t('tools.shoeRepair.editRepairOrder', 'Edit Repair Order') : t('tools.shoeRepair.newRepairOrder', 'New Repair Order')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.customer', 'Customer *')}</label>
                        <select
                          value={repairForm.customerId}
                          onChange={(e) => setRepairForm(prev => ({ ...prev, customerId: e.target.value }))}
                          className={inputClassName}
                        >
                          <option value="">{t('tools.shoeRepair.selectCustomer', 'Select Customer')}</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.itemType', 'Item Type')}</label>
                        <select
                          value={repairForm.itemType}
                          onChange={(e) => setRepairForm(prev => ({ ...prev, itemType: e.target.value as RepairItem['itemType'] }))}
                          className={inputClassName}
                        >
                          {ITEM_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.brand', 'Brand')}</label>
                        <input
                          type="text"
                          value={repairForm.brand}
                          onChange={(e) => setRepairForm(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder={t('tools.shoeRepair.eGNikeGucci', 'e.g., Nike, Gucci')}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.color', 'Color')}</label>
                        <input
                          type="text"
                          value={repairForm.color}
                          onChange={(e) => setRepairForm(prev => ({ ...prev, color: e.target.value }))}
                          placeholder={t('tools.shoeRepair.eGBlackBrown', 'e.g., Black, Brown')}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.condition', 'Condition')}</label>
                        <select
                          value={repairForm.condition}
                          onChange={(e) => setRepairForm(prev => ({ ...prev, condition: e.target.value as RepairItem['condition'] }))}
                          className={inputClassName}
                        >
                          <option value="excellent">{t('tools.shoeRepair.excellent', 'Excellent')}</option>
                          <option value="good">{t('tools.shoeRepair.good', 'Good')}</option>
                          <option value="fair">{t('tools.shoeRepair.fair', 'Fair')}</option>
                          <option value="poor">{t('tools.shoeRepair.poor', 'Poor')}</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.estPickupDate', 'Est. Pickup Date')}</label>
                        <input
                          type="date"
                          value={repairForm.estimatedPickupDate}
                          onChange={(e) => setRepairForm(prev => ({ ...prev, estimatedPickupDate: e.target.value }))}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className={labelClassName}>{t('tools.shoeRepair.repairTypes', 'Repair Types *')}</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {REPAIR_TYPES.map(repair => (
                          <label
                            key={repair.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                              repairForm.repairTypes.includes(repair.id)
                                ? 'border-[#0D9488] bg-[#0D9488]/10'
                                : theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={repairForm.repairTypes.includes(repair.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRepairForm(prev => ({ ...prev, repairTypes: [...prev.repairTypes, repair.id] }));
                                } else {
                                  setRepairForm(prev => ({ ...prev, repairTypes: prev.repairTypes.filter(r => r !== repair.id) }));
                                }
                              }}
                              className="sr-only"
                            />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                              {repair.name} (${repair.basePrice})
                            </span>
                          </label>
                        ))}
                      </div>
                      {repairForm.repairTypes.length > 0 && (
                        <div className="mt-2 text-sm text-[#0D9488] font-medium">
                          Estimated Total: ${calculateEstimatedCost(repairForm.repairTypes)}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className={labelClassName}>{t('tools.shoeRepair.beforeNotes', 'Before Notes')}</label>
                      <textarea
                        value={repairForm.beforeNotes}
                        onChange={(e) => setRepairForm(prev => ({ ...prev, beforeNotes: e.target.value }))}
                        placeholder={t('tools.shoeRepair.describeInitialConditionSpecialInstructions', 'Describe initial condition, special instructions...')}
                        rows={3}
                        className={inputClassName}
                      />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveRepair}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        {editingRepair ? t('tools.shoeRepair.updateOrder', 'Update Order') : t('tools.shoeRepair.createOrder2', 'Create Order')}
                      </button>
                      <button
                        onClick={resetRepairForm}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {t('tools.shoeRepair.cancel', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Repair Orders List */}
              <div className="space-y-4">
                {filteredRepairs.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.shoeRepair.noRepairOrdersFound', 'No repair orders found')}</p>
                  </div>
                ) : (
                  filteredRepairs.map(repair => (
                    <div key={repair.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {getCustomerName(repair.customerId)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                              {repair.status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span>{ITEM_TYPES.find(t => t.value === repair.itemType)?.label}</span>
                            {repair.brand && <span> - {repair.brand}</span>}
                            {repair.color && <span> ({repair.color})</span>}
                          </div>
                          <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Repairs: {repair.repairTypes.map(rt => REPAIR_TYPES.find(r => r.id === rt)?.name).join(', ')}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Est: ${repair.estimatedCost}
                            </span>
                            <span className={`font-medium ${repair.actualCost ? 'text-green-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Actual: ${repair.actualCost || '-'}
                            </span>
                            {repair.estimatedPickupDate && (
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                Pickup: {new Date(repair.estimatedPickupDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {repair.status !== 'picked-up' && (
                            <>
                              <select
                                value={repair.status}
                                onChange={(e) => handleUpdateStatus(repair.id, e.target.value as RepairItem['status'])}
                                className={`text-sm px-2 py-1 rounded border ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                }`}
                              >
                                <option value="received">{t('tools.shoeRepair.received2', 'Received')}</option>
                                <option value="in-progress">{t('tools.shoeRepair.inProgress2', 'In Progress')}</option>
                                <option value="ready">{t('tools.shoeRepair.ready2', 'Ready')}</option>
                                <option value="picked-up">{t('tools.shoeRepair.pickedUp2', 'Picked Up')}</option>
                              </select>
                              <input
                                type="number"
                                placeholder={t('tools.shoeRepair.actual2', 'Actual $')}
                                value={repair.actualCost || ''}
                                onChange={(e) => handleUpdateActualCost(repair.id, parseFloat(e.target.value) || 0)}
                                className={`w-24 text-sm px-2 py-1 rounded border ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                }`}
                              />
                            </>
                          )}
                          <button
                            onClick={() => handleEditRepair(repair)}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteRepair(repair.id)}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {(repair.beforeNotes || repair.status !== 'received') && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          {repair.beforeNotes && (
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <strong>{t('tools.shoeRepair.before', 'Before:')}</strong> {repair.beforeNotes}
                            </div>
                          )}
                          {repair.status !== 'received' && (
                            <div className="mt-2">
                              <textarea
                                placeholder={t('tools.shoeRepair.afterNotesWorkDoneRecommendations', 'After notes (work done, recommendations)...')}
                                value={repair.afterNotes}
                                onChange={(e) => handleUpdateAfterNotes(repair.id, e.target.value)}
                                rows={2}
                                className={`w-full text-sm px-3 py-2 rounded border ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.shoeRepair.customers', 'Customers')}
                </h2>
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.shoeRepair.addCustomer', 'Add Customer')}
                </button>
              </div>

              {/* Customer Form Modal */}
              {showCustomerForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {editingCustomer ? t('tools.shoeRepair.editCustomer', 'Edit Customer') : t('tools.shoeRepair.addCustomer2', 'Add Customer')}
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.name', 'Name *')}</label>
                        <input
                          type="text"
                          value={customerForm.name}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t('tools.shoeRepair.customerName', 'Customer name')}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.phone', 'Phone *')}</label>
                        <input
                          type="tel"
                          value={customerForm.phone}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder={t('tools.shoeRepair.phoneNumber', 'Phone number')}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.email', 'Email')}</label>
                        <input
                          type="email"
                          value={customerForm.email}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={t('tools.shoeRepair.emailAddress', 'Email address')}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.address', 'Address')}</label>
                        <input
                          type="text"
                          value={customerForm.address}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder={t('tools.shoeRepair.address2', 'Address')}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={`flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          <input
                            type="checkbox"
                            checked={customerForm.isRecurring}
                            onChange={(e) => setCustomerForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                          />
                          {t('tools.shoeRepair.recurringRegularCustomer', 'Recurring/Regular Customer')}
                        </label>
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.notes', 'Notes')}</label>
                        <textarea
                          value={customerForm.notes}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder={t('tools.shoeRepair.specialPreferencesShoeSizesEtc', 'Special preferences, shoe sizes, etc.')}
                          rows={2}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveCustomer}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        {editingCustomer ? t('tools.shoeRepair.update', 'Update') : t('tools.shoeRepair.save', 'Save')}
                      </button>
                      <button
                        onClick={resetCustomerForm}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {t('tools.shoeRepair.cancel2', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customers List */}
              <div className="grid gap-4">
                {customers.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.shoeRepair.noCustomersYet', 'No customers yet')}</p>
                  </div>
                ) : (
                  customers.map(customer => (
                    <div key={customer.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.name}
                            </span>
                            {customer.isRecurring && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#0D9488]/20 text-[#0D9488]">
                                {t('tools.shoeRepair.regular', 'Regular')}
                              </span>
                            )}
                          </div>
                          <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {customer.phone}
                            {customer.email && ` | ${customer.email}`}
                          </div>
                          {customer.address && (
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {customer.address}
                            </div>
                          )}
                          {customer.notes && (
                            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Notes: {customer.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.shoeRepair.materialsInventory', 'Materials Inventory')}
                </h2>
                <button
                  onClick={() => setShowInventoryForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.shoeRepair.addItem', 'Add Item')}
                </button>
              </div>

              {/* Inventory Form Modal */}
              {showInventoryForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {editingInventory ? t('tools.shoeRepair.editItem', 'Edit Item') : t('tools.shoeRepair.addInventoryItem', 'Add Inventory Item')}
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.itemName', 'Item Name *')}</label>
                        <input
                          type="text"
                          value={inventoryForm.name}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t('tools.shoeRepair.eGBlackRubberHeels', 'e.g., Black Rubber Heels')}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.category', 'Category')}</label>
                        <select
                          value={inventoryForm.category}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, category: e.target.value as InventoryItem['category'] }))}
                          className={inputClassName}
                        >
                          {INVENTORY_CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClassName}>{t('tools.shoeRepair.quantity', 'Quantity')}</label>
                          <input
                            type="number"
                            value={inventoryForm.quantity}
                            onChange={(e) => setInventoryForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                            min="0"
                            className={inputClassName}
                          />
                        </div>
                        <div>
                          <label className={labelClassName}>{t('tools.shoeRepair.minQuantity', 'Min Quantity')}</label>
                          <input
                            type="number"
                            value={inventoryForm.minQuantity}
                            onChange={(e) => setInventoryForm(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
                            min="0"
                            className={inputClassName}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.unitPrice', 'Unit Price ($)')}</label>
                        <input
                          type="number"
                          value={inventoryForm.unitPrice}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                          min="0"
                          step="0.01"
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.supplier', 'Supplier')}</label>
                        <input
                          type="text"
                          value={inventoryForm.supplier}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, supplier: e.target.value }))}
                          placeholder={t('tools.shoeRepair.supplierName', 'Supplier name')}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveInventory}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        {editingInventory ? t('tools.shoeRepair.update2', 'Update') : t('tools.shoeRepair.save2', 'Save')}
                      </button>
                      <button
                        onClick={resetInventoryForm}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {t('tools.shoeRepair.cancel3', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-left text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <th className="pb-3 font-medium">{t('tools.shoeRepair.item', 'Item')}</th>
                      <th className="pb-3 font-medium">{t('tools.shoeRepair.category2', 'Category')}</th>
                      <th className="pb-3 font-medium">{t('tools.shoeRepair.quantity2', 'Quantity')}</th>
                      <th className="pb-3 font-medium">{t('tools.shoeRepair.unitPrice2', 'Unit Price')}</th>
                      <th className="pb-3 font-medium">{t('tools.shoeRepair.supplier2', 'Supplier')}</th>
                      <th className="pb-3 font-medium">{t('tools.shoeRepair.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Warehouse className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>{t('tools.shoeRepair.noInventoryItems', 'No inventory items')}</p>
                        </td>
                      </tr>
                    ) : (
                      inventory.map(item => (
                        <tr key={item.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                            {item.quantity <= item.minQuantity && (
                              <AlertCircle className="inline w-4 h-4 ml-2 text-yellow-500" />
                            )}
                          </td>
                          <td className={`py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {INVENTORY_CATEGORIES.find(c => c.value === item.category)?.label}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                className={`p-1 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <span className={`w-8 text-center ${
                                item.quantity <= item.minQuantity ? 'text-yellow-500 font-medium' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                className={`p-1 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className={`py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            ${item.unitPrice.toFixed(2)}
                          </td>
                          <td className={`py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.supplier || '-'}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditInventory(item)}
                                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              </button>
                              <button
                                onClick={() => handleDeleteInventory(item.id)}
                                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Cutting Tab */}
          {activeTab === 'keys' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.shoeRepair.keyCuttingServices', 'Key Cutting Services')}
                </h2>
                <button
                  onClick={() => setShowKeyForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.shoeRepair.newKeyOrder', 'New Key Order')}
                </button>
              </div>

              {/* Key Form Modal */}
              {showKeyForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.shoeRepair.newKeyOrder2', 'New Key Order')}
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.customer2', 'Customer')}</label>
                        <select
                          value={keyForm.customerId}
                          onChange={(e) => setKeyForm(prev => ({ ...prev, customerId: e.target.value }))}
                          className={inputClassName}
                        >
                          <option value="">{t('tools.shoeRepair.walkInCustomer', 'Walk-in Customer')}</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.keyType', 'Key Type *')}</label>
                        <input
                          type="text"
                          value={keyForm.keyType}
                          onChange={(e) => setKeyForm(prev => ({ ...prev, keyType: e.target.value }))}
                          placeholder={t('tools.shoeRepair.eGHouseKeyCar', 'e.g., House key, Car key, Padlock')}
                          className={inputClassName}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClassName}>{t('tools.shoeRepair.quantity3', 'Quantity')}</label>
                          <input
                            type="number"
                            value={keyForm.quantity}
                            onChange={(e) => setKeyForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            min="1"
                            className={inputClassName}
                          />
                        </div>
                        <div>
                          <label className={labelClassName}>{t('tools.shoeRepair.pricePerKey', 'Price per Key ($)')}</label>
                          <input
                            type="number"
                            value={keyForm.price}
                            onChange={(e) => setKeyForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.50"
                            className={inputClassName}
                          />
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shoeRepair.total', 'Total')}</div>
                        <div className="text-xl font-bold text-[#0D9488]">
                          ${(keyForm.quantity * keyForm.price).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveKey}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        {t('tools.shoeRepair.createOrder', 'Create Order')}
                      </button>
                      <button
                        onClick={resetKeyForm}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {t('tools.shoeRepair.cancel4', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Orders List */}
              <div className="space-y-4">
                {keyCuttingOrders.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.shoeRepair.noKeyOrders', 'No key orders')}</p>
                  </div>
                ) : (
                  keyCuttingOrders.map(order => (
                    <div key={order.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {order.keyType}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Customer: {getCustomerName(order.customerId)}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Qty: {order.quantity} x ${order.price} = ${(order.quantity * order.price).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCompleteKey(order.id)}
                              className="p-2 rounded bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteKey(order.id)}
                            className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Product Sales Tab */}
          {activeTab === 'products' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.shoeRepair.shoeCareProductSales', 'Shoe Care Product Sales')}
                </h2>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.shoeRepair.recordSale', 'Record Sale')}
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.shoeRepair.recordProductSale', 'Record Product Sale')}
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.customer3', 'Customer')}</label>
                        <select
                          value={productForm.customerId}
                          onChange={(e) => setProductForm(prev => ({ ...prev, customerId: e.target.value }))}
                          className={inputClassName}
                        >
                          <option value="">{t('tools.shoeRepair.walkInCustomer2', 'Walk-in Customer')}</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClassName}>{t('tools.shoeRepair.productName', 'Product Name *')}</label>
                        <input
                          type="text"
                          value={productForm.productName}
                          onChange={(e) => setProductForm(prev => ({ ...prev, productName: e.target.value }))}
                          placeholder={t('tools.shoeRepair.eGShoePolishLeather', 'e.g., Shoe Polish, Leather Conditioner')}
                          className={inputClassName}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClassName}>{t('tools.shoeRepair.quantity4', 'Quantity')}</label>
                          <input
                            type="number"
                            value={productForm.quantity}
                            onChange={(e) => setProductForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            min="1"
                            className={inputClassName}
                          />
                        </div>
                        <div>
                          <label className={labelClassName}>{t('tools.shoeRepair.unitPrice3', 'Unit Price ($)')}</label>
                          <input
                            type="number"
                            value={productForm.unitPrice}
                            onChange={(e) => setProductForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.01"
                            className={inputClassName}
                          />
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shoeRepair.total2', 'Total')}</div>
                        <div className="text-xl font-bold text-[#0D9488]">
                          ${(productForm.quantity * productForm.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveProduct}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        {t('tools.shoeRepair.recordSale2', 'Record Sale')}
                      </button>
                      <button
                        onClick={resetProductForm}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {t('tools.shoeRepair.cancel5', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Sales List */}
              <div className="space-y-4">
                {productSales.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.shoeRepair.noProductSalesRecorded', 'No product sales recorded')}</p>
                  </div>
                ) : (
                  productSales.map(sale => (
                    <div key={sale.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {sale.productName}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Customer: {getCustomerName(sale.customerId)}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Qty: {sale.quantity} x ${sale.unitPrice.toFixed(2)} = ${sale.totalPrice.toFixed(2)}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(sale.saleDate).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteProductSale(sale.id)}
                          className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.shoeRepair.businessReports', 'Business Reports')}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue Summary */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.shoeRepair.revenueSummary', 'Revenue Summary')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.repairServices', 'Repair Services')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${repairItems.filter(r => r.status === 'picked-up').reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.keyCutting', 'Key Cutting')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${keyCuttingOrders.filter(k => k.status === 'completed').reduce((sum, k) => sum + (k.price * k.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.productSales', 'Product Sales')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${productSales.reduce((sum, p) => sum + p.totalPrice, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="flex justify-between">
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.shoeRepair.totalRevenue2', 'Total Revenue')}</span>
                        <span className="font-bold text-[#0D9488] text-xl">${stats.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.shoeRepair.orderStatistics', 'Order Statistics')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.totalRepairOrders', 'Total Repair Orders')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{repairItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.completed', 'Completed')}</span>
                      <span className="font-medium text-green-500">{repairItems.filter(r => r.status === 'picked-up').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.inProgress3', 'In Progress')}</span>
                      <span className="font-medium text-yellow-500">{repairItems.filter(r => r.status === 'in-progress').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.readyForPickup2', 'Ready for Pickup')}</span>
                      <span className="font-medium text-blue-500">{stats.readyForPickup}</span>
                    </div>
                  </div>
                </div>

                {/* Popular Repairs */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.shoeRepair.popularRepairTypes', 'Popular Repair Types')}
                  </h3>
                  <div className="space-y-2">
                    {REPAIR_TYPES
                      .map(repair => ({
                        ...repair,
                        count: repairItems.reduce((count, r) =>
                          count + (r.repairTypes.includes(repair.id) ? 1 : 0), 0
                        )
                      }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map(repair => (
                        <div key={repair.id} className="flex justify-between items-center">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{repair.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                            {repair.count} orders
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Customer Insights */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.shoeRepair.customerInsights', 'Customer Insights')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.totalCustomers', 'Total Customers')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.recurringCustomers2', 'Recurring Customers')}</span>
                      <span className="font-medium text-[#0D9488]">{stats.recurringCustomers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.shoeRepair.avgOrderValue', 'Avg. Order Value')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${repairItems.length > 0
                          ? (repairItems.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0) / repairItems.length).toFixed(2)
                          : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimate vs Actual Cost Analysis */}
              <div className={`mt-6 p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.shoeRepair.estimateVsActualCostAnalysis', 'Estimate vs Actual Cost Analysis')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`text-left text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <th className="pb-2">{t('tools.shoeRepair.customer4', 'Customer')}</th>
                        <th className="pb-2">{t('tools.shoeRepair.item2', 'Item')}</th>
                        <th className="pb-2">{t('tools.shoeRepair.estimated', 'Estimated')}</th>
                        <th className="pb-2">{t('tools.shoeRepair.actual', 'Actual')}</th>
                        <th className="pb-2">{t('tools.shoeRepair.difference', 'Difference')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairItems
                        .filter(r => r.actualCost > 0)
                        .slice(0, 10)
                        .map(repair => {
                          const diff = repair.actualCost - repair.estimatedCost;
                          return (
                            <tr key={repair.id} className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                              <td className={`py-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                {getCustomerName(repair.customerId)}
                              </td>
                              <td className={`py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {ITEM_TYPES.find(t => t.value === repair.itemType)?.label}
                              </td>
                              <td className={`py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                ${repair.estimatedCost.toFixed(2)}
                              </td>
                              <td className={`py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${repair.actualCost.toFixed(2)}
                              </td>
                              <td className={`py-2 font-medium ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                  {repairItems.filter(r => r.actualCost > 0).length === 0 && (
                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.shoeRepair.noCompletedOrdersWithActual', 'No completed orders with actual cost recorded')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.shoeRepair.aboutShoeRepairShopManager', 'About Shoe Repair Shop Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            A complete management system for cobbler and shoe repair shops. Track customer information, repair orders,
            materials inventory, key cutting services, and product sales. Features status tracking, estimate vs actual
            cost comparison, recurring customer management, and comprehensive business reports. All data is saved
            locally in your browser.
          </p>
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AlertCircle className="w-5 h-5" />
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ShoeRepairTool;
