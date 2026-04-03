'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Package,
  Users,
  Bell,
  Truck,
  FileText,
  Printer,
  Phone,
  Key,
  DollarSign,
  MapPin,
  PauseCircle,
  BarChart3,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Send,
  Archive,
  RefreshCw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mailboxNumber: string;
  mailboxSize: 'small' | 'medium' | 'large' | 'xl';
  rentalStartDate: string;
  rentalEndDate: string;
  monthlyFee: number;
  status: 'active' | 'expired' | 'pending';
  forwardingAddress?: string;
  notes?: string;
  createdAt: string;
}

interface PackageLog {
  id: string;
  customerId: string;
  customerName: string;
  mailboxNumber: string;
  trackingNumber: string;
  carrier: string;
  receivedDate: string;
  pickedUpDate?: string;
  status: 'received' | 'notified' | 'picked_up' | 'forwarded';
  description?: string;
}

interface Notification {
  id: string;
  customerId: string;
  customerName: string;
  packageId: string;
  type: 'email' | 'sms' | 'both';
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
}

interface ShippingService {
  id: string;
  customerId?: string;
  customerName?: string;
  carrier: string;
  trackingNumber: string;
  destination: string;
  weight: number;
  cost: number;
  date: string;
  status: 'pending' | 'shipped' | 'delivered';
}

interface NotaryService {
  id: string;
  customerId?: string;
  customerName: string;
  documentType: string;
  date: string;
  fee: number;
  notaryName: string;
  notes?: string;
}

interface CopyPrintService {
  id: string;
  customerId?: string;
  customerName?: string;
  serviceType: 'copy' | 'print' | 'scan' | 'fax_send' | 'fax_receive';
  pages: number;
  colorType: 'bw' | 'color';
  cost: number;
  date: string;
}

interface FaxLog {
  id: string;
  customerId?: string;
  customerName?: string;
  direction: 'incoming' | 'outgoing';
  faxNumber: string;
  pages: number;
  date: string;
  status: 'completed' | 'failed';
  cost: number;
}

interface KeyReplacement {
  id: string;
  customerId: string;
  customerName: string;
  mailboxNumber: string;
  reason: string;
  date: string;
  fee: number;
  keyType: 'standard' | 'high_security';
}

interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: 'rental' | 'shipping' | 'notary' | 'copy_print' | 'fax' | 'key' | 'other';
  date: string;
  method: 'cash' | 'card' | 'check' | 'online';
  notes?: string;
}

interface HoldRequest {
  id: string;
  customerId: string;
  customerName: string;
  mailboxNumber: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'active' | 'completed' | 'cancelled';
}

type TabType = 'dashboard' | 'mailboxes' | 'customers' | 'packages' | 'shipping' | 'services' | 'payments' | 'reports';

const MAILBOX_SIZES = {
  small: { name: 'Small', monthlyFee: 15 },
  medium: { name: 'Medium', monthlyFee: 25 },
  large: { name: 'Large', monthlyFee: 40 },
  xl: { name: 'Extra Large', monthlyFee: 60 },
};

const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Amazon', 'Other'];

// Export column configurations
const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'mailboxNumber', header: 'Mailbox #', type: 'string' },
  { key: 'mailboxSize', header: 'Size', type: 'string' },
  { key: 'monthlyFee', header: 'Monthly Fee', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'rentalStartDate', header: 'Start Date', type: 'date' },
  { key: 'rentalEndDate', header: 'End Date', type: 'date' },
  { key: 'forwardingAddress', header: 'Forwarding Address', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const PACKAGE_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'mailboxNumber', header: 'Mailbox #', type: 'string' },
  { key: 'trackingNumber', header: 'Tracking #', type: 'string' },
  { key: 'carrier', header: 'Carrier', type: 'string' },
  { key: 'receivedDate', header: 'Received', type: 'date' },
  { key: 'pickedUpDate', header: 'Picked Up', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
];

const SHIPPING_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'carrier', header: 'Carrier', type: 'string' },
  { key: 'trackingNumber', header: 'Tracking #', type: 'string' },
  { key: 'destination', header: 'Destination', type: 'string' },
  { key: 'weight', header: 'Weight (lbs)', type: 'number' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
];

const PAYMENT_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'method', header: 'Method', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const NOTARY_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'documentType', header: 'Document Type', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'fee', header: 'Fee', type: 'currency' },
  { key: 'notaryName', header: 'Notary', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const COPY_PRINT_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'pages', header: 'Pages', type: 'number' },
  { key: 'colorType', header: 'Color Type', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
];

const FAX_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'direction', header: 'Direction', type: 'string' },
  { key: 'faxNumber', header: 'Fax Number', type: 'string' },
  { key: 'pages', header: 'Pages', type: 'number' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
];

const KEY_REPLACEMENT_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'mailboxNumber', header: 'Mailbox #', type: 'string' },
  { key: 'reason', header: 'Reason', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'fee', header: 'Fee', type: 'currency' },
  { key: 'keyType', header: 'Key Type', type: 'string' },
];

const HOLD_REQUEST_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'mailboxNumber', header: 'Mailbox #', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'reason', header: 'Reason', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Combined data type for backend sync
interface MailboxStoreData {
  id: string;
  customers: Customer[];
  packages: PackageLog[];
  notifications: Notification[];
  shippingServices: ShippingService[];
  notaryServices: NotaryService[];
  copyPrintServices: CopyPrintService[];
  faxLogs: FaxLog[];
  keyReplacements: KeyReplacement[];
  payments: Payment[];
  holdRequests: HoldRequest[];
}

// Main column config for the combined data (used for sync)
const MAIN_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

