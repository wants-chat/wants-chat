'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  CreditCard,
  DollarSign,
  Banknote,
  Smartphone,
  User,
  Package,
  Plus,
  Minus,
  Trash2,
  Search,
  Receipt,
  Tag,
  Percent,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
  History,
  Filter,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface POSTransactionToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type PaymentMethod = 'cash' | 'credit' | 'debit' | 'mobile' | 'gift_card';
type TransactionStatus = 'completed' | 'pending' | 'voided' | 'refunded';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  barcode: string;
  taxable: boolean;
}

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount: number;
  taxable: boolean;
}

interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  change: number;
  customerId?: string;
  customerName?: string;
  cashierId: string;
  cashierName: string;
  register: string;
  status: TransactionStatus;
  receiptNumber: string;
  createdAt: string;
  notes?: string;
}

interface DailySummary {
  date: string;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  cashSales: number;
  cardSales: number;
  refunds: number;
  voids: number;
}

// Constants
const PAYMENT_METHODS: { method: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { method: 'cash', label: 'Cash', icon: <Banknote className="w-5 h-5" /> },
  { method: 'credit', label: 'Credit Card', icon: <CreditCard className="w-5 h-5" /> },
  { method: 'debit', label: 'Debit Card', icon: <CreditCard className="w-5 h-5" /> },
  { method: 'mobile', label: 'Mobile Pay', icon: <Smartphone className="w-5 h-5" /> },
  { method: 'gift_card', label: 'Gift Card', icon: <Tag className="w-5 h-5" /> },
];

const TAX_RATE = 0.0825; // 8.25% tax rate

