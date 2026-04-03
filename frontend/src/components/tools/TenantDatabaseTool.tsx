'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  User,
  Home,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  Search,
  Filter,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wrench,
  Building,
  RefreshCw,
  Download,
  Upload,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface TenantDatabaseToolProps {
  uiConfig?: UIConfig;
}

// Types
type LeaseStatus = 'active' | 'expiring_soon' | 'expired' | 'pending';
type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';
type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
type DocumentType = 'lease' | 'id' | 'income_verification' | 'reference' | 'other';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unit: string;
  propertyId?: string;
  propertyName?: string;
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  status: LeaseStatus;
  createdAt: string;
  updatedAt: string;
}

interface Lease {
  id: string;
  tenantId: string;
  unit: string;
  propertyName?: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  renewalStatus: 'pending' | 'approved' | 'declined' | 'not_applicable';
  terms?: string;
  createdAt: string;
}

interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

interface MaintenanceRequest {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  category: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
}

interface Document {
  id: string;
  tenantId: string;
  name: string;
  type: DocumentType;
  url?: string;
  uploadDate: string;
  expiryDate?: string;
  notes?: string;
}

type TabType = 'tenants' | 'leases' | 'payments' | 'maintenance';

const LEASE_STATUSES: { value: LeaseStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'text-green-500 bg-green-500/10' },
  { value: 'expiring_soon', label: 'Expiring Soon', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'expired', label: 'Expired', color: 'text-red-500 bg-red-500/10' },
  { value: 'pending', label: 'Pending', color: 'text-blue-500 bg-blue-500/10' },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'paid', label: 'Paid', color: 'text-green-500 bg-green-500/10' },
  { value: 'pending', label: 'Pending', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'overdue', label: 'Overdue', color: 'text-red-500 bg-red-500/10' },
  { value: 'partial', label: 'Partial', color: 'text-blue-500 bg-blue-500/10' },
];

const MAINTENANCE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Appliances',
  'Structural',
  'Pest Control',
  'Landscaping',
  'Cleaning',
  'Security',
  'Other',
];

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'lease', label: 'Lease Agreement' },
  { value: 'id', label: 'ID Document' },
  { value: 'income_verification', label: 'Income Verification' },
  { value: 'reference', label: 'Reference Letter' },
  { value: 'other', label: 'Other' },
];

// Combined data structure for backend sync
interface TenantDatabaseData {
  id: string;
  tenants: Tenant[];
  leases: Lease[];
  payments: Payment[];
  maintenanceRequests: MaintenanceRequest[];
  documents: Document[];
}

// Column configuration for export
const tenantColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'propertyName', header: 'Property', type: 'string' },
  { key: 'leaseStartDate', header: 'Lease Start', type: 'date' },
  { key: 'leaseEndDate', header: 'Lease End', type: 'date' },
  { key: 'rentAmount', header: 'Rent', type: 'currency' },
  { key: 'depositAmount', header: 'Deposit', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'boolean' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'emergencyContact', header: 'Emergency Contact', type: 'string' },
  { key: 'emergencyPhone', header: 'Emergency Phone', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Column config for the combined data (simplified for useToolData)
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'tenants', header: 'Tenants', type: 'string' },
  { key: 'leases', header: 'Leases', type: 'string' },
  { key: 'payments', header: 'Payments', type: 'string' },
  { key: 'maintenanceRequests', header: 'Maintenance', type: 'string' },
  { key: 'documents', header: 'Documents', type: 'string' },
];

