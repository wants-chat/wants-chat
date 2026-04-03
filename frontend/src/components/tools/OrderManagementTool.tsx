'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Hash,
  Truck,
  CreditCard,
  DollarSign,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  XCircle,
  CheckCircle,
  Send,
  Loader2,
  MoreHorizontal,
  Copy,
  Printer,
  Download,
  TrendingUp,
  TrendingDown,
  Box,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderTimeline {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  user?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive' | 'out-of-stock';
  createdAt: string;
}

type TabType = 'orders' | 'customers' | 'products' | 'reports';

// Column configurations for export
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'shippingAddress', header: 'Shipping Address', type: 'string' },
  { key: 'orderStatus', header: 'Order Status', type: 'string' },
  { key: 'paymentStatus', header: 'Payment Status', type: 'string' },
  { key: 'trackingNumber', header: 'Tracking #', type: 'string' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'shipping', header: 'Shipping', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'discount', header: 'Discount', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'totalOrders', header: 'Total Orders', type: 'number' },
  { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
  { key: 'lastOrderDate', header: 'Last Order', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const PRODUCT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Product Name', type: 'string' },
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'stock', header: 'Stock', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const STORAGE_KEY_LEGACY = 'order-management-data';

const ORDER_STATUSES: { value: Order['orderStatus']; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'processing', label: 'Processing', color: 'indigo' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

const PAYMENT_STATUSES: { value: Order['paymentStatus']; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate order number
const generateOrderNumber = (): string => {
  const prefix = 'ORD';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
};

// Sample data generator
const generateSampleData = (): { orders: Order[]; customers: Customer[]; products: Product[] } => {
  const products: Product[] = [
    { id: generateId(), name: 'Wireless Headphones', sku: 'WH-001', price: 79.99, stock: 150, category: 'Electronics', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'USB-C Cable 6ft', sku: 'USB-002', price: 12.99, stock: 500, category: 'Accessories', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Laptop Stand', sku: 'LS-003', price: 45.99, stock: 75, category: 'Office', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Mechanical Keyboard', sku: 'KB-004', price: 129.99, stock: 45, category: 'Electronics', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Webcam HD', sku: 'WC-005', price: 59.99, stock: 0, category: 'Electronics', status: 'out-of-stock', createdAt: new Date().toISOString() },
  ];

  const customers: Customer[] = [
    { id: generateId(), name: 'John Smith', email: 'john.smith@email.com', phone: '+1 555-0101', address: '123 Main St, New York, NY 10001', totalOrders: 5, totalSpent: 459.95, lastOrderDate: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 555-0102', address: '456 Oak Ave, Los Angeles, CA 90001', totalOrders: 3, totalSpent: 287.97, lastOrderDate: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Mike Wilson', email: 'mike.w@email.com', phone: '+1 555-0103', address: '789 Pine Rd, Chicago, IL 60601', totalOrders: 8, totalSpent: 1245.92, lastOrderDate: new Date().toISOString(), createdAt: new Date().toISOString() },
  ];

  const orders: Order[] = [
    {
      id: generateId(),
      orderNumber: 'ORD-2412-0001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '+1 555-0101',
      shippingAddress: '123 Main St, New York, NY 10001',
      items: [
        { id: generateId(), productName: 'Wireless Headphones', sku: 'WH-001', quantity: 1, unitPrice: 79.99, subtotal: 79.99 },
        { id: generateId(), productName: 'USB-C Cable 6ft', sku: 'USB-002', quantity: 2, unitPrice: 12.99, subtotal: 25.98 },
      ],
      orderStatus: 'delivered',
      paymentStatus: 'paid',
      trackingNumber: '1Z999AA10123456784',
      subtotal: 105.97,
      shipping: 9.99,
      tax: 8.48,
      discount: 10.00,
      total: 114.44,
      notes: 'Leave at door',
      timeline: [
        { id: generateId(), timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), action: 'created', description: 'Order placed' },
        { id: generateId(), timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), action: 'confirmed', description: 'Order confirmed and payment received' },
        { id: generateId(), timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), action: 'shipped', description: 'Order shipped via UPS' },
        { id: generateId(), timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), action: 'delivered', description: 'Order delivered' },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      orderNumber: 'ORD-2412-0002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      customerPhone: '+1 555-0102',
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
      items: [
        { id: generateId(), productName: 'Mechanical Keyboard', sku: 'KB-004', quantity: 1, unitPrice: 129.99, subtotal: 129.99 },
      ],
      orderStatus: 'shipped',
      paymentStatus: 'paid',
      trackingNumber: '1Z999BB20234567895',
      subtotal: 129.99,
      shipping: 12.99,
      tax: 10.40,
      discount: 0,
      total: 153.38,
      notes: '',
      timeline: [
        { id: generateId(), timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), action: 'created', description: 'Order placed' },
        { id: generateId(), timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), action: 'shipped', description: 'Order shipped via FedEx' },
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      orderNumber: 'ORD-2412-0003',
      customerName: 'Mike Wilson',
      customerEmail: 'mike.w@email.com',
      customerPhone: '+1 555-0103',
      shippingAddress: '789 Pine Rd, Chicago, IL 60601',
      items: [
        { id: generateId(), productName: 'Laptop Stand', sku: 'LS-003', quantity: 2, unitPrice: 45.99, subtotal: 91.98 },
        { id: generateId(), productName: 'Wireless Headphones', sku: 'WH-001', quantity: 1, unitPrice: 79.99, subtotal: 79.99 },
      ],
      orderStatus: 'pending',
      paymentStatus: 'pending',
      trackingNumber: '',
      subtotal: 171.97,
      shipping: 14.99,
      tax: 13.76,
      discount: 0,
      total: 200.72,
      notes: 'Priority shipping requested',
      timeline: [
        { id: generateId(), timestamp: new Date().toISOString(), action: 'created', description: 'Order placed, awaiting payment' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { orders, customers, products };
};

interface OrderManagementToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

export const OrderManagementTool: React.FC<OrderManagementToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize useToolData hook for orders
  const {
    data: orders,
    addItem: addOrder,
    updateItem: updateOrder,
    deleteItem: deleteOrder,
    isLoading: ordersLoading,
    isSaving: ordersSaving,
    isSynced: ordersSynced,
    lastSaved: ordersLastSaved,
    syncError: ordersSyncError,
    forceSync: forceSyncOrders,
  } = useToolData<Order>('orders', generateSampleData().orders, ORDER_COLUMNS);

  // Initialize useToolData hook for customers
  const {
    data: customers,
    addItem: addCustomer,
    updateItem: updateCustomer,
    deleteItem: deleteCustomer,
    isLoading: customersLoading,
    isSaving: customersSaving,
    isSynced: customersSynced,
    lastSaved: customersLastSaved,
    syncError: customersSyncError,
  } = useToolData<Customer>('customers', generateSampleData().customers, CUSTOMER_COLUMNS);

  // Initialize useToolData hook for products
  const {
    data: products,
    addItem: addProduct,
    updateItem: updateProduct,
    deleteItem: deleteProduct,
    isLoading: productsLoading,
    isSaving: productsSaving,
    isSynced: productsSynced,
    lastSaved: productsLastSaved,
    syncError: productsSyncError,
  } = useToolData<Product>('products', generateSampleData().products, PRODUCT_COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  // Order form state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState<Partial<Order>>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    items: [],
    orderStatus: 'pending',
    paymentStatus: 'pending',
    trackingNumber: '',
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: '',
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Customer form state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Product form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    category: '',
    status: 'active',
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Handle prefill data
  useEffect(() => {
    if (prefillData && !isPrefilled) {
      setIsPrefilled(true);
      // Handle any prefill logic here
    }
  }, [prefillData, isPrefilled]);

  // Calculate order totals
  const calculateOrderTotals = (items: OrderItem[], shipping: number, tax: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + shipping + tax - discount;
    return { subtotal, total };
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchQuery ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
      const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;

      const orderDate = new Date(order.createdAt);
      const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesStatus && matchesPayment && matchesDateFrom && matchesDateTo;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, dateFrom, dateTo]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      return !searchQuery ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);
    });
  }, [customers, searchQuery]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [products, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
    const processingOrders = orders.filter(o => ['confirmed', 'processing'].includes(o.orderStatus)).length;
    const shippedOrders = orders.filter(o => o.orderStatus === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled' && o.orderStatus !== 'refunded')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingPayments = orders
      .filter(o => o.paymentStatus === 'pending')
      .reduce((sum, o) => sum + o.total, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / orders.filter(o => o.paymentStatus === 'paid').length : 0;

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      pendingPayments,
      averageOrderValue: isNaN(averageOrderValue) ? 0 : averageOrderValue,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockProducts: products.filter(p => p.stock < 10 && p.stock > 0).length,
      outOfStockProducts: products.filter(p => p.stock === 0).length,
    };
  }, [orders, customers, products]);

  // Order handlers
  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: generateId(),
      productName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.subtotal = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(items => items.filter(item => item.id !== id));
  };

  const handleSelectProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setOrderItems(items => items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            productName: product.name,
            sku: product.sku,
            unitPrice: product.price,
            subtotal: item.quantity * product.price,
          };
        }
        return item;
      }));
    }
  };

  const handleSaveOrder = () => {
    const { subtotal, total } = calculateOrderTotals(
      orderItems,
      Number(orderForm.shipping) || 0,
      Number(orderForm.tax) || 0,
      Number(orderForm.discount) || 0
    );

    const timeline: OrderTimeline[] = editingOrder
      ? [...(editingOrder.timeline || [])]
      : [{ id: generateId(), timestamp: new Date().toISOString(), action: 'created', description: 'Order created' }];

    if (editingOrder && editingOrder.orderStatus !== orderForm.orderStatus) {
      timeline.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        action: orderForm.orderStatus || 'updated',
        description: `Order status changed to ${orderForm.orderStatus}`,
      });
    }

    const orderData: Order = {
      id: editingOrder?.id || generateId(),
      orderNumber: editingOrder?.orderNumber || generateOrderNumber(),
      customerName: orderForm.customerName || '',
      customerEmail: orderForm.customerEmail || '',
      customerPhone: orderForm.customerPhone || '',
      shippingAddress: orderForm.shippingAddress || '',
      items: orderItems,
      orderStatus: orderForm.orderStatus || 'pending',
      paymentStatus: orderForm.paymentStatus || 'pending',
      trackingNumber: orderForm.trackingNumber || '',
      subtotal,
      shipping: Number(orderForm.shipping) || 0,
      tax: Number(orderForm.tax) || 0,
      discount: Number(orderForm.discount) || 0,
      total,
      notes: orderForm.notes || '',
      timeline,
      createdAt: editingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingOrder) {
      updateOrder(editingOrder.id, orderData);
    } else {
      addOrder(orderData);
    }

    resetOrderForm();
  };

  const handleDeleteOrder = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOrder(id);
    }
  };

  const resetOrderForm = () => {
    setShowOrderModal(false);
    setEditingOrder(null);
    setOrderForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      items: [],
      orderStatus: 'pending',
      paymentStatus: 'pending',
      trackingNumber: '',
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: '',
    });
    setOrderItems([]);
  };

  const openEditOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderForm({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      shipping: order.shipping,
      tax: order.tax,
      discount: order.discount,
      notes: order.notes,
    });
    setOrderItems([...order.items]);
    setShowOrderModal(true);
  };

  // Customer handlers
  const handleSaveCustomer = () => {
    const customerData: Customer = {
      id: editingCustomer?.id || generateId(),
      name: customerForm.name || '',
      email: customerForm.email || '',
      phone: customerForm.phone || '',
      address: customerForm.address || '',
      totalOrders: editingCustomer?.totalOrders || 0,
      totalSpent: editingCustomer?.totalSpent || 0,
      lastOrderDate: editingCustomer?.lastOrderDate || '',
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
    } else {
      addCustomer(customerData);
    }

    resetCustomerForm();
  };

  const handleDeleteCustomer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteCustomer(id);
    }
  };

  const resetCustomerForm = () => {
    setShowCustomerModal(false);
    setEditingCustomer(null);
    setCustomerForm({ name: '', email: '', phone: '', address: '' });
  };

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setShowCustomerModal(true);
  };

  // Product handlers
  const handleSaveProduct = () => {
    const productData: Product = {
      id: editingProduct?.id || generateId(),
      name: productForm.name || '',
      sku: productForm.sku || '',
      price: Number(productForm.price) || 0,
      stock: Number(productForm.stock) || 0,
      category: productForm.category || '',
      status: productForm.status || 'active',
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    resetProductForm();
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteProduct(id);
    }
  };

  const resetProductForm = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({ name: '', sku: '', price: 0, stock: 0, category: '', status: 'active' });
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      category: product.category,
      status: product.status,
    });
    setShowProductModal(true);
  };

  // Helper functions
  const getStatusColor = (status: string, type: 'order' | 'payment') => {
    const statusList = type === 'order' ? ORDER_STATUSES : PAYMENT_STATUSES;
    const found = statusList.find(s => s.value === status);
    const color = found?.color || 'gray';

    const colorMap: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      blue: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-300',
      indigo: isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-300',
      purple: isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300',
      green: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300',
      red: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300',
      gray: isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300',
    };

    return colorMap[color] || colorMap.gray;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Styles
  const cardClass = isDark
    ? 'bg-gray-800/50 border border-gray-700 rounded-xl'
    : 'bg-white border border-gray-200 rounded-xl shadow-sm';

  const inputClass = isDark
    ? 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500'
    : 'w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

  const selectClass = isDark
    ? 'px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500'
    : 'px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500';

  const buttonPrimary = 'px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 transition-colors';
  const buttonSecondary = isDark
    ? 'px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors'
    : 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors';
  const buttonDanger = 'px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 transition-colors';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Package className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.orderManagement.orderManagement', 'Order Management')}</h1>
              <p className={textSecondary}>{t('tools.orderManagement.manageOrdersCustomersAndProducts', 'Manage orders, customers, and products')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Sync Status for current tab */}
            {activeTab === 'orders' && (
              <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <WidgetEmbedButton toolSlug="order-management" toolName="Order Management" />

                <SyncStatus
                  isSynced={ordersSynced}
                  isSaving={ordersSaving}
                  lastSaved={ordersLastSaved}
                  syncError={ordersSyncError}
                  onForceSync={forceSyncOrders}
                  theme={isDark ? 'dark' : 'light'}
                  showLabel={true}
                  size="sm"
                />
              </div>
            )}
            {activeTab === 'customers' && (
              <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <SyncStatus
                  isSynced={customersSynced}
                  isSaving={customersSaving}
                  lastSaved={customersLastSaved}
                  syncError={customersSyncError}
                  theme={isDark ? 'dark' : 'light'}
                  showLabel={true}
                  size="sm"
                />
              </div>
            )}
            {activeTab === 'products' && (
              <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <SyncStatus
                  isSynced={productsSynced}
                  isSaving={productsSaving}
                  lastSaved={productsLastSaved}
                  syncError={productsSyncError}
                  theme={isDark ? 'dark' : 'light'}
                  showLabel={true}
                  size="sm"
                />
              </div>
            )}
            <div className="flex gap-2">
            {activeTab === 'orders' && (
              <>
                <ExportDropdown
                  onExportCSV={() => exportToCSV(filteredOrders, ORDER_COLUMNS, { filename: 'orders' })}
                  onExportExcel={() => exportToExcel(filteredOrders, ORDER_COLUMNS, { filename: 'orders' })}
                  onExportJSON={() => exportToJSON(filteredOrders, { filename: 'orders' })}
                  onExportPDF={() => exportToPDF(filteredOrders, ORDER_COLUMNS, { filename: 'orders', title: 'Orders Report' })}
                  onPrint={() => printData(filteredOrders, ORDER_COLUMNS, { title: 'Orders Report' })}
                  onCopyToClipboard={() => copyUtil(filteredOrders, ORDER_COLUMNS)}
                  disabled={filteredOrders.length === 0}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button onClick={() => { resetOrderForm(); setShowOrderModal(true); }} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.orderManagement.newOrder', 'New Order')}
                </button>
              </>
            )}
            {activeTab === 'customers' && (
              <>
                <ExportDropdown
                  onExportCSV={() => exportToCSV(filteredCustomers, CUSTOMER_COLUMNS, { filename: 'customers' })}
                  onExportExcel={() => exportToExcel(filteredCustomers, CUSTOMER_COLUMNS, { filename: 'customers' })}
                  onExportJSON={() => exportToJSON(filteredCustomers, { filename: 'customers' })}
                  onExportPDF={() => exportToPDF(filteredCustomers, CUSTOMER_COLUMNS, { filename: 'customers', title: 'Customers Report' })}
                  onPrint={() => printData(filteredCustomers, CUSTOMER_COLUMNS, { title: 'Customers Report' })}
                  onCopyToClipboard={() => copyUtil(filteredCustomers, CUSTOMER_COLUMNS)}
                  disabled={filteredCustomers.length === 0}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button onClick={() => { resetCustomerForm(); setShowCustomerModal(true); }} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.orderManagement.newCustomer', 'New Customer')}
                </button>
              </>
            )}
            {activeTab === 'products' && (
              <>
                <ExportDropdown
                  onExportCSV={() => exportToCSV(filteredProducts, PRODUCT_COLUMNS, { filename: 'products' })}
                  onExportExcel={() => exportToExcel(filteredProducts, PRODUCT_COLUMNS, { filename: 'products' })}
                  onExportJSON={() => exportToJSON(filteredProducts, { filename: 'products' })}
                  onExportPDF={() => exportToPDF(filteredProducts, PRODUCT_COLUMNS, { filename: 'products', title: 'Products Report' })}
                  onPrint={() => printData(filteredProducts, PRODUCT_COLUMNS, { title: 'Products Report' })}
                  onCopyToClipboard={() => copyUtil(filteredProducts, PRODUCT_COLUMNS)}
                  disabled={filteredProducts.length === 0}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button onClick={() => { resetProductForm(); setShowProductModal(true); }} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.orderManagement.newProduct', 'New Product')}
                </button>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass + ' p-4'}>
            <div className={`flex items-center gap-2 ${textSecondary} mb-1`}>
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">{t('tools.orderManagement.totalOrders', 'Total Orders')}</span>
            </div>
            <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalOrders}</p>
            <p className={`text-xs ${textMuted}`}>{stats.pendingOrders} pending</p>
          </div>
          <div className={cardClass + ' p-4'}>
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">{t('tools.orderManagement.totalRevenue', 'Total Revenue')}</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalRevenue)}</p>
            <p className={`text-xs ${textMuted}`}>Avg: {formatCurrency(stats.averageOrderValue)}</p>
          </div>
          <div className={cardClass + ' p-4'}>
            <div className={`flex items-center gap-2 ${textSecondary} mb-1`}>
              <Users className="w-4 h-4" />
              <span className="text-sm">{t('tools.orderManagement.customers', 'Customers')}</span>
            </div>
            <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalCustomers}</p>
          </div>
          <div className={cardClass + ' p-4'}>
            <div className={`flex items-center gap-2 ${textSecondary} mb-1`}>
              <Box className="w-4 h-4" />
              <span className="text-sm">{t('tools.orderManagement.products', 'Products')}</span>
            </div>
            <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalProducts}</p>
            <p className={`text-xs ${stats.outOfStockProducts > 0 ? 'text-red-400' : textMuted}`}>
              {stats.outOfStockProducts > 0 ? `${stats.outOfStockProducts} out of stock` : `${stats.lowStockProducts} low stock`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 ${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'} pb-2`}>
          {[
            { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart },
            { id: 'customers' as TabType, label: 'Customers', icon: Users },
            { id: 'products' as TabType, label: 'Products', icon: Box },
            { id: 'reports' as TabType, label: 'Reports', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        {activeTab !== 'reports' && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            {activeTab === 'orders' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="">{t('tools.orderManagement.allStatus', 'All Status')}</option>
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="">{t('tools.orderManagement.allPayments', 'All Payments')}</option>
                  {PAYMENT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={selectClass}
                  placeholder={t('tools.orderManagement.from', 'From')}
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={selectClass}
                  placeholder="To"
                />
              </>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={cardClass + ' overflow-hidden'}>
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                <p className={textSecondary}>{t('tools.orderManagement.noOrdersFound', 'No orders found')}</p>
                <button onClick={() => { resetOrderForm(); setShowOrderModal(true); }} className={`${buttonPrimary} mt-4 mx-auto`}>
                  {t('tools.orderManagement.createYourFirstOrder', 'Create Your First Order')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.order', 'Order #')}</th>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.customer', 'Customer')}</th>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.date', 'Date')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.total', 'Total')}</th>
                      <th className={`text-center p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.status', 'Status')}</th>
                      <th className={`text-center p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.payment', 'Payment')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className={isDark ? 'border-b border-gray-700/50 hover:bg-gray-700/20' : 'border-b border-gray-100 hover:bg-gray-50'}>
                        <td className="p-4">
                          <span className={`font-mono ${textPrimary}`}>{order.orderNumber}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className={`font-medium ${textPrimary}`}>{order.customerName}</p>
                            <p className={`text-sm ${textSecondary}`}>{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className={`p-4 ${textSecondary}`}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td className={`p-4 text-right ${textPrimary} font-medium`}>
                          {formatCurrency(order.total)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus, 'order')}`}>
                              {ORDER_STATUSES.find(s => s.value === order.orderStatus)?.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.paymentStatus, 'payment')}`}>
                              {PAYMENT_STATUSES.find(s => s.value === order.paymentStatus)?.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary} transition-colors`}
                              title={t('tools.orderManagement.view', 'View')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditOrder(order)}
                              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary} transition-colors`}
                              title={t('tools.orderManagement.edit', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg text-red-400 transition-colors`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className={cardClass + ' overflow-hidden'}>
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                <p className={textSecondary}>{t('tools.orderManagement.noCustomersFound', 'No customers found')}</p>
                <button onClick={() => { resetCustomerForm(); setShowCustomerModal(true); }} className={`${buttonPrimary} mt-4 mx-auto`}>
                  {t('tools.orderManagement.addYourFirstCustomer', 'Add Your First Customer')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.customer2', 'Customer')}</th>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.contact', 'Contact')}</th>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.address', 'Address')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.orders', 'Orders')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.totalSpent', 'Total Spent')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.actions2', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(customer => (
                      <tr key={customer.id} className={isDark ? 'border-b border-gray-700/50 hover:bg-gray-700/20' : 'border-b border-gray-100 hover:bg-gray-50'}>
                        <td className="p-4">
                          <p className={`font-medium ${textPrimary}`}>{customer.name}</p>
                        </td>
                        <td className="p-4">
                          <div className={`text-sm ${textSecondary}`}>
                            <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</p>
                            <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</p>
                          </div>
                        </td>
                        <td className={`p-4 ${textSecondary} text-sm max-w-xs truncate`}>
                          {customer.address}
                        </td>
                        <td className={`p-4 text-right ${textPrimary}`}>
                          {customer.totalOrders}
                        </td>
                        <td className={`p-4 text-right ${textPrimary} font-medium`}>
                          {formatCurrency(customer.totalSpent)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditCustomer(customer)}
                              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary} transition-colors`}
                              title={t('tools.orderManagement.edit2', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg text-red-400 transition-colors`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className={cardClass + ' overflow-hidden'}>
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Box className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                <p className={textSecondary}>{t('tools.orderManagement.noProductsFound', 'No products found')}</p>
                <button onClick={() => { resetProductForm(); setShowProductModal(true); }} className={`${buttonPrimary} mt-4 mx-auto`}>
                  {t('tools.orderManagement.addYourFirstProduct', 'Add Your First Product')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.product', 'Product')}</th>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.sku', 'SKU')}</th>
                      <th className={`text-left p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.category', 'Category')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.price', 'Price')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.stock', 'Stock')}</th>
                      <th className={`text-center p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.status2', 'Status')}</th>
                      <th className={`text-right p-4 ${textSecondary} font-medium`}>{t('tools.orderManagement.actions3', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className={isDark ? 'border-b border-gray-700/50 hover:bg-gray-700/20' : 'border-b border-gray-100 hover:bg-gray-50'}>
                        <td className="p-4">
                          <p className={`font-medium ${textPrimary}`}>{product.name}</p>
                        </td>
                        <td className={`p-4 font-mono text-sm ${textSecondary}`}>
                          {product.sku}
                        </td>
                        <td className={`p-4 ${textSecondary}`}>
                          {product.category}
                        </td>
                        <td className={`p-4 text-right ${textPrimary} font-medium`}>
                          {formatCurrency(product.price)}
                        </td>
                        <td className={`p-4 text-right ${product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-yellow-400' : textPrimary}`}>
                          {product.stock}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              product.status === 'active'
                                ? isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300'
                                : product.status === 'out-of-stock'
                                ? isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300'
                                : isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                              {product.status === 'out-of-stock' ? 'Out of Stock' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditProduct(product)}
                              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary} transition-colors`}
                              title={t('tools.orderManagement.edit3', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg text-red-400 transition-colors`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className={cardClass + ' p-6'}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.orderManagement.orderSummary', 'Order Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.pendingOrders', 'Pending Orders')}</span>
                  <span className={`font-medium ${textPrimary}`}>{stats.pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.processing', 'Processing')}</span>
                  <span className={`font-medium ${textPrimary}`}>{stats.processingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.shipped', 'Shipped')}</span>
                  <span className={`font-medium ${textPrimary}`}>{stats.shippedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.delivered', 'Delivered')}</span>
                  <span className="font-medium text-green-400">{stats.deliveredOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.cancelled', 'Cancelled')}</span>
                  <span className="font-medium text-red-400">{stats.cancelledOrders}</span>
                </div>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className={cardClass + ' p-6'}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.orderManagement.revenueSummary', 'Revenue Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.totalRevenue2', 'Total Revenue')}</span>
                  <span className="font-medium text-green-400">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.pendingPayments', 'Pending Payments')}</span>
                  <span className="font-medium text-yellow-400">{formatCurrency(stats.pendingPayments)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.averageOrderValue', 'Average Order Value')}</span>
                  <span className={`font-medium ${textPrimary}`}>{formatCurrency(stats.averageOrderValue)}</span>
                </div>
              </div>
            </div>

            {/* Inventory Summary */}
            <div className={cardClass + ' p-6'}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.orderManagement.inventorySummary', 'Inventory Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.totalProducts', 'Total Products')}</span>
                  <span className={`font-medium ${textPrimary}`}>{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.lowStockItems', 'Low Stock Items')}</span>
                  <span className="font-medium text-yellow-400">{stats.lowStockProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.outOfStock', 'Out of Stock')}</span>
                  <span className="font-medium text-red-400">{stats.outOfStockProducts}</span>
                </div>
              </div>
            </div>

            {/* Customer Summary */}
            <div className={cardClass + ' p-6'}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.orderManagement.customerSummary', 'Customer Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.totalCustomers', 'Total Customers')}</span>
                  <span className={`font-medium ${textPrimary}`}>{stats.totalCustomers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSecondary}>{t('tools.orderManagement.avgOrdersPerCustomer', 'Avg. Orders per Customer')}</span>
                  <span className={`font-medium ${textPrimary}`}>
                    {stats.totalCustomers > 0 ? (stats.totalOrders / stats.totalCustomers).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${textPrimary}`}>
                  {editingOrder ? t('tools.orderManagement.editOrder', 'Edit Order') : t('tools.orderManagement.createOrder', 'Create Order')}
                </h2>
                <button onClick={resetOrderForm} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className={`font-medium ${textPrimary} mb-3`}>{t('tools.orderManagement.customerInformation', 'Customer Information')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.customerName', 'Customer Name *')}</label>
                      <input
                        type="text"
                        value={orderForm.customerName || ''}
                        onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.email', 'Email *')}</label>
                      <input
                        type="email"
                        value={orderForm.customerEmail || ''}
                        onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.phone', 'Phone')}</label>
                      <input
                        type="tel"
                        value={orderForm.customerPhone || ''}
                        onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.shippingAddress', 'Shipping Address *')}</label>
                      <input
                        type="text"
                        value={orderForm.shippingAddress || ''}
                        onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-medium ${textPrimary}`}>{t('tools.orderManagement.orderItems', 'Order Items')}</h3>
                    <button type="button" onClick={handleAddItem} className="text-sm text-indigo-400 hover:text-indigo-300">
                      {t('tools.orderManagement.addItem', '+ Add Item')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <select
                            value={products.find(p => p.name === item.productName)?.id || ''}
                            onChange={(e) => handleSelectProduct(item.id, e.target.value)}
                            className={`${selectClass} w-full`}
                          >
                            <option value="">{t('tools.orderManagement.selectProduct', 'Select Product')}</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder={t('tools.orderManagement.sku4', 'SKU')}
                            value={item.sku}
                            onChange={(e) => handleUpdateItem(item.id, 'sku', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            placeholder={t('tools.orderManagement.qty2', 'Qty')}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={t('tools.orderManagement.price4', 'Price')}
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={inputClass}
                          />
                        </div>
                        <div className={`col-span-1 text-right ${textPrimary}`}>
                          {formatCurrency(item.subtotal)}
                        </div>
                        <div className="col-span-1">
                          {orderItems.length > 1 && (
                            <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className={`flex justify-between ${textSecondary}`}>
                      <span>{t('tools.orderManagement.subtotal', 'Subtotal:')}</span>
                      <span>{formatCurrency(orderItems.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={textSecondary}>{t('tools.orderManagement.shipping', 'Shipping:')}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={orderForm.shipping || 0}
                        onChange={(e) => setOrderForm({ ...orderForm, shipping: parseFloat(e.target.value) || 0 })}
                        className={`w-24 px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded text-sm ${textPrimary}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={textSecondary}>{t('tools.orderManagement.tax', 'Tax:')}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={orderForm.tax || 0}
                        onChange={(e) => setOrderForm({ ...orderForm, tax: parseFloat(e.target.value) || 0 })}
                        className={`w-24 px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded text-sm ${textPrimary}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={textSecondary}>{t('tools.orderManagement.discount', 'Discount:')}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={orderForm.discount || 0}
                        onChange={(e) => setOrderForm({ ...orderForm, discount: parseFloat(e.target.value) || 0 })}
                        className={`w-24 px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded text-sm ${textPrimary}`}
                      />
                    </div>
                    <div className={`flex justify-between font-semibold ${textPrimary} border-t ${isDark ? 'border-gray-600' : 'border-gray-300'} pt-2`}>
                      <span>{t('tools.orderManagement.total2', 'Total:')}</span>
                      <span>{formatCurrency(
                        orderItems.reduce((sum, item) => sum + item.subtotal, 0) +
                        (Number(orderForm.shipping) || 0) +
                        (Number(orderForm.tax) || 0) -
                        (Number(orderForm.discount) || 0)
                      )}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.orderStatus', 'Order Status')}</label>
                    <select
                      value={orderForm.orderStatus || 'pending'}
                      onChange={(e) => setOrderForm({ ...orderForm, orderStatus: e.target.value as Order['orderStatus'] })}
                      className={`${selectClass} w-full`}
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.paymentStatus', 'Payment Status')}</label>
                    <select
                      value={orderForm.paymentStatus || 'pending'}
                      onChange={(e) => setOrderForm({ ...orderForm, paymentStatus: e.target.value as Order['paymentStatus'] })}
                      className={`${selectClass} w-full`}
                    >
                      {PAYMENT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.trackingNumber', 'Tracking Number')}</label>
                    <input
                      type="text"
                      value={orderForm.trackingNumber || ''}
                      onChange={(e) => setOrderForm({ ...orderForm, trackingNumber: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.orderManagement.eG1z999aa10123456784', 'e.g., 1Z999AA10123456784')}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.notes', 'Notes')}</label>
                  <textarea
                    value={orderForm.notes || ''}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    rows={3}
                    className={inputClass}
                    placeholder={t('tools.orderManagement.additionalNotes', 'Additional notes...')}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={resetOrderForm} className={buttonSecondary}>
                    {t('tools.orderManagement.cancel', 'Cancel')}
                  </button>
                  <button type="button" onClick={handleSaveOrder} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {editingOrder ? t('tools.orderManagement.update', 'Update') : t('tools.orderManagement.create', 'Create')} Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${textPrimary}`}>
                  Order {viewingOrder.orderNumber}
                </h2>
                <button onClick={() => setViewingOrder(null)} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className={`${textSecondary} text-sm mb-2`}>{t('tools.orderManagement.customer3', 'Customer')}</h3>
                    <p className={`font-medium ${textPrimary}`}>{viewingOrder.customerName}</p>
                    <p className={`text-sm ${textSecondary}`}>{viewingOrder.customerEmail}</p>
                    <p className={`text-sm ${textSecondary}`}>{viewingOrder.customerPhone}</p>
                    <p className={`text-sm ${textSecondary} mt-2`}>{viewingOrder.shippingAddress}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(viewingOrder.orderStatus, 'order')}`}>
                        {ORDER_STATUSES.find(s => s.value === viewingOrder.orderStatus)?.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(viewingOrder.paymentStatus, 'payment')}`}>
                        {PAYMENT_STATUSES.find(s => s.value === viewingOrder.paymentStatus)?.label}
                      </span>
                    </div>
                    <p className={`${textSecondary} text-sm`}>Created: {formatDateTime(viewingOrder.createdAt)}</p>
                    {viewingOrder.trackingNumber && (
                      <p className={`${textSecondary} text-sm mt-1`}>
                        Tracking: <span className="font-mono">{viewingOrder.trackingNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className={`${textSecondary} text-sm mb-2`}>{t('tools.orderManagement.items', 'Items')}</h3>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg overflow-hidden`}>
                    <table className="w-full">
                      <thead>
                        <tr className={isDark ? 'border-b border-gray-600' : 'border-b border-gray-200'}>
                          <th className={`text-left p-3 ${textSecondary} text-sm`}>{t('tools.orderManagement.product2', 'Product')}</th>
                          <th className={`text-left p-3 ${textSecondary} text-sm`}>{t('tools.orderManagement.sku2', 'SKU')}</th>
                          <th className={`text-right p-3 ${textSecondary} text-sm`}>{t('tools.orderManagement.qty', 'Qty')}</th>
                          <th className={`text-right p-3 ${textSecondary} text-sm`}>{t('tools.orderManagement.price2', 'Price')}</th>
                          <th className={`text-right p-3 ${textSecondary} text-sm`}>{t('tools.orderManagement.subtotal2', 'Subtotal')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingOrder.items.map((item) => (
                          <tr key={item.id} className={isDark ? 'border-b border-gray-600/50' : 'border-b border-gray-200'}>
                            <td className={`p-3 ${textPrimary}`}>{item.productName}</td>
                            <td className={`p-3 font-mono text-sm ${textSecondary}`}>{item.sku}</td>
                            <td className={`p-3 text-right ${textSecondary}`}>{item.quantity}</td>
                            <td className={`p-3 text-right ${textSecondary}`}>{formatCurrency(item.unitPrice)}</td>
                            <td className={`p-3 text-right ${textPrimary}`}>{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className={`flex justify-between ${textSecondary}`}>
                      <span>{t('tools.orderManagement.subtotal3', 'Subtotal:')}</span>
                      <span>{formatCurrency(viewingOrder.subtotal)}</span>
                    </div>
                    {viewingOrder.shipping > 0 && (
                      <div className={`flex justify-between ${textSecondary}`}>
                        <span>{t('tools.orderManagement.shipping2', 'Shipping:')}</span>
                        <span>{formatCurrency(viewingOrder.shipping)}</span>
                      </div>
                    )}
                    {viewingOrder.tax > 0 && (
                      <div className={`flex justify-between ${textSecondary}`}>
                        <span>{t('tools.orderManagement.tax2', 'Tax:')}</span>
                        <span>{formatCurrency(viewingOrder.tax)}</span>
                      </div>
                    )}
                    {viewingOrder.discount > 0 && (
                      <div className={`flex justify-between ${textSecondary}`}>
                        <span>{t('tools.orderManagement.discount2', 'Discount:')}</span>
                        <span>-{formatCurrency(viewingOrder.discount)}</span>
                      </div>
                    )}
                    <div className={`flex justify-between font-semibold ${textPrimary} border-t ${isDark ? 'border-gray-600' : 'border-gray-300'} pt-2`}>
                      <span>{t('tools.orderManagement.total3', 'Total:')}</span>
                      <span>{formatCurrency(viewingOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {viewingOrder.timeline && viewingOrder.timeline.length > 0 && (
                  <div>
                    <h3 className={`${textSecondary} text-sm mb-2`}>{t('tools.orderManagement.timeline', 'Timeline')}</h3>
                    <div className="space-y-3">
                      {viewingOrder.timeline.map((event) => (
                        <div key={event.id} className={`flex items-start gap-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3`}>
                          <Clock className={`w-4 h-4 ${textMuted} mt-0.5`} />
                          <div>
                            <p className={textPrimary}>{event.description}</p>
                            <p className={`text-xs ${textMuted}`}>{formatDateTime(event.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {viewingOrder.notes && (
                  <div>
                    <h3 className={`${textSecondary} text-sm mb-1`}>{t('tools.orderManagement.notes2', 'Notes')}</h3>
                    <p className={`${textSecondary} text-sm`}>{viewingOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Modal */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${textPrimary}`}>
                  {editingCustomer ? t('tools.orderManagement.editCustomer', 'Edit Customer') : t('tools.orderManagement.addCustomer', 'Add Customer')}
                </h2>
                <button onClick={resetCustomerForm} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={customerForm.name || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.email2', 'Email *')}</label>
                  <input
                    type="email"
                    value={customerForm.email || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={customerForm.phone || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.address2', 'Address')}</label>
                  <textarea
                    value={customerForm.address || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    rows={2}
                    className={inputClass}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={resetCustomerForm} className={buttonSecondary}>
                    {t('tools.orderManagement.cancel2', 'Cancel')}
                  </button>
                  <button type="button" onClick={handleSaveCustomer} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {editingCustomer ? t('tools.orderManagement.update2', 'Update') : t('tools.orderManagement.add', 'Add')} Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${textPrimary}`}>
                  {editingProduct ? t('tools.orderManagement.editProduct', 'Edit Product') : t('tools.orderManagement.addProduct', 'Add Product')}
                </h2>
                <button onClick={resetProductForm} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg ${textSecondary}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.productName', 'Product Name *')}</label>
                  <input
                    type="text"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.sku3', 'SKU *')}</label>
                  <input
                    type="text"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.price3', 'Price *')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price || 0}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.stock2', 'Stock *')}</label>
                    <input
                      type="number"
                      value={productForm.stock || 0}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.category2', 'Category')}</label>
                  <input
                    type="text"
                    value={productForm.category || ''}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>{t('tools.orderManagement.status3', 'Status')}</label>
                  <select
                    value={productForm.status || 'active'}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as Product['status'] })}
                    className={`${selectClass} w-full`}
                  >
                    <option value="active">{t('tools.orderManagement.active', 'Active')}</option>
                    <option value="inactive">{t('tools.orderManagement.inactive', 'Inactive')}</option>
                    <option value="out-of-stock">{t('tools.orderManagement.outOfStock2', 'Out of Stock')}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={resetProductForm} className={buttonSecondary}>
                    {t('tools.orderManagement.cancel3', 'Cancel')}
                  </button>
                  <button type="button" onClick={handleSaveProduct} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {editingProduct ? t('tools.orderManagement.update3', 'Update') : t('tools.orderManagement.add2', 'Add')} Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default OrderManagementTool;
