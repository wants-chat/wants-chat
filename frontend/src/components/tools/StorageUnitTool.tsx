'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Warehouse,
  Package,
  Key,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  MapPin,
  Thermometer,
  Lock,
  Shield,
  FileText,
  History,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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

// Types
interface StorageUnit {
  id: string;
  unitNumber: string;
  size: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  squareFeet: number;
  cubicFeet: number;
  floor: number;
  building: string;
  monthlyRate: number;
  isClimateControlled: boolean;
  hasElectricity: boolean;
  hasVehicleAccess: boolean;
  securityLevel: 'standard' | 'enhanced' | 'premium';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentTenantId: string | null;
  notes: string;
  createdAt: string;
}

interface StorageTenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  idType: string;
  idNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdAt: string;
}

interface StorageRental {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string | null;
  monthlyRate: number;
  depositAmount: number;
  depositPaid: boolean;
  promoCode: string;
  discountPercent: number;
  accessCode: string;
  insuranceSelected: boolean;
  insuranceAmount: number;
  autoPay: boolean;
  paymentMethod: string;
  status: 'active' | 'pending' | 'expired' | 'terminated';
  moveInDate: string;
  moveOutDate: string | null;
  notes: string;
  createdAt: string;
}

interface PaymentRecord {
  id: string;
  rentalId: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'late' | 'failed' | 'waived';
  lateFee: number;
  notes: string;
  createdAt: string;
}

interface AccessLog {
  id: string;
  unitId: string;
  tenantId: string;
  accessTime: string;
  exitTime: string | null;
  accessType: 'entry' | 'exit';
  notes: string;
}

// Column configurations
const unitColumns: ColumnConfig[] = [
  { key: 'unitNumber', header: 'Unit #', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'squareFeet', header: 'Sq Ft', type: 'number' },
  { key: 'building', header: 'Building', type: 'string' },
  { key: 'floor', header: 'Floor', type: 'number' },
  { key: 'monthlyRate', header: 'Rate', type: 'currency' },
  { key: 'isClimateControlled', header: 'Climate', type: 'boolean' },
  { key: 'status', header: 'Status', type: 'string' },
];

const tenantColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const rentalColumns: ColumnConfig[] = [
  { key: 'id', header: 'Rental ID', type: 'string' },
  { key: 'unitId', header: 'Unit', type: 'string' },
  { key: 'tenantId', header: 'Tenant', type: 'string' },
  { key: 'startDate', header: 'Start', type: 'date' },
  { key: 'monthlyRate', header: 'Rate', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Size presets
const SIZE_PRESETS: Record<string, { width: number; depth: number; height: number; sqft: number }> = {
  '5x5': { width: 5, depth: 5, height: 8, sqft: 25 },
  '5x10': { width: 5, depth: 10, height: 8, sqft: 50 },
  '10x10': { width: 10, depth: 10, height: 8, sqft: 100 },
  '10x15': { width: 10, depth: 15, height: 8, sqft: 150 },
  '10x20': { width: 10, depth: 20, height: 8, sqft: 200 },
  '10x25': { width: 10, depth: 25, height: 10, sqft: 250 },
  '10x30': { width: 10, depth: 30, height: 10, sqft: 300 },
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const generateAccessCode = () => Math.random().toString().substring(2, 8);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface StorageUnitToolProps {
  uiConfig?: UIConfig;
}

export const StorageUnitTool: React.FC<StorageUnitToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: units,
    addItem: addUnit,
    updateItem: updateUnit,
    deleteItem: deleteUnit,
    isSynced: unitsSynced,
    isSaving: unitsSaving,
    lastSaved: unitsLastSaved,
    syncError: unitsSyncError,
    forceSync: forceUnitsSync,
  } = useToolData<StorageUnit>('storage-units', [], unitColumns);

  const {
    data: tenants,
    addItem: addTenant,
    updateItem: updateTenant,
    deleteItem: deleteTenant,
  } = useToolData<StorageTenant>('storage-tenants', [], tenantColumns);

  const {
    data: rentals,
    addItem: addRental,
    updateItem: updateRental,
    deleteItem: deleteRental,
  } = useToolData<StorageRental>('storage-rentals', [], rentalColumns);

  const {
    data: payments,
    addItem: addPayment,
    updateItem: updatePayment,
  } = useToolData<PaymentRecord>('storage-payments', [], []);

  // UI State
  const [activeTab, setActiveTab] = useState<'units' | 'tenants' | 'rentals' | 'payments'>('units');
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<StorageUnit | null>(null);
  const [editingTenant, setEditingTenant] = useState<StorageTenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form states
  const [unitForm, setUnitForm] = useState({
    unitNumber: '',
    size: '10x10',
    floor: 1,
    building: 'A',
    monthlyRate: 150,
    isClimateControlled: false,
    hasElectricity: false,
    hasVehicleAccess: false,
    securityLevel: 'standard' as 'standard' | 'enhanced' | 'premium',
    notes: '',
  });

  const [tenantForm, setTenantForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    idType: 'drivers_license',
    idNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [rentalForm, setRentalForm] = useState({
    unitId: '',
    tenantId: '',
    startDate: '',
    monthlyRate: 0,
    depositAmount: 0,
    promoCode: '',
    discountPercent: 0,
    insuranceSelected: false,
    insuranceAmount: 15,
    autoPay: false,
    paymentMethod: 'credit_card',
    notes: '',
  });

  // Get unique buildings
  const buildings = useMemo(() => {
    const buildingSet = new Set(units.map((u) => u.building));
    return Array.from(buildingSet).sort();
  }, [units]);

  // Filter units
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) || unit.building.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
      const matchesBuilding = filterBuilding === 'all' || unit.building === filterBuilding;
      return matchesSearch && matchesStatus && matchesBuilding;
    });
  }, [units, searchTerm, filterStatus, filterBuilding]);

  // Filter tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [tenants, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUnits = units.length;
    const occupied = units.filter((u) => u.status === 'occupied').length;
    const available = units.filter((u) => u.status === 'available').length;
    const reserved = units.filter((u) => u.status === 'reserved').length;
    const maintenance = units.filter((u) => u.status === 'maintenance').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
    const monthlyRevenue = rentals.filter((r) => r.status === 'active').reduce((sum, r) => sum + r.monthlyRate, 0);

    return { totalUnits, occupied, available, reserved, maintenance, occupancyRate, monthlyRevenue };
  }, [units, rentals]);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.customer || params.unitNumber) {
        if (params.customer) {
          setTenantForm((prev) => ({
            ...prev,
            firstName: params.firstName || '',
            lastName: params.lastName || params.customer || '',
            email: params.email || '',
            phone: params.phone || '',
          }));
          setActiveTab('tenants');
          setShowTenantForm(true);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add unit
  const handleAddUnit = () => {
    const preset = SIZE_PRESETS[unitForm.size];
    const dimensions = preset
      ? { width: preset.width, depth: preset.depth, height: preset.height }
      : { width: 10, depth: 10, height: 8 };
    const squareFeet = preset?.sqft || dimensions.width * dimensions.depth;
    const cubicFeet = squareFeet * dimensions.height;

    const newUnit: StorageUnit = {
      id: editingUnit?.id || generateId(),
      unitNumber: unitForm.unitNumber,
      size: unitForm.size,
      dimensions,
      squareFeet,
      cubicFeet,
      floor: unitForm.floor,
      building: unitForm.building,
      monthlyRate: unitForm.monthlyRate,
      isClimateControlled: unitForm.isClimateControlled,
      hasElectricity: unitForm.hasElectricity,
      hasVehicleAccess: unitForm.hasVehicleAccess,
      securityLevel: unitForm.securityLevel,
      status: editingUnit?.status || 'available',
      currentTenantId: editingUnit?.currentTenantId || null,
      notes: unitForm.notes,
      createdAt: editingUnit?.createdAt || new Date().toISOString(),
    };

    if (editingUnit) {
      updateUnit(editingUnit.id, newUnit);
    } else {
      addUnit(newUnit);
    }

    resetUnitForm();
  };

  // Add tenant
  const handleAddTenant = () => {
    if (!tenantForm.firstName || !tenantForm.lastName) {
      setValidationMessage('Please enter tenant name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newTenant: StorageTenant = {
      id: editingTenant?.id || generateId(),
      ...tenantForm,
      createdAt: editingTenant?.createdAt || new Date().toISOString(),
    };

    if (editingTenant) {
      updateTenant(editingTenant.id, newTenant);
    } else {
      addTenant(newTenant);
    }

    resetTenantForm();
  };

  // Create rental
  const handleCreateRental = () => {
    if (!rentalForm.unitId || !rentalForm.tenantId || !rentalForm.startDate) {
      setValidationMessage('Please select unit, tenant, and start date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const unit = units.find((u) => u.id === rentalForm.unitId);
    if (!unit) return;

    const newRental: StorageRental = {
      id: generateId(),
      unitId: rentalForm.unitId,
      tenantId: rentalForm.tenantId,
      startDate: rentalForm.startDate,
      endDate: null,
      monthlyRate: rentalForm.monthlyRate || unit.monthlyRate,
      depositAmount: rentalForm.depositAmount || unit.monthlyRate,
      depositPaid: false,
      promoCode: rentalForm.promoCode,
      discountPercent: rentalForm.discountPercent,
      accessCode: generateAccessCode(),
      insuranceSelected: rentalForm.insuranceSelected,
      insuranceAmount: rentalForm.insuranceAmount,
      autoPay: rentalForm.autoPay,
      paymentMethod: rentalForm.paymentMethod,
      status: 'active',
      moveInDate: rentalForm.startDate,
      moveOutDate: null,
      notes: rentalForm.notes,
      createdAt: new Date().toISOString(),
    };

    addRental(newRental);
    updateUnit(rentalForm.unitId, { status: 'occupied', currentTenantId: rentalForm.tenantId });

    resetRentalForm();
    setActiveTab('rentals');
  };

  // Reset forms
  const resetUnitForm = () => {
    setUnitForm({
      unitNumber: '',
      size: '10x10',
      floor: 1,
      building: 'A',
      monthlyRate: 150,
      isClimateControlled: false,
      hasElectricity: false,
      hasVehicleAccess: false,
      securityLevel: 'standard',
      notes: '',
    });
    setEditingUnit(null);
    setShowUnitForm(false);
  };

  const resetTenantForm = () => {
    setTenantForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      idType: 'drivers_license',
      idNumber: '',
      emergencyContact: '',
      emergencyPhone: '',
    });
    setEditingTenant(null);
    setShowTenantForm(false);
  };

  const resetRentalForm = () => {
    setRentalForm({
      unitId: '',
      tenantId: '',
      startDate: '',
      monthlyRate: 0,
      depositAmount: 0,
      promoCode: '',
      discountPercent: 0,
      insuranceSelected: false,
      insuranceAmount: 15,
      autoPay: false,
      paymentMethod: 'credit_card',
      notes: '',
    });
    setShowRentalForm(false);
  };

  // Export handlers
  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf' | 'clipboard' | 'print') => {
    let exportData: any[];
    let columns: ColumnConfig[];
    let title: string;
    let filename: string;

    switch (activeTab) {
      case 'tenants':
        exportData = filteredTenants;
        columns = tenantColumns;
        title = 'Storage Tenants';
        filename = 'storage-tenants';
        break;
      case 'rentals':
        exportData = rentals;
        columns = rentalColumns;
        title = 'Storage Rentals';
        filename = 'storage-rentals';
        break;
      default:
        exportData = filteredUnits;
        columns = unitColumns;
        title = 'Storage Units';
        filename = 'storage-units';
    }

    switch (format) {
      case 'csv':
        exportToCSV(exportData, columns, filename);
        break;
      case 'excel':
        exportToExcel(exportData, columns, filename);
        break;
      case 'json':
        exportToJSON(exportData, filename);
        break;
      case 'pdf':
        exportToPDF(exportData, columns, title, filename);
        break;
      case 'clipboard':
        await copyUtil(exportData, columns);
        break;
      case 'print':
        printData(exportData, columns, title);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'occupied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'maintenance':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getUnitNumber = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    return unit ? unit.unitNumber : 'Unknown';
  };

  return (
    <>
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Warehouse className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tools.storageUnit.storageUnitManagement', 'Storage Unit Management')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.storageUnit.manageStorageUnitsTenantsAnd', 'Manage storage units, tenants, and rentals')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="storage-unit" toolName="Storage Unit" />

          <SyncStatus
            isSynced={unitsSynced}
            isSaving={unitsSaving}
            lastSaved={unitsLastSaved}
            error={unitsSyncError}
            onForceSync={forceUnitsSync}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUnits}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.storageUnit.totalUnits', 'Total Units')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.occupied}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.storageUnit.occupied', 'Occupied')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.available}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.storageUnit.available', 'Available')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.reserved}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.storageUnit.reserved', 'Reserved')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.maintenance}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.storageUnit.maintenance', 'Maintenance')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.occupancyRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.storageUnit.occupancy', 'Occupancy')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.monthlyRevenue)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.storageUnit.monthlyRev', 'Monthly Rev')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['units', 'tenants', 'rentals', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-orange-600 border-b-2 border-orange-600 dark:text-orange-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Units Tab */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 flex-1">
              <input
                type="text"
                placeholder={t('tools.storageUnit.searchUnits', 'Search units...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="all">{t('tools.storageUnit.allStatus', 'All Status')}</option>
                <option value="available">{t('tools.storageUnit.available2', 'Available')}</option>
                <option value="occupied">{t('tools.storageUnit.occupied2', 'Occupied')}</option>
                <option value="reserved">{t('tools.storageUnit.reserved2', 'Reserved')}</option>
                <option value="maintenance">{t('tools.storageUnit.maintenance2', 'Maintenance')}</option>
              </select>
              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="all">{t('tools.storageUnit.allBuildings', 'All Buildings')}</option>
                {buildings.map((b) => (
                  <option key={b} value={b}>
                    Building {b}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowUnitForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.storageUnit.addUnit', 'Add Unit')}
            </button>
          </div>

          {/* Unit Form */}
          {showUnitForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingUnit ? t('tools.storageUnit.editUnit', 'Edit Unit') : t('tools.storageUnit.addNewUnit', 'Add New Unit')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.unitNumber', 'Unit Number *')}</label>
                    <input
                      type="text"
                      value={unitForm.unitNumber}
                      onChange={(e) => setUnitForm({ ...unitForm, unitNumber: e.target.value })}
                      placeholder="A101"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.size', 'Size')}</label>
                    <select
                      value={unitForm.size}
                      onChange={(e) => {
                        const preset = SIZE_PRESETS[e.target.value];
                        setUnitForm({
                          ...unitForm,
                          size: e.target.value,
                          monthlyRate: preset ? Math.round(preset.sqft * 1.5) : unitForm.monthlyRate,
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      {Object.keys(SIZE_PRESETS).map((size) => (
                        <option key={size} value={size}>
                          {size} ({SIZE_PRESETS[size].sqft} sq ft)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.building', 'Building')}</label>
                    <input
                      type="text"
                      value={unitForm.building}
                      onChange={(e) => setUnitForm({ ...unitForm, building: e.target.value })}
                      placeholder="A"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.floor', 'Floor')}</label>
                    <input
                      type="number"
                      value={unitForm.floor}
                      onChange={(e) => setUnitForm({ ...unitForm, floor: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.monthlyRate', 'Monthly Rate ($)')}</label>
                    <input
                      type="number"
                      value={unitForm.monthlyRate}
                      onChange={(e) => setUnitForm({ ...unitForm, monthlyRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.securityLevel', 'Security Level')}</label>
                    <select
                      value={unitForm.securityLevel}
                      onChange={(e) => setUnitForm({ ...unitForm, securityLevel: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="standard">{t('tools.storageUnit.standard', 'Standard')}</option>
                      <option value="enhanced">{t('tools.storageUnit.enhanced', 'Enhanced')}</option>
                      <option value="premium">{t('tools.storageUnit.premium', 'Premium')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={unitForm.isClimateControlled}
                      onChange={(e) => setUnitForm({ ...unitForm, isClimateControlled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Thermometer className="w-4 h-4 text-blue-500" />
                    <span className="text-sm dark:text-gray-300">{t('tools.storageUnit.climateControlled', 'Climate Controlled')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={unitForm.hasElectricity}
                      onChange={(e) => setUnitForm({ ...unitForm, hasElectricity: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.storageUnit.hasElectricity', 'Has Electricity')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={unitForm.hasVehicleAccess}
                      onChange={(e) => setUnitForm({ ...unitForm, hasVehicleAccess: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.storageUnit.driveUpAccess', 'Drive-Up Access')}</span>
                  </label>
                </div>

                <textarea
                  placeholder={t('tools.storageUnit.notes', 'Notes')}
                  value={unitForm.notes}
                  onChange={(e) => setUnitForm({ ...unitForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />

                <div className="flex gap-2">
                  <button onClick={handleAddUnit} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingUnit ? t('tools.storageUnit.update', 'Update') : t('tools.storageUnit.addUnit2', 'Add Unit')}
                  </button>
                  <button
                    onClick={resetUnitForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.storageUnit.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Units Grid */}
          {filteredUnits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Warehouse className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.storageUnit.noUnitsFoundAddYour', 'No units found. Add your first storage unit to get started.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnits.map((unit) => (
                <Card key={unit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold dark:text-white">{unit.unitNumber}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(unit.status)}`}>{unit.status}</span>
                      </div>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrency(unit.monthlyRate)}/mo</span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        Size: {unit.size} | {unit.squareFeet} sq ft | {unit.cubicFeet} cu ft
                      </p>
                      <p>
                        Building {unit.building}, Floor {unit.floor}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {unit.isClimateControlled && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">{t('tools.storageUnit.climate', 'Climate')}</span>
                        )}
                        {unit.hasElectricity && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded">{t('tools.storageUnit.electric', 'Electric')}</span>
                        )}
                        {unit.hasVehicleAccess && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded">{t('tools.storageUnit.driveUp', 'Drive-Up')}</span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            unit.securityLevel === 'premium'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : unit.securityLevel === 'enhanced'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {unit.securityLevel}
                        </span>
                      </div>
                      {unit.currentTenantId && <p className="mt-2">Tenant: {getTenantName(unit.currentTenantId)}</p>}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingUnit(unit);
                          setUnitForm({
                            unitNumber: unit.unitNumber,
                            size: unit.size,
                            floor: unit.floor,
                            building: unit.building,
                            monthlyRate: unit.monthlyRate,
                            isClimateControlled: unit.isClimateControlled,
                            hasElectricity: unit.hasElectricity,
                            hasVehicleAccess: unit.hasVehicleAccess,
                            securityLevel: unit.securityLevel,
                            notes: unit.notes,
                          });
                          setShowUnitForm(true);
                        }}
                        className="flex-1 px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900"
                      >
                        {t('tools.storageUnit.edit', 'Edit')}
                      </button>
                      {unit.status === 'available' && (
                        <button
                          onClick={() => {
                            setRentalForm({ ...rentalForm, unitId: unit.id, monthlyRate: unit.monthlyRate, depositAmount: unit.monthlyRate });
                            setShowRentalForm(true);
                            setActiveTab('rentals');
                          }}
                          className="flex-1 px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900"
                        >
                          {t('tools.storageUnit.rent', 'Rent')}
                        </button>
                      )}
                      <button
                        onClick={() => deleteUnit(unit.id)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder={t('tools.storageUnit.searchTenants', 'Search tenants...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={() => setShowTenantForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.storageUnit.addTenant', 'Add Tenant')}
            </button>
          </div>

          {/* Tenant Form */}
          {showTenantForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTenant ? t('tools.storageUnit.editTenant', 'Edit Tenant') : t('tools.storageUnit.addNewTenant', 'Add New Tenant')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.storageUnit.firstName', 'First Name *')}
                    value={tenantForm.firstName}
                    onChange={(e) => setTenantForm({ ...tenantForm, firstName: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.storageUnit.lastName', 'Last Name *')}
                    value={tenantForm.lastName}
                    onChange={(e) => setTenantForm({ ...tenantForm, lastName: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="email"
                    placeholder={t('tools.storageUnit.email', 'Email')}
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder={t('tools.storageUnit.phone', 'Phone')}
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.storageUnit.address', 'Address')}
                    value={tenantForm.address}
                    onChange={(e) => setTenantForm({ ...tenantForm, address: e.target.value })}
                    className="md:col-span-2 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.storageUnit.city', 'City')}
                    value={tenantForm.city}
                    onChange={(e) => setTenantForm({ ...tenantForm, city: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('tools.storageUnit.state', 'State')}
                      value={tenantForm.state}
                      onChange={(e) => setTenantForm({ ...tenantForm, state: e.target.value })}
                      className="w-1/2 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder={t('tools.storageUnit.zip', 'ZIP')}
                      value={tenantForm.zip}
                      onChange={(e) => setTenantForm({ ...tenantForm, zip: e.target.value })}
                      className="w-1/2 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.storageUnit.emergencyContact', 'Emergency Contact')}
                    value={tenantForm.emergencyContact}
                    onChange={(e) => setTenantForm({ ...tenantForm, emergencyContact: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder={t('tools.storageUnit.emergencyPhone', 'Emergency Phone')}
                    value={tenantForm.emergencyPhone}
                    onChange={(e) => setTenantForm({ ...tenantForm, emergencyPhone: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTenant}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingTenant ? t('tools.storageUnit.update2', 'Update') : t('tools.storageUnit.addTenant2', 'Add Tenant')}
                  </button>
                  <button
                    onClick={resetTenantForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.storageUnit.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tenants List */}
          {filteredTenants.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.storageUnit.noTenantsFoundAddYour', 'No tenants found. Add your first tenant to get started.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredTenants.map((tenant) => (
                <Card key={tenant.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold dark:text-white">
                          {tenant.firstName} {tenant.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tenant.email} | {tenant.phone}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tenant.city}, {tenant.state} {tenant.zip}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTenant(tenant);
                            setTenantForm(tenant);
                            setShowTenantForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTenant(tenant.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rentals Tab */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRentalForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.storageUnit.newRental', 'New Rental')}
            </button>
          </div>

          {/* Rental Form */}
          {showRentalForm && (
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.storageUnit.createNewRental', 'Create New Rental')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.unit', 'Unit *')}</label>
                    <select
                      value={rentalForm.unitId}
                      onChange={(e) => {
                        const unit = units.find((u) => u.id === e.target.value);
                        setRentalForm({
                          ...rentalForm,
                          unitId: e.target.value,
                          monthlyRate: unit?.monthlyRate || 0,
                          depositAmount: unit?.monthlyRate || 0,
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('tools.storageUnit.selectUnit', 'Select Unit')}</option>
                      {units
                        .filter((u) => u.status === 'available')
                        .map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unitNumber} - {unit.size} ({formatCurrency(unit.monthlyRate)}/mo)
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.tenant', 'Tenant *')}</label>
                    <select
                      value={rentalForm.tenantId}
                      onChange={(e) => setRentalForm({ ...rentalForm, tenantId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('tools.storageUnit.selectTenant', 'Select Tenant')}</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.firstName} {tenant.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.startDate', 'Start Date *')}</label>
                    <input
                      type="date"
                      value={rentalForm.startDate}
                      onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.monthlyRate2', 'Monthly Rate')}</label>
                    <input
                      type="number"
                      value={rentalForm.monthlyRate}
                      onChange={(e) => setRentalForm({ ...rentalForm, monthlyRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.deposit', 'Deposit')}</label>
                    <input
                      type="number"
                      value={rentalForm.depositAmount}
                      onChange={(e) => setRentalForm({ ...rentalForm, depositAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.promoCode', 'Promo Code')}</label>
                    <input
                      type="text"
                      value={rentalForm.promoCode}
                      onChange={(e) => setRentalForm({ ...rentalForm, promoCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.storageUnit.discount', 'Discount %')}</label>
                    <input
                      type="number"
                      value={rentalForm.discountPercent}
                      onChange={(e) => setRentalForm({ ...rentalForm, discountPercent: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rentalForm.insuranceSelected}
                      onChange={(e) => setRentalForm({ ...rentalForm, insuranceSelected: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">Insurance ({formatCurrency(rentalForm.insuranceAmount)}/mo)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rentalForm.autoPay}
                      onChange={(e) => setRentalForm({ ...rentalForm, autoPay: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.storageUnit.autoPay', 'Auto-Pay')}</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateRental}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.storageUnit.createRental', 'Create Rental')}
                  </button>
                  <button
                    onClick={resetRentalForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.storageUnit.cancel3', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rentals List */}
          {rentals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.storageUnit.noRentalsFoundCreateA', 'No rentals found. Create a new rental to get started.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {rentals.map((rental) => (
                <Card key={rental.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold dark:text-white">Unit {getUnitNumber(rental.unitId)}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(rental.status)}`}>{rental.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tenant: {getTenantName(rental.tenantId)} | Started: {formatDate(rental.startDate)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Rate: {formatCurrency(rental.monthlyRate)}/mo
                          {rental.discountPercent > 0 && ` (${rental.discountPercent}% discount)`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Access Code: {rental.accessCode}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => deleteRental(rental.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.storageUnit.noPaymentRecordsYet', 'No payment records yet.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium dark:text-white">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Due: {formatDate(payment.dueDate)} | Status: {payment.status}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(payment.status)}`}>{payment.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default StorageUnitTool;
