'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Store,
  Users,
  Package,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  Percent,
  TrendingDown,
  RotateCcw,
  FolderOpen,
  Calculator,
  ClipboardList,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowLeftRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
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

interface ConsignmentShopToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Consignor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  splitPercentage: number;
  paymentMethod: 'check' | 'cash' | 'bank_transfer' | 'paypal';
  paymentDetails: string;
  notes: string;
  createdAt: string;
  totalItems: number;
  totalSold: number;
  totalPayout: number;
  pendingPayout: number;
}

interface ConsignmentItem {
  id: string;
  consignorId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  originalPrice: number;
  currentPrice: number;
  minimumPrice: number;
  status: 'intake' | 'active' | 'sold' | 'returned' | 'expired';
  intakeDate: string;
  expirationDate: string;
  soldDate?: string;
  soldPrice?: number;
  markdownSchedule: MarkdownRule[];
  photos: string[];
  notes: string;
}

interface MarkdownRule {
  daysAfterIntake: number;
  percentageOff: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  defaultSplitPercentage: number;
  defaultMarkdownSchedule: MarkdownRule[];
  itemCount: number;
}

interface ConsignmentAgreement {
  id: string;
  consignorId: string;
  agreementNumber: string;
  startDate: string;
  endDate: string;
  splitPercentage: number;
  terms: string;
  status: 'active' | 'expired' | 'terminated';
  signedDate: string;
}

interface Payment {
  id: string;
  consignorId: string;
  amount: number;
  date: string;
  method: 'check' | 'cash' | 'bank_transfer' | 'paypal';
  reference: string;
  items: string[];
  notes: string;
}

interface ConsignorStatement {
  consignorId: string;
  consignorName: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  itemsSold: { itemId: string; name: string; soldPrice: number; consignorShare: number }[];
  totalSales: number;
  consignorShare: number;
  fees: number;
  payments: { date: string; amount: number; reference: string }[];
  closingBalance: number;
}

// Combined data structure for backend sync
interface ConsignmentShopData {
  id: string;
  consignors: Consignor[];
  items: ConsignmentItem[];
  categories: Category[];
  agreements: ConsignmentAgreement[];
  payments: Payment[];
}

// Column configuration for combined data export
const SHOP_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'consignors', header: 'Consignors Count', type: 'number' },
  { key: 'items', header: 'Items Count', type: 'number' },
  { key: 'categories', header: 'Categories Count', type: 'number' },
  { key: 'agreements', header: 'Agreements Count', type: 'number' },
  { key: 'payments', header: 'Payments Count', type: 'number' },
];

