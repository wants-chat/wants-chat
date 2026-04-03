'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Plus,
  Trash2,
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  Edit2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

interface ContactLensOrderToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  createdAt: string;
}

interface LensPrescription {
  sphere: { od: string; os: string };
  cylinder?: { od: string; os: string };
  axis?: { od: string; os: string };
  baseCurve: { od: string; os: string };
  diameter: { od: string; os: string };
  brand: string;
  type: 'daily' | 'bi-weekly' | 'monthly' | 'extended';
  modality: 'spherical' | 'toric' | 'multifocal' | 'colored';
  expirationDate: string;
}

interface ContactLensOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  prescription: LensPrescription;
  boxesOD: number;
  boxesOS: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery?: string;
  trackingNumber?: string;
  supplier: string;
  notes?: string;
  isAutoRefill: boolean;
  refillDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const LENS_BRANDS = [
  'Acuvue Oasys',
  'Acuvue Moist',
  'Acuvue Vita',
  'Air Optix Plus',
  'Air Optix Aqua',
  'Biofinity',
  'Biotrue ONEday',
  'Dailies Total1',
  'Dailies AquaComfort',
  'Proclear',
  'SofLens',
  'Ultra',
  'Other',
];

const LENS_TYPES = [
  { value: 'daily', label: 'Daily Disposable' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'extended', label: 'Extended Wear' },
];

const LENS_MODALITIES = [
  { value: 'spherical', label: 'Spherical' },
  { value: 'toric', label: 'Toric (Astigmatism)' },
  { value: 'multifocal', label: 'Multifocal' },
  { value: 'colored', label: 'Colored' },
];

const SUPPLIERS = [
  'ABB Optical',
  'Alcon',
  'Bausch + Lomb',
  'CooperVision',
  'Johnson & Johnson Vision',
  'Direct Order',
];

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'ordered', label: 'Ordered', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

// Column configuration for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'boxesOD', header: 'Boxes OD', type: 'number' },
  { key: 'boxesOS', header: 'Boxes OS', type: 'number' },
  { key: 'totalPrice', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
];

const PATIENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateOrderNumber = () => `CLO-${Date.now().toString(36).toUpperCase()}`;

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
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

