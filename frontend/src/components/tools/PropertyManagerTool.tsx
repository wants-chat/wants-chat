'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Building,
  Building2,
  Key,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Users,
  Calendar,
  Wrench,
  CreditCard,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  BedDouble,
  Bath,
  Square,
  UserPlus,
  Phone,
  Mail,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PropertyManagerToolProps {
  uiConfig?: UIConfig;
}

// Types
type PropertyType = 'apartment' | 'house' | 'commercial' | 'condo' | 'townhouse';
type PropertyStatus = 'available' | 'rented' | 'maintenance';
type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';
type PaymentStatus = 'paid' | 'pending' | 'overdue';

interface Property {
  id: string;
  address: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rentAmount: number;
  depositAmount: number;
  status: PropertyStatus;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  rentDueDay: number;
  emergencyContact?: string;
  createdAt: string;
}

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: MaintenanceStatus;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
}

interface RentPayment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

interface PropertyExpense {
  id: string;
  propertyId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

type TabType = 'properties' | 'tenants' | 'maintenance' | 'payments' | 'expenses';

// Column configurations for exports
const propertyColumns: ColumnConfig[] = [
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'bedrooms', header: 'Bedrooms', type: 'number' },
  { key: 'bathrooms', header: 'Bathrooms', type: 'number' },
  { key: 'sqft', header: 'Square Feet', type: 'number' },
  { key: 'rentAmount', header: 'Monthly Rent', type: 'currency' },
  { key: 'depositAmount', header: 'Deposit', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const tenantColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'rentDueDay', header: 'Rent Due Day', type: 'number' },
  { key: 'leaseStartDate', header: 'Lease Start', type: 'date' },
  { key: 'leaseEndDate', header: 'Lease End', type: 'date' },
  { key: 'emergencyContact', header: 'Emergency Contact', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const maintenanceColumns: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'completedDate', header: 'Completed Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const paymentColumns: ColumnConfig[] = [
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'paidDate', header: 'Paid Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'paymentMethod', header: 'Payment Method', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const expenseColumns: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
];

const PROPERTY_STATUSES: { value: PropertyStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'text-green-500 bg-green-500/10' },
  { value: 'rented', label: 'Rented', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'maintenance', label: 'Maintenance', color: 'text-red-500 bg-red-500/10' },
];

const EXPENSE_CATEGORIES = [
  'Repairs',
  'Utilities',
  'Insurance',
  'Taxes',
  'Maintenance',
  'Landscaping',
  'Cleaning',
  'Appliances',
  'Legal',
  'Marketing',
  'Other',
];

const STORAGE_KEY = 'property-manager-data';