// Sample data generator
const generateSampleData = () => {
  const now = new Date();
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const tenants: Tenant[] = [
    {
      id: 'tenant-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      unit: 'Unit 101',
      propertyName: 'Sunset Apartments',
      leaseStartDate: oneMonthAgo.toISOString().split('T')[0],
      leaseEndDate: oneYearFromNow.toISOString().split('T')[0],
      rentAmount: 1500,
      depositAmount: 1500,
      depositPaid: true,
      emergencyContact: 'Jane Smith',
      emergencyPhone: '(555) 987-6543',
      status: 'active',
      createdAt: oneMonthAgo.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'tenant-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 234-5678',
      unit: 'Unit 205',
      propertyName: 'Sunset Apartments',
      leaseStartDate: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      leaseEndDate: threeMonthsFromNow.toISOString().split('T')[0],
      rentAmount: 1800,
      depositAmount: 1800,
      depositPaid: true,
      emergencyContact: 'Mike Johnson',
      emergencyPhone: '(555) 876-5432',
      status: 'expiring_soon',
      createdAt: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'tenant-3',
      firstName: 'Michael',
      lastName: 'Davis',
      email: 'mdavis@email.com',
      phone: '(555) 345-6789',
      unit: 'Unit 302',
      propertyName: 'Oak Street Complex',
      leaseStartDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0],
      leaseEndDate: new Date(now.getFullYear() + 1, now.getMonth() + 1, 1).toISOString().split('T')[0],
      rentAmount: 2200,
      depositAmount: 2200,
      depositPaid: false,
      status: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const leases: Lease[] = tenants.map(t => ({
    id: `lease-${t.id}`,
    tenantId: t.id,
    unit: t.unit,
    propertyName: t.propertyName,
    startDate: t.leaseStartDate,
    endDate: t.leaseEndDate,
    rentAmount: t.rentAmount,
    depositAmount: t.depositAmount,
    renewalStatus: t.status === 'expiring_soon' ? 'pending' : 'not_applicable',
    terms: '12-month lease agreement',
    createdAt: t.createdAt,
  }));

  const payments: Payment[] = [
    {
      id: 'pay-1',
      tenantId: 'tenant-1',
      amount: 1500,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      paidDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      createdAt: now.toISOString(),
    },
    {
      id: 'pay-2',
      tenantId: 'tenant-2',
      amount: 1800,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      status: 'pending',
      createdAt: now.toISOString(),
    },
    {
      id: 'pay-3',
      tenantId: 'tenant-1',
      amount: 1500,
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
      paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 2).toISOString().split('T')[0],
      status: 'paid',
      paymentMethod: 'Check',
      createdAt: oneMonthAgo.toISOString(),
    },
  ];

  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 'maint-1',
      tenantId: 'tenant-1',
      title: 'Leaky Faucet',
      description: 'Kitchen faucet is dripping constantly',
      priority: 'medium',
      status: 'pending',
      category: 'Plumbing',
      estimatedCost: 150,
      createdAt: now.toISOString(),
    },
    {
      id: 'maint-2',
      tenantId: 'tenant-2',
      title: 'AC Not Cooling',
      description: 'Air conditioning unit is not cooling properly',
      priority: 'high',
      status: 'in_progress',
      category: 'HVAC',
      estimatedCost: 500,
      scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString().split('T')[0],
      createdAt: oneMonthAgo.toISOString(),
    },
  ];

  const documents: Document[] = [
    {
      id: 'doc-1',
      tenantId: 'tenant-1',
      name: 'Lease Agreement - John Smith',
      type: 'lease',
      uploadDate: oneMonthAgo.toISOString(),
    },
    {
      id: 'doc-2',
      tenantId: 'tenant-1',
      name: 'Driver License',
      type: 'id',
      uploadDate: oneMonthAgo.toISOString(),
    },
    {
      id: 'doc-3',
      tenantId: 'tenant-2',
      name: 'Lease Agreement - Sarah Johnson',
      type: 'lease',
      uploadDate: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString(),
    },
  ];

  return { tenants, leases, payments, maintenanceRequests, documents };
};