// Sample products for demo
const SAMPLE_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Organic Coffee Beans 1lb', sku: 'COF-001', category: 'Beverages', price: 14.99, cost: 8.50, quantity: 45, barcode: '123456789001', taxable: true },
  { id: 'p2', name: 'Whole Wheat Bread', sku: 'BRD-001', category: 'Bakery', price: 4.49, cost: 2.25, quantity: 20, barcode: '123456789002', taxable: false },
  { id: 'p3', name: 'Almond Milk 64oz', sku: 'MLK-001', category: 'Dairy', price: 5.99, cost: 3.50, quantity: 32, barcode: '123456789003', taxable: true },
  { id: 'p4', name: 'Fresh Avocados (3 pack)', sku: 'PRD-001', category: 'Produce', price: 6.99, cost: 4.00, quantity: 28, barcode: '123456789004', taxable: false },
  { id: 'p5', name: 'Organic Eggs (12 ct)', sku: 'EGG-001', category: 'Dairy', price: 7.99, cost: 4.50, quantity: 40, barcode: '123456789005', taxable: false },
  { id: 'p6', name: 'Premium Olive Oil 500ml', sku: 'OIL-001', category: 'Pantry', price: 12.99, cost: 7.00, quantity: 25, barcode: '123456789006', taxable: true },
  { id: 'p7', name: 'Greek Yogurt 32oz', sku: 'YOG-001', category: 'Dairy', price: 6.49, cost: 3.75, quantity: 36, barcode: '123456789007', taxable: true },
  { id: 'p8', name: 'Sparkling Water 12pk', sku: 'WAT-001', category: 'Beverages', price: 8.99, cost: 5.00, quantity: 48, barcode: '123456789008', taxable: true },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateReceiptNumber = () => `RCP-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Column configurations for exports
const TRANSACTION_COLUMNS: ColumnConfig[] = [
  { key: 'receiptNumber', header: 'Receipt #', type: 'string' },
  { key: 'createdAt', header: 'Date/Time', type: 'date' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'discount', header: 'Discount', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'paymentMethod', header: 'Payment', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'cashierName', header: 'Cashier', type: 'string' },
];

// Main Component
export const POSTransactionTool: React.FC<POSTransactionToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: transactions,
    addItem: addTransactionToBackend,
    updateItem: updateTransactionBackend,
    deleteItem: deleteTransactionBackend,
    isSynced: transactionsSynced,
    isSaving: transactionsSaving,
    lastSaved: transactionsLastSaved,
    syncError: transactionsSyncError,
    forceSync: forceTransactionsSync,
  } = useToolData<Transaction>('pos-transactions', [], TRANSACTION_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'reports'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Current cashier/register info (would come from auth in production)
  const currentCashier = { id: 'cashier-1', name: 'John Smith' };
  const currentRegister = 'Register 1';

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        // Restore all saved form fields
        if (params.customerName) setCustomerName(params.customerName);
        if (params.orderDiscount !== undefined) setOrderDiscount(params.orderDiscount);
        if (params.selectedPayment) setSelectedPayment(params.selectedPayment);
        if (params.amountTendered) setAmountTendered(params.amountTendered);
        if (params.cart) setCart(params.cart);
        if (params.activeTab) setActiveTab(params.activeTab);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Normal prefill
        if (params.customerName) {
          setCustomerName(params.customerName);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return SAMPLE_PRODUCTS;
    const term = searchTerm.toLowerCase();
    return SAMPLE_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.barcode.includes(term)
    );
  }, [searchTerm]);

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity) - item.discount, 0);
    const taxableAmount = cart
      .filter((item) => item.taxable)
      .reduce((sum, item) => sum + (item.price * item.quantity) - item.discount, 0);
    const tax = taxableAmount * TAX_RATE;
    const discountAmount = orderDiscount > 0 ? subtotal * (orderDiscount / 100) : 0;
    const total = subtotal + tax - discountAmount;

    return { subtotal, tax, discountAmount, total };
  }, [cart, orderDiscount]);

  // Add item to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          discount: 0,
          taxable: product.taxable,
        },
      ];
    });
  };

  // Update cart item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Process transaction
  const processTransaction = () => {
    if (cart.length === 0) {
      setValidationMessage('Cart is empty');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const tenderedAmount = parseFloat(amountTendered) || 0;
    if (selectedPayment === 'cash' && tenderedAmount < cartTotals.total) {
      setValidationMessage('Insufficient payment amount');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      items: [...cart],
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      discount: cartTotals.discountAmount,
      total: cartTotals.total,
      paymentMethod: selectedPayment,
      amountTendered: selectedPayment === 'cash' ? tenderedAmount : cartTotals.total,
      change: selectedPayment === 'cash' ? tenderedAmount - cartTotals.total : 0,
      customerId: customerName ? generateId() : undefined,
      customerName: customerName || 'Walk-in Customer',
      cashierId: currentCashier.id,
      cashierName: currentCashier.name,
      register: currentRegister,
      status: 'completed',
      receiptNumber: generateReceiptNumber(),
      createdAt: new Date().toISOString(),
    };

    addTransactionToBackend({
      ...transaction,
      metadata: {
        toolId: 'pos-transaction',
        customerName,
        orderDiscount,
        selectedPayment,
        amountTendered,
        cart: [...cart],
      },
    });

    // Call onSaveCallback if provided (for gallery saves)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    // Reset cart
    setCart([]);
    setAmountTendered('');
    setCustomerName('');
    setOrderDiscount(0);
    setShowPaymentModal(false);
    setSelectedPayment('cash');

    setValidationMessage(`Transaction completed! Receipt: ${transaction.receiptNumber}`);
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Void transaction
  const voidTransaction = async (transactionId: string) => {
    const confirmed = await confirm({
      title: 'Void Transaction',
      message: 'Are you sure you want to void this transaction?',
      confirmText: 'Yes, Void',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      updateTransactionBackend(transactionId, { status: 'voided' });
    }
  };

  // Refund transaction
  const refundTransaction = async (transactionId: string) => {
    const confirmed = await confirm({
      title: 'Refund Transaction',
      message: 'Are you sure you want to refund this transaction?',
      confirmText: 'Yes, Refund',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      updateTransactionBackend(transactionId, { status: 'refunded' });
    }
  };

  // Daily summary
  const dailySummary = useMemo((): DailySummary => {
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(
      (t) => new Date(t.createdAt).toDateString() === today
    );

    const completed = todayTransactions.filter((t) => t.status === 'completed');
    const totalSales = completed.reduce((sum, t) => sum + t.total, 0);
    const cashSales = completed
      .filter((t) => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.total, 0);
    const cardSales = completed
      .filter((t) => ['credit', 'debit'].includes(t.paymentMethod))
      .reduce((sum, t) => sum + t.total, 0);
    const refunds = todayTransactions.filter((t) => t.status === 'refunded').length;
    const voids = todayTransactions.filter((t) => t.status === 'voided').length;

    return {
      date: today,
      totalSales,
      transactionCount: completed.length,
      averageTransaction: completed.length > 0 ? totalSales / completed.length : 0,
      cashSales,
      cardSales,
      refunds,
      voids,
    };
  }, [transactions]);

  // Filtered transactions for history
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesDate = !filterDate || new Date(t.createdAt).toDateString() === new Date(filterDate).toDateString();
      return matchesStatus && matchesDate;
    });
  }, [transactions, filterStatus, filterDate]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.pOSTransaction.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pOSTransaction.posTransactionTool', 'POS Transaction Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.pOSTransaction.pointOfSaleTransactionManagement', 'Point of sale transaction management')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="p-o-s-transaction" toolName="P O S Transaction" />

              <SyncStatus
                isSynced={transactionsSynced}
                isSaving={transactionsSaving}
                lastSaved={transactionsLastSaved}
                syncError={transactionsSyncError}
                onForceSync={forceTransactionsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(transactions, TRANSACTION_COLUMNS, 'pos-transactions')}
                onExportExcel={() => exportToExcel(transactions, TRANSACTION_COLUMNS, 'pos-transactions')}
                onExportJSON={() => exportToJSON(transactions, 'pos-transactions')}
                onExportPDF={() => exportToPDF(transactions, TRANSACTION_COLUMNS, 'POS Transactions')}
                onCopy={() => copyUtil(transactions, TRANSACTION_COLUMNS)}
                onPrint={() => printData(transactions, TRANSACTION_COLUMNS, 'POS Transactions')}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['pos', 'history', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'pos' && <ShoppingCart className="w-4 h-4 inline mr-2" />}
                {tab === 'history' && <History className="w-4 h-4 inline mr-2" />}
                {tab === 'reports' && <BarChart3 className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* POS Tab */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Section */}
            <div className={`lg:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.pOSTransaction.searchProductsByNameSku', 'Search products by name, SKU, or barcode...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                      theme === 'dark'
                        ? t('tools.pOSTransaction.bgGray700BorderGray', 'bg-gray-700 border-gray-600 hover:border-[#0D9488]') : t('tools.pOSTransaction.bgGray50BorderGray', 'bg-gray-50 border-gray-200 hover:border-[#0D9488]')
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Package className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {product.category}
                      </span>
                    </div>
                    <h3 className={`font-medium text-sm mb-1 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {product.name}
                    </h3>
                    <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      SKU: {product.sku}
                    </p>
                    <p className="text-[#0D9488] font-bold">{formatCurrency(product.price)}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      In Stock: {product.quantity}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pOSTransaction.currentOrder', 'Current Order')}
              </h2>

              {/* Customer Name */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.pOSTransaction.customerNameOptional', 'Customer name (optional)')}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className={`max-h-64 overflow-y-auto mb-4 ${cart.length === 0 ? 'py-8' : ''}`}>
                {cart.length === 0 ? (
                  <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.pOSTransaction.cartIsEmpty', 'Cart is empty')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className={`w-6 h-6 rounded flex items-center justify-center ${
                                theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`w-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className={`w-6 h-6 rounded flex items-center justify-center ${
                                theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Discount */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder={t('tools.pOSTransaction.orderDiscount', 'Order discount %')}
                    value={orderDiscount || ''}
                    onChange={(e) => setOrderDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-4 mb-4`}>
                <div className={`flex justify-between text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>{t('tools.pOSTransaction.subtotal', 'Subtotal')}</span>
                  <span>{formatCurrency(cartTotals.subtotal)}</span>
                </div>
                <div className={`flex justify-between text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
                  <span>{formatCurrency(cartTotals.tax)}</span>
                </div>
                {cartTotals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm mb-2 text-green-500">
                    <span>Discount ({orderDiscount}%)</span>
                    <span>-{formatCurrency(cartTotals.discountAmount)}</span>
                  </div>
                )}
                <div className={`flex justify-between text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>{t('tools.pOSTransaction.total', 'Total')}</span>
                  <span className="text-[#0D9488]">{formatCurrency(cartTotals.total)}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  cart.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : t('tools.pOSTransaction.bg0d9488TextWhiteHover', 'bg-[#0D9488] text-white hover:bg-[#0B7B6F]')
                }`}
              >
                <CreditCard className="w-5 h-5 inline mr-2" />
                {t('tools.pOSTransaction.processPayment', 'Process Payment')}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.pOSTransaction.allStatus', 'All Status')}</option>
                  <option value="completed">{t('tools.pOSTransaction.completed', 'Completed')}</option>
                  <option value="pending">{t('tools.pOSTransaction.pending', 'Pending')}</option>
                  <option value="voided">{t('tools.pOSTransaction.voided', 'Voided')}</option>
                  <option value="refunded">{t('tools.pOSTransaction.refunded', 'Refunded')}</option>
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    <th className="text-left py-3 px-4">{t('tools.pOSTransaction.receipt', 'Receipt #')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pOSTransaction.dateTime', 'Date/Time')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pOSTransaction.customer', 'Customer')}</th>
                    <th className="text-right py-3 px-4">{t('tools.pOSTransaction.total2', 'Total')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pOSTransaction.payment', 'Payment')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pOSTransaction.status', 'Status')}</th>
                    <th className="text-left py-3 px-4">{t('tools.pOSTransaction.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.receiptNumber}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.customerName}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(transaction.total)}
                      </td>
                      <td className={`py-3 px-4 capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {transaction.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.status === 'voided'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {transaction.status === 'completed' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => voidTransaction(transaction.id)}
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              {t('tools.pOSTransaction.void', 'Void')}
                            </button>
                            <button
                              onClick={() => refundTransaction(transaction.id)}
                              className="text-orange-500 hover:text-orange-600 text-sm"
                            >
                              {t('tools.pOSTransaction.refund', 'Refund')}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.pOSTransaction.noTransactionsFound', 'No transactions found')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pOSTransaction.todaySSales', 'Today\'s Sales')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dailySummary.totalSales)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pOSTransaction.transactions', 'Transactions')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dailySummary.transactionCount}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pOSTransaction.avgTransaction', 'Avg. Transaction')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dailySummary.averageTransaction)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pOSTransaction.refundsVoids', 'Refunds/Voids')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dailySummary.refunds + dailySummary.voids}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pOSTransaction.paymentBreakdown', 'Payment Breakdown')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-green-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.pOSTransaction.cashSales', 'Cash Sales')}</span>
                  </div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dailySummary.cashSales)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.pOSTransaction.cardSales', 'Card Sales')}</span>
                  </div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dailySummary.cardSales)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pOSTransaction.processPayment2', 'Process Payment')}
              </h2>

              <div className={`text-2xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Total: <span className="text-[#0D9488]">{formatCurrency(cartTotals.total)}</span>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.method}
                    onClick={() => setSelectedPayment(pm.method)}
                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                      selectedPayment === pm.method
                        ? 'border-[#0D9488] bg-[#0D9488]/10'
                        : theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className={selectedPayment === pm.method ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {pm.icon}
                    </span>
                    <span className={`text-sm ${selectedPayment === pm.method ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {pm.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Amount Tendered (for cash) */}
              {selectedPayment === 'cash' && (
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pOSTransaction.amountTendered', 'Amount Tendered')}
                  </label>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-lg border text-xl ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    step="0.01"
                    min={cartTotals.total}
                  />
                  {parseFloat(amountTendered) >= cartTotals.total && (
                    <p className="mt-2 text-green-500 font-medium">
                      Change: {formatCurrency(parseFloat(amountTendered) - cartTotals.total)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.pOSTransaction.cancel', 'Cancel')}
                </button>
                <button
                  onClick={processTransaction}
                  className="flex-1 py-3 rounded-lg font-medium bg-[#0D9488] text-white hover:bg-[#0B7B6F]"
                >
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  {t('tools.pOSTransaction.complete', 'Complete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{validationMessage}</p>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default POSTransactionTool;