// Default markdown schedule
const DEFAULT_MARKDOWN_SCHEDULE: MarkdownRule[] = [
  { daysAfterIntake: 30, percentageOff: 10 },
  { daysAfterIntake: 60, percentageOff: 25 },
  { daysAfterIntake: 90, percentageOff: 50 },
];

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Clothing', description: 'Apparel and accessories', defaultSplitPercentage: 60, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
  { id: '2', name: 'Furniture', description: 'Home and office furniture', defaultSplitPercentage: 50, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
  { id: '3', name: 'Electronics', description: 'Electronic devices and gadgets', defaultSplitPercentage: 55, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
  { id: '4', name: 'Jewelry', description: 'Jewelry and watches', defaultSplitPercentage: 60, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
  { id: '5', name: 'Art', description: 'Artwork and collectibles', defaultSplitPercentage: 65, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
  { id: '6', name: 'Books', description: 'Books and media', defaultSplitPercentage: 50, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
  { id: '7', name: 'Sports', description: 'Sports equipment and gear', defaultSplitPercentage: 55, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
  { id: '8', name: 'Other', description: 'Miscellaneous items', defaultSplitPercentage: 50, defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE, itemCount: 0 },
];

// Export column configurations
const CONSIGNOR_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'splitPercentage', header: 'Split %', type: 'number' },
  { key: 'paymentMethod', header: 'Payment Method', type: 'string' },
  { key: 'totalItems', header: 'Total Items', type: 'number' },
  { key: 'totalSold', header: 'Total Sold', type: 'number' },
  { key: 'totalPayout', header: 'Total Payout', type: 'currency' },
  { key: 'pendingPayout', header: 'Pending Payout', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const ITEM_COLUMNS: ColumnConfig[] = [
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'consignorName', header: 'Consignor', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'originalPrice', header: 'Original Price', type: 'currency' },
  { key: 'currentPrice', header: 'Current Price', type: 'currency' },
  { key: 'minimumPrice', header: 'Minimum Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'intakeDate', header: 'Intake Date', type: 'date' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
  { key: 'soldDate', header: 'Sold Date', type: 'date' },
  { key: 'soldPrice', header: 'Sold Price', type: 'currency' },
];

const CATEGORY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'defaultSplitPercentage', header: 'Default Split %', type: 'number' },
  { key: 'itemCount', header: 'Item Count', type: 'number' },
];

const AGREEMENT_COLUMNS: ColumnConfig[] = [
  { key: 'agreementNumber', header: 'Agreement #', type: 'string' },
  { key: 'consignorName', header: 'Consignor', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'splitPercentage', header: 'Split %', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'signedDate', header: 'Signed Date', type: 'date' },
];

const PAYMENT_COLUMNS: ColumnConfig[] = [
  { key: 'consignorName', header: 'Consignor', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'method', header: 'Method', type: 'string' },
  { key: 'reference', header: 'Reference', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateSKU = () => `CS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
const formatDate = (date: string) => new Date(date).toLocaleDateString();

// Initial shop data
const INITIAL_SHOP_DATA: ConsignmentShopData[] = [{
  id: 'main',
  consignors: [],
  items: [],
  categories: DEFAULT_CATEGORIES,
  agreements: [],
  payments: [],
}];

export const ConsignmentShopTool: React.FC<ConsignmentShopToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for backend persistence
  const {
    data: shopDataArray,
    setData: setShopDataArray,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ConsignmentShopData>('consignment-shop', INITIAL_SHOP_DATA, SHOP_DATA_COLUMNS);

  // Extract the main shop data (we use an array wrapper for the hook but only need one item)
  const shopData = shopDataArray[0] || INITIAL_SHOP_DATA[0];

  // Derived state from shopData
  const consignors = shopData.consignors;
  const items = shopData.items;
  const categories = shopData.categories;
  const agreements = shopData.agreements;
  const payments = shopData.payments;

  // Helper function to update shop data
  const updateShopData = (updates: Partial<Omit<ConsignmentShopData, 'id'>>) => {
    setShopDataArray([{
      ...shopData,
      ...updates,
    }]);
  };

  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'consignors' | 'items' | 'agreements' | 'categories' | 'payments' | 'reports'>('dashboard');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Modal states
  const [showConsignorModal, setShowConsignorModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);

  // Edit states
  const [editingConsignor, setEditingConsignor] = useState<Consignor | null>(null);
  const [editingItem, setEditingItem] = useState<ConsignmentItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [consignorFilter, setConsignorFilter] = useState<string>('all');

  // Statement state
  const [selectedConsignorForStatement, setSelectedConsignorForStatement] = useState<string>('');
  const [statementPeriodStart, setStatementPeriodStart] = useState('');
  const [statementPeriodEnd, setStatementPeriodEnd] = useState('');
  const [generatedStatement, setGeneratedStatement] = useState<ConsignorStatement | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill consignor name
      if (params.consignorName || params.customerName || params.name) {
        hasChanges = true;
      }

      // Prefill item name
      if (params.itemName || params.title) {
        hasChanges = true;
      }

      // Prefill price
      if (params.price || params.amount) {
        hasChanges = true;
      }

      // Prefill category
      if (params.category) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Check for expired items and apply markdowns
  useEffect(() => {
    if (isLoading || items.length === 0) return;

    const today = new Date();
    const updatedItems = items.map(item => {
      if (item.status !== 'active') return item;

      // Check expiration
      if (new Date(item.expirationDate) < today) {
        return { ...item, status: 'expired' as const };
      }

      // Apply markdown based on schedule
      const intakeDate = new Date(item.intakeDate);
      const daysSinceIntake = Math.floor((today.getTime() - intakeDate.getTime()) / (1000 * 60 * 60 * 24));

      let applicableMarkdown = 0;
      for (const rule of item.markdownSchedule.sort((a, b) => b.daysAfterIntake - a.daysAfterIntake)) {
        if (daysSinceIntake >= rule.daysAfterIntake) {
          applicableMarkdown = rule.percentageOff;
          break;
        }
      }

      if (applicableMarkdown > 0) {
        const newPrice = Math.max(item.originalPrice * (1 - applicableMarkdown / 100), item.minimumPrice);
        if (newPrice !== item.currentPrice) {
          return { ...item, currentPrice: newPrice };
        }
      }

      return item;
    });

    const hasChanges = JSON.stringify(updatedItems) !== JSON.stringify(items);
    if (hasChanges) {
      updateShopData({ items: updatedItems });
    }
  }, [items, isLoading]);

  // Computed values
  const dashboardStats = useMemo(() => {
    const activeItems = items.filter(i => i.status === 'active');
    const soldItems = items.filter(i => i.status === 'sold');
    const expiredItems = items.filter(i => i.status === 'expired');
    const returnedItems = items.filter(i => i.status === 'returned');

    const totalInventoryValue = activeItems.reduce((sum, i) => sum + i.currentPrice, 0);
    const totalSalesValue = soldItems.reduce((sum, i) => sum + (i.soldPrice || 0), 0);
    const pendingPayouts = consignors.reduce((sum, c) => sum + c.pendingPayout, 0);

    const itemsExpiringIn7Days = activeItems.filter(i => {
      const expDate = new Date(i.expirationDate);
      const today = new Date();
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;

    return {
      totalConsignors: consignors.length,
      activeItems: activeItems.length,
      soldItems: soldItems.length,
      expiredItems: expiredItems.length,
      returnedItems: returnedItems.length,
      totalInventoryValue,
      totalSalesValue,
      pendingPayouts,
      itemsExpiringIn7Days,
    };
  }, [consignors, items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesConsignor = consignorFilter === 'all' || item.consignorId === consignorFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesConsignor;
    });
  }, [items, searchTerm, statusFilter, categoryFilter, consignorFilter]);

  // CRUD Operations for Consignors
  const addConsignor = (consignor: Omit<Consignor, 'id' | 'createdAt' | 'totalItems' | 'totalSold' | 'totalPayout' | 'pendingPayout'>) => {
    const newConsignor: Consignor = {
      ...consignor,
      id: generateId(),
      createdAt: new Date().toISOString(),
      totalItems: 0,
      totalSold: 0,
      totalPayout: 0,
      pendingPayout: 0,
    };
    updateShopData({ consignors: [...consignors, newConsignor] });
  };

  const updateConsignor = (id: string, updates: Partial<Consignor>) => {
    updateShopData({ consignors: consignors.map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  const deleteConsignor = (id: string) => {
    const consignorItems = items.filter(i => i.consignorId === id);
    if (consignorItems.length > 0) {
      setValidationMessage('Cannot delete consignor with existing items. Please remove or reassign items first.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    updateShopData({
      consignors: consignors.filter(c => c.id !== id),
      agreements: agreements.filter(a => a.consignorId !== id),
      payments: payments.filter(p => p.consignorId !== id),
    });
  };

  // CRUD Operations for Items
  const addItem = (item: Omit<ConsignmentItem, 'id' | 'sku' | 'currentPrice' | 'status'>) => {
    const newItem: ConsignmentItem = {
      ...item,
      id: generateId(),
      sku: generateSKU(),
      currentPrice: item.originalPrice,
      status: 'intake',
    };

    // Build updates object
    const updates: Partial<Omit<ConsignmentShopData, 'id'>> = {
      items: [...items, newItem],
    };

    // Update consignor stats
    const consignor = consignors.find(c => c.id === item.consignorId);
    if (consignor) {
      updates.consignors = consignors.map(c =>
        c.id === consignor.id ? { ...c, totalItems: c.totalItems + 1 } : c
      );
    }

    // Update category count
    const category = categories.find(c => c.name === item.category);
    if (category) {
      updates.categories = categories.map(c =>
        c.id === category.id ? { ...c, itemCount: c.itemCount + 1 } : c
      );
    }

    updateShopData(updates);
  };

  const updateItem = (id: string, updates: Partial<ConsignmentItem>) => {
    updateShopData({ items: items.map(i => i.id === id ? { ...i, ...updates } : i) });
  };

  const markItemAsSold = (id: string, soldPrice: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updates: Partial<Omit<ConsignmentShopData, 'id'>> = {
      items: items.map(i => i.id === id ? {
        ...i,
        status: 'sold' as const,
        soldDate: new Date().toISOString(),
        soldPrice,
      } : i),
    };

    // Update consignor stats
    const consignor = consignors.find(c => c.id === item.consignorId);
    if (consignor) {
      const consignorShare = soldPrice * (consignor.splitPercentage / 100);
      updates.consignors = consignors.map(c =>
        c.id === consignor.id ? {
          ...c,
          totalSold: c.totalSold + 1,
          pendingPayout: c.pendingPayout + consignorShare,
        } : c
      );
    }

    updateShopData(updates);
  };

  const returnItemToConsignor = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    updateShopData({ items: items.map(i => i.id === id ? { ...i, status: 'returned' as const } : i) });
  };

  const activateItem = (id: string) => {
    updateShopData({ items: items.map(i => i.id === id ? { ...i, status: 'active' as const } : i) });
  };

  const deleteItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (item.status === 'sold') {
      setValidationMessage('Cannot delete sold items.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const updates: Partial<Omit<ConsignmentShopData, 'id'>> = {
      items: items.filter(i => i.id !== id),
    };

    // Update category count
    const category = categories.find(c => c.name === item.category);
    if (category) {
      updates.categories = categories.map(c =>
        c.id === category.id ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c
      );
    }

    updateShopData(updates);
  };

  // CRUD Operations for Categories
  const addCategory = (category: Omit<Category, 'id' | 'itemCount'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      itemCount: 0,
    };
    updateShopData({ categories: [...categories, newCategory] });
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    updateShopData({ categories: categories.map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category && category.itemCount > 0) {
      setValidationMessage('Cannot delete category with existing items.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    updateShopData({ categories: categories.filter(c => c.id !== id) });
  };

  // CRUD Operations for Agreements
  const addAgreement = (agreement: Omit<ConsignmentAgreement, 'id' | 'agreementNumber'>) => {
    const agreementNumber = `AGR-${Date.now().toString(36).toUpperCase()}`;
    const newAgreement: ConsignmentAgreement = {
      ...agreement,
      id: generateId(),
      agreementNumber,
    };
    updateShopData({ agreements: [...agreements, newAgreement] });
  };

  // Payment Operations
  const processPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
    };

    const updates: Partial<Omit<ConsignmentShopData, 'id'>> = {
      payments: [...payments, newPayment],
    };

    // Update consignor stats
    const consignor = consignors.find(c => c.id === payment.consignorId);
    if (consignor) {
      updates.consignors = consignors.map(c =>
        c.id === consignor.id ? {
          ...c,
          totalPayout: c.totalPayout + payment.amount,
          pendingPayout: Math.max(0, c.pendingPayout - payment.amount),
        } : c
      );
    }

    updateShopData(updates);
  };

  // Generate Statement
  const generateStatement = (): ConsignorStatement | null => {
    if (!selectedConsignorForStatement || !statementPeriodStart || !statementPeriodEnd) {
      return null;
    }

    const consignor = consignors.find(c => c.id === selectedConsignorForStatement);
    if (!consignor) return null;

    const periodStart = new Date(statementPeriodStart);
    const periodEnd = new Date(statementPeriodEnd);

    const soldItemsInPeriod = items.filter(i =>
      i.consignorId === selectedConsignorForStatement &&
      i.status === 'sold' &&
      i.soldDate &&
      new Date(i.soldDate) >= periodStart &&
      new Date(i.soldDate) <= periodEnd
    );

    const paymentsInPeriod = payments.filter(p =>
      p.consignorId === selectedConsignorForStatement &&
      new Date(p.date) >= periodStart &&
      new Date(p.date) <= periodEnd
    );

    const itemsSold = soldItemsInPeriod.map(i => ({
      itemId: i.id,
      name: i.name,
      soldPrice: i.soldPrice || 0,
      consignorShare: (i.soldPrice || 0) * (consignor.splitPercentage / 100),
    }));

    const totalSales = itemsSold.reduce((sum, i) => sum + i.soldPrice, 0);
    const consignorShare = itemsSold.reduce((sum, i) => sum + i.consignorShare, 0);
    const fees = totalSales - consignorShare;
    const paymentTotal = paymentsInPeriod.reduce((sum, p) => sum + p.amount, 0);

    return {
      consignorId: consignor.id,
      consignorName: consignor.name,
      periodStart: statementPeriodStart,
      periodEnd: statementPeriodEnd,
      openingBalance: 0, // Would need historical data
      itemsSold,
      totalSales,
      consignorShare,
      fees,
      payments: paymentsInPeriod.map(p => ({ date: p.date, amount: p.amount, reference: p.reference })),
      closingBalance: consignorShare - paymentTotal,
    };
  };

  // Form states
  const [consignorForm, setConsignorForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    splitPercentage: 60,
    paymentMethod: 'check' as const,
    paymentDetails: '',
    notes: '',
  });

  const [itemForm, setItemForm] = useState({
    consignorId: '',
    name: '',
    description: '',
    category: '',
    condition: 'good' as const,
    originalPrice: 0,
    minimumPrice: 0,
    intakeDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    markdownSchedule: DEFAULT_MARKDOWN_SCHEDULE,
    photos: [] as string[],
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    defaultSplitPercentage: 50,
    defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE,
  });

  const [paymentForm, setPaymentForm] = useState({
    consignorId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'check' as const,
    reference: '',
    items: [] as string[],
    notes: '',
  });

  const [soldPriceInput, setSoldPriceInput] = useState<{ [key: string]: string }>({});

  const resetConsignorForm = () => {
    setConsignorForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      splitPercentage: 60,
      paymentMethod: 'check',
      paymentDetails: '',
      notes: '',
    });
    setEditingConsignor(null);
  };

  const resetItemForm = () => {
    setItemForm({
      consignorId: '',
      name: '',
      description: '',
      category: '',
      condition: 'good',
      originalPrice: 0,
      minimumPrice: 0,
      intakeDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      markdownSchedule: DEFAULT_MARKDOWN_SCHEDULE,
      photos: [],
      notes: '',
    });
    setEditingItem(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      defaultSplitPercentage: 50,
      defaultMarkdownSchedule: DEFAULT_MARKDOWN_SCHEDULE,
    });
    setEditingCategory(null);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      consignorId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'check',
      reference: '',
      items: [],
      notes: '',
    });
  };

  // Theme-based styles
  const cardClass = `${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm`;
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;
  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`;
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const buttonPrimaryClass = 'bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2';
  const buttonSecondaryClass = `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2`;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Store },
    { id: 'consignors', label: 'Consignors', icon: Users },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'agreements', label: 'Agreements', icon: FileText },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: ClipboardList },
  ];

  // Export data preparation based on active tab
  const getExportData = (): Record<string, any>[] => {
    switch (activeTab) {
      case 'consignors':
        return consignors.map(c => ({
          ...c,
          paymentMethod: c.paymentMethod.replace('_', ' '),
        }));
      case 'items':
        return items.map(i => ({
          ...i,
          consignorName: consignors.find(c => c.id === i.consignorId)?.name || 'Unknown',
          condition: i.condition.replace('_', ' '),
        }));
      case 'categories':
        return categories;
      case 'agreements':
        return agreements.map(a => ({
          ...a,
          consignorName: consignors.find(c => c.id === a.consignorId)?.name || 'Unknown',
        }));
      case 'payments':
        return payments.map(p => ({
          ...p,
          consignorName: consignors.find(c => c.id === p.consignorId)?.name || 'Unknown',
          method: p.method.replace('_', ' '),
        }));
      default:
        return items.map(i => ({
          ...i,
          consignorName: consignors.find(c => c.id === i.consignorId)?.name || 'Unknown',
          condition: i.condition.replace('_', ' '),
        }));
    }
  };

  const getExportColumns = () => {
    switch (activeTab) {
      case 'consignors':
        return CONSIGNOR_COLUMNS;
      case 'items':
        return ITEM_COLUMNS;
      case 'categories':
        return CATEGORY_COLUMNS;
      case 'agreements':
        return AGREEMENT_COLUMNS;
      case 'payments':
        return PAYMENT_COLUMNS;
      default:
        return ITEM_COLUMNS;
    }
  };

  const getExportFileName = () => {
    const prefix = 'consignment-shop';
    switch (activeTab) {
      case 'consignors':
        return `${prefix}-consignors`;
      case 'items':
        return `${prefix}-items`;
      case 'categories':
        return `${prefix}-categories`;
      case 'agreements':
        return `${prefix}-agreements`;
      case 'payments':
        return `${prefix}-payments`;
      default:
        return `${prefix}-data`;
    }
  };

  const getExportTitle = () => {
    switch (activeTab) {
      case 'consignors':
        return 'Consignment Shop - Consignors';
      case 'items':
        return 'Consignment Shop - Items';
      case 'categories':
        return 'Consignment Shop - Categories';
      case 'agreements':
        return 'Consignment Shop - Agreements';
      case 'payments':
        return 'Consignment Shop - Payments';
      default:
        return 'Consignment Shop Data';
    }
  };

  const handleExportCSV = () => {
    const data = getExportData();
    const columns = getExportColumns();
    if (data.length === 0) return;
    exportToCSV(data, columns, { filename: getExportFileName() });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    const columns = getExportColumns();
    if (data.length === 0) return;
    exportToExcel(data, columns, { filename: getExportFileName() });
  };

  const handleExportJSON = () => {
    const data = getExportData();
    if (data.length === 0) return;
    exportToJSON(data, { filename: getExportFileName() });
  };

  const handleExportPDF = async () => {
    const data = getExportData();
    const columns = getExportColumns();
    if (data.length === 0) return;
    await exportToPDF(data, columns, {
      filename: getExportFileName(),
      title: getExportTitle(),
    });
  };

  const handleCopy = async (): Promise<boolean> => {
    const data = getExportData();
    const columns = getExportColumns();
    if (data.length === 0) return false;
    return copyUtil(data, columns);
  };

  const handlePrint = () => {
    const data = getExportData();
    const columns = getExportColumns();
    if (data.length === 0) return;
    printData(data, columns, { title: getExportTitle() });
  };

  const isExportDisabled = () => {
    switch (activeTab) {
      case 'consignors':
        return consignors.length === 0;
      case 'items':
        return items.length === 0;
      case 'categories':
        return categories.length === 0;
      case 'agreements':
        return agreements.length === 0;
      case 'payments':
        return payments.length === 0;
      case 'dashboard':
      case 'reports':
        return items.length === 0;
      default:
        return true;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.consignmentShop.loadingShopData', 'Loading shop data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClass} p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textClass}`}>{t('tools.consignmentShop.consignmentShopManager', 'Consignment Shop Manager')}</h1>
                <p className={mutedTextClass}>{t('tools.consignmentShop.manageConsignorsInventorySalesAnd', 'Manage consignors, inventory, sales, and payouts')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="consignment-shop" toolName="Consignment Shop" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onCopyToClipboard={handleCopy}
                onPrint={handlePrint}
                showImport={false}
                disabled={isExportDisabled()}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
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
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.consignmentShop.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.totalConsignors', 'Total Consignors')}</p>
                    <p className={`text-2xl font-bold ${textClass}`}>{dashboardStats.totalConsignors}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#0D9488]" />
                </div>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.activeItems', 'Active Items')}</p>
                    <p className={`text-2xl font-bold ${textClass}`}>{dashboardStats.activeItems}</p>
                  </div>
                  <Package className="w-8 h-8 text-[#0D9488]" />
                </div>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.inventoryValue', 'Inventory Value')}</p>
                    <p className={`text-2xl font-bold ${textClass}`}>{formatCurrency(dashboardStats.totalInventoryValue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-[#0D9488]" />
                </div>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.pendingPayouts', 'Pending Payouts')}</p>
                    <p className={`text-2xl font-bold ${textClass}`}>{formatCurrency(dashboardStats.pendingPayouts)}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-[#0D9488]" />
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.soldItems', 'Sold Items')}</p>
                    <p className={`text-xl font-bold ${textClass}`}>{dashboardStats.soldItems}</p>
                  </div>
                </div>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-500" />
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.expiringSoon7Days', 'Expiring Soon (7 days)')}</p>
                    <p className={`text-xl font-bold ${textClass}`}>{dashboardStats.itemsExpiringIn7Days}</p>
                  </div>
                </div>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.expiredItems', 'Expired Items')}</p>
                    <p className={`text-xl font-bold ${textClass}`}>{dashboardStats.expiredItems}</p>
                  </div>
                </div>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className={mutedTextClass}>{t('tools.consignmentShop.returnedItems', 'Returned Items')}</p>
                    <p className={`text-xl font-bold ${textClass}`}>{dashboardStats.returnedItems}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Sales */}
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.consignmentShop.salesSummary', 'Sales Summary')}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className={mutedTextClass}>{t('tools.consignmentShop.totalSalesRevenue', 'Total Sales Revenue')}</p>
                  <p className={`text-3xl font-bold text-green-500`}>{formatCurrency(dashboardStats.totalSalesValue)}</p>
                </div>
                <TrendingDown className="w-12 h-12 text-green-500" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.consignmentShop.recentItems', 'Recent Items')}</h3>
              <div className="space-y-3">
                {items.slice(-5).reverse().map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div>
                      <p className={`font-medium ${textClass}`}>{item.name}</p>
                      <p className={`text-sm ${mutedTextClass}`}>SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${textClass}`}>{formatCurrency(item.currentPrice)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        item.status === 'sold' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        item.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        item.status === 'returned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className={mutedTextClass}>{t('tools.consignmentShop.noItemsYetAddYour', 'No items yet. Add your first item to get started.')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Consignors Tab */}
        {activeTab === 'consignors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.consignors', 'Consignors')}</h2>
              <button
                onClick={() => { resetConsignorForm(); setShowConsignorModal(true); }}
                className={buttonPrimaryClass}
              >
                <Plus className="w-4 h-4" />
                {t('tools.consignmentShop.addConsignor', 'Add Consignor')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consignors.map(consignor => (
                <div key={consignor.id} className={`${cardClass} p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-semibold ${textClass}`}>{consignor.name}</h3>
                      <p className={`text-sm ${mutedTextClass}`}>{consignor.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingConsignor(consignor);
                          setConsignorForm({
                            name: consignor.name,
                            email: consignor.email,
                            phone: consignor.phone,
                            address: consignor.address,
                            splitPercentage: consignor.splitPercentage,
                            paymentMethod: consignor.paymentMethod,
                            paymentDetails: consignor.paymentDetails,
                            notes: consignor.notes,
                          });
                          setShowConsignorModal(true);
                        }}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${mutedTextClass}`} />
                      </button>
                      <button
                        onClick={() => deleteConsignor(consignor.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.split', 'Split:')}</span>
                      <span className={textClass}>{consignor.splitPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.totalItems', 'Total Items:')}</span>
                      <span className={textClass}>{consignor.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.totalSold', 'Total Sold:')}</span>
                      <span className={textClass}>{consignor.totalSold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.pendingPayout', 'Pending Payout:')}</span>
                      <span className="text-green-500 font-medium">{formatCurrency(consignor.pendingPayout)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {consignors.length === 0 && (
              <div className={`${cardClass} p-8 text-center`}>
                <Users className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                <p className={mutedTextClass}>{t('tools.consignmentShop.noConsignorsYetAddYour', 'No consignors yet. Add your first consignor to get started.')}</p>
              </div>
            )}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.inventory', 'Inventory')}</h2>
              <button
                onClick={() => { resetItemForm(); setShowItemModal(true); }}
                className={buttonPrimaryClass}
                disabled={consignors.length === 0}
              >
                <Plus className="w-4 h-4" />
                {t('tools.consignmentShop.addItem2', 'Add Item')}
              </button>
            </div>

            {/* Filters */}
            <div className={`${cardClass} p-4`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.search', 'Search')}</label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('tools.consignmentShop.searchItems', 'Search items...')}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.status', 'Status')}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={inputClass}
                  >
                    <option value="all">{t('tools.consignmentShop.allStatuses', 'All Statuses')}</option>
                    <option value="intake">{t('tools.consignmentShop.intake', 'Intake')}</option>
                    <option value="active">{t('tools.consignmentShop.active', 'Active')}</option>
                    <option value="sold">{t('tools.consignmentShop.sold', 'Sold')}</option>
                    <option value="expired">{t('tools.consignmentShop.expired', 'Expired')}</option>
                    <option value="returned">{t('tools.consignmentShop.returned', 'Returned')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.category', 'Category')}</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={inputClass}
                  >
                    <option value="all">{t('tools.consignmentShop.allCategories', 'All Categories')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.consignor', 'Consignor')}</label>
                  <select
                    value={consignorFilter}
                    onChange={(e) => setConsignorFilter(e.target.value)}
                    className={inputClass}
                  >
                    <option value="all">{t('tools.consignmentShop.allConsignors', 'All Consignors')}</option>
                    {consignors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {filteredItems.map(item => {
                const consignor = consignors.find(c => c.id === item.consignorId);
                return (
                  <div key={item.id} className={`${cardClass} p-4`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${textClass}`}>{item.name}</h3>
                            <p className={`text-sm ${mutedTextClass}`}>SKU: {item.sku}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            item.status === 'sold' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            item.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            item.status === 'returned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className={`text-sm mt-2 ${mutedTextClass}`}>{item.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <span className={mutedTextClass}>Consignor: <span className={textClass}>{consignor?.name || 'Unknown'}</span></span>
                          <span className={mutedTextClass}>Category: <span className={textClass}>{item.category}</span></span>
                          <span className={mutedTextClass}>Condition: <span className={textClass}>{item.condition}</span></span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textClass}`}>{formatCurrency(item.currentPrice)}</p>
                          {item.currentPrice !== item.originalPrice && (
                            <p className={`text-sm line-through ${mutedTextClass}`}>{formatCurrency(item.originalPrice)}</p>
                          )}
                        </div>
                        <div className={`text-xs ${mutedTextClass}`}>
                          <p>Intake: {formatDate(item.intakeDate)}</p>
                          <p>Expires: {formatDate(item.expirationDate)}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.status === 'intake' && (
                            <button
                              onClick={() => activateItem(item.id)}
                              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                              title={t('tools.consignmentShop.activateItem', 'Activate Item')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === 'active' && (
                            <>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  placeholder={t('tools.consignmentShop.soldPrice', 'Sold price')}
                                  value={soldPriceInput[item.id] || ''}
                                  onChange={(e) => setSoldPriceInput({ ...soldPriceInput, [item.id]: e.target.value })}
                                  className={`w-24 px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                />
                                <button
                                  onClick={() => {
                                    const price = parseFloat(soldPriceInput[item.id] || '0');
                                    if (price > 0) {
                                      markItemAsSold(item.id, price);
                                      setSoldPriceInput({ ...soldPriceInput, [item.id]: '' });
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                  title={t('tools.consignmentShop.markAsSold', 'Mark as Sold')}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => returnItemToConsignor(item.id)}
                                className="p-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                                title={t('tools.consignmentShop.returnToConsignor', 'Return to Consignor')}
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {(item.status === 'expired' || item.status === 'intake') && (
                            <button
                              onClick={() => returnItemToConsignor(item.id)}
                              className="p-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                              title={t('tools.consignmentShop.returnToConsignor2', 'Return to Consignor')}
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>
                          )}
                          {item.status !== 'sold' && (
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                              title={t('tools.consignmentShop.deleteItem', 'Delete Item')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className={`${cardClass} p-8 text-center`}>
                <Package className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                <p className={mutedTextClass}>No items found. {consignors.length === 0 ? t('tools.consignmentShop.addAConsignorFirst', 'Add a consignor first.') : t('tools.consignmentShop.addYourFirstItemTo', 'Add your first item to get started.')}</p>
              </div>
            )}
          </div>
        )}

        {/* Agreements Tab */}
        {activeTab === 'agreements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.consignmentAgreements', 'Consignment Agreements')}</h2>
              <button
                onClick={() => setShowAgreementModal(true)}
                className={buttonPrimaryClass}
                disabled={consignors.length === 0}
              >
                <Plus className="w-4 h-4" />
                {t('tools.consignmentShop.newAgreement', 'New Agreement')}
              </button>
            </div>

            <div className="space-y-4">
              {agreements.map(agreement => {
                const consignor = consignors.find(c => c.id === agreement.consignorId);
                return (
                  <div key={agreement.id} className={`${cardClass} p-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${textClass}`}>{agreement.agreementNumber}</h3>
                        <p className={mutedTextClass}>Consignor: {consignor?.name || 'Unknown'}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className={mutedTextClass}>Start: {formatDate(agreement.startDate)}</span>
                          <span className={mutedTextClass}>End: {formatDate(agreement.endDate)}</span>
                          <span className={mutedTextClass}>Split: {agreement.splitPercentage}%</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        agreement.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        agreement.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {agreement.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {agreements.length === 0 && (
              <div className={`${cardClass} p-8 text-center`}>
                <FileText className={`w-12 h-12 mx-auto mb-4 ${mutedTextClass}`} />
                <p className={mutedTextClass}>{t('tools.consignmentShop.noAgreementsYetCreateYour', 'No agreements yet. Create your first agreement.')}</p>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.categories', 'Categories')}</h2>
              <button
                onClick={() => { resetCategoryForm(); setShowCategoryModal(true); }}
                className={buttonPrimaryClass}
              >
                <Plus className="w-4 h-4" />
                {t('tools.consignmentShop.addCategory', 'Add Category')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.id} className={`${cardClass} p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-semibold ${textClass}`}>{category.name}</h3>
                      <p className={`text-sm ${mutedTextClass}`}>{category.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryForm({
                            name: category.name,
                            description: category.description,
                            defaultSplitPercentage: category.defaultSplitPercentage,
                            defaultMarkdownSchedule: category.defaultMarkdownSchedule,
                          });
                          setShowCategoryModal(true);
                        }}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${mutedTextClass}`} />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.defaultSplit', 'Default Split:')}</span>
                      <span className={textClass}>{category.defaultSplitPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.items', 'Items:')}</span>
                      <span className={textClass}>{category.itemCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.payments', 'Payments')}</h2>
              <button
                onClick={() => { resetPaymentForm(); setShowPaymentModal(true); }}
                className={buttonPrimaryClass}
                disabled={consignors.length === 0}
              >
                <Plus className="w-4 h-4" />
                {t('tools.consignmentShop.processPayment2', 'Process Payment')}
              </button>
            </div>

            {/* Pending Payouts Summary */}
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.consignmentShop.pendingPayoutsByConsignor', 'Pending Payouts by Consignor')}</h3>
              <div className="space-y-3">
                {consignors.filter(c => c.pendingPayout > 0).map(consignor => (
                  <div key={consignor.id} className={`flex justify-between items-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span className={textClass}>{consignor.name}</span>
                    <span className="font-semibold text-green-500">{formatCurrency(consignor.pendingPayout)}</span>
                  </div>
                ))}
                {consignors.filter(c => c.pendingPayout > 0).length === 0 && (
                  <p className={mutedTextClass}>{t('tools.consignmentShop.noPendingPayouts', 'No pending payouts.')}</p>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.consignmentShop.paymentHistory', 'Payment History')}</h3>
              <div className="space-y-3">
                {payments.map(payment => {
                  const consignor = consignors.find(c => c.id === payment.consignorId);
                  return (
                    <div key={payment.id} className={`flex justify-between items-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div>
                        <p className={textClass}>{consignor?.name || 'Unknown'}</p>
                        <p className={`text-sm ${mutedTextClass}`}>{formatDate(payment.date)} - {payment.method} - Ref: {payment.reference}</p>
                      </div>
                      <span className="font-semibold text-green-500">{formatCurrency(payment.amount)}</span>
                    </div>
                  );
                })}
                {payments.length === 0 && (
                  <p className={mutedTextClass}>{t('tools.consignmentShop.noPaymentsProcessedYet', 'No payments processed yet.')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.reports', 'Reports')}</h2>

            {/* Generate Statement */}
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.consignmentShop.generateConsignorStatement', 'Generate Consignor Statement')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.consignor2', 'Consignor')}</label>
                  <select
                    value={selectedConsignorForStatement}
                    onChange={(e) => setSelectedConsignorForStatement(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{t('tools.consignmentShop.selectConsignor', 'Select Consignor')}</option>
                    {consignors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.periodStart', 'Period Start')}</label>
                  <input
                    type="date"
                    value={statementPeriodStart}
                    onChange={(e) => setStatementPeriodStart(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.periodEnd', 'Period End')}</label>
                  <input
                    type="date"
                    value={statementPeriodEnd}
                    onChange={(e) => setStatementPeriodEnd(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const statement = generateStatement();
                  setGeneratedStatement(statement);
                  if (statement) setShowStatementModal(true);
                }}
                className={buttonPrimaryClass}
                disabled={!selectedConsignorForStatement || !statementPeriodStart || !statementPeriodEnd}
              >
                <ClipboardList className="w-4 h-4" />
                {t('tools.consignmentShop.generateStatement', 'Generate Statement')}
              </button>
            </div>

            {/* Inventory Valuation */}
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.consignmentShop.inventoryValuationByCategory', 'Inventory Valuation by Category')}</h3>
              <div className="space-y-3">
                {categories.map(category => {
                  const categoryItems = items.filter(i => i.category === category.name && i.status === 'active');
                  const totalValue = categoryItems.reduce((sum, i) => sum + i.currentPrice, 0);
                  return (
                    <div key={category.id} className={`flex justify-between items-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div>
                        <p className={textClass}>{category.name}</p>
                        <p className={`text-sm ${mutedTextClass}`}>{categoryItems.length} items</p>
                      </div>
                      <span className={`font-semibold ${textClass}`}>{formatCurrency(totalValue)}</span>
                    </div>
                  );
                })}
              </div>
              <div className={`flex justify-between items-center p-3 mt-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <span className={`font-semibold ${textClass}`}>{t('tools.consignmentShop.totalInventoryValue', 'Total Inventory Value')}</span>
                <span className={`font-bold text-lg ${textClass}`}>{formatCurrency(dashboardStats.totalInventoryValue)}</span>
              </div>
            </div>

            {/* Sales by Category */}
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.consignmentShop.salesByCategory', 'Sales by Category')}</h3>
              <div className="space-y-3">
                {categories.map(category => {
                  const soldInCategory = items.filter(i => i.category === category.name && i.status === 'sold');
                  const totalSales = soldInCategory.reduce((sum, i) => sum + (i.soldPrice || 0), 0);
                  return (
                    <div key={category.id} className={`flex justify-between items-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div>
                        <p className={textClass}>{category.name}</p>
                        <p className={`text-sm ${mutedTextClass}`}>{soldInCategory.length} items sold</p>
                      </div>
                      <span className="font-semibold text-green-500">{formatCurrency(totalSales)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Consignor Modal */}
        {showConsignorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-lg w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${textClass}`}>
                  {editingConsignor ? t('tools.consignmentShop.editConsignor', 'Edit Consignor') : t('tools.consignmentShop.addConsignor2', 'Add Consignor')}
                </h2>
                <button onClick={() => { setShowConsignorModal(false); resetConsignorForm(); }}>
                  <X className={mutedTextClass} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={consignorForm.name}
                    onChange={(e) => setConsignorForm({ ...consignorForm, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.consignmentShop.fullName', 'Full name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.email', 'Email *')}</label>
                  <input
                    type="email"
                    value={consignorForm.email}
                    onChange={(e) => setConsignorForm({ ...consignorForm, email: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.consignmentShop.emailExampleCom', 'email@example.com')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={consignorForm.phone}
                    onChange={(e) => setConsignorForm({ ...consignorForm, phone: e.target.value })}
                    className={inputClass}
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.address', 'Address')}</label>
                  <textarea
                    value={consignorForm.address}
                    onChange={(e) => setConsignorForm({ ...consignorForm, address: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.consignmentShop.streetAddressCityStateZip', 'Street address, city, state, zip')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.splitPercentageConsignorSShare', 'Split Percentage (Consignor\'s Share) *')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={consignorForm.splitPercentage}
                    onChange={(e) => setConsignorForm({ ...consignorForm, splitPercentage: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.paymentMethod', 'Payment Method')}</label>
                  <select
                    value={consignorForm.paymentMethod}
                    onChange={(e) => setConsignorForm({ ...consignorForm, paymentMethod: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="check">{t('tools.consignmentShop.check', 'Check')}</option>
                    <option value="cash">{t('tools.consignmentShop.cash', 'Cash')}</option>
                    <option value="bank_transfer">{t('tools.consignmentShop.bankTransfer', 'Bank Transfer')}</option>
                    <option value="paypal">{t('tools.consignmentShop.paypal', 'PayPal')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.paymentDetails', 'Payment Details')}</label>
                  <input
                    type="text"
                    value={consignorForm.paymentDetails}
                    onChange={(e) => setConsignorForm({ ...consignorForm, paymentDetails: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.consignmentShop.accountNumberPaypalEmailEtc', 'Account number, PayPal email, etc.')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.notes', 'Notes')}</label>
                  <textarea
                    value={consignorForm.notes}
                    onChange={(e) => setConsignorForm({ ...consignorForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (!consignorForm.name || !consignorForm.email) {
                        setValidationMessage('Name and email are required');
                        setTimeout(() => setValidationMessage(null), 3000);
                        return;
                      }
                      if (editingConsignor) {
                        updateConsignor(editingConsignor.id, consignorForm);
                      } else {
                        addConsignor(consignorForm);
                      }
                      setShowConsignorModal(false);
                      resetConsignorForm();
                    }}
                    className={buttonPrimaryClass}
                  >
                    {editingConsignor ? t('tools.consignmentShop.update', 'Update') : t('tools.consignmentShop.add', 'Add')} Consignor
                  </button>
                  <button
                    onClick={() => { setShowConsignorModal(false); resetConsignorForm(); }}
                    className={buttonSecondaryClass}
                  >
                    {t('tools.consignmentShop.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.addItem', 'Add Item')}</h2>
                <button onClick={() => { setShowItemModal(false); resetItemForm(); }}>
                  <X className={mutedTextClass} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.consignor3', 'Consignor *')}</label>
                  <select
                    value={itemForm.consignorId}
                    onChange={(e) => {
                      const consignor = consignors.find(c => c.id === e.target.value);
                      setItemForm({
                        ...itemForm,
                        consignorId: e.target.value,
                      });
                    }}
                    className={inputClass}
                  >
                    <option value="">{t('tools.consignmentShop.selectConsignor2', 'Select Consignor')}</option>
                    {consignors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.itemName', 'Item Name *')}</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.consignmentShop.eGVintageLeatherJacket', 'e.g., Vintage Leather Jacket')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.description', 'Description')}</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className={inputClass}
                    rows={3}
                    placeholder={t('tools.consignmentShop.detailedDescriptionOfTheItem', 'Detailed description of the item')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.category2', 'Category *')}</label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => {
                        const category = categories.find(c => c.name === e.target.value);
                        setItemForm({
                          ...itemForm,
                          category: e.target.value,
                          markdownSchedule: category?.defaultMarkdownSchedule || DEFAULT_MARKDOWN_SCHEDULE,
                        });
                      }}
                      className={inputClass}
                    >
                      <option value="">{t('tools.consignmentShop.selectCategory', 'Select Category')}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.condition', 'Condition *')}</label>
                    <select
                      value={itemForm.condition}
                      onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="new">{t('tools.consignmentShop.new', 'New')}</option>
                      <option value="like_new">{t('tools.consignmentShop.likeNew', 'Like New')}</option>
                      <option value="good">{t('tools.consignmentShop.good', 'Good')}</option>
                      <option value="fair">{t('tools.consignmentShop.fair', 'Fair')}</option>
                      <option value="poor">{t('tools.consignmentShop.poor', 'Poor')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.originalPrice', 'Original Price *')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.originalPrice || ''}
                      onChange={(e) => setItemForm({ ...itemForm, originalPrice: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.minimumPrice', 'Minimum Price *')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.minimumPrice || ''}
                      onChange={(e) => setItemForm({ ...itemForm, minimumPrice: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.intakeDate', 'Intake Date *')}</label>
                    <input
                      type="date"
                      value={itemForm.intakeDate}
                      onChange={(e) => setItemForm({ ...itemForm, intakeDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.expirationDate', 'Expiration Date *')}</label>
                    <input
                      type="date"
                      value={itemForm.expirationDate}
                      onChange={(e) => setItemForm({ ...itemForm, expirationDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.markdownSchedule', 'Markdown Schedule')}</label>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {itemForm.markdownSchedule.map((rule, index) => (
                      <div key={index} className={`flex items-center gap-2 ${index > 0 ? 'mt-2' : ''}`}>
                        <span className={`text-sm ${mutedTextClass}`}>{t('tools.consignmentShop.after', 'After')}</span>
                        <input
                          type="number"
                          min="1"
                          value={rule.daysAfterIntake}
                          onChange={(e) => {
                            const newSchedule = [...itemForm.markdownSchedule];
                            newSchedule[index].daysAfterIntake = parseInt(e.target.value) || 0;
                            setItemForm({ ...itemForm, markdownSchedule: newSchedule });
                          }}
                          className={`w-16 px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <span className={`text-sm ${mutedTextClass}`}>{t('tools.consignmentShop.days', 'days:')}</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={rule.percentageOff}
                          onChange={(e) => {
                            const newSchedule = [...itemForm.markdownSchedule];
                            newSchedule[index].percentageOff = parseInt(e.target.value) || 0;
                            setItemForm({ ...itemForm, markdownSchedule: newSchedule });
                          }}
                          className={`w-16 px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <span className={`text-sm ${mutedTextClass}`}>% off</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.notes2', 'Notes')}</label>
                  <textarea
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (!itemForm.consignorId || !itemForm.name || !itemForm.category || !itemForm.originalPrice || !itemForm.expirationDate) {
                        setValidationMessage('Please fill in all required fields');
                        setTimeout(() => setValidationMessage(null), 3000);
                        return;
                      }
                      addItem(itemForm);
                      setShowItemModal(false);
                      resetItemForm();
                    }}
                    className={buttonPrimaryClass}
                  >
                    {t('tools.consignmentShop.addItem3', 'Add Item')}
                  </button>
                  <button
                    onClick={() => { setShowItemModal(false); resetItemForm(); }}
                    className={buttonSecondaryClass}
                  >
                    {t('tools.consignmentShop.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-lg w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${textClass}`}>
                  {editingCategory ? t('tools.consignmentShop.editCategory', 'Edit Category') : t('tools.consignmentShop.addCategory2', 'Add Category')}
                </h2>
                <button onClick={() => { setShowCategoryModal(false); resetCategoryForm(); }}>
                  <X className={mutedTextClass} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.name2', 'Name *')}</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.consignmentShop.categoryName', 'Category name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.description2', 'Description')}</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.defaultSplitPercentage', 'Default Split Percentage')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={categoryForm.defaultSplitPercentage}
                    onChange={(e) => setCategoryForm({ ...categoryForm, defaultSplitPercentage: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (!categoryForm.name) {
                        setValidationMessage('Category name is required');
                        setTimeout(() => setValidationMessage(null), 3000);
                        return;
                      }
                      if (editingCategory) {
                        updateCategory(editingCategory.id, categoryForm);
                      } else {
                        addCategory(categoryForm);
                      }
                      setShowCategoryModal(false);
                      resetCategoryForm();
                    }}
                    className={buttonPrimaryClass}
                  >
                    {editingCategory ? t('tools.consignmentShop.update2', 'Update') : t('tools.consignmentShop.add2', 'Add')} Category
                  </button>
                  <button
                    onClick={() => { setShowCategoryModal(false); resetCategoryForm(); }}
                    className={buttonSecondaryClass}
                  >
                    {t('tools.consignmentShop.cancel3', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agreement Modal */}
        {showAgreementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-lg w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.newConsignmentAgreement', 'New Consignment Agreement')}</h2>
                <button onClick={() => setShowAgreementModal(false)}>
                  <X className={mutedTextClass} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.consignor4', 'Consignor *')}</label>
                  <select
                    id="agreement-consignor"
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">{t('tools.consignmentShop.selectConsignor3', 'Select Consignor')}</option>
                    {consignors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.startDate', 'Start Date *')}</label>
                    <input
                      type="date"
                      id="agreement-start"
                      className={inputClass}
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.consignmentShop.endDate', 'End Date *')}</label>
                    <input
                      type="date"
                      id="agreement-end"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.splitPercentageConsignorSShare2', 'Split Percentage (Consignor\'s Share) *')}</label>
                  <input
                    type="number"
                    id="agreement-split"
                    min="0"
                    max="100"
                    className={inputClass}
                    defaultValue="60"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.termsAndConditions', 'Terms and Conditions')}</label>
                  <textarea
                    id="agreement-terms"
                    className={inputClass}
                    rows={4}
                    placeholder={t('tools.consignmentShop.enterTheTermsAndConditions', 'Enter the terms and conditions...')}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      const consignorId = (document.getElementById('agreement-consignor') as HTMLSelectElement).value;
                      const startDate = (document.getElementById('agreement-start') as HTMLInputElement).value;
                      const endDate = (document.getElementById('agreement-end') as HTMLInputElement).value;
                      const splitPercentage = parseInt((document.getElementById('agreement-split') as HTMLInputElement).value);
                      const terms = (document.getElementById('agreement-terms') as HTMLTextAreaElement).value;

                      if (!consignorId || !startDate || !endDate) {
                        setValidationMessage('Please fill in all required fields');
                        setTimeout(() => setValidationMessage(null), 3000);
                        return;
                      }

                      addAgreement({
                        consignorId,
                        startDate,
                        endDate,
                        splitPercentage,
                        terms,
                        status: 'active',
                        signedDate: new Date().toISOString(),
                      });
                      setShowAgreementModal(false);
                    }}
                    className={buttonPrimaryClass}
                  >
                    {t('tools.consignmentShop.createAgreement', 'Create Agreement')}
                  </button>
                  <button
                    onClick={() => setShowAgreementModal(false)}
                    className={buttonSecondaryClass}
                  >
                    {t('tools.consignmentShop.cancel4', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-lg w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.processPayment', 'Process Payment')}</h2>
                <button onClick={() => { setShowPaymentModal(false); resetPaymentForm(); }}>
                  <X className={mutedTextClass} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.consignor5', 'Consignor *')}</label>
                  <select
                    value={paymentForm.consignorId}
                    onChange={(e) => {
                      const consignor = consignors.find(c => c.id === e.target.value);
                      setPaymentForm({
                        ...paymentForm,
                        consignorId: e.target.value,
                        amount: consignor?.pendingPayout || 0,
                        method: consignor?.paymentMethod || 'check',
                      });
                    }}
                    className={inputClass}
                  >
                    <option value="">{t('tools.consignmentShop.selectConsignor4', 'Select Consignor')}</option>
                    {consignors.filter(c => c.pendingPayout > 0).map(c => (
                      <option key={c.id} value={c.id}>{c.name} - Pending: {formatCurrency(c.pendingPayout)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.amount', 'Amount *')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentForm.amount || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.date', 'Date *')}</label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.paymentMethod2', 'Payment Method')}</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="check">{t('tools.consignmentShop.check2', 'Check')}</option>
                    <option value="cash">{t('tools.consignmentShop.cash2', 'Cash')}</option>
                    <option value="bank_transfer">{t('tools.consignmentShop.bankTransfer2', 'Bank Transfer')}</option>
                    <option value="paypal">{t('tools.consignmentShop.paypal2', 'PayPal')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.referenceNumber', 'Reference Number')}</label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.consignmentShop.checkNumberTransactionIdEtc', 'Check number, transaction ID, etc.')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.consignmentShop.notes3', 'Notes')}</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (!paymentForm.consignorId || !paymentForm.amount) {
                        setValidationMessage('Please select a consignor and enter an amount');
                        setTimeout(() => setValidationMessage(null), 3000);
                        return;
                      }
                      processPayment(paymentForm);
                      setShowPaymentModal(false);
                      resetPaymentForm();
                    }}
                    className={buttonPrimaryClass}
                  >
                    {t('tools.consignmentShop.processPayment3', 'Process Payment')}
                  </button>
                  <button
                    onClick={() => { setShowPaymentModal(false); resetPaymentForm(); }}
                    className={buttonSecondaryClass}
                  >
                    {t('tools.consignmentShop.cancel5', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statement Modal */}
        {showStatementModal && generatedStatement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${textClass}`}>{t('tools.consignmentShop.consignorStatement', 'Consignor Statement')}</h2>
                <button onClick={() => setShowStatementModal(false)}>
                  <X className={mutedTextClass} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Statement Header */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold ${textClass}`}>{generatedStatement.consignorName}</h3>
                  <p className={mutedTextClass}>
                    Period: {formatDate(generatedStatement.periodStart)} - {formatDate(generatedStatement.periodEnd)}
                  </p>
                </div>

                {/* Items Sold */}
                <div>
                  <h4 className={`font-semibold ${textClass} mb-2`}>{t('tools.consignmentShop.itemsSold', 'Items Sold')}</h4>
                  {generatedStatement.itemsSold.length > 0 ? (
                    <div className="space-y-2">
                      {generatedStatement.itemsSold.map(item => (
                        <div key={item.itemId} className={`flex justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={textClass}>{item.name}</span>
                          <div className="text-right">
                            <span className={textClass}>{formatCurrency(item.soldPrice)}</span>
                            <span className={`ml-2 ${mutedTextClass}`}>({formatCurrency(item.consignorShare)} share)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={mutedTextClass}>{t('tools.consignmentShop.noItemsSoldInThis', 'No items sold in this period.')}</p>
                  )}
                </div>

                {/* Summary */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.totalSales', 'Total Sales:')}</span>
                      <span className={textClass}>{formatCurrency(generatedStatement.totalSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.shopFees', 'Shop Fees:')}</span>
                      <span className={textClass}>-{formatCurrency(generatedStatement.fees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedTextClass}>{t('tools.consignmentShop.consignorShare', 'Consignor Share:')}</span>
                      <span className="text-green-500 font-semibold">{formatCurrency(generatedStatement.consignorShare)}</span>
                    </div>
                  </div>
                </div>

                {/* Payments */}
                {generatedStatement.payments.length > 0 && (
                  <div>
                    <h4 className={`font-semibold ${textClass} mb-2`}>{t('tools.consignmentShop.paymentsMade', 'Payments Made')}</h4>
                    <div className="space-y-2">
                      {generatedStatement.payments.map((payment, index) => (
                        <div key={index} className={`flex justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={mutedTextClass}>{formatDate(payment.date)} - {payment.reference}</span>
                          <span className="text-green-500">-{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Closing Balance */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className={`font-semibold ${textClass}`}>{t('tools.consignmentShop.balanceDue', 'Balance Due:')}</span>
                    <span className={`font-bold text-xl ${generatedStatement.closingBalance > 0 ? 'text-green-500' : textClass}`}>
                      {formatCurrency(generatedStatement.closingBalance)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Create printable version
                      const printContent = `
                        CONSIGNOR STATEMENT
                        ==================

                        Consignor: ${generatedStatement.consignorName}
                        Period: ${formatDate(generatedStatement.periodStart)} - ${formatDate(generatedStatement.periodEnd)}

                        ITEMS SOLD
                        ----------
                        ${generatedStatement.itemsSold.map(i => `${i.name}: ${formatCurrency(i.soldPrice)} (Share: ${formatCurrency(i.consignorShare)})`).join('\n')}

                        SUMMARY
                        -------
                        Total Sales: ${formatCurrency(generatedStatement.totalSales)}
                        Shop Fees: ${formatCurrency(generatedStatement.fees)}
                        Consignor Share: ${formatCurrency(generatedStatement.consignorShare)}

                        PAYMENTS
                        --------
                        ${generatedStatement.payments.map(p => `${formatDate(p.date)}: ${formatCurrency(p.amount)} (${p.reference})`).join('\n') || 'No payments'}

                        BALANCE DUE: ${formatCurrency(generatedStatement.closingBalance)}
                      `;

                      const blob = new Blob([printContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `statement-${generatedStatement.consignorName.replace(/\s+/g, '-')}-${generatedStatement.periodEnd}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className={buttonPrimaryClass}
                  >
                    <Download className="w-4 h-4" />
                    {t('tools.consignmentShop.downloadStatement', 'Download Statement')}
                  </button>
                  <button
                    onClick={() => setShowStatementModal(false)}
                    className={buttonSecondaryClass}
                  >
                    {t('tools.consignmentShop.close', 'Close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`${cardClass} p-6 mt-6`}>
          <h3 className={`font-semibold mb-3 ${textClass}`}>{t('tools.consignmentShop.aboutConsignmentShopManager', 'About Consignment Shop Manager')}</h3>
          <p className={`text-sm ${mutedTextClass}`}>
            A comprehensive tool for managing your consignment shop operations. Track consignors, manage inventory with automatic markdown schedules,
            process sales and payouts, generate statements, and monitor your shop's performance. All data is stored locally in your browser for privacy and convenience.
          </p>
          <div className={`mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${mutedTextClass}`}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0D9488]" />
              <span>{t('tools.consignmentShop.consignorProfiles', 'Consignor Profiles')}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#0D9488]" />
              <span>{t('tools.consignmentShop.autoMarkdowns', 'Auto Markdowns')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0D9488]" />
              <span>{t('tools.consignmentShop.paymentTracking', 'Payment Tracking')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#0D9488]" />
              <span>{t('tools.consignmentShop.statementGeneration', 'Statement Generation')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className={`fixed bottom-4 right-4 rounded-lg shadow-lg p-4 max-w-sm ${isDark ? 'bg-red-900 text-white border border-red-700' : 'bg-red-100 text-red-900 border border-red-300'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{validationMessage}</p>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ConsignmentShopTool;