export const TenantDatabaseTool: React.FC<TenantDatabaseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Default data with sample data
  const defaultData: TenantDatabaseData[] = [{
    id: 'tenant-database-main',
    ...generateSampleData()
  }];

  // Use the useToolData hook for backend persistence
  const {
    data: toolData,
    setData: setToolData,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<TenantDatabaseData>('tenant-database', defaultData, COLUMNS);

  // Extract data from the combined structure
  const tenants = toolData[0]?.tenants || [];
  const leases = toolData[0]?.leases || [];
  const payments = toolData[0]?.payments || [];
  const maintenanceRequests = toolData[0]?.maintenanceRequests || [];
  const documents = toolData[0]?.documents || [];

  // Helper to update the combined data
  const updateDatabaseData = (updates: Partial<Omit<TenantDatabaseData, 'id'>>) => {
    const currentData = toolData[0] || { id: 'tenant-database-main', tenants: [], leases: [], payments: [], maintenanceRequests: [], documents: [] };
    updateItem('tenant-database-main', {
      ...updates
    });
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('tenants');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaseExpiryFilter, setLeaseExpiryFilter] = useState<'all' | '30days' | '60days' | '90days'>('all');

  // Modal states
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showTenantDetailModal, setShowTenantDetailModal] = useState(false);

  // Edit states
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form states
  const [tenantForm, setTenantForm] = useState<Partial<Tenant>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    unit: '',
    propertyName: '',
    leaseStartDate: new Date().toISOString().split('T')[0],
    leaseEndDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0],
    rentAmount: 0,
    depositAmount: 0,
    depositPaid: false,
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    status: 'pending',
  });

  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({
    tenantId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: '',
    notes: '',
  });

  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceRequest>>({
    tenantId: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    category: 'Other',
    estimatedCost: 0,
  });

  const [documentForm, setDocumentForm] = useState<Partial<Document>>({
    tenantId: '',
    name: '',
    type: 'other',
    url: '',
    notes: '',
  });

  // Data is automatically loaded and synced via useToolData hook

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.tenantName || params.firstName || params.unit) {
        const nameParts = (params.tenantName || '').split(' ');
        setTenantForm(prev => ({
          ...prev,
          firstName: params.firstName || nameParts[0] || prev.firstName,
          lastName: params.lastName || nameParts.slice(1).join(' ') || prev.lastName,
          email: params.email || prev.email,
          phone: params.phone || prev.phone,
          unit: params.unit || prev.unit,
          rentAmount: params.rent || params.amount || prev.rentAmount,
        }));
        setShowTenantModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Data is automatically saved via useToolData hook

  // Computed stats
  const stats = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const expiringSoon = tenants.filter(t => t.status === 'expiring_soon').length;
    const totalRentIncome = tenants.filter(t => t.status === 'active').reduce((sum, t) => sum + t.rentAmount, 0);
    const overduePayments = payments.filter(p => p.status === 'overdue').length;
    const pendingMaintenance = maintenanceRequests.filter(m => m.status === 'pending' || m.status === 'in_progress').length;
    const totalCollected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    return {
      totalTenants,
      activeTenants,
      expiringSoon,
      totalRentIncome,
      overduePayments,
      pendingMaintenance,
      totalCollected,
      occupancyRate: totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0,
    };
  }, [tenants, payments, maintenanceRequests]);

  // Get unique property names
  const propertyNames = useMemo(() => {
    const names = new Set(tenants.map(t => t.propertyName).filter(Boolean));
    return Array.from(names) as string[];
  }, [tenants]);

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesProperty = propertyFilter === 'all' || t.propertyName === propertyFilter;
      const matchesSearch = !searchQuery ||
        t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.unit.toLowerCase().includes(searchQuery.toLowerCase());

      // Lease expiry filter
      let matchesExpiry = true;
      if (leaseExpiryFilter !== 'all') {
        const daysUntilExpiry = Math.ceil((new Date(t.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const filterDays = leaseExpiryFilter === '30days' ? 30 : leaseExpiryFilter === '60days' ? 60 : 90;
        matchesExpiry = daysUntilExpiry <= filterDays && daysUntilExpiry > 0;
      }

      return matchesStatus && matchesProperty && matchesSearch && matchesExpiry;
    });
  }, [tenants, statusFilter, propertyFilter, searchQuery, leaseExpiryFilter]);

  // Helper functions
  const getTenantById = (id: string) => tenants.find(t => t.id === id);
  const getPaymentsByTenant = (tenantId: string) => payments.filter(p => p.tenantId === tenantId);
  const getMaintenanceByTenant = (tenantId: string) => maintenanceRequests.filter(m => m.tenantId === tenantId);
  const getDocumentsByTenant = (tenantId: string) => documents.filter(d => d.tenantId === tenantId);

  const calculateLeaseStatus = (endDate: string): LeaseStatus => {
    const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 60) return 'expiring_soon';
    return 'active';
  };

  // CRUD operations
  const handleAddTenant = async () => {
    if (!tenantForm.firstName || !tenantForm.lastName || !tenantForm.unit) return;

    const status = tenantForm.leaseEndDate ? calculateLeaseStatus(tenantForm.leaseEndDate) : 'pending';

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      firstName: tenantForm.firstName || '',
      lastName: tenantForm.lastName || '',
      email: tenantForm.email || '',
      phone: tenantForm.phone || '',
      unit: tenantForm.unit || '',
      propertyName: tenantForm.propertyName,
      leaseStartDate: tenantForm.leaseStartDate || new Date().toISOString().split('T')[0],
      leaseEndDate: tenantForm.leaseEndDate || new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0],
      rentAmount: tenantForm.rentAmount || 0,
      depositAmount: tenantForm.depositAmount || 0,
      depositPaid: tenantForm.depositPaid || false,
      emergencyContact: tenantForm.emergencyContact,
      emergencyPhone: tenantForm.emergencyPhone,
      notes: tenantForm.notes,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create corresponding lease
    const newLease: Lease = {
      id: `lease-${newTenant.id}`,
      tenantId: newTenant.id,
      unit: newTenant.unit,
      propertyName: newTenant.propertyName,
      startDate: newTenant.leaseStartDate,
      endDate: newTenant.leaseEndDate,
      rentAmount: newTenant.rentAmount,
      depositAmount: newTenant.depositAmount,
      renewalStatus: 'not_applicable',
      createdAt: new Date().toISOString(),
    };

    updateDatabaseData({
      tenants: [...tenants, newTenant],
      leases: [...leases, newLease]
    });
    resetTenantForm();
    setShowTenantModal(false);
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;

    const status = tenantForm.leaseEndDate ? calculateLeaseStatus(tenantForm.leaseEndDate) : editingTenant.status;

    const updatedTenant: Tenant = {
      ...editingTenant,
      ...tenantForm,
      status,
      updatedAt: new Date().toISOString(),
    } as Tenant;

    const updatedTenants = tenants.map(t => t.id === editingTenant.id ? updatedTenant : t);
    const updatedLeases = leases.map(l => l.tenantId === editingTenant.id ? {
      ...l,
      unit: updatedTenant.unit,
      propertyName: updatedTenant.propertyName,
      startDate: updatedTenant.leaseStartDate,
      endDate: updatedTenant.leaseEndDate,
      rentAmount: updatedTenant.rentAmount,
      depositAmount: updatedTenant.depositAmount,
    } : l);

    updateDatabaseData({
      tenants: updatedTenants,
      leases: updatedLeases
    });

    resetTenantForm();
    setEditingTenant(null);
    setShowTenantModal(false);
  };

  const handleDeleteTenant = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Tenant',
      message: 'Are you sure you want to delete this tenant? This will also remove all associated records.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;

    updateDatabaseData({
      tenants: tenants.filter(t => t.id !== id),
      leases: leases.filter(l => l.tenantId !== id),
      payments: payments.filter(p => p.tenantId !== id),
      maintenanceRequests: maintenanceRequests.filter(m => m.tenantId !== id),
      documents: documents.filter(d => d.tenantId !== id)
    });
  };

  const handleAddPayment = async () => {
    if (!paymentForm.tenantId || !paymentForm.amount) return;

    const tenant = getTenantById(paymentForm.tenantId);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      tenantId: paymentForm.tenantId,
      amount: paymentForm.amount || 0,
      dueDate: paymentForm.dueDate || new Date().toISOString().split('T')[0],
      paidDate: paymentForm.status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
      status: paymentForm.status || 'pending',
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
      createdAt: new Date().toISOString(),
    };

    updateDatabaseData({
      payments: [...payments, newPayment]
    });
    setPaymentForm({
      tenantId: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      paymentMethod: '',
      notes: '',
    });
    setShowPaymentModal(false);
  };

  const handleUpdatePaymentStatus = (id: string, status: PaymentStatus) => {
    updateDatabaseData({
      payments: payments.map(p =>
        p.id === id
          ? { ...p, status, paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : p.paidDate }
          : p
      )
    });
  };

  const handleAddMaintenanceRequest = async () => {
    if (!maintenanceForm.tenantId || !maintenanceForm.title) return;

    const newRequest: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      tenantId: maintenanceForm.tenantId,
      title: maintenanceForm.title || '',
      description: maintenanceForm.description || '',
      priority: maintenanceForm.priority || 'medium',
      status: maintenanceForm.status || 'pending',
      category: maintenanceForm.category || 'Other',
      estimatedCost: maintenanceForm.estimatedCost,
      notes: maintenanceForm.notes,
      createdAt: new Date().toISOString(),
    };

    setMaintenanceRequests([...maintenanceRequests, newRequest]);
    setMaintenanceForm({
      tenantId: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      category: 'Other',
      estimatedCost: 0,
    });
    setShowMaintenanceModal(false);
  };

  const handleUpdateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
    setMaintenanceRequests(maintenanceRequests.map(m =>
      m.id === id
        ? { ...m, status, completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : m.completedDate }
        : m
    ));
  };

  const handleAddDocument = () => {
    if (!documentForm.tenantId || !documentForm.name) return;

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      tenantId: documentForm.tenantId,
      name: documentForm.name || '',
      type: documentForm.type || 'other',
      url: documentForm.url,
      uploadDate: new Date().toISOString(),
      notes: documentForm.notes,
    };

    setDocuments([...documents, newDocument]);
    setDocumentForm({
      tenantId: '',
      name: '',
      type: 'other',
      url: '',
      notes: '',
    });
    setShowDocumentModal(false);
  };

  const handleUpdateLeaseRenewal = (leaseId: string, status: Lease['renewalStatus']) => {
    setLeases(leases.map(l => l.id === leaseId ? { ...l, renewalStatus: status } : l));
  };

  const resetTenantForm = () => {
    setTenantForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      unit: '',
      propertyName: '',
      leaseStartDate: new Date().toISOString().split('T')[0],
      leaseEndDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0],
      rentAmount: 0,
      depositAmount: 0,
      depositPaid: false,
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
      status: 'pending',
    });
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
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Tenants</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalTenants}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Leases</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeTenants}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Expiring Soon</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.expiringSoon}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Income</p>
            <p className={`text-2xl font-bold text-green-500`}>${stats.totalRentIncome.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tenants tab
  const renderTenantsTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-10 w-64`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeaseStatus | 'all')}
            className={inputClass}
          >
            <option value="all">All Status</option>
            {LEASE_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">All Properties</option>
            {propertyNames.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={leaseExpiryFilter}
            onChange={(e) => setLeaseExpiryFilter(e.target.value as any)}
            className={inputClass}
          >
            <option value="all">Any Expiry</option>
            <option value="30days">Expiring in 30 days</option>
            <option value="60days">Expiring in 60 days</option>
            <option value="90days">Expiring in 90 days</option>
          </select>
        </div>
        <button onClick={() => setShowTenantModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          Add Tenant
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.map(tenant => {
          const statusInfo = LEASE_STATUSES.find(s => s.value === tenant.status);
          const tenantPayments = getPaymentsByTenant(tenant.id);
          const pendingPayments = tenantPayments.filter(p => p.status === 'pending' || p.status === 'overdue').length;

          return (
            <div key={tenant.id} className={`${cardClass} p-4 hover:shadow-lg transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-amber-500">
                      {tenant.firstName[0]}{tenant.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {tenant.firstName} {tenant.lastName}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {tenant.unit}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                  {statusInfo?.label}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{tenant.email}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Phone className="w-4 h-4" />
                  <span>{tenant.phone}</span>
                </div>
                {tenant.propertyName && (
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Building className="w-4 h-4" />
                    <span>{tenant.propertyName}</span>
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between py-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.rent', 'Rent')}</p>
                  <p className="text-lg font-bold text-amber-500">${tenant.rentAmount.toLocaleString()}/mo</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.leaseEnds', 'Lease Ends')}</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(tenant.leaseEndDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {pendingPayments > 0 && (
                <div className={`mt-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm flex items-center gap-2`}>
                  <AlertCircle className="w-4 h-4" />
                  {pendingPayments} pending payment{pendingPayments > 1 ? 's' : ''}
                </div>
              )}

              <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} mt-3`}>
                <button
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setShowTenantDetailModal(true);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {t('tools.tenantDatabase.view', 'View')}
                </button>
                <button
                  onClick={() => {
                    setEditingTenant(tenant);
                    setTenantForm(tenant);
                    setShowTenantModal(true);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-colors ${
                    isDark ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  {t('tools.tenantDatabase.edit', 'Edit')}
                </button>
                <button
                  onClick={() => handleDeleteTenant(tenant.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTenants.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.noTenantsFound', 'No tenants found')}</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.tenantDatabase.addYourFirstTenantTo', 'Add your first tenant to get started')}</p>
        </div>
      )}
    </div>
  );

  // Render leases tab
  const renderLeasesTab = () => (
    <div className="space-y-4">
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.tenant', 'Tenant')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.unit', 'Unit')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.startDate', 'Start Date')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.endDate', 'End Date')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.rent2', 'Rent')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.renewalStatus', 'Renewal Status')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {leases.map(lease => {
                const tenant = getTenantById(lease.tenantId);
                const daysUntilExpiry = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const renewalColors = {
                  pending: 'text-amber-500 bg-amber-500/10',
                  approved: 'text-green-500 bg-green-500/10',
                  declined: 'text-red-500 bg-red-500/10',
                  not_applicable: 'text-gray-500 bg-gray-500/10',
                };

                return (
                  <tr key={lease.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown'}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div>
                        <p>{lease.unit}</p>
                        {lease.propertyName && (
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{lease.propertyName}</p>
                        )}
                      </div>
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(lease.startDate).toLocaleDateString()}
                    </td>
                    <td className={`py-3 px-4`}>
                      <div className={daysUntilExpiry <= 60 && daysUntilExpiry > 0 ? 'text-amber-500' : daysUntilExpiry <= 0 ? 'text-red-500' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(lease.endDate).toLocaleDateString()}
                        {daysUntilExpiry > 0 && daysUntilExpiry <= 60 && (
                          <span className="block text-xs">({daysUntilExpiry} days left)</span>
                        )}
                        {daysUntilExpiry <= 0 && (
                          <span className="block text-xs">{t('tools.tenantDatabase.expired', 'Expired')}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-500">
                      ${lease.rentAmount.toLocaleString()}/mo
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${renewalColors[lease.renewalStatus]}`}>
                        {lease.renewalStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {daysUntilExpiry <= 60 && daysUntilExpiry > 0 && lease.renewalStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateLeaseRenewal(lease.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            {t('tools.tenantDatabase.renew', 'Renew')}
                          </button>
                          <button
                            onClick={() => handleUpdateLeaseRenewal(lease.id, 'declined')}
                            className="px-3 py-1.5 rounded-lg text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            {t('tools.tenantDatabase.end', 'End')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {leases.length === 0 && (
          <div className="text-center py-12">
            <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.noLeasesFound', 'No leases found')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render payments tab
  const renderPaymentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowPaymentModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.tenantDatabase.recordPayment2', 'Record Payment')}
        </button>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.tenant2', 'Tenant')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.amount', 'Amount')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.dueDate', 'Due Date')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.paidDate', 'Paid Date')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.method', 'Method')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.status', 'Status')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.actions2', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map(payment => {
                const tenant = getTenantById(payment.tenantId);
                const statusInfo = PAYMENT_STATUSES.find(s => s.value === payment.status);

                return (
                  <tr key={payment.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-500">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {payment.paymentMethod || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(payment.id, 'paid')}
                          className="px-3 py-1.5 rounded-lg text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        >
                          {t('tools.tenantDatabase.markPaid', 'Mark Paid')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.noPaymentRecords', 'No payment records')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render maintenance tab
  const renderMaintenanceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowMaintenanceModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.tenantDatabase.newRequest', 'New Request')}
        </button>
      </div>

      <div className="grid gap-4">
        {maintenanceRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(request => {
          const tenant = getTenantById(request.tenantId);
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
            cancelled: 'text-red-500 bg-red-500/10',
          };

          return (
            <div key={request.id} className={`${cardClass} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tenant ? `${tenant.firstName} ${tenant.lastName} - ${tenant.unit}` : 'Unknown tenant'}
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
              <div className="flex flex-wrap gap-4 text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  Category: {request.category}
                </span>
                {request.estimatedCost && (
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Est. Cost: ${request.estimatedCost}
                  </span>
                )}
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  Created: {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                {request.status !== 'completed' && request.status !== 'cancelled' && (
                  <>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateMaintenanceStatus(request.id, 'in_progress')}
                        className={`px-3 py-1.5 rounded-lg text-sm ${buttonSecondary}`}
                      >
                        {t('tools.tenantDatabase.startWork', 'Start Work')}
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateMaintenanceStatus(request.id, 'completed')}
                      className="px-3 py-1.5 rounded-lg text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    >
                      {t('tools.tenantDatabase.complete', 'Complete')}
                    </button>
                    <button
                      onClick={() => handleUpdateMaintenanceStatus(request.id, 'cancelled')}
                      className="px-3 py-1.5 rounded-lg text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      {t('tools.tenantDatabase.cancel4', 'Cancel')}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {maintenanceRequests.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Wrench className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.noMaintenanceRequests', 'No maintenance requests')}</p>
        </div>
      )}
    </div>
  );

  // Render Tenant Modal
  const renderTenantModal = () => (
    showTenantModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingTenant ? t('tools.tenantDatabase.editTenant', 'Edit Tenant') : t('tools.tenantDatabase.addNewTenant', 'Add New Tenant')}
            </h2>
            <button
              onClick={() => {
                setShowTenantModal(false);
                setEditingTenant(null);
                resetTenantForm();
              }}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {/* Personal Information */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tenantDatabase.personalInformation', 'Personal Information')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={tenantForm.firstName || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, firstName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={tenantForm.lastName || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, lastName: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.email', 'Email')}</label>
                  <input
                    type="email"
                    value={tenantForm.email || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={tenantForm.phone || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.emergencyContact', 'Emergency Contact')}</label>
                  <input
                    type="text"
                    value={tenantForm.emergencyContact || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, emergencyContact: e.target.value })}
                    placeholder={t('tools.tenantDatabase.contactName', 'Contact name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.emergencyPhone', 'Emergency Phone')}</label>
                  <input
                    type="tel"
                    value={tenantForm.emergencyPhone || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, emergencyPhone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Unit & Lease Information */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tenantDatabase.unitLeaseInformation', 'Unit & Lease Information')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.unit2', 'Unit *')}</label>
                  <input
                    type="text"
                    value={tenantForm.unit || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, unit: e.target.value })}
                    placeholder={t('tools.tenantDatabase.eGUnit101', 'e.g., Unit 101')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.propertyName', 'Property Name')}</label>
                  <input
                    type="text"
                    value={tenantForm.propertyName || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, propertyName: e.target.value })}
                    placeholder={t('tools.tenantDatabase.eGSunsetApartments', 'e.g., Sunset Apartments')}
                    className={inputClass}
                    list="property-names"
                  />
                  <datalist id="property-names">
                    {propertyNames.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.leaseStartDate', 'Lease Start Date')}</label>
                  <input
                    type="date"
                    value={tenantForm.leaseStartDate || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, leaseStartDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.leaseEndDate', 'Lease End Date')}</label>
                  <input
                    type="date"
                    value={tenantForm.leaseEndDate || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, leaseEndDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tenantDatabase.financialInformation', 'Financial Information')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.monthlyRent', 'Monthly Rent ($)')}</label>
                  <input
                    type="number"
                    value={tenantForm.rentAmount || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, rentAmount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.tenantDatabase.securityDeposit', 'Security Deposit ($)')}</label>
                  <input
                    type="number"
                    value={tenantForm.depositAmount || ''}
                    onChange={(e) => setTenantForm({ ...tenantForm, depositAmount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tenantForm.depositPaid || false}
                    onChange={(e) => setTenantForm({ ...tenantForm, depositPaid: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tenantDatabase.depositPaid', 'Deposit Paid')}</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.notes', 'Notes')}</label>
              <textarea
                value={tenantForm.notes || ''}
                onChange={(e) => setTenantForm({ ...tenantForm, notes: e.target.value })}
                placeholder={t('tools.tenantDatabase.anyAdditionalNotes', 'Any additional notes...')}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => { setShowTenantModal(false); setEditingTenant(null); resetTenantForm(); }} className={buttonSecondary}>
              {t('tools.tenantDatabase.cancel5', 'Cancel')}
            </button>
            <button
              onClick={editingTenant ? handleUpdateTenant : handleAddTenant}
              disabled={!tenantForm.firstName || !tenantForm.lastName || !tenantForm.unit}
              className={`${buttonPrimary} disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              {editingTenant ? t('tools.tenantDatabase.updateTenant', 'Update Tenant') : t('tools.tenantDatabase.addTenant', 'Add Tenant')}
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
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tenantDatabase.recordPayment', 'Record Payment')}</h2>
            <button onClick={() => setShowPaymentModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.tenant3', 'Tenant *')}</label>
              <select
                value={paymentForm.tenantId || ''}
                onChange={(e) => {
                  const tenant = getTenantById(e.target.value);
                  setPaymentForm({
                    ...paymentForm,
                    tenantId: e.target.value,
                    amount: tenant?.rentAmount || 0,
                  });
                }}
                className={inputClass}
              >
                <option value="">{t('tools.tenantDatabase.selectTenant', 'Select tenant...')}</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} - {t.unit}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.tenantDatabase.amount2', 'Amount ($) *')}</label>
                <input type="number" value={paymentForm.amount || ''} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.tenantDatabase.dueDate2', 'Due Date')}</label>
                <input type="date" value={paymentForm.dueDate || ''} onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.tenantDatabase.status2', 'Status')}</label>
                <select value={paymentForm.status || 'pending'} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as PaymentStatus })} className={inputClass}>
                  {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.tenantDatabase.paymentMethod', 'Payment Method')}</label>
                <input type="text" value={paymentForm.paymentMethod || ''} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} placeholder={t('tools.tenantDatabase.eGBankTransfer', 'e.g., Bank Transfer')} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.notes2', 'Notes')}</label>
              <textarea value={paymentForm.notes || ''} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} rows={2} className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowPaymentModal(false)} className={buttonSecondary}>{t('tools.tenantDatabase.cancel', 'Cancel')}</button>
            <button onClick={handleAddPayment} disabled={!paymentForm.tenantId || !paymentForm.amount} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Record Payment
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
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tenantDatabase.newMaintenanceRequest', 'New Maintenance Request')}</h2>
            <button onClick={() => setShowMaintenanceModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.tenant4', 'Tenant *')}</label>
              <select value={maintenanceForm.tenantId || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, tenantId: e.target.value })} className={inputClass}>
                <option value="">{t('tools.tenantDatabase.selectTenant2', 'Select tenant...')}</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} - {t.unit}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.title', 'Title *')}</label>
              <input type="text" value={maintenanceForm.title || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })} placeholder={t('tools.tenantDatabase.briefDescriptionOfIssue', 'Brief description of issue')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.description', 'Description')}</label>
              <textarea value={maintenanceForm.description || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.tenantDatabase.category', 'Category')}</label>
                <select value={maintenanceForm.category || 'Other'} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, category: e.target.value })} className={inputClass}>
                  {MAINTENANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.tenantDatabase.priority', 'Priority')}</label>
                <select value={maintenanceForm.priority || 'medium'} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value as MaintenancePriority })} className={inputClass}>
                  <option value="low">{t('tools.tenantDatabase.low', 'Low')}</option>
                  <option value="medium">{t('tools.tenantDatabase.medium', 'Medium')}</option>
                  <option value="high">{t('tools.tenantDatabase.high', 'High')}</option>
                  <option value="urgent">{t('tools.tenantDatabase.urgent', 'Urgent')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.estimatedCost', 'Estimated Cost ($)')}</label>
              <input type="number" value={maintenanceForm.estimatedCost || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, estimatedCost: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowMaintenanceModal(false)} className={buttonSecondary}>{t('tools.tenantDatabase.cancel2', 'Cancel')}</button>
            <button onClick={handleAddMaintenanceRequest} disabled={!maintenanceForm.tenantId || !maintenanceForm.title} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Create Request
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Tenant Detail Modal
  const renderTenantDetailModal = () => (
    showTenantDetailModal && selectedTenant && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.tenantDatabase.tenantDetails', 'Tenant Details')}
            </h2>
            <button
              onClick={() => {
                setShowTenantDetailModal(false);
                setSelectedTenant(null);
              }}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-500">
                  {selectedTenant.firstName[0]}{selectedTenant.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTenant.firstName} {selectedTenant.lastName}
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedTenant.unit}</p>
                {selectedTenant.propertyName && (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{selectedTenant.propertyName}</p>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.email2', 'Email')}</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTenant.email || '-'}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.phone2', 'Phone')}</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTenant.phone || '-'}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.leasePeriod', 'Lease Period')}</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(selectedTenant.leaseStartDate).toLocaleDateString()} - {new Date(selectedTenant.leaseEndDate).toLocaleDateString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.monthlyRent2', 'Monthly Rent')}</p>
                <p className="font-bold text-amber-500">${selectedTenant.rentAmount.toLocaleString()}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.securityDeposit2', 'Security Deposit')}</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${selectedTenant.depositAmount.toLocaleString()}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${selectedTenant.depositPaid ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {selectedTenant.depositPaid ? t('tools.tenantDatabase.paid', 'Paid') : t('tools.tenantDatabase.unpaid', 'Unpaid')}
                  </span>
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.emergencyContact2', 'Emergency Contact')}</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTenant.emergencyContact || '-'} {selectedTenant.emergencyPhone && `(${selectedTenant.emergencyPhone})`}
                </p>
              </div>
            </div>

            {/* Payment History */}
            <div className="mb-6">
              <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tenantDatabase.recentPayments', 'Recent Payments')}</h4>
              <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                {getPaymentsByTenant(selectedTenant.id).slice(0, 5).length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className={`text-left py-2 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.date', 'Date')}</th>
                        <th className={`text-left py-2 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.amount3', 'Amount')}</th>
                        <th className={`text-left py-2 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.status3', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaymentsByTenant(selectedTenant.id).slice(0, 5).map(p => {
                        const statusInfo = PAYMENT_STATUSES.find(s => s.value === p.status);
                        return (
                          <tr key={p.id} className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                            <td className={`py-2 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {new Date(p.dueDate).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4 font-semibold text-amber-500">
                              ${p.amount.toLocaleString()}
                            </td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${statusInfo?.color}`}>
                                {statusInfo?.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tenantDatabase.noPaymentRecords2', 'No payment records')}</p>
                )}
              </div>
            </div>

            {/* Maintenance Requests */}
            <div className="mb-6">
              <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tenantDatabase.maintenanceRequests', 'Maintenance Requests')}</h4>
              <div className="space-y-2">
                {getMaintenanceByTenant(selectedTenant.id).length > 0 ? (
                  getMaintenanceByTenant(selectedTenant.id).map(m => (
                    <div key={m.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                          m.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          m.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{m.category}</p>
                    </div>
                  ))
                ) : (
                  <p className={`p-4 text-center rounded-lg ${isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>{t('tools.tenantDatabase.noMaintenanceRequests2', 'No maintenance requests')}</p>
                )}
              </div>
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tenantDatabase.documents', 'Documents')}</h4>
                <button
                  onClick={() => {
                    setDocumentForm({ ...documentForm, tenantId: selectedTenant.id });
                    setShowDocumentModal(true);
                  }}
                  className={`text-sm px-3 py-1.5 rounded-lg ${buttonSecondary}`}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  {t('tools.tenantDatabase.add', 'Add')}
                </button>
              </div>
              <div className="space-y-2">
                {getDocumentsByTenant(selectedTenant.id).length > 0 ? (
                  getDocumentsByTenant(selectedTenant.id).map(doc => (
                    <div key={doc.id} className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{doc.name}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label} - {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`p-4 text-center rounded-lg ${isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>{t('tools.tenantDatabase.noDocumentsUploaded', 'No documents uploaded')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Render Document Modal
  const renderDocumentModal = () => (
    showDocumentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tenantDatabase.addDocument', 'Add Document')}</h2>
            <button onClick={() => setShowDocumentModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {!documentForm.tenantId && (
              <div>
                <label className={labelClass}>{t('tools.tenantDatabase.tenant5', 'Tenant *')}</label>
                <select value={documentForm.tenantId || ''} onChange={(e) => setDocumentForm({ ...documentForm, tenantId: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.tenantDatabase.selectTenant3', 'Select tenant...')}</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.documentName', 'Document Name *')}</label>
              <input type="text" value={documentForm.name || ''} onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })} placeholder={t('tools.tenantDatabase.eGLeaseAgreement2024', 'e.g., Lease Agreement 2024')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.documentType', 'Document Type')}</label>
              <select value={documentForm.type || 'other'} onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value as DocumentType })} className={inputClass}>
                {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.urlReference', 'URL / Reference')}</label>
              <input type="text" value={documentForm.url || ''} onChange={(e) => setDocumentForm({ ...documentForm, url: e.target.value })} placeholder={t('tools.tenantDatabase.linkToDocumentOrFile', 'Link to document or file reference')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.tenantDatabase.notes3', 'Notes')}</label>
              <textarea value={documentForm.notes || ''} onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })} rows={2} className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowDocumentModal(false)} className={buttonSecondary}>{t('tools.tenantDatabase.cancel3', 'Cancel')}</button>
            <button onClick={handleAddDocument} disabled={!documentForm.tenantId || !documentForm.name} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Add Document
            </button>
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
            <span className="text-sm text-amber-500 font-medium">{t('tools.tenantDatabase.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg shadow-amber-500/20">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.tenantDatabase.tenantDatabase', 'Tenant Database')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.tenantDatabase.manageTenantsLeasesAndPayments', 'Manage tenants, leases, and payments')}
                  </p>
                </div>
              </div>
              {tenants.length > 0 && (
                <ExportDropdown
                  onExportCSV={() => exportToCSV(tenants, tenantColumns, { filename: 'tenants' })}
                  onExportExcel={() => exportToExcel(tenants, tenantColumns, { filename: 'tenants' })}
                  onExportJSON={() => exportToJSON(tenants, { filename: 'tenants' })}
                  onExportPDF={() => exportToPDF(tenants, tenantColumns, { filename: 'tenants', title: 'Tenant Database', subtitle: `Total: ${tenants.length} tenants` })}
                  onPrint={() => printData(tenants, tenantColumns, { title: 'Tenant Database' })}
                  onCopyToClipboard={() => copyUtil(tenants, tenantColumns)}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {renderStats()}

        {/* Tabs */}
        <div className={cardClass}>
          <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {[
              { id: 'tenants', label: 'Tenants', icon: Users },
              { id: 'leases', label: 'Leases', icon: FileText },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
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
            {activeTab === 'tenants' && renderTenantsTab()}
            {activeTab === 'leases' && renderLeasesTab()}
            {activeTab === 'payments' && renderPaymentsTab()}
            {activeTab === 'maintenance' && renderMaintenanceTab()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {renderTenantModal()}
      {renderPaymentModal()}
      {renderMaintenanceModal()}
      {renderTenantDetailModal()}
      {renderDocumentModal()}
      <ConfirmDialog />
    </div>
  );
};

export default TenantDatabaseTool;