export const PropertyManagerTool: React.FC<PropertyManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const propertiesToolData = useToolData<Property>('property-manager-properties', [], propertyColumns);
  const tenantsToolData = useToolData<Tenant>('property-manager-tenants', [], tenantColumns);
  const maintenanceToolData = useToolData<MaintenanceRequest>('property-manager-maintenance', [], maintenanceColumns);
  const paymentsToolData = useToolData<RentPayment>('property-manager-payments', [], paymentColumns);
  const expensesToolData = useToolData<PropertyExpense>('property-manager-expenses', [], expenseColumns);

  // Extract convenient aliases
  const properties = propertiesToolData.data;
  const setProperties = propertiesToolData.setData;
  const { addItem: addProperty, updateItem: updateProperty, deleteItem: deleteProperty } = propertiesToolData;

  const tenants = tenantsToolData.data;
  const setTenants = tenantsToolData.setData;
  const { addItem: addTenant, deleteItem: deleteTenant } = tenantsToolData;

  const maintenanceRequests = maintenanceToolData.data;
  const { addItem: addMaintenance, updateItem: updateMaintenance } = maintenanceToolData;

  const rentPayments = paymentsToolData.data;
  const { addItem: addPayment, updateItem: updatePayment } = paymentsToolData;

  const expenses = expensesToolData.data;
  const { addItem: addExpense, deleteItem: deleteExpense } = expensesToolData;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAssignTenantModal, setShowAssignTenantModal] = useState(false);

  // Edit states
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Form states
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({
    address: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    rentAmount: 0,
    depositAmount: 0,
    status: 'available',
    description: '',
  });

  const [tenantForm, setTenantForm] = useState<Partial<Tenant>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rentDueDay: 1,
    emergencyContact: '',
  });

  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceRequest>>({
    propertyId: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    estimatedCost: 0,
  });

  const [paymentForm, setPaymentForm] = useState<Partial<RentPayment>>({
    propertyId: '',
    tenantId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  });

  const [expenseForm, setExpenseForm] = useState<Partial<PropertyExpense>>({
    propertyId: '',
    category: 'Repairs',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Note: Data loading is now handled by useToolData hooks with automatic API/localStorage sync

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.address || params.propertyName || params.rent) {
        setPropertyForm(prev => ({
          ...prev,
          address: params.address || params.propertyName || prev.address,
          rentAmount: params.rent || params.amount || prev.rentAmount,
          description: params.description || prev.description,
        }));
        setShowPropertyModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Note: Data persistence is now handled by useToolData hooks with automatic localStorage/API sync

  // Computed stats
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(p => p.status === 'rented').length;
    const vacantProperties = properties.filter(p => p.status === 'available').length;
    const maintenanceProperties = properties.filter(p => p.status === 'maintenance').length;
    const totalRentIncome = properties
      .filter(p => p.status === 'rented')
      .reduce((sum, p) => sum + p.rentAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingMaintenance = maintenanceRequests.filter(m => m.status !== 'completed').length;
    const overduePayments = rentPayments.filter(p => p.status === 'overdue').length;

    return {
      totalProperties,
      occupiedProperties,
      vacantProperties,
      maintenanceProperties,
      totalRentIncome,
      totalExpenses,
      pendingMaintenance,
      overduePayments,
      occupancyRate: totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0,
    };
  }, [properties, expenses, maintenanceRequests, rentPayments]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesSearch = !searchQuery ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [properties, statusFilter, searchQuery]);

  // Helper functions
  const getPropertyById = (id: string) => properties.find(p => p.id === id);
  const getTenantById = (id: string) => tenants.find(t => t.id === id);
  const getTenantByPropertyId = (propertyId: string) => tenants.find(t => t.propertyId === propertyId);

  // CRUD operations
  const handleAddProperty = async () => {
    if (!propertyForm.address || !propertyForm.rentAmount) return;

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      address: propertyForm.address || '',
      type: propertyForm.type || 'apartment',
      bedrooms: propertyForm.bedrooms || 1,
      bathrooms: propertyForm.bathrooms || 1,
      sqft: propertyForm.sqft || 0,
      rentAmount: propertyForm.rentAmount || 0,
      depositAmount: propertyForm.depositAmount || 0,
      status: propertyForm.status || 'available',
      description: propertyForm.description,
      imageUrl: propertyForm.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProperty(newProperty);
    resetPropertyForm();
    setShowPropertyModal(false);
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;

    updateProperty(editingProperty.id, {
      ...propertyForm,
      updatedAt: new Date().toISOString(),
    });
    resetPropertyForm();
    setEditingProperty(null);
    setShowPropertyModal(false);
  };

  const handleDeleteProperty = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Property',
      message: 'Are you sure you want to delete this property? This will also remove tenant associations and maintenance requests.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    deleteProperty(id);
    // Remove tenant associations
    tenants.forEach(t => {
      if (t.propertyId === id) {
        updateTenant(t.id, { propertyId: undefined });
      }
    });
    // Remove maintenance requests for this property
    maintenanceRequests.forEach(m => {
      if (m.propertyId === id) {
        deleteMaintenance(m.id);
      }
    });
  };

  // Helper for tenant updates
  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    tenantsToolData.updateItem(id, updates);
  };

  // Helper for maintenance deletion
  const deleteMaintenance = (id: string) => {
    maintenanceToolData.deleteItem(id);
  };

  const handleAddTenant = async () => {
    if (!tenantForm.firstName || !tenantForm.lastName) return;

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      firstName: tenantForm.firstName || '',
      lastName: tenantForm.lastName || '',
      email: tenantForm.email || '',
      phone: tenantForm.phone || '',
      propertyId: tenantForm.propertyId,
      leaseStartDate: tenantForm.leaseStartDate,
      leaseEndDate: tenantForm.leaseEndDate,
      rentDueDay: tenantForm.rentDueDay || 1,
      emergencyContact: tenantForm.emergencyContact,
      createdAt: new Date().toISOString(),
    };

    addTenant(newTenant);
    resetTenantForm();
    setShowTenantModal(false);
  };

  const handleDeleteTenant = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove Tenant',
      message: 'Are you sure you want to remove this tenant?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteTenant(id);
  };

  const handleAssignTenant = (tenantId: string, propertyId: string) => {
    const property = getPropertyById(propertyId);
    if (!property) return;

    // Update tenant with property
    updateTenant(tenantId, { propertyId });

    // Remove tenant from any other property
    tenants.forEach(t => {
      if (t.propertyId === propertyId && t.id !== tenantId) {
        updateTenant(t.id, { propertyId: undefined });
      }
    });

    // Update property status to rented
    updateProperty(propertyId, { status: 'rented' });

    setShowAssignTenantModal(false);
    setSelectedPropertyId(null);
  };

  const handleRemoveTenantFromProperty = (propertyId: string) => {
    // Remove tenant from property
    tenants.forEach(t => {
      if (t.propertyId === propertyId) {
        updateTenant(t.id, { propertyId: undefined });
      }
    });

    // Update property status to available
    updateProperty(propertyId, { status: 'available' });
  };

  const handleAddMaintenanceRequest = async () => {
    if (!maintenanceForm.propertyId || !maintenanceForm.title) return;

    const newRequest: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      propertyId: maintenanceForm.propertyId || '',
      tenantId: maintenanceForm.tenantId,
      title: maintenanceForm.title || '',
      description: maintenanceForm.description || '',
      priority: maintenanceForm.priority || 'medium',
      status: maintenanceForm.status || 'pending',
      estimatedCost: maintenanceForm.estimatedCost,
      scheduledDate: maintenanceForm.scheduledDate,
      createdAt: new Date().toISOString(),
    };

    addMaintenance(newRequest);

    setMaintenanceForm({
      propertyId: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      estimatedCost: 0,
    });
    setShowMaintenanceModal(false);
  };

  const handleUpdateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
    updateMaintenance(id, {
      status,
      completedDate: status === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  const handleAddPayment = async () => {
    if (!paymentForm.propertyId || !paymentForm.amount) return;

    const newPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      propertyId: paymentForm.propertyId || '',
      tenantId: paymentForm.tenantId || '',
      amount: paymentForm.amount || 0,
      dueDate: paymentForm.dueDate || new Date().toISOString().split('T')[0],
      paidDate: paymentForm.paidDate,
      status: paymentForm.status || 'pending',
      paymentMethod: paymentForm.paymentMethod,
      notes: paymentForm.notes,
      createdAt: new Date().toISOString(),
    };

    addPayment(newPayment);

    setPaymentForm({
      propertyId: '',
      tenantId: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    });
    setShowPaymentModal(false);
  };

  const handleUpdatePaymentStatus = (id: string, status: PaymentStatus) => {
    updatePayment(id, {
      status,
      paidDate: status === 'paid' ? new Date().toISOString() : undefined,
    });
  };

  const handleAddExpense = () => {
    if (!expenseForm.propertyId || !expenseForm.amount) return;

    const newExpense: PropertyExpense = {
      id: `exp-${Date.now()}`,
      propertyId: expenseForm.propertyId || '',
      category: expenseForm.category || 'Other',
      description: expenseForm.description || '',
      amount: expenseForm.amount || 0,
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);
    setExpenseForm({
      propertyId: '',
      category: 'Repairs',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    });
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteExpense(id);
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      address: '',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 0,
      rentAmount: 0,
      depositAmount: 0,
      status: 'available',
      description: '',
    });
  };

  const resetTenantForm = () => {
    setTenantForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      rentDueDay: 1,
      emergencyContact: '',
    });
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case 'house':
        return Home;
      case 'commercial':
        return Building2;
      default:
        return Building;
    }
  };

  // Style classes
  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${
    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  // Render stats cards
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg">
            <Building className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Properties</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalProperties}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Occupied</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.occupiedProperties}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg">
            <Key className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Vacant</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.vacantProperties}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Income</p>
            <p className={`text-2xl font-bold text-amber-500`}>${stats.totalRentIncome.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render properties tab
  const renderPropertiesTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-10 w-64`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}
            className={inputClass}
          >
            <option value="all">All Status</option>
            {PROPERTY_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            onExportCSV={() => propertiesToolData.exportCSV({ filename: 'properties' })}
            onExportExcel={() => propertiesToolData.exportExcel({ filename: 'properties' })}
            onExportJSON={() => propertiesToolData.exportJSON({ filename: 'properties' })}
            onExportPDF={async () => { await propertiesToolData.exportPDF({ filename: 'properties', title: 'Properties Report' }); }}
            onPrint={() => propertiesToolData.print('Properties Report')}
            onCopyToClipboard={() => propertiesToolData.copyToClipboard()}
            disabled={filteredProperties.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
          <button onClick={() => setShowPropertyModal(true)} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map(property => {
          const PropertyIcon = getPropertyTypeIcon(property.type);
          const statusInfo = PROPERTY_STATUSES.find(s => s.value === property.status);
          const tenant = getTenantByPropertyId(property.id);

          return (
            <div key={property.id} className={`${cardClass} p-4 hover:shadow-lg transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-lg">
                    <PropertyIcon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {property.address}
                    </h3>
                    <p className={`text-sm capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {property.type}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                  {statusInfo?.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BedDouble className="w-4 h-4" />
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms} bath</span>
                </div>
                <div className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Square className="w-4 h-4" />
                  <span>{property.sqft} sqft</span>
                </div>
              </div>

              <div className={`flex items-center justify-between py-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.rent', 'Rent')}</p>
                  <p className="text-lg font-bold text-amber-500">${property.rentAmount.toLocaleString()}/mo</p>
                </div>
                {tenant && (
                  <div className="text-right">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.tenant', 'Tenant')}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tenant.firstName} {tenant.lastName}
                    </p>
                  </div>
                )}
              </div>

              <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <button
                  onClick={() => {
                    setEditingProperty(property);
                    setPropertyForm(property);
                    setShowPropertyModal(true);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  {t('tools.propertyManager.edit', 'Edit')}
                </button>
                {property.status === 'available' ? (
                  <button
                    onClick={() => {
                      setSelectedPropertyId(property.id);
                      setShowAssignTenantModal(true);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-colors ${
                      isDark ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('tools.propertyManager.assign', 'Assign')}
                  </button>
                ) : property.status === 'rented' && tenant ? (
                  <button
                    onClick={() => handleRemoveTenantFromProperty(property.id)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-colors ${
                      isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    {t('tools.propertyManager.remove', 'Remove')}
                  </button>
                ) : null}
                <button
                  onClick={() => handleDeleteProperty(property.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Building className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.noPropertiesFound', 'No properties found')}</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.propertyManager.addYourFirstPropertyTo', 'Add your first property to get started')}</p>
        </div>
      )}
    </div>
  );

  // Render tenants tab
  const renderTenantsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ExportDropdown
          onExportCSV={() => tenantsToolData.exportCSV({ filename: 'tenants' })}
          onExportExcel={() => tenantsToolData.exportExcel({ filename: 'tenants' })}
          onExportJSON={() => tenantsToolData.exportJSON({ filename: 'tenants' })}
          onExportPDF={async () => { await tenantsToolData.exportPDF({ filename: 'tenants', title: 'Tenants Report' }); }}
          onPrint={() => tenantsToolData.print('Tenants Report')}
          onCopyToClipboard={() => tenantsToolData.copyToClipboard()}
          disabled={tenants.length === 0}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowTenantModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.propertyManager.addTenant', 'Add Tenant')}
        </button>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.name', 'Name')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.contact', 'Contact')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.property', 'Property')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.lease', 'Lease')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => {
                const property = tenant.propertyId ? getPropertyById(tenant.propertyId) : null;
                return (
                  <tr key={tenant.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-amber-500">
                            {tenant.firstName[0]}{tenant.lastName[0]}
                          </span>
                        </div>
                        <span className="font-medium">{tenant.firstName} {tenant.lastName}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Mail className="w-3.5 h-3.5" />
                          {tenant.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="w-3.5 h-3.5" />
                          {tenant.phone}
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {property ? property.address : <span className="text-gray-500">{t('tools.propertyManager.notAssigned', 'Not assigned')}</span>}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tenant.leaseStartDate && tenant.leaseEndDate ? (
                        <span className="text-sm">
                          {new Date(tenant.leaseStartDate).toLocaleDateString()} - {new Date(tenant.leaseEndDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">{t('tools.propertyManager.noLease', 'No lease')}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {tenants.length === 0 && (
          <div className="text-center py-12">
            <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.noTenantsYet', 'No tenants yet')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render maintenance tab
  const renderMaintenanceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ExportDropdown
          onExportCSV={() => maintenanceToolData.exportCSV({ filename: 'maintenance-requests' })}
          onExportExcel={() => maintenanceToolData.exportExcel({ filename: 'maintenance-requests' })}
          onExportJSON={() => maintenanceToolData.exportJSON({ filename: 'maintenance-requests' })}
          onExportPDF={async () => { await maintenanceToolData.exportPDF({ filename: 'maintenance-requests', title: 'Maintenance Requests Report' }); }}
          onPrint={() => maintenanceToolData.print('Maintenance Requests Report')}
          onCopyToClipboard={() => maintenanceToolData.copyToClipboard()}
          disabled={maintenanceRequests.length === 0}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowMaintenanceModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.propertyManager.newRequest', 'New Request')}
        </button>
      </div>

      <div className="grid gap-4">
        {maintenanceRequests.map(request => {
          const property = getPropertyById(request.propertyId);
          const priorityColors = {
            low: 'text-blue-500 bg-blue-500/10',
            medium: 'text-amber-500 bg-amber-500/10',
            high: 'text-orange-500 bg-orange-500/10',
            urgent: 'text-red-500 bg-red-500/10',
          };
          const statusColors = {
            pending: 'text-gray-500 bg-gray-500/10',
            in_progress: 'text-amber-500 bg-amber-500/10',
            completed: 'text-green-500 bg-green-500/10',
          };

          return (
            <div key={request.id} className={`${cardClass} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {property?.address || 'Unknown property'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[request.priority]}`}>
                    {request.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[request.status]}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{request.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {request.estimatedCost && (
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Est. Cost: ${request.estimatedCost}
                    </span>
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created: {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {request.status !== 'completed' && (
                    <>
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateMaintenanceStatus(request.id, 'in_progress')}
                          className={`px-3 py-1.5 rounded-lg text-sm ${buttonSecondary}`}
                        >
                          {t('tools.propertyManager.start', 'Start')}
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateMaintenanceStatus(request.id, 'completed')}
                        className="px-3 py-1.5 rounded-lg text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      >
                        {t('tools.propertyManager.complete', 'Complete')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {maintenanceRequests.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Wrench className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.noMaintenanceRequests', 'No maintenance requests')}</p>
        </div>
      )}
    </div>
  );

  // Render payments tab
  const renderPaymentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ExportDropdown
          onExportCSV={() => paymentsToolData.exportCSV({ filename: 'rent-payments' })}
          onExportExcel={() => paymentsToolData.exportExcel({ filename: 'rent-payments' })}
          onExportJSON={() => paymentsToolData.exportJSON({ filename: 'rent-payments' })}
          onExportPDF={async () => { await paymentsToolData.exportPDF({ filename: 'rent-payments', title: 'Rent Payments Report' }); }}
          onPrint={() => paymentsToolData.print('Rent Payments Report')}
          onCopyToClipboard={() => paymentsToolData.copyToClipboard()}
          disabled={rentPayments.length === 0}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowPaymentModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.propertyManager.recordPayment2', 'Record Payment')}
        </button>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.property2', 'Property')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.tenant2', 'Tenant')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.amount', 'Amount')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.dueDate', 'Due Date')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.status', 'Status')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.actions2', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rentPayments.map(payment => {
                const property = getPropertyById(payment.propertyId);
                const tenant = getTenantById(payment.tenantId);
                const statusColors = {
                  paid: 'text-green-500 bg-green-500/10',
                  pending: 'text-amber-500 bg-amber-500/10',
                  overdue: 'text-red-500 bg-red-500/10',
                };

                return (
                  <tr key={payment.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {property?.address || 'Unknown'}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-500">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[payment.status]}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(payment.id, 'paid')}
                          className="px-3 py-1.5 rounded-lg text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        >
                          {t('tools.propertyManager.markPaid', 'Mark Paid')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rentPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.noPaymentRecords', 'No payment records')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render expenses tab
  const renderExpensesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ExportDropdown
          onExportCSV={() => expensesToolData.exportCSV({ filename: 'property-expenses' })}
          onExportExcel={() => expensesToolData.exportExcel({ filename: 'property-expenses' })}
          onExportJSON={() => expensesToolData.exportJSON({ filename: 'property-expenses' })}
          onExportPDF={async () => { await expensesToolData.exportPDF({ filename: 'property-expenses', title: 'Property Expenses Report' }); }}
          onPrint={() => expensesToolData.print('Property Expenses Report')}
          onCopyToClipboard={() => expensesToolData.copyToClipboard()}
          disabled={expenses.length === 0}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowExpenseModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.propertyManager.addExpense2', 'Add Expense')}
        </button>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.property3', 'Property')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.category', 'Category')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.description', 'Description')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.amount2', 'Amount')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.date', 'Date')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.actions3', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => {
                const property = getPropertyById(expense.propertyId);
                return (
                  <tr key={expense.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {property?.address || 'Unknown'}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {expense.category}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {expense.description}
                    </td>
                    <td className="py-3 px-4 font-semibold text-red-500">
                      -${expense.amount.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {expenses.length === 0 && (
          <div className="text-center py-12">
            <Receipt className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyManager.noExpensesRecorded', 'No expenses recorded')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Property Modal
  const renderPropertyModal = () => (
    showPropertyModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingProperty ? t('tools.propertyManager.editProperty', 'Edit Property') : t('tools.propertyManager.addNewProperty', 'Add New Property')}
            </h2>
            <button
              onClick={() => {
                setShowPropertyModal(false);
                setEditingProperty(null);
                resetPropertyForm();
              }}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.propertyManager.address', 'Address *')}</label>
              <input
                type="text"
                value={propertyForm.address || ''}
                onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                placeholder={t('tools.propertyManager.123MainStreetCityState', '123 Main Street, City, State')}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.propertyType', 'Property Type')}</label>
                <select
                  value={propertyForm.type || 'apartment'}
                  onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value as PropertyType })}
                  className={inputClass}
                >
                  {PROPERTY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.status2', 'Status')}</label>
                <select
                  value={propertyForm.status || 'available'}
                  onChange={(e) => setPropertyForm({ ...propertyForm, status: e.target.value as PropertyStatus })}
                  className={inputClass}
                >
                  {PROPERTY_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.bedrooms', 'Bedrooms')}</label>
                <input
                  type="number"
                  value={propertyForm.bedrooms || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: parseInt(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.bathrooms', 'Bathrooms')}</label>
                <input
                  type="number"
                  value={propertyForm.bathrooms || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.squareFeet', 'Square Feet')}</label>
                <input
                  type="number"
                  value={propertyForm.sqft || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, sqft: parseInt(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.monthlyRent', 'Monthly Rent ($) *')}</label>
                <input
                  type="number"
                  value={propertyForm.rentAmount || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, rentAmount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.securityDeposit', 'Security Deposit ($)')}</label>
                <input
                  type="number"
                  value={propertyForm.depositAmount || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, depositAmount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.description2', 'Description')}</label>
              <textarea
                value={propertyForm.description || ''}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                placeholder={t('tools.propertyManager.propertyDescription', 'Property description...')}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => { setShowPropertyModal(false); setEditingProperty(null); resetPropertyForm(); }} className={buttonSecondary}>
              {t('tools.propertyManager.cancel5', 'Cancel')}
            </button>
            <button
              onClick={editingProperty ? handleUpdateProperty : handleAddProperty}
              disabled={!propertyForm.address || !propertyForm.rentAmount}
              className={`${buttonPrimary} disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              {editingProperty ? t('tools.propertyManager.updateProperty', 'Update Property') : t('tools.propertyManager.addProperty', 'Add Property')}
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Tenant Modal
  const renderTenantModal = () => (
    showTenantModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyManager.addNewTenant', 'Add New Tenant')}</h2>
            <button onClick={() => { setShowTenantModal(false); resetTenantForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.firstName', 'First Name *')}</label>
                <input type="text" value={tenantForm.firstName || ''} onChange={(e) => setTenantForm({ ...tenantForm, firstName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.lastName', 'Last Name *')}</label>
                <input type="text" value={tenantForm.lastName || ''} onChange={(e) => setTenantForm({ ...tenantForm, lastName: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.email', 'Email')}</label>
              <input type="email" value={tenantForm.email || ''} onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.phone', 'Phone')}</label>
              <input type="tel" value={tenantForm.phone || ''} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.rentDueDay131', 'Rent Due Day (1-31)')}</label>
              <input type="number" value={tenantForm.rentDueDay || 1} onChange={(e) => setTenantForm({ ...tenantForm, rentDueDay: parseInt(e.target.value) || 1 })} min="1" max="31" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.leaseStartDate', 'Lease Start Date')}</label>
                <input type="date" value={tenantForm.leaseStartDate || ''} onChange={(e) => setTenantForm({ ...tenantForm, leaseStartDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.leaseEndDate', 'Lease End Date')}</label>
                <input type="date" value={tenantForm.leaseEndDate || ''} onChange={(e) => setTenantForm({ ...tenantForm, leaseEndDate: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.emergencyContact', 'Emergency Contact')}</label>
              <input type="text" value={tenantForm.emergencyContact || ''} onChange={(e) => setTenantForm({ ...tenantForm, emergencyContact: e.target.value })} placeholder={t('tools.propertyManager.namePhone', 'Name - Phone')} className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => { setShowTenantModal(false); resetTenantForm(); }} className={buttonSecondary}>{t('tools.propertyManager.cancel', 'Cancel')}</button>
            <button onClick={handleAddTenant} disabled={!tenantForm.firstName || !tenantForm.lastName} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Add Tenant
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Maintenance Modal
  const renderMaintenanceModal = () => (
    showMaintenanceModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyManager.newMaintenanceRequest', 'New Maintenance Request')}</h2>
            <button onClick={() => setShowMaintenanceModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.propertyManager.property4', 'Property *')}</label>
              <select value={maintenanceForm.propertyId || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, propertyId: e.target.value })} className={inputClass}>
                <option value="">{t('tools.propertyManager.selectProperty', 'Select property...')}</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.title', 'Title *')}</label>
              <input type="text" value={maintenanceForm.title || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })} placeholder={t('tools.propertyManager.briefDescriptionOfIssue', 'Brief description of issue')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.description3', 'Description')}</label>
              <textarea value={maintenanceForm.description || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.priority', 'Priority')}</label>
                <select value={maintenanceForm.priority || 'medium'} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value as MaintenanceRequest['priority'] })} className={inputClass}>
                  <option value="low">{t('tools.propertyManager.low', 'Low')}</option>
                  <option value="medium">{t('tools.propertyManager.medium', 'Medium')}</option>
                  <option value="high">{t('tools.propertyManager.high', 'High')}</option>
                  <option value="urgent">{t('tools.propertyManager.urgent', 'Urgent')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.estimatedCost', 'Estimated Cost ($)')}</label>
                <input type="number" value={maintenanceForm.estimatedCost || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, estimatedCost: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
              </div>
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowMaintenanceModal(false)} className={buttonSecondary}>{t('tools.propertyManager.cancel2', 'Cancel')}</button>
            <button onClick={handleAddMaintenanceRequest} disabled={!maintenanceForm.propertyId || !maintenanceForm.title} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Create Request
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Payment Modal
  const renderPaymentModal = () => (
    showPaymentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyManager.recordPayment', 'Record Payment')}</h2>
            <button onClick={() => setShowPaymentModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.propertyManager.property5', 'Property *')}</label>
              <select
                value={paymentForm.propertyId || ''}
                onChange={(e) => {
                  const propertyId = e.target.value;
                  const tenant = getTenantByPropertyId(propertyId);
                  const property = getPropertyById(propertyId);
                  setPaymentForm({
                    ...paymentForm,
                    propertyId,
                    tenantId: tenant?.id || '',
                    amount: property?.rentAmount || 0,
                  });
                }}
                className={inputClass}
              >
                <option value="">{t('tools.propertyManager.selectProperty2', 'Select property...')}</option>
                {properties.filter(p => p.status === 'rented').map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.amount3', 'Amount ($) *')}</label>
                <input type="number" value={paymentForm.amount || ''} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.dueDate2', 'Due Date')}</label>
                <input type="date" value={paymentForm.dueDate || ''} onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.status3', 'Status')}</label>
              <select value={paymentForm.status || 'pending'} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as PaymentStatus })} className={inputClass}>
                <option value="pending">{t('tools.propertyManager.pending', 'Pending')}</option>
                <option value="paid">{t('tools.propertyManager.paid', 'Paid')}</option>
                <option value="overdue">{t('tools.propertyManager.overdue', 'Overdue')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.notes', 'Notes')}</label>
              <textarea value={paymentForm.notes || ''} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} rows={2} className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowPaymentModal(false)} className={buttonSecondary}>{t('tools.propertyManager.cancel3', 'Cancel')}</button>
            <button onClick={handleAddPayment} disabled={!paymentForm.propertyId || !paymentForm.amount} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Record Payment
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Expense Modal
  const renderExpenseModal = () => (
    showExpenseModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyManager.addExpense', 'Add Expense')}</h2>
            <button onClick={() => setShowExpenseModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.propertyManager.property6', 'Property *')}</label>
              <select value={expenseForm.propertyId || ''} onChange={(e) => setExpenseForm({ ...expenseForm, propertyId: e.target.value })} className={inputClass}>
                <option value="">{t('tools.propertyManager.selectProperty3', 'Select property...')}</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.propertyManager.category2', 'Category')}</label>
                <select value={expenseForm.category || 'Repairs'} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className={inputClass}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.propertyManager.amount4', 'Amount ($) *')}</label>
                <input type="number" value={expenseForm.amount || ''} onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.date2', 'Date')}</label>
              <input type="date" value={expenseForm.date || ''} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.propertyManager.description4', 'Description')}</label>
              <textarea value={expenseForm.description || ''} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} rows={2} className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowExpenseModal(false)} className={buttonSecondary}>{t('tools.propertyManager.cancel4', 'Cancel')}</button>
            <button onClick={handleAddExpense} disabled={!expenseForm.propertyId || !expenseForm.amount} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Add Expense
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Assign Tenant Modal
  const renderAssignTenantModal = () => (
    showAssignTenantModal && selectedPropertyId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-md`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyManager.assignTenant', 'Assign Tenant')}</h2>
            <button onClick={() => { setShowAssignTenantModal(false); setSelectedPropertyId(null); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {tenants.filter(t => !t.propertyId).length === 0 ? (
              <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.propertyManager.noUnassignedTenantsAvailableAdd', 'No unassigned tenants available. Add a new tenant first.')}
              </p>
            ) : (
              tenants.filter(t => !t.propertyId).map(tenant => (
                <button
                  key={tenant.id}
                  onClick={() => handleAssignTenant(tenant.id, selectedPropertyId)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-amber-500">
                      {tenant.firstName[0]}{tenant.lastName[0]}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {tenant.firstName} {tenant.lastName}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tenant.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500 font-medium">{t('tools.propertyManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg shadow-amber-500/20">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.propertyManager.propertyManager', 'Property Manager')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.propertyManager.manageYourRealEstatePortfolio', 'Manage your real estate portfolio')}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <WidgetEmbedButton toolSlug="property-manager" toolName="Property Manager" />

                <SyncStatus
                  isSynced={propertiesToolData.isSynced && tenantsToolData.isSynced && maintenanceToolData.isSynced && paymentsToolData.isSynced && expensesToolData.isSynced}
                  isSaving={propertiesToolData.isSaving || tenantsToolData.isSaving || maintenanceToolData.isSaving || paymentsToolData.isSaving || expensesToolData.isSaving}
                  lastSaved={propertiesToolData.lastSaved || tenantsToolData.lastSaved || maintenanceToolData.lastSaved || paymentsToolData.lastSaved || expensesToolData.lastSaved}
                  syncError={propertiesToolData.syncError || tenantsToolData.syncError || maintenanceToolData.syncError || paymentsToolData.syncError || expensesToolData.syncError}
                  onForceSync={() => {
                    propertiesToolData.forceSync();
                    tenantsToolData.forceSync();
                    maintenanceToolData.forceSync();
                    paymentsToolData.forceSync();
                    expensesToolData.forceSync();
                  }}
                  theme={isDark ? 'dark' : 'light'}
                  showLabel={true}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {renderStats()}

        {/* Tabs */}
        <div className={cardClass}>
          <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {[
              { id: 'properties', label: 'Properties', icon: Building },
              { id: 'tenants', label: 'Tenants', icon: Users },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'expenses', label: 'Expenses', icon: Receipt },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-500'
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'properties' && renderPropertiesTab()}
            {activeTab === 'tenants' && renderTenantsTab()}
            {activeTab === 'maintenance' && renderMaintenanceTab()}
            {activeTab === 'payments' && renderPaymentsTab()}
            {activeTab === 'expenses' && renderExpensesTab()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {renderPropertyModal()}
      {renderTenantModal()}
      {renderMaintenanceModal()}
      {renderPaymentModal()}
      {renderExpenseModal()}
      {renderAssignTenantModal()}
      <ConfirmDialog />
    </div>
  );
};

export default PropertyManagerTool;