// Main Component
export const ContactLensOrderTool: React.FC<ContactLensOrderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: patients,
    addItem: addPatientToBackend,
    deleteItem: deletePatientBackend,
    isSynced: patientsSynced,
    isSaving: patientsSaving,
    lastSaved: patientsLastSaved,
    syncError: patientsSyncError,
    forceSync: forcePatientsSync,
  } = useToolData<Patient>('cl-patients', [], PATIENT_COLUMNS);

  const {
    data: orders,
    addItem: addOrderToBackend,
    updateItem: updateOrderBackend,
    deleteItem: deleteOrderBackend,
    isSynced: ordersSynced,
    isSaving: ordersSaving,
    lastSaved: ordersLastSaved,
    syncError: ordersSyncError,
    forceSync: forceOrdersSync,
  } = useToolData<ContactLensOrder>('cl-orders', [], ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'patients' | 'refills'>('orders');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New patient form state
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  // New order form state
  const [newOrder, setNewOrder] = useState<Partial<ContactLensOrder>>({
    prescription: {
      sphere: { od: '', os: '' },
      cylinder: { od: '', os: '' },
      axis: { od: '', os: '' },
      baseCurve: { od: '', os: '' },
      diameter: { od: '', os: '' },
      brand: '',
      type: 'monthly',
      modality: 'spherical',
      expirationDate: '',
    },
    boxesOD: 1,
    boxesOS: 1,
    unitPrice: 0,
    supplier: '',
    notes: '',
    isAutoRefill: false,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patient || params.brand || params.orderData) {
        if (params.firstName || params.lastName) {
          setNewPatient({
            ...newPatient,
            firstName: params.firstName || '',
            lastName: params.lastName || '',
          });
          setShowPatientForm(true);
        }
        if (params.brand) {
          setNewOrder({
            ...newOrder,
            prescription: {
              ...newOrder.prescription!,
              brand: params.brand,
            },
          });
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate total price
  useEffect(() => {
    const total = ((newOrder.boxesOD || 0) + (newOrder.boxesOS || 0)) * (newOrder.unitPrice || 0);
    setNewOrder((prev) => ({ ...prev, totalPrice: total }));
  }, [newOrder.boxesOD, newOrder.boxesOS, newOrder.unitPrice]);

  // Add patient
  const addPatient = () => {
    if (!newPatient.firstName || !newPatient.lastName) {
      setValidationMessage('Please fill in required fields (First Name, Last Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const patient: Patient = {
      id: generateId(),
      firstName: newPatient.firstName || '',
      lastName: newPatient.lastName || '',
      email: newPatient.email || '',
      phone: newPatient.phone || '',
      dateOfBirth: newPatient.dateOfBirth || '',
      createdAt: new Date().toISOString(),
    };

    addPatientToBackend(patient);
    setSelectedPatientId(patient.id);
    setShowPatientForm(false);
    setNewPatient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
    });
  };

  // Add order
  const addOrder = () => {
    if (!selectedPatientId) {
      setValidationMessage('Please select a patient first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    if (!newOrder.prescription?.brand) {
      setValidationMessage('Please select a lens brand');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const order: ContactLensOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      patientId: selectedPatientId,
      prescription: newOrder.prescription as LensPrescription,
      boxesOD: newOrder.boxesOD || 1,
      boxesOS: newOrder.boxesOS || 1,
      unitPrice: newOrder.unitPrice || 0,
      totalPrice: newOrder.totalPrice || 0,
      status: 'pending',
      orderDate: new Date().toISOString(),
      supplier: newOrder.supplier || '',
      notes: newOrder.notes,
      isAutoRefill: newOrder.isAutoRefill || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrderToBackend(order);
    setShowOrderForm(false);
    resetOrderForm();
  };

  const resetOrderForm = () => {
    setNewOrder({
      prescription: {
        sphere: { od: '', os: '' },
        cylinder: { od: '', os: '' },
        axis: { od: '', os: '' },
        baseCurve: { od: '', os: '' },
        diameter: { od: '', os: '' },
        brand: '',
        type: 'monthly',
        modality: 'spherical',
        expirationDate: '',
      },
      boxesOD: 1,
      boxesOS: 1,
      unitPrice: 0,
      supplier: '',
      notes: '',
      isAutoRefill: false,
    });
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: ContactLensOrder['status']) => {
    updateOrderBackend(orderId, { status, updatedAt: new Date().toISOString() });
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOrderBackend(orderId);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const patient = patients.find((p) => p.id === order.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        patientName.includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.prescription.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, patients, searchTerm, filterStatus]);

  // Upcoming refills
  const upcomingRefills = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return orders.filter((o) => {
      if (!o.isAutoRefill || !o.refillDate) return false;
      const refillDate = new Date(o.refillDate);
      return refillDate >= today && refillDate <= thirtyDaysFromNow;
    });
  }, [orders]);

  // Analytics
  const analytics = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const monthlyOrders = orders.filter((o) => new Date(o.orderDate) >= thisMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const shippedOrders = orders.filter((o) => o.status === 'shipped').length;

    const byBrand = orders.reduce((acc, o) => {
      acc[o.prescription.brand] = (acc[o.prescription.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders: orders.length,
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue,
      pendingOrders,
      shippedOrders,
      topBrands: Object.entries(byBrand).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [orders]);

  const getStatusIcon = (status: ContactLensOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'ordered':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ContactLensOrder['status']) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
    switch (statusConfig?.color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-700';
      case 'blue':
        return 'bg-blue-100 text-blue-700';
      case 'purple':
        return 'bg-purple-100 text-purple-700';
      case 'green':
        return 'bg-green-100 text-green-700';
      case 'red':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed top-4 left-4 right-4 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{validationMessage}</span>
            </div>
          </div>
        )}

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.contactLensOrder.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.contactLensOrder.contactLensOrders', 'Contact Lens Orders')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.contactLensOrder.manageContactLensPrescriptionsOrders', 'Manage contact lens prescriptions, orders, and refills')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="contact-lens-order" toolName="Contact Lens Order" />

              <SyncStatus
                isSynced={ordersSynced}
                isSaving={ordersSaving}
                lastSaved={ordersLastSaved}
                syncError={ordersSyncError}
                onForceSync={forceOrdersSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = orders.map((o) => {
                    const patient = patients.find((p) => p.id === o.patientId);
                    return {
                      ...o,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      brand: o.prescription.brand,
                    };
                  });
                  exportToCSV(exportData, ORDER_COLUMNS, { filename: 'contact-lens-orders' });
                }}
                onExportExcel={() => {
                  const exportData = orders.map((o) => {
                    const patient = patients.find((p) => p.id === o.patientId);
                    return {
                      ...o,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      brand: o.prescription.brand,
                    };
                  });
                  exportToExcel(exportData, ORDER_COLUMNS, { filename: 'contact-lens-orders' });
                }}
                onExportJSON={() => {
                  const exportData = orders.map((o) => {
                    const patient = patients.find((p) => p.id === o.patientId);
                    return {
                      ...o,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  exportToJSON(exportData, { filename: 'contact-lens-orders' });
                }}
                onExportPDF={async () => {
                  const exportData = orders.map((o) => {
                    const patient = patients.find((p) => p.id === o.patientId);
                    return {
                      ...o,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      brand: o.prescription.brand,
                    };
                  });
                  await exportToPDF(exportData, ORDER_COLUMNS, {
                    filename: 'contact-lens-orders',
                    title: 'Contact Lens Orders Report',
                    subtitle: `${orders.length} orders | Revenue: ${formatCurrency(analytics.monthlyRevenue)}`,
                  });
                }}
                onPrint={() => {
                  const exportData = orders.map((o) => {
                    const patient = patients.find((p) => p.id === o.patientId);
                    return {
                      ...o,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      brand: o.prescription.brand,
                    };
                  });
                  printData(exportData, ORDER_COLUMNS, { title: 'Contact Lens Orders' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = orders.map((o) => {
                    const patient = patients.find((p) => p.id === o.patientId);
                    return {
                      ...o,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      brand: o.prescription.brand,
                    };
                  });
                  return await copyUtil(exportData, ORDER_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.contactLensOrder.thisMonth', 'This Month')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.monthlyOrders} orders
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.contactLensOrder.revenue', 'Revenue')}</p>
              <p className={`text-xl font-bold text-green-500`}>
                {formatCurrency(analytics.monthlyRevenue)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.contactLensOrder.pending', 'Pending')}</p>
              <p className={`text-xl font-bold text-yellow-500`}>
                {analytics.pendingOrders}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.contactLensOrder.inTransit', 'In Transit')}</p>
              <p className={`text-xl font-bold text-purple-500`}>
                {analytics.shippedOrders}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
              { id: 'patients', label: 'Patients', icon: <User className="w-4 h-4" /> },
              { id: 'refills', label: 'Auto-Refills', icon: <RefreshCw className="w-4 h-4" /> },
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.contactLensOrder.searchOrders', 'Search orders...')}
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.contactLensOrder.allStatuses', 'All Statuses')}</option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowOrderForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.contactLensOrder.newOrder', 'New Order')}
                </button>
              </div>
            </div>

            {/* Order List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <Package className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.contactLensOrder.noOrdersFoundCreateA', 'No orders found. Create a new order to get started.')}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const patient = patients.find((p) => p.id === order.patientId);

                  return (
                    <div
                      key={order.id}
                      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {order.orderNumber}
                              </h3>
                              {order.isAutoRefill && (
                                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                  {t('tools.contactLensOrder.autoRefill', 'Auto-Refill')}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {order.prescription.brand}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {order.boxesOD + order.boxesOS} boxes
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.totalPrice)}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {formatDate(order.orderDate)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as ContactLensOrder['status'])}
                              className={`text-sm px-2 py-1 rounded border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.contactLensOrder.patientDatabase', 'Patient Database')}
              </h2>
              <button
                onClick={() => setShowPatientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.contactLensOrder.addPatient', 'Add Patient')}
              </button>
            </div>

            <div className="grid gap-4">
              {patients.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <User className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.contactLensOrder.noPatientsYetAddYour', 'No patients yet. Add your first patient to get started.')}
                  </p>
                </div>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                          <User className="w-5 h-5 text-[#0D9488]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {patient.email} | {patient.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {orders.filter((o) => o.patientId === patient.id).length} order(s)
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setShowOrderForm(true);
                          }}
                          className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePatientBackend(patient.id)}
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

        {/* Refills Tab */}
        {activeTab === 'refills' && (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.contactLensOrder.upcomingAutoRefills', 'Upcoming Auto-Refills')}
            </h2>

            {upcomingRefills.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                <RefreshCw className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.contactLensOrder.noAutoRefillsScheduledFor', 'No auto-refills scheduled for the next 30 days.')}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingRefills.map((order) => {
                  const patient = patients.find((p) => p.id === order.patientId);
                  return (
                    <div
                      key={order.id}
                      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {order.prescription.brand} - {order.boxesOD + order.boxesOS} boxes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Refill Date: {formatDate(order.refillDate || '')}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatCurrency(order.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Patient Form Modal */}
        {showPatientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.contactLensOrder.addPatient2', 'Add Patient')}
                  </h2>
                  <button
                    onClick={() => setShowPatientForm(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.firstName', 'First Name *')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.lastName', 'Last Name *')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.email', 'Email')}
                      </label>
                      <input
                        type="email"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
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
                      {t('tools.contactLensOrder.dateOfBirth', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
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
                    onClick={() => setShowPatientForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.contactLensOrder.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addPatient}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.contactLensOrder.addPatient3', 'Add Patient')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Form Modal */}
        {showOrderForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.contactLensOrder.newContactLensOrder', 'New Contact Lens Order')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowOrderForm(false);
                      resetOrderForm();
                    }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Patient Selection */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.contactLensOrder.selectPatient', 'Select Patient *')}
                    </label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="">{t('tools.contactLensOrder.selectAPatient', 'Select a patient...')}</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lens Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.brand', 'Brand *')}
                      </label>
                      <select
                        value={newOrder.prescription?.brand}
                        onChange={(e) =>
                          setNewOrder({
                            ...newOrder,
                            prescription: { ...newOrder.prescription!, brand: e.target.value },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.contactLensOrder.selectBrand', 'Select brand...')}</option>
                        {LENS_BRANDS.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.type', 'Type')}
                      </label>
                      <select
                        value={newOrder.prescription?.type}
                        onChange={(e) =>
                          setNewOrder({
                            ...newOrder,
                            prescription: { ...newOrder.prescription!, type: e.target.value as LensPrescription['type'] },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {LENS_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prescription */}
                  <div>
                    <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.contactLensOrder.prescription', 'Prescription')}
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.contactLensOrder.sphereOd', 'Sphere OD')}
                        </label>
                        <input
                          type="text"
                          placeholder="-2.00"
                          value={newOrder.prescription?.sphere.od}
                          onChange={(e) =>
                            setNewOrder({
                              ...newOrder,
                              prescription: {
                                ...newOrder.prescription!,
                                sphere: { ...newOrder.prescription!.sphere, od: e.target.value },
                              },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.contactLensOrder.sphereOs', 'Sphere OS')}
                        </label>
                        <input
                          type="text"
                          placeholder="-2.25"
                          value={newOrder.prescription?.sphere.os}
                          onChange={(e) =>
                            setNewOrder({
                              ...newOrder,
                              prescription: {
                                ...newOrder.prescription!,
                                sphere: { ...newOrder.prescription!.sphere, os: e.target.value },
                              },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.contactLensOrder.baseCurveOd', 'Base Curve OD')}
                        </label>
                        <input
                          type="text"
                          placeholder="8.4"
                          value={newOrder.prescription?.baseCurve.od}
                          onChange={(e) =>
                            setNewOrder({
                              ...newOrder,
                              prescription: {
                                ...newOrder.prescription!,
                                baseCurve: { ...newOrder.prescription!.baseCurve, od: e.target.value },
                              },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.contactLensOrder.baseCurveOs', 'Base Curve OS')}
                        </label>
                        <input
                          type="text"
                          placeholder="8.4"
                          value={newOrder.prescription?.baseCurve.os}
                          onChange={(e) =>
                            setNewOrder({
                              ...newOrder,
                              prescription: {
                                ...newOrder.prescription!,
                                baseCurve: { ...newOrder.prescription!.baseCurve, os: e.target.value },
                              },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.boxesOd', 'Boxes OD')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newOrder.boxesOD}
                        onChange={(e) => setNewOrder({ ...newOrder, boxesOD: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.boxesOs', 'Boxes OS')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newOrder.boxesOS}
                        onChange={(e) => setNewOrder({ ...newOrder, boxesOS: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.unitPrice', 'Unit Price ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newOrder.unitPrice}
                        onChange={(e) => setNewOrder({ ...newOrder, unitPrice: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.totalPrice', 'Total Price')}
                      </label>
                      <input
                        type="text"
                        value={formatCurrency(newOrder.totalPrice || 0)}
                        disabled
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-600 text-gray-300'
                            : 'bg-gray-100 border-gray-300 text-gray-700'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Supplier and Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contactLensOrder.supplier', 'Supplier')}
                      </label>
                      <select
                        value={newOrder.supplier}
                        onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.contactLensOrder.selectSupplier', 'Select supplier...')}</option>
                        {SUPPLIERS.map((supplier) => (
                          <option key={supplier} value={supplier}>
                            {supplier}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="autoRefill"
                        checked={newOrder.isAutoRefill}
                        onChange={(e) => setNewOrder({ ...newOrder, isAutoRefill: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                      />
                      <label htmlFor="autoRefill" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {t('tools.contactLensOrder.enableAutoRefill', 'Enable Auto-Refill')}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.contactLensOrder.notes', 'Notes')}
                    </label>
                    <textarea
                      value={newOrder.notes}
                      onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
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
                      setShowOrderForm(false);
                      resetOrderForm();
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.contactLensOrder.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addOrder}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.contactLensOrder.createOrder', 'Create Order')}
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

export default ContactLensOrderTool;