const DEFAULT_STORE_DATA: MailboxStoreData = {
  id: 'mailbox-store-main',
  customers: [],
  packages: [],
  notifications: [],
  shippingServices: [],
  notaryServices: [],
  copyPrintServices: [],
  faxLogs: [],
  keyReplacements: [],
  payments: [],
  holdRequests: [],
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

interface MailboxStoreToolProps {
  uiConfig?: UIConfig;
}

export const MailboxStoreTool: React.FC<MailboxStoreToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: storeDataArray,
    setData: setStoreDataArray,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard: copyToClipboardHook,
    print: printHook,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MailboxStoreData>('mailbox-store', [DEFAULT_STORE_DATA], MAIN_COLUMNS);

  // Extract the store data from the array (we always have one item)
  const storeData = storeDataArray[0] || DEFAULT_STORE_DATA;

  // Derived data accessors
  const customers = storeData.customers;
  const packages = storeData.packages;
  const notifications = storeData.notifications;
  const shippingServices = storeData.shippingServices;
  const notaryServices = storeData.notaryServices;
  const copyPrintServices = storeData.copyPrintServices;
  const faxLogs = storeData.faxLogs;
  const keyReplacements = storeData.keyReplacements;
  const payments = storeData.payments;
  const holdRequests = storeData.holdRequests;

  // Helper to update specific collections
  const updateStoreData = (updates: Partial<MailboxStoreData>) => {
    setStoreDataArray([{ ...storeData, ...updates }]);
  };

  // Collection setters
  const setCustomers = (updater: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const newCustomers = typeof updater === 'function' ? updater(customers) : updater;
    updateStoreData({ customers: newCustomers });
  };

  const setPackages = (updater: PackageLog[] | ((prev: PackageLog[]) => PackageLog[])) => {
    const newPackages = typeof updater === 'function' ? updater(packages) : updater;
    updateStoreData({ packages: newPackages });
  };

  const setNotifications = (updater: Notification[] | ((prev: Notification[]) => Notification[])) => {
    const newNotifications = typeof updater === 'function' ? updater(notifications) : updater;
    updateStoreData({ notifications: newNotifications });
  };

  const setShippingServices = (updater: ShippingService[] | ((prev: ShippingService[]) => ShippingService[])) => {
    const newShippingServices = typeof updater === 'function' ? updater(shippingServices) : updater;
    updateStoreData({ shippingServices: newShippingServices });
  };

  const setNotaryServices = (updater: NotaryService[] | ((prev: NotaryService[]) => NotaryService[])) => {
    const newNotaryServices = typeof updater === 'function' ? updater(notaryServices) : updater;
    updateStoreData({ notaryServices: newNotaryServices });
  };

  const setCopyPrintServices = (updater: CopyPrintService[] | ((prev: CopyPrintService[]) => CopyPrintService[])) => {
    const newCopyPrintServices = typeof updater === 'function' ? updater(copyPrintServices) : updater;
    updateStoreData({ copyPrintServices: newCopyPrintServices });
  };

  const setFaxLogs = (updater: FaxLog[] | ((prev: FaxLog[]) => FaxLog[])) => {
    const newFaxLogs = typeof updater === 'function' ? updater(faxLogs) : updater;
    updateStoreData({ faxLogs: newFaxLogs });
  };

  const setKeyReplacements = (updater: KeyReplacement[] | ((prev: KeyReplacement[]) => KeyReplacement[])) => {
    const newKeyReplacements = typeof updater === 'function' ? updater(keyReplacements) : updater;
    updateStoreData({ keyReplacements: newKeyReplacements });
  };

  const setPayments = (updater: Payment[] | ((prev: Payment[]) => Payment[])) => {
    const newPayments = typeof updater === 'function' ? updater(payments) : updater;
    updateStoreData({ payments: newPayments });
  };

  const setHoldRequests = (updater: HoldRequest[] | ((prev: HoldRequest[]) => HoldRequest[])) => {
    const newHoldRequests = typeof updater === 'function' ? updater(holdRequests) : updater;
    updateStoreData({ holdRequests: newHoldRequests });
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

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showNotaryModal, setShowNotaryModal] = useState(false);
  const [showCopyPrintModal, setShowCopyPrintModal] = useState(false);
  const [showFaxModal, setShowFaxModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showForwardingModal, setShowForwardingModal] = useState(false);

  // Edit states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingPackage, setEditingPackage] = useState<PackageLog | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Dashboard statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7);

    const activeMailboxes = customers.filter(c => c.status === 'active').length;
    const pendingPackages = packages.filter(p => p.status !== 'picked_up' && p.status !== 'forwarded').length;
    const todayPackages = packages.filter(p => p.receivedDate.startsWith(today)).length;

    const monthlyRevenue = payments
      .filter(p => p.date.startsWith(thisMonth))
      .reduce((sum, p) => sum + p.amount, 0);

    const revenueByService = {
      rental: payments.filter(p => p.type === 'rental').reduce((sum, p) => sum + p.amount, 0),
      shipping: payments.filter(p => p.type === 'shipping').reduce((sum, p) => sum + p.amount, 0),
      notary: payments.filter(p => p.type === 'notary').reduce((sum, p) => sum + p.amount, 0),
      copyPrint: payments.filter(p => p.type === 'copy_print').reduce((sum, p) => sum + p.amount, 0),
      fax: payments.filter(p => p.type === 'fax').reduce((sum, p) => sum + p.amount, 0),
      key: payments.filter(p => p.type === 'key').reduce((sum, p) => sum + p.amount, 0),
      other: payments.filter(p => p.type === 'other').reduce((sum, p) => sum + p.amount, 0),
    };

    const expiringMailboxes = customers.filter(c => {
      const endDate = new Date(c.rentalEndDate);
      const diffDays = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    }).length;

    return {
      activeMailboxes,
      pendingPackages,
      todayPackages,
      monthlyRevenue,
      revenueByService,
      expiringMailboxes,
      totalCustomers: customers.length,
      activeHolds: holdRequests.filter(h => h.status === 'active').length,
    };
  }, [customers, packages, payments, holdRequests]);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    mailboxNumber: '',
    mailboxSize: 'medium' as 'small' | 'medium' | 'large' | 'xl',
    rentalStartDate: new Date().toISOString().split('T')[0],
    rentalEndDate: '',
    notes: '',
  });

  // Package form state
  const [packageForm, setPackageForm] = useState({
    customerId: '',
    trackingNumber: '',
    carrier: 'USPS',
    description: '',
  });

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    customerId: '',
    carrier: 'USPS',
    destination: '',
    weight: '',
    cost: '',
  });

  // Reset forms
  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      email: '',
      phone: '',
      mailboxNumber: '',
      mailboxSize: 'medium',
      rentalStartDate: new Date().toISOString().split('T')[0],
      rentalEndDate: '',
      notes: '',
    });
    setEditingCustomer(null);
  };

  const resetPackageForm = () => {
    setPackageForm({
      customerId: '',
      trackingNumber: '',
      carrier: 'USPS',
      description: '',
    });
    setEditingPackage(null);
  };

  // CRUD operations
  const handleAddCustomer = () => {
    const monthlyFee = MAILBOX_SIZES[customerForm.mailboxSize].monthlyFee;
    const newCustomer: Customer = {
      id: editingCustomer?.id || generateId(),
      ...customerForm,
      monthlyFee,
      status: 'active',
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
    };

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? newCustomer : c));
    } else {
      setCustomers(prev => [...prev, newCustomer]);
    }

    setShowCustomerModal(false);
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
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddPackage = () => {
    const customer = customers.find(c => c.id === packageForm.customerId);
    if (!customer) return;

    const newPackage: PackageLog = {
      id: generateId(),
      customerId: packageForm.customerId,
      customerName: customer.name,
      mailboxNumber: customer.mailboxNumber,
      trackingNumber: packageForm.trackingNumber,
      carrier: packageForm.carrier,
      receivedDate: new Date().toISOString(),
      status: 'received',
      description: packageForm.description,
    };

    setPackages(prev => [...prev, newPackage]);
    setShowPackageModal(false);
    resetPackageForm();
  };

  const handleNotifyCustomer = (pkg: PackageLog) => {
    const notification: Notification = {
      id: generateId(),
      customerId: pkg.customerId,
      customerName: pkg.customerName,
      packageId: pkg.id,
      type: 'email',
      sentAt: new Date().toISOString(),
      status: 'sent',
    };

    setNotifications(prev => [...prev, notification]);
    setPackages(prev => prev.map(p =>
      p.id === pkg.id ? { ...p, status: 'notified' as const } : p
    ));
  };

  const handlePickupPackage = (pkg: PackageLog) => {
    setPackages(prev => prev.map(p =>
      p.id === pkg.id ? { ...p, status: 'picked_up' as const, pickedUpDate: new Date().toISOString() } : p
    ));
  };

  const handleAddShipping = () => {
    const customer = customers.find(c => c.id === shippingForm.customerId);
    const newShipping: ShippingService = {
      id: generateId(),
      customerId: shippingForm.customerId || undefined,
      customerName: customer?.name,
      carrier: shippingForm.carrier,
      trackingNumber: generateId().toUpperCase(),
      destination: shippingForm.destination,
      weight: parseFloat(shippingForm.weight) || 0,
      cost: parseFloat(shippingForm.cost) || 0,
      date: new Date().toISOString(),
      status: 'pending',
    };

    setShippingServices(prev => [...prev, newShipping]);

    // Add payment record
    if (newShipping.cost > 0) {
      const payment: Payment = {
        id: generateId(),
        customerId: shippingForm.customerId || 'walk-in',
        customerName: customer?.name || 'Walk-in Customer',
        amount: newShipping.cost,
        type: 'shipping',
        date: new Date().toISOString(),
        method: 'cash',
      };
      setPayments(prev => [...prev, payment]);
    }

    setShowShippingModal(false);
    setShippingForm({ customerId: '', carrier: 'USPS', destination: '', weight: '', cost: '' });
  };

  // Filtered data
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.mailboxNumber.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  const filteredPackages = useMemo(() => {
    if (!searchQuery) return packages;
    const query = searchQuery.toLowerCase();
    return packages.filter(p =>
      p.customerName.toLowerCase().includes(query) ||
      p.trackingNumber.toLowerCase().includes(query) ||
      p.mailboxNumber.toLowerCase().includes(query)
    );
  }, [packages, searchQuery]);

  // Export data and columns based on active tab
  const { exportData, exportColumns, exportFilename, exportTitle } = useMemo(() => {
    switch (activeTab) {
      case 'customers':
      case 'mailboxes':
        return {
          exportData: customers,
          exportColumns: CUSTOMER_COLUMNS,
          exportFilename: 'mailbox-store-customers',
          exportTitle: 'Mailbox Store Customers',
        };
      case 'packages':
        return {
          exportData: packages,
          exportColumns: PACKAGE_COLUMNS,
          exportFilename: 'mailbox-store-packages',
          exportTitle: 'Package Log',
        };
      case 'shipping':
        return {
          exportData: shippingServices.map(s => ({
            ...s,
            customerName: s.customerName || 'Walk-in',
          })),
          exportColumns: SHIPPING_COLUMNS,
          exportFilename: 'mailbox-store-shipping',
          exportTitle: 'Shipping Services',
        };
      case 'payments':
        return {
          exportData: payments,
          exportColumns: PAYMENT_COLUMNS,
          exportFilename: 'mailbox-store-payments',
          exportTitle: 'Payment Records',
        };
      case 'services':
        // Combine all service types for export
        const allServices = [
          ...notaryServices.map(s => ({ ...s, serviceCategory: 'Notary' })),
          ...copyPrintServices.map(s => ({ ...s, serviceCategory: 'Copy/Print', customerName: s.customerName || 'Walk-in' })),
          ...faxLogs.map(s => ({ ...s, serviceCategory: 'Fax', customerName: s.customerName || 'Walk-in' })),
          ...keyReplacements.map(s => ({ ...s, serviceCategory: 'Key Replacement' })),
        ];
        return {
          exportData: allServices,
          exportColumns: [
            { key: 'serviceCategory', header: 'Service Type', type: 'string' as const },
            { key: 'customerName', header: 'Customer', type: 'string' as const },
            { key: 'date', header: 'Date', type: 'date' as const },
            { key: 'cost', header: 'Cost', type: 'currency' as const },
            { key: 'fee', header: 'Fee', type: 'currency' as const },
          ],
          exportFilename: 'mailbox-store-services',
          exportTitle: 'All Services',
        };
      case 'reports':
        // Export all data for reports
        return {
          exportData: payments,
          exportColumns: PAYMENT_COLUMNS,
          exportFilename: 'mailbox-store-report',
          exportTitle: 'Mailbox Store Report',
        };
      default:
        return {
          exportData: customers,
          exportColumns: CUSTOMER_COLUMNS,
          exportFilename: 'mailbox-store-data',
          exportTitle: 'Mailbox Store Data',
        };
    }
  }, [activeTab, customers, packages, shippingServices, payments, notaryServices, copyPrintServices, faxLogs, keyReplacements]);

  // Tab navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'mailboxes', label: 'Mailboxes', icon: Mail },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'services', label: 'Services', icon: FileText },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-teal-500`;

  const buttonClass = `px-4 py-2 rounded-lg font-medium transition-colors`;
  const primaryButtonClass = `${buttonClass} bg-teal-600 hover:bg-teal-700 text-white`;
  const secondaryButtonClass = `${buttonClass} ${
    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const cardClass = `rounded-lg p-4 ${
    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeMailboxes}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Active Mailboxes
              </div>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.pendingPackages}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Pending Packages
              </div>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.monthlyRevenue)}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Monthly Revenue
              </div>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.expiringMailboxes}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Expiring Soon
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setShowCustomerModal(true)}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-5 h-5 text-teal-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>New Customer</span>
          </button>
          <button
            onClick={() => setShowPackageModal(true)}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Package className="w-5 h-5 text-orange-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Log Package</span>
          </button>
          <button
            onClick={() => setShowShippingModal(true)}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Truck className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>New Shipment</span>
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Recent Packages */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Recent Packages
        </h3>
        <div className="space-y-3">
          {packages.slice(-5).reverse().map(pkg => (
            <div
              key={pkg.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-5 h-5 ${
                  pkg.status === 'picked_up' ? 'text-green-500' :
                  pkg.status === 'notified' ? 'text-blue-500' : 'text-orange-500'
                }`} />
                <div>
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.customerName} - Box #{pkg.mailboxNumber}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {pkg.carrier} - {pkg.trackingNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pkg.status === 'received' && (
                  <button
                    onClick={() => handleNotifyCustomer(pkg)}
                    className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
                    title="Send Notification"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                )}
                {pkg.status !== 'picked_up' && pkg.status !== 'forwarded' && (
                  <button
                    onClick={() => handlePickupPackage(pkg)}
                    className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg"
                    title="Mark as Picked Up"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No packages logged yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Customers Tab
  const renderCustomers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
        <button onClick={() => setShowCustomerModal(true)} className={primaryButtonClass}>
          <Plus className="w-4 h-4 inline mr-2" />
          Add Customer
        </button>
      </div>

      <div className="grid gap-4">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className={cardClass}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {customer.name}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    customer.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Mailbox</div>
                    <div className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      #{customer.mailboxNumber} ({MAILBOX_SIZES[customer.mailboxSize].name})
                    </div>
                  </div>
                  <div>
                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Email</div>
                    <div className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>{customer.email}</div>
                  </div>
                  <div>
                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Phone</div>
                    <div className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>{customer.phone}</div>
                  </div>
                  <div>
                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Monthly Fee</div>
                    <div className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      {formatCurrency(customer.monthlyFee)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Start: </span>
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      {formatDate(customer.rentalStartDate)}
                    </span>
                  </div>
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>End: </span>
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      {formatDate(customer.rentalEndDate)}
                    </span>
                  </div>
                </div>
                {customer.forwardingAddress && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Forwarding: {customer.forwardingAddress}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCustomer(customer);
                    setCustomerForm({
                      name: customer.name,
                      email: customer.email,
                      phone: customer.phone,
                      mailboxNumber: customer.mailboxNumber,
                      mailboxSize: customer.mailboxSize,
                      rentalStartDate: customer.rentalStartDate.split('T')[0],
                      rentalEndDate: customer.rentalEndDate.split('T')[0],
                      notes: customer.notes || '',
                    });
                    setShowCustomerModal(true);
                  }}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchQuery ? 'No customers found matching your search' : 'No customers yet. Add your first customer!'}
          </div>
        )}
      </div>
    </div>
  );

  // Render Packages Tab
  const renderPackages = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
        <button onClick={() => setShowPackageModal(true)} className={primaryButtonClass}>
          <Plus className="w-4 h-4 inline mr-2" />
          Log Package
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          <thead>
            <tr className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
              <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Mailbox</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Carrier</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tracking</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Received</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map(pkg => (
              <tr key={pkg.id} className={`border-b ${
                theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <td className="px-4 py-3">{pkg.customerName}</td>
                <td className="px-4 py-3">#{pkg.mailboxNumber}</td>
                <td className="px-4 py-3">{pkg.carrier}</td>
                <td className="px-4 py-3 font-mono text-sm">{pkg.trackingNumber}</td>
                <td className="px-4 py-3">{formatDate(pkg.receivedDate)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pkg.status === 'picked_up' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    pkg.status === 'notified' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    pkg.status === 'forwarded' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  }`}>
                    {pkg.status.replace('_', ' ').charAt(0).toUpperCase() + pkg.status.replace('_', ' ').slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {pkg.status === 'received' && (
                      <button
                        onClick={() => handleNotifyCustomer(pkg)}
                        className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        title="Send Notification"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    )}
                    {pkg.status !== 'picked_up' && pkg.status !== 'forwarded' && (
                      <button
                        onClick={() => handlePickupPackage(pkg)}
                        className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                        title="Mark Picked Up"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPackages.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No packages found
          </div>
        )}
      </div>
    </div>
  );

  // Render Shipping Tab
  const renderShipping = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Shipping Services
        </h3>
        <button onClick={() => setShowShippingModal(true)} className={primaryButtonClass}>
          <Plus className="w-4 h-4 inline mr-2" />
          New Shipment
        </button>
      </div>

      <div className="grid gap-4">
        {shippingServices.map(shipping => (
          <div key={shipping.id} className={cardClass}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {shipping.carrier} - {shipping.trackingNumber}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shipping.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    shipping.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {shipping.status.charAt(0).toUpperCase() + shipping.status.slice(1)}
                  </span>
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div>Destination: {shipping.destination}</div>
                  <div>Weight: {shipping.weight} lbs | Cost: {formatCurrency(shipping.cost)}</div>
                  {shipping.customerName && <div>Customer: {shipping.customerName}</div>}
                </div>
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(shipping.date)}
              </div>
            </div>
          </div>
        ))}
        {shippingServices.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No shipping services recorded yet
          </div>
        )}
      </div>
    </div>
  );

  // Render Services Tab (Notary, Copy/Print, Fax, Key Replacement)
  const renderServices = () => (
    <div className="space-y-6">
      {/* Service Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setShowNotaryModal(true)}
          className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
            theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          <FileText className="w-6 h-6 text-purple-500" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Notary Service
          </span>
        </button>
        <button
          onClick={() => setShowCopyPrintModal(true)}
          className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
            theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          <Printer className="w-6 h-6 text-cyan-500" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Copy/Print
          </span>
        </button>
        <button
          onClick={() => setShowFaxModal(true)}
          className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
            theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          <Phone className="w-6 h-6 text-indigo-500" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Fax Service
          </span>
        </button>
        <button
          onClick={() => setShowKeyModal(true)}
          className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
            theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          <Key className="w-6 h-6 text-amber-500" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Key Replacement
          </span>
        </button>
      </div>

      {/* Notary Services List */}
      {notaryServices.length > 0 && (
        <div className={cardClass}>
          <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recent Notary Services
          </h4>
          <div className="space-y-2">
            {notaryServices.slice(-5).reverse().map(service => (
              <div key={service.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      {service.customerName}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {service.documentType} - by {service.notaryName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-medium">{formatCurrency(service.fee)}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(service.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy/Print Services List */}
      {copyPrintServices.length > 0 && (
        <div className={cardClass}>
          <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recent Copy/Print Services
          </h4>
          <div className="space-y-2">
            {copyPrintServices.slice(-5).reverse().map(service => (
              <div key={service.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      {service.serviceType.replace('_', ' ').toUpperCase()} - {service.pages} pages
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {service.colorType === 'color' ? 'Color' : 'Black & White'}
                      {service.customerName && ` - ${service.customerName}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-medium">{formatCurrency(service.cost)}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(service.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fax Log List */}
      {faxLogs.length > 0 && (
        <div className={cardClass}>
          <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recent Fax Log
          </h4>
          <div className="space-y-2">
            {faxLogs.slice(-5).reverse().map(fax => (
              <div key={fax.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    {fax.direction === 'outgoing' ? (
                      <Send className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Archive className="w-4 h-4 text-green-500" />
                    )}
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        {fax.direction === 'outgoing' ? 'Sent to' : 'Received from'}: {fax.faxNumber}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {fax.pages} pages {fax.customerName && `- ${fax.customerName}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-medium">{formatCurrency(fax.cost)}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(fax.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Replacements List */}
      {keyReplacements.length > 0 && (
        <div className={cardClass}>
          <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Key Replacements
          </h4>
          <div className="space-y-2">
            {keyReplacements.slice(-5).reverse().map(key => (
              <div key={key.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      {key.customerName} - Box #{key.mailboxNumber}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {key.keyType === 'high_security' ? 'High Security' : 'Standard'} - {key.reason}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-medium">{formatCurrency(key.fee)}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(key.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Payments Tab
  const renderPayments = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Payment History
        </h3>
        <button onClick={() => setShowPaymentModal(true)} className={primaryButtonClass}>
          <Plus className="w-4 h-4 inline mr-2" />
          Record Payment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          <thead>
            <tr className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.slice().reverse().map(payment => (
              <tr key={payment.id} className={`border-b ${
                theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <td className="px-4 py-3">{formatDate(payment.date)}</td>
                <td className="px-4 py-3">{payment.customerName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    payment.type === 'rental' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' :
                    payment.type === 'shipping' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    payment.type === 'notary' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {payment.type.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{payment.method}</td>
                <td className="px-4 py-3 text-right font-medium text-green-500">
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No payments recorded yet
          </div>
        )}
      </div>
    </div>
  );

  // Render Reports Tab
  const renderReports = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Revenue by Service
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className={cardClass}>
          <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Revenue Breakdown
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.revenueByService).map(([service, amount]) => {
              const total = Object.values(stats.revenueByService).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (amount / total) * 100 : 0;
              const colors: Record<string, string> = {
                rental: 'bg-teal-500',
                shipping: 'bg-blue-500',
                notary: 'bg-purple-500',
                copyPrint: 'bg-cyan-500',
                fax: 'bg-indigo-500',
                key: 'bg-amber-500',
                other: 'bg-gray-500',
              };

              return (
                <div key={service}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {service.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full ${colors[service] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between">
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.mailboxStore.totalRevenue', 'Total Revenue')}</span>
              <span className="font-bold text-green-500 text-lg">
                {formatCurrency(Object.values(stats.revenueByService).reduce((sum, val) => sum + val, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={cardClass}>
          <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.mailboxStore.summaryStatistics', 'Summary Statistics')}
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.mailboxStore.totalCustomers', 'Total Customers')}</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalCustomers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.mailboxStore.activeMailboxes', 'Active Mailboxes')}</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeMailboxes}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.mailboxStore.totalPackagesReceived', 'Total Packages Received')}</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {packages.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.mailboxStore.packagesPickedUp', 'Packages Picked Up')}</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {packages.filter(p => p.status === 'picked_up').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.mailboxStore.totalShipments', 'Total Shipments')}</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {shippingServices.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.mailboxStore.notaryServices', 'Notary Services')}</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {notaryServices.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.mailboxStore.totalTransactions', 'Total Transactions')}</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {payments.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hold Requests */}
      <div className={cardClass}>
        <div className="flex justify-between items-center mb-4">
          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.mailboxStore.packageHoldRequests', 'Package Hold Requests')}
          </h4>
          <button onClick={() => setShowHoldModal(true)} className={secondaryButtonClass}>
            <Plus className="w-4 h-4 inline mr-1" />
            {t('tools.mailboxStore.newHold', 'New Hold')}
          </button>
        </div>
        {holdRequests.length > 0 ? (
          <div className="space-y-2">
            {holdRequests.map(hold => (
              <div key={hold.id} className={`p-3 rounded-lg flex justify-between ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div>
                  <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {hold.customerName} - Box #{hold.mailboxNumber}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(hold.startDate)} - {formatDate(hold.endDate)}
                    {hold.reason && ` | ${hold.reason}`}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium h-fit ${
                  hold.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  hold.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {hold.status.charAt(0).toUpperCase() + hold.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.mailboxStore.noHoldRequests', 'No hold requests')}
          </div>
        )}
      </div>
    </div>
  );

  // Render Mailboxes Tab
  const renderMailboxes = () => {
    const mailboxesBySize = {
      small: customers.filter(c => c.mailboxSize === 'small'),
      medium: customers.filter(c => c.mailboxSize === 'medium'),
      large: customers.filter(c => c.mailboxSize === 'large'),
      xl: customers.filter(c => c.mailboxSize === 'xl'),
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.mailboxStore.mailboxOverview', 'Mailbox Overview')}
          </h3>
          <button onClick={() => setShowCustomerModal(true)} className={primaryButtonClass}>
            <Plus className="w-4 h-4 inline mr-2" />
            {t('tools.mailboxStore.newRental', 'New Rental')}
          </button>
        </div>

        {/* Size Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(MAILBOX_SIZES).map(([size, info]) => (
            <div key={size} className={cardClass}>
              <div className="text-center">
                <Mail className={`w-8 h-8 mx-auto mb-2 ${
                  size === 'small' ? 'text-green-500' :
                  size === 'medium' ? 'text-blue-500' :
                  size === 'large' ? 'text-purple-500' : 'text-orange-500'
                }`} />
                <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {info.name}
                </div>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {mailboxesBySize[size as keyof typeof mailboxesBySize].length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatCurrency(info.monthlyFee)}/mo
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mailbox List */}
        <div className={cardClass}>
          <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.mailboxStore.allMailboxes', 'All Mailboxes')}
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.sort((a, b) => a.mailboxNumber.localeCompare(b.mailboxNumber)).map(customer => (
              <div
                key={customer.id}
                className={`p-4 rounded-lg border ${
                  customer.status === 'active'
                    ? theme === 'dark' ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'
                    : customer.status === 'expired'
                    ? theme === 'dark' ? 'border-red-700 bg-red-900/20' : 'border-red-200 bg-red-50'
                    : theme === 'dark' ? 'border-yellow-700 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      #{customer.mailboxNumber}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {customer.name}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {MAILBOX_SIZES[customer.mailboxSize].name} - Expires {formatDate(customer.rentalEndDate)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' :
                    customer.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {customers.length === 0 && (
            <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.mailboxStore.noMailboxesRentedYet', 'No mailboxes rented yet')}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal component
  const Modal: React.FC<{ title: string; show: boolean; onClose: () => void; children: React.ReactNode }> = ({
    title, show, onClose, children
  }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`flex justify-between items-center p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <button onClick={onClose} className={`p-1 rounded hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.mailboxStore.mailboxStoreManager', 'Mailbox Store Manager')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.mailboxStore.completeMailboxAndShippingCenter', 'Complete mailbox and shipping center management')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="mailbox-store" toolName="Mailbox Store" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            {exportData.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: exportFilename })}
                onExportExcel={() => exportExcel({ filename: exportFilename })}
                onExportJSON={() => exportJSON({ filename: exportFilename })}
                onExportPDF={async () => {
                  await exportPDF({
                    filename: exportFilename,
                    title: exportTitle,
                  });
                }}
                onPrint={() => printHook(exportTitle)}
                onCopyToClipboard={() => copyToClipboardHook('tab')}
                showImport={false}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
            )}
          </div>
        </div>

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.mailboxStore.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`mb-6 overflow-x-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <div className="flex min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'mailboxes' && renderMailboxes()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'packages' && renderPackages()}
          {activeTab === 'shipping' && renderShipping()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'reports' && renderReports()}
        </div>
      </div>

      {/* Customer Modal */}
      <Modal
        title={editingCustomer ? t('tools.mailboxStore.editCustomer', 'Edit Customer') : t('tools.mailboxStore.addNewCustomer', 'Add New Customer')}
        show={showCustomerModal}
        onClose={() => { setShowCustomerModal(false); resetCustomerForm(); }}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.name', 'Name')}</label>
            <input
              type="text"
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              className={inputClass}
              placeholder={t('tools.mailboxStore.customerName2', 'Customer name')}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.email', 'Email')}</label>
            <input
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              className={inputClass}
              placeholder={t('tools.mailboxStore.customerEmailCom', 'customer@email.com')}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.phone', 'Phone')}</label>
            <input
              type="tel"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              className={inputClass}
              placeholder="(555) 555-5555"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.mailboxNumber', 'Mailbox Number')}</label>
              <input
                type="text"
                value={customerForm.mailboxNumber}
                onChange={(e) => setCustomerForm({ ...customerForm, mailboxNumber: e.target.value })}
                className={inputClass}
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.mailboxSize', 'Mailbox Size')}</label>
              <select
                value={customerForm.mailboxSize}
                onChange={(e) => setCustomerForm({ ...customerForm, mailboxSize: e.target.value as any })}
                className={inputClass}
              >
                {Object.entries(MAILBOX_SIZES).map(([size, info]) => (
                  <option key={size} value={size}>
                    {info.name} - {formatCurrency(info.monthlyFee)}/mo
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.startDate', 'Start Date')}</label>
              <input
                type="date"
                value={customerForm.rentalStartDate}
                onChange={(e) => setCustomerForm({ ...customerForm, rentalStartDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.endDate', 'End Date')}</label>
              <input
                type="date"
                value={customerForm.rentalEndDate}
                onChange={(e) => setCustomerForm({ ...customerForm, rentalEndDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.notesOptional', 'Notes (Optional)')}</label>
            <textarea
              value={customerForm.notes}
              onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
              className={inputClass}
              rows={2}
              placeholder={t('tools.mailboxStore.anyAdditionalNotes', 'Any additional notes...')}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleAddCustomer} className={`flex-1 ${primaryButtonClass}`}>
              {editingCustomer ? t('tools.mailboxStore.updateCustomer', 'Update Customer') : t('tools.mailboxStore.addCustomer', 'Add Customer')}
            </button>
            <button
              onClick={() => { setShowCustomerModal(false); resetCustomerForm(); }}
              className={secondaryButtonClass}
            >
              {t('tools.mailboxStore.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Package Modal */}
      <Modal
        title={t('tools.mailboxStore.logNewPackage', 'Log New Package')}
        show={showPackageModal}
        onClose={() => { setShowPackageModal(false); resetPackageForm(); }}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.customer', 'Customer')}</label>
            <select
              value={packageForm.customerId}
              onChange={(e) => setPackageForm({ ...packageForm, customerId: e.target.value })}
              className={inputClass}
            >
              <option value="">{t('tools.mailboxStore.selectACustomer', 'Select a customer')}</option>
              {customers.filter(c => c.status === 'active').map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - Box #{customer.mailboxNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.carrier', 'Carrier')}</label>
            <select
              value={packageForm.carrier}
              onChange={(e) => setPackageForm({ ...packageForm, carrier: e.target.value })}
              className={inputClass}
            >
              {CARRIERS.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.trackingNumber', 'Tracking Number')}</label>
            <input
              type="text"
              value={packageForm.trackingNumber}
              onChange={(e) => setPackageForm({ ...packageForm, trackingNumber: e.target.value })}
              className={inputClass}
              placeholder={t('tools.mailboxStore.enterTrackingNumber', 'Enter tracking number')}
            />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.descriptionOptional', 'Description (Optional)')}</label>
            <input
              type="text"
              value={packageForm.description}
              onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
              className={inputClass}
              placeholder={t('tools.mailboxStore.eGSmallBoxLarge', 'e.g., Small box, large envelope')}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddPackage}
              disabled={!packageForm.customerId}
              className={`flex-1 ${primaryButtonClass} disabled:opacity-50`}
            >
              {t('tools.mailboxStore.logPackage', 'Log Package')}
            </button>
            <button
              onClick={() => { setShowPackageModal(false); resetPackageForm(); }}
              className={secondaryButtonClass}
            >
              {t('tools.mailboxStore.cancel2', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Shipping Modal */}
      <Modal
        title={t('tools.mailboxStore.newShipment', 'New Shipment')}
        show={showShippingModal}
        onClose={() => setShowShippingModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.customerOptional', 'Customer (Optional)')}</label>
            <select
              value={shippingForm.customerId}
              onChange={(e) => setShippingForm({ ...shippingForm, customerId: e.target.value })}
              className={inputClass}
            >
              <option value="">{t('tools.mailboxStore.walkInCustomer', 'Walk-in Customer')}</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - Box #{customer.mailboxNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.carrier2', 'Carrier')}</label>
            <select
              value={shippingForm.carrier}
              onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
              className={inputClass}
            >
              {CARRIERS.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.destination', 'Destination')}</label>
            <input
              type="text"
              value={shippingForm.destination}
              onChange={(e) => setShippingForm({ ...shippingForm, destination: e.target.value })}
              className={inputClass}
              placeholder={t('tools.mailboxStore.cityStateOrFullAddress', 'City, State or Full Address')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.weightLbs', 'Weight (lbs)')}</label>
              <input
                type="number"
                value={shippingForm.weight}
                onChange={(e) => setShippingForm({ ...shippingForm, weight: e.target.value })}
                className={inputClass}
                placeholder="0.0"
                step="0.1"
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.cost', 'Cost ($)')}</label>
              <input
                type="number"
                value={shippingForm.cost}
                onChange={(e) => setShippingForm({ ...shippingForm, cost: e.target.value })}
                className={inputClass}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleAddShipping} className={`flex-1 ${primaryButtonClass}`}>
              {t('tools.mailboxStore.createShipment', 'Create Shipment')}
            </button>
            <button onClick={() => setShowShippingModal(false)} className={secondaryButtonClass}>
              {t('tools.mailboxStore.cancel3', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title={t('tools.mailboxStore.recordPayment2', 'Record Payment')}
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.customer2', 'Customer')}</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('tools.mailboxStore.walkInCustomer2', 'Walk-in Customer')}</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - Box #{customer.mailboxNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.paymentType', 'Payment Type')}</label>
            <select className={inputClass} id="payment-type">
              <option value="rental">{t('tools.mailboxStore.mailboxRental', 'Mailbox Rental')}</option>
              <option value="shipping">{t('tools.mailboxStore.shipping', 'Shipping')}</option>
              <option value="notary">{t('tools.mailboxStore.notaryService', 'Notary Service')}</option>
              <option value="copy_print">{t('tools.mailboxStore.copyPrint', 'Copy/Print')}</option>
              <option value="fax">{t('tools.mailboxStore.fax', 'Fax')}</option>
              <option value="key">{t('tools.mailboxStore.keyReplacement', 'Key Replacement')}</option>
              <option value="other">{t('tools.mailboxStore.other', 'Other')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.amount', 'Amount ($)')}</label>
            <input type="number" className={inputClass} placeholder="0.00" step="0.01" id="payment-amount" />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.paymentMethod', 'Payment Method')}</label>
            <select className={inputClass} id="payment-method">
              <option value="cash">{t('tools.mailboxStore.cash', 'Cash')}</option>
              <option value="card">{t('tools.mailboxStore.card', 'Card')}</option>
              <option value="check">{t('tools.mailboxStore.check', 'Check')}</option>
              <option value="online">{t('tools.mailboxStore.online', 'Online')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.notesOptional2', 'Notes (Optional)')}</label>
            <input type="text" className={inputClass} placeholder={t('tools.mailboxStore.additionalNotes', 'Additional notes...')} id="payment-notes" />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                const type = (document.getElementById('payment-type') as HTMLSelectElement).value;
                const amount = parseFloat((document.getElementById('payment-amount') as HTMLInputElement).value) || 0;
                const method = (document.getElementById('payment-method') as HTMLSelectElement).value;
                const notes = (document.getElementById('payment-notes') as HTMLInputElement).value;
                const customer = customers.find(c => c.id === selectedCustomerId);

                if (amount > 0) {
                  const payment: Payment = {
                    id: generateId(),
                    customerId: selectedCustomerId || 'walk-in',
                    customerName: customer?.name || 'Walk-in Customer',
                    amount,
                    type: type as Payment['type'],
                    date: new Date().toISOString(),
                    method: method as Payment['method'],
                    notes: notes || undefined,
                  };
                  setPayments(prev => [...prev, payment]);
                  setShowPaymentModal(false);
                  setSelectedCustomerId('');
                }
              }}
              className={`flex-1 ${primaryButtonClass}`}
            >
              {t('tools.mailboxStore.recordPayment', 'Record Payment')}
            </button>
            <button onClick={() => setShowPaymentModal(false)} className={secondaryButtonClass}>
              {t('tools.mailboxStore.cancel4', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Notary Service Modal */}
      <Modal
        title={t('tools.mailboxStore.recordNotaryService', 'Record Notary Service')}
        show={showNotaryModal}
        onClose={() => setShowNotaryModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.customerName', 'Customer Name')}</label>
            <input type="text" className={inputClass} placeholder={t('tools.mailboxStore.customerName3', 'Customer name')} id="notary-customer" />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.documentType', 'Document Type')}</label>
            <input type="text" className={inputClass} placeholder={t('tools.mailboxStore.eGAffidavitPowerOf', 'e.g., Affidavit, Power of Attorney')} id="notary-doc" />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.notaryName', 'Notary Name')}</label>
            <input type="text" className={inputClass} placeholder={t('tools.mailboxStore.notaryPublicName', 'Notary public name')} id="notary-name" />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.fee', 'Fee ($)')}</label>
            <input type="number" className={inputClass} placeholder="0.00" step="0.01" id="notary-fee" defaultValue="10" />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                const customerName = (document.getElementById('notary-customer') as HTMLInputElement).value;
                const documentType = (document.getElementById('notary-doc') as HTMLInputElement).value;
                const notaryName = (document.getElementById('notary-name') as HTMLInputElement).value;
                const fee = parseFloat((document.getElementById('notary-fee') as HTMLInputElement).value) || 10;

                if (customerName && documentType) {
                  const service: NotaryService = {
                    id: generateId(),
                    customerName,
                    documentType,
                    notaryName,
                    fee,
                    date: new Date().toISOString(),
                  };
                  setNotaryServices(prev => [...prev, service]);

                  // Add payment
                  const payment: Payment = {
                    id: generateId(),
                    customerId: 'walk-in',
                    customerName,
                    amount: fee,
                    type: 'notary',
                    date: new Date().toISOString(),
                    method: 'cash',
                  };
                  setPayments(prev => [...prev, payment]);
                  setShowNotaryModal(false);
                }
              }}
              className={`flex-1 ${primaryButtonClass}`}
            >
              {t('tools.mailboxStore.recordService', 'Record Service')}
            </button>
            <button onClick={() => setShowNotaryModal(false)} className={secondaryButtonClass}>
              {t('tools.mailboxStore.cancel5', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Copy/Print Modal */}
      <Modal
        title={t('tools.mailboxStore.recordCopyPrintService', 'Record Copy/Print Service')}
        show={showCopyPrintModal}
        onClose={() => setShowCopyPrintModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.serviceType', 'Service Type')}</label>
            <select className={inputClass} id="copy-type">
              <option value="copy">{t('tools.mailboxStore.copy', 'Copy')}</option>
              <option value="print">{t('tools.mailboxStore.print', 'Print')}</option>
              <option value="scan">{t('tools.mailboxStore.scan', 'Scan')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.numberOfPages', 'Number of Pages')}</label>
            <input type="number" className={inputClass} placeholder="0" id="copy-pages" min="1" />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.colorType', 'Color Type')}</label>
            <select className={inputClass} id="copy-color">
              <option value="bw">{t('tools.mailboxStore.blackWhite010Page', 'Black & White ($0.10/page)')}</option>
              <option value="color">{t('tools.mailboxStore.color050Page', 'Color ($0.50/page)')}</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                const serviceType = (document.getElementById('copy-type') as HTMLSelectElement).value as CopyPrintService['serviceType'];
                const pages = parseInt((document.getElementById('copy-pages') as HTMLInputElement).value) || 0;
                const colorType = (document.getElementById('copy-color') as HTMLSelectElement).value as 'bw' | 'color';
                const cost = pages * (colorType === 'color' ? 0.50 : 0.10);

                if (pages > 0) {
                  const service: CopyPrintService = {
                    id: generateId(),
                    serviceType,
                    pages,
                    colorType,
                    cost,
                    date: new Date().toISOString(),
                  };
                  setCopyPrintServices(prev => [...prev, service]);

                  const payment: Payment = {
                    id: generateId(),
                    customerId: 'walk-in',
                    customerName: 'Walk-in Customer',
                    amount: cost,
                    type: 'copy_print',
                    date: new Date().toISOString(),
                    method: 'cash',
                  };
                  setPayments(prev => [...prev, payment]);
                  setShowCopyPrintModal(false);
                }
              }}
              className={`flex-1 ${primaryButtonClass}`}
            >
              {t('tools.mailboxStore.recordService2', 'Record Service')}
            </button>
            <button onClick={() => setShowCopyPrintModal(false)} className={secondaryButtonClass}>
              {t('tools.mailboxStore.cancel6', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Fax Modal */}
      <Modal
        title={t('tools.mailboxStore.recordFaxService', 'Record Fax Service')}
        show={showFaxModal}
        onClose={() => setShowFaxModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.direction', 'Direction')}</label>
            <select className={inputClass} id="fax-direction">
              <option value="outgoing">{t('tools.mailboxStore.outgoingSend', 'Outgoing (Send)')}</option>
              <option value="incoming">{t('tools.mailboxStore.incomingReceive', 'Incoming (Receive)')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.faxNumber', 'Fax Number')}</label>
            <input type="tel" className={inputClass} placeholder="(555) 555-5555" id="fax-number" />
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.numberOfPages2', 'Number of Pages')}</label>
            <input type="number" className={inputClass} placeholder="0" id="fax-pages" min="1" />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                const direction = (document.getElementById('fax-direction') as HTMLSelectElement).value as 'incoming' | 'outgoing';
                const faxNumber = (document.getElementById('fax-number') as HTMLInputElement).value;
                const pages = parseInt((document.getElementById('fax-pages') as HTMLInputElement).value) || 0;
                const cost = pages * (direction === 'outgoing' ? 2 : 1);

                if (pages > 0 && faxNumber) {
                  const fax: FaxLog = {
                    id: generateId(),
                    direction,
                    faxNumber,
                    pages,
                    cost,
                    date: new Date().toISOString(),
                    status: 'completed',
                  };
                  setFaxLogs(prev => [...prev, fax]);

                  const payment: Payment = {
                    id: generateId(),
                    customerId: 'walk-in',
                    customerName: 'Walk-in Customer',
                    amount: cost,
                    type: 'fax',
                    date: new Date().toISOString(),
                    method: 'cash',
                  };
                  setPayments(prev => [...prev, payment]);
                  setShowFaxModal(false);
                }
              }}
              className={`flex-1 ${primaryButtonClass}`}
            >
              {t('tools.mailboxStore.recordFax', 'Record Fax')}
            </button>
            <button onClick={() => setShowFaxModal(false)} className={secondaryButtonClass}>
              {t('tools.mailboxStore.cancel7', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Key Replacement Modal */}
      <Modal
        title={t('tools.mailboxStore.keyReplacement2', 'Key Replacement')}
        show={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.customer3', 'Customer')}</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('tools.mailboxStore.selectACustomer2', 'Select a customer')}</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - Box #{customer.mailboxNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.keyType', 'Key Type')}</label>
            <select className={inputClass} id="key-type">
              <option value="standard">{t('tools.mailboxStore.standard5', 'Standard ($5)')}</option>
              <option value="high_security">{t('tools.mailboxStore.highSecurity15', 'High Security ($15)')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.reason', 'Reason')}</label>
            <input type="text" className={inputClass} placeholder={t('tools.mailboxStore.eGLostDamagedAdditional', 'e.g., Lost, Damaged, Additional')} id="key-reason" />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                const customer = customers.find(c => c.id === selectedCustomerId);
                const keyType = (document.getElementById('key-type') as HTMLSelectElement).value as 'standard' | 'high_security';
                const reason = (document.getElementById('key-reason') as HTMLInputElement).value;
                const fee = keyType === 'high_security' ? 15 : 5;

                if (customer && reason) {
                  const key: KeyReplacement = {
                    id: generateId(),
                    customerId: customer.id,
                    customerName: customer.name,
                    mailboxNumber: customer.mailboxNumber,
                    keyType,
                    reason,
                    fee,
                    date: new Date().toISOString(),
                  };
                  setKeyReplacements(prev => [...prev, key]);

                  const payment: Payment = {
                    id: generateId(),
                    customerId: customer.id,
                    customerName: customer.name,
                    amount: fee,
                    type: 'key',
                    date: new Date().toISOString(),
                    method: 'cash',
                  };
                  setPayments(prev => [...prev, payment]);
                  setShowKeyModal(false);
                  setSelectedCustomerId('');
                }
              }}
              className={`flex-1 ${primaryButtonClass}`}
              disabled={!selectedCustomerId}
            >
              {t('tools.mailboxStore.recordReplacement', 'Record Replacement')}
            </button>
            <button onClick={() => setShowKeyModal(false)} className={secondaryButtonClass}>
              {t('tools.mailboxStore.cancel8', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Hold Request Modal */}
      <Modal
        title={t('tools.mailboxStore.packageHoldRequest', 'Package Hold Request')}
        show={showHoldModal}
        onClose={() => setShowHoldModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.customer4', 'Customer')}</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('tools.mailboxStore.selectACustomer3', 'Select a customer')}</option>
              {customers.filter(c => c.status === 'active').map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - Box #{customer.mailboxNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.startDate2', 'Start Date')}</label>
              <input type="date" className={inputClass} id="hold-start" />
            </div>
            <div>
              <label className={labelClass}>{t('tools.mailboxStore.endDate2', 'End Date')}</label>
              <input type="date" className={inputClass} id="hold-end" />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('tools.mailboxStore.reasonOptional', 'Reason (Optional)')}</label>
            <input type="text" className={inputClass} placeholder={t('tools.mailboxStore.eGVacationBusinessTrip', 'e.g., Vacation, Business trip')} id="hold-reason" />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                const customer = customers.find(c => c.id === selectedCustomerId);
                const startDate = (document.getElementById('hold-start') as HTMLInputElement).value;
                const endDate = (document.getElementById('hold-end') as HTMLInputElement).value;
                const reason = (document.getElementById('hold-reason') as HTMLInputElement).value;

                if (customer && startDate && endDate) {
                  const hold: HoldRequest = {
                    id: generateId(),
                    customerId: customer.id,
                    customerName: customer.name,
                    mailboxNumber: customer.mailboxNumber,
                    startDate,
                    endDate,
                    reason: reason || undefined,
                    status: 'active',
                  };
                  setHoldRequests(prev => [...prev, hold]);
                  setShowHoldModal(false);
                  setSelectedCustomerId('');
                }
              }}
              className={`flex-1 ${primaryButtonClass}`}
              disabled={!selectedCustomerId}
            >
              {t('tools.mailboxStore.createHoldRequest', 'Create Hold Request')}
            </button>
            <button onClick={() => setShowHoldModal(false)} className={secondaryButtonClass}>
              {t('tools.mailboxStore.cancel9', 'Cancel')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog />
    </div>
  );
};

export default MailboxStoreTool;
