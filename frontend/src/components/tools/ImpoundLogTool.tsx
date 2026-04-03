'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Car,
  MapPin,
  Phone,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileText,
  Camera,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Building2,
  Key,
  ClipboardList,
  Package,
  Edit,
  Eye,
  X,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface ImpoundLogToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ImpoundStatus = 'impounded' | 'pending_release' | 'released' | 'auction' | 'scrapped';
type ImpoundReason = 'police_hold' | 'abandoned' | 'parking_violation' | 'accident' | 'illegal_parking' | 'dui' | 'no_insurance' | 'other';

interface ImpoundedVehicle {
  id: string;
  impoundNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleVin: string;
  licensePlate: string;
  licenseState: string;
  ownerName: string;
  ownerPhone: string;
  ownerAddress: string;
  reason: ImpoundReason;
  reasonDetails: string;
  towedFrom: string;
  towedBy: string;
  towDate: string;
  towTime: string;
  lotLocation: string;
  spotNumber: string;
  keysWith: string;
  hasKeys: boolean;
  status: ImpoundStatus;
  policeReportNumber?: string;
  officerName?: string;
  officerBadge?: string;
  dailyRate: number;
  towFee: number;
  adminFee: number;
  totalOwed: number;
  lastPayment?: number;
  lastPaymentDate?: string;
  releaseDate?: string;
  releasedTo?: string;
  releaseAuthorization?: string;
  photos: string[];
  inventoryItems: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface LotSpace {
  id: string;
  spotNumber: string;
  section: string;
  type: 'standard' | 'large' | 'motorcycle' | 'covered';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  vehicleId?: string;
}

// Constants
const IMPOUND_REASONS: { reason: ImpoundReason; label: string }[] = [
  { reason: 'police_hold', label: 'Police Hold' },
  { reason: 'abandoned', label: 'Abandoned Vehicle' },
  { reason: 'parking_violation', label: 'Parking Violation' },
  { reason: 'accident', label: 'Accident' },
  { reason: 'illegal_parking', label: 'Illegal Parking' },
  { reason: 'dui', label: 'DUI/DWI' },
  { reason: 'no_insurance', label: 'No Insurance' },
  { reason: 'other', label: 'Other' },
];

const IMPOUND_STATUSES: { status: ImpoundStatus; label: string; color: string }[] = [
  { status: 'impounded', label: 'Impounded', color: 'bg-orange-500' },
  { status: 'pending_release', label: 'Pending Release', color: 'bg-blue-500' },
  { status: 'released', label: 'Released', color: 'bg-green-500' },
  { status: 'auction', label: 'Auction', color: 'bg-purple-500' },
  { status: 'scrapped', label: 'Scrapped', color: 'bg-gray-500' },
];

// Column configuration for exports
const IMPOUND_COLUMNS: ColumnConfig[] = [
  { key: 'impoundNumber', header: 'Impound #', type: 'string' },
  { key: 'vehicleYear', header: 'Year', type: 'string' },
  { key: 'vehicleMake', header: 'Make', type: 'string' },
  { key: 'vehicleModel', header: 'Model', type: 'string' },
  { key: 'vehicleColor', header: 'Color', type: 'string' },
  { key: 'licensePlate', header: 'Plate', type: 'string' },
  { key: 'vehicleVin', header: 'VIN', type: 'string' },
  { key: 'ownerName', header: 'Owner', type: 'string' },
  { key: 'ownerPhone', header: 'Phone', type: 'string' },
  { key: 'reason', header: 'Reason', type: 'string' },
  { key: 'towDate', header: 'Tow Date', type: 'date' },
  { key: 'spotNumber', header: 'Spot', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalOwed', header: 'Total Owed', type: 'currency' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateImpoundNumber = () => `IMP-${Date.now().toString().slice(-8)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateDaysImpounded = (towDate: string) => {
  const tow = new Date(towDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - tow.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateStorageFees = (towDate: string, dailyRate: number) => {
  const days = calculateDaysImpounded(towDate);
  return days * dailyRate;
};

// Main Component
export const ImpoundLogTool: React.FC<ImpoundLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [releaseFormData, setReleaseFormData] = useState<{ vehicleId: string; releasedTo: string; authorization: string } | null>(null);

  // useToolData hooks for backend sync
  const {
    data: vehicles,
    addItem: addVehicleToBackend,
    updateItem: updateVehicleBackend,
    deleteItem: deleteVehicleBackend,
    isSynced: vehiclesSynced,
    isSaving: vehiclesSaving,
    lastSaved: vehiclesLastSaved,
    syncError: vehiclesSyncError,
    forceSync: forceVehiclesSync,
  } = useToolData<ImpoundedVehicle>('impound-vehicles', [], IMPOUND_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'releases' | 'lot' | 'reports'>('inventory');
  const [showVehicleDetails, setShowVehicleDetails] = useState<ImpoundedVehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterReason, setFilterReason] = useState<string>('all');

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState<Partial<ImpoundedVehicle>>({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleVin: '',
    licensePlate: '',
    licenseState: '',
    ownerName: '',
    ownerPhone: '',
    ownerAddress: '',
    reason: 'parking_violation',
    reasonDetails: '',
    towedFrom: '',
    towedBy: '',
    towDate: new Date().toISOString().split('T')[0],
    towTime: '',
    lotLocation: 'Main Lot',
    spotNumber: '',
    keysWith: '',
    hasKeys: false,
    policeReportNumber: '',
    officerName: '',
    officerBadge: '',
    dailyRate: 35,
    towFee: 150,
    adminFee: 50,
    inventoryItems: [],
    notes: '',
  });

  // Calculate stats
  const stats = useMemo(() => {
    const impoundedVehicles = vehicles.filter(v => v.status === 'impounded');
    const pendingRelease = vehicles.filter(v => v.status === 'pending_release');
    const releasedThisMonth = vehicles.filter(v => {
      if (v.status !== 'released' || !v.releaseDate) return false;
      const releaseMonth = new Date(v.releaseDate).getMonth();
      const currentMonth = new Date().getMonth();
      return releaseMonth === currentMonth;
    });
    const totalStorageFees = impoundedVehicles.reduce((sum, v) => {
      return sum + calculateStorageFees(v.towDate, v.dailyRate);
    }, 0);
    const policeHolds = impoundedVehicles.filter(v => v.reason === 'police_hold').length;

    return {
      totalImpounded: impoundedVehicles.length,
      pendingRelease: pendingRelease.length,
      releasedThisMonth: releasedThisMonth.length,
      totalStorageFees,
      policeHolds,
      totalVehicles: vehicles.length,
    };
  }, [vehicles]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch =
        v.impoundNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicleVin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${v.vehicleYear} ${v.vehicleMake} ${v.vehicleModel}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
      const matchesReason = filterReason === 'all' || v.reason === filterReason;
      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [vehicles, searchTerm, filterStatus, filterReason]);

  // Add new vehicle
  const addVehicle = () => {
    if (!newVehicle.vehicleMake || !newVehicle.licensePlate || !newVehicle.towedFrom) {
      setValidationMessage('Please fill in required fields (Make, License Plate, Towed From)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const vehicle: ImpoundedVehicle = {
      id: generateId(),
      impoundNumber: generateImpoundNumber(),
      vehicleMake: newVehicle.vehicleMake || '',
      vehicleModel: newVehicle.vehicleModel || '',
      vehicleYear: newVehicle.vehicleYear || '',
      vehicleColor: newVehicle.vehicleColor || '',
      vehicleVin: newVehicle.vehicleVin || '',
      licensePlate: newVehicle.licensePlate || '',
      licenseState: newVehicle.licenseState || '',
      ownerName: newVehicle.ownerName || 'Unknown',
      ownerPhone: newVehicle.ownerPhone || '',
      ownerAddress: newVehicle.ownerAddress || '',
      reason: newVehicle.reason || 'parking_violation',
      reasonDetails: newVehicle.reasonDetails || '',
      towedFrom: newVehicle.towedFrom || '',
      towedBy: newVehicle.towedBy || '',
      towDate: newVehicle.towDate || new Date().toISOString().split('T')[0],
      towTime: newVehicle.towTime || '',
      lotLocation: newVehicle.lotLocation || 'Main Lot',
      spotNumber: newVehicle.spotNumber || '',
      keysWith: newVehicle.keysWith || '',
      hasKeys: newVehicle.hasKeys || false,
      status: 'impounded',
      policeReportNumber: newVehicle.policeReportNumber,
      officerName: newVehicle.officerName,
      officerBadge: newVehicle.officerBadge,
      dailyRate: newVehicle.dailyRate || 35,
      towFee: newVehicle.towFee || 150,
      adminFee: newVehicle.adminFee || 50,
      totalOwed: (newVehicle.towFee || 150) + (newVehicle.adminFee || 50),
      photos: [],
      inventoryItems: newVehicle.inventoryItems || [],
      notes: newVehicle.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addVehicleToBackend(vehicle);
    resetForm();
    setActiveTab('inventory');
  };

  const resetForm = () => {
    setNewVehicle({
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      vehicleVin: '',
      licensePlate: '',
      licenseState: '',
      ownerName: '',
      ownerPhone: '',
      ownerAddress: '',
      reason: 'parking_violation',
      reasonDetails: '',
      towedFrom: '',
      towedBy: '',
      towDate: new Date().toISOString().split('T')[0],
      towTime: '',
      lotLocation: 'Main Lot',
      spotNumber: '',
      keysWith: '',
      hasKeys: false,
      policeReportNumber: '',
      officerName: '',
      officerBadge: '',
      dailyRate: 35,
      towFee: 150,
      adminFee: 50,
      inventoryItems: [],
      notes: '',
    });
  };

  // Release vehicle
  const releaseVehicle = (vehicleId: string, releasedTo: string, authorization: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const storageFees = calculateStorageFees(vehicle.towDate, vehicle.dailyRate);
    const totalOwed = vehicle.towFee + vehicle.adminFee + storageFees;

    updateVehicleBackend(vehicleId, {
      status: 'released',
      releaseDate: new Date().toISOString(),
      releasedTo,
      releaseAuthorization: authorization,
      totalOwed,
      updatedAt: new Date().toISOString(),
    });
    setShowVehicleDetails(null);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = filteredVehicles.map(v => ({
      ...v,
      daysImpounded: calculateDaysImpounded(v.towDate),
      storageFees: calculateStorageFees(v.towDate, v.dailyRate),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, IMPOUND_COLUMNS, { filename: 'impound-log' });
        break;
      case 'excel':
        exportToExcel(exportData, IMPOUND_COLUMNS, { filename: 'impound-log' });
        break;
      case 'json':
        exportToJSON(exportData, IMPOUND_COLUMNS, { filename: 'impound-log' });
        break;
      case 'pdf':
        exportToPDF(exportData, IMPOUND_COLUMNS, { filename: 'impound-log', title: 'Impound Lot Report' });
        break;
    }
  };

  const getStatusBadge = (status: ImpoundStatus) => {
    const statusInfo = IMPOUND_STATUSES.find(s => s.status === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.label || status}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}

      {/* Release Form Modal */}
      {releaseFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.impoundLog.releaseVehicle', 'Release Vehicle')}</CardTitle>
              <button onClick={() => setReleaseFormData(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.releasedToName', 'Released To (Name)')}</label>
                <input
                  type="text"
                  value={releaseFormData.releasedTo}
                  onChange={(e) => setReleaseFormData({ ...releaseFormData, releasedTo: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder={t('tools.impoundLog.enterName', 'Enter name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.authorizationIdReference', 'Authorization (ID/Reference)')}</label>
                <input
                  type="text"
                  value={releaseFormData.authorization}
                  onChange={(e) => setReleaseFormData({ ...releaseFormData, authorization: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder={t('tools.impoundLog.enterAuthorization', 'Enter authorization')}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setReleaseFormData(null)}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  {t('tools.impoundLog.cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => {
                    if (releaseFormData.releasedTo && releaseFormData.authorization) {
                      releaseVehicle(releaseFormData.vehicleId, releaseFormData.releasedTo, releaseFormData.authorization);
                      setReleaseFormData(null);
                    } else {
                      setValidationMessage('Please fill in both fields');
                      setTimeout(() => setValidationMessage(null), 3000);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {t('tools.impoundLog.confirmRelease', 'Confirm Release')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">{t('tools.impoundLog.impoundLotManagement', 'Impound Lot Management')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="impound-log" toolName="Impound Log" />

            <SyncStatus
              isSynced={vehiclesSynced}
              isSaving={vehiclesSaving}
              lastSaved={vehiclesLastSaved}
              error={vehiclesSyncError}
              onRetry={forceVehiclesSync}
            />
            <ExportDropdown
              onExport={handleExport}
              onCopy={() => copyUtil(filteredVehicles, 'csv')}
              onPrint={() => printData(filteredVehicles, IMPOUND_COLUMNS, 'Impound Lot Report')}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.impoundLog.currentlyImpounded', 'Currently Impounded')}</div>
            <div className="text-2xl font-bold text-orange-600">{stats.totalImpounded}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.impoundLog.pendingRelease', 'Pending Release')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingRelease}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.impoundLog.policeHolds', 'Police Holds')}</div>
            <div className="text-2xl font-bold text-red-600">{stats.policeHolds}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.impoundLog.releasedMonth', 'Released (Month)')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.releasedThisMonth}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.impoundLog.totalStorageFees', 'Total Storage Fees')}</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalStorageFees)}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.impoundLog.totalVehicles', 'Total Vehicles')}</div>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-4">
        <div className="flex gap-4">
          {[
            { id: 'inventory', label: 'Inventory', icon: ClipboardList },
            { id: 'add', label: 'Add Vehicle', icon: Plus },
            { id: 'releases', label: 'Releases', icon: CheckCircle },
            { id: 'reports', label: 'Reports', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  placeholder={t('tools.impoundLog.searchByPlateVinOwner', 'Search by plate, VIN, owner...')}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="all">{t('tools.impoundLog.allStatus', 'All Status')}</option>
                {IMPOUND_STATUSES.map(s => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="all">{t('tools.impoundLog.allReasons', 'All Reasons')}</option>
                {IMPOUND_REASONS.map(r => (
                  <option key={r.reason} value={r.reason}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Vehicle List */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">{t('tools.impoundLog.impound', 'Impound #')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.vehicle', 'Vehicle')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.plateVin', 'Plate/VIN')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.owner', 'Owner')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.reason', 'Reason')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.days', 'Days')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.spot', 'Spot')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.status', 'Status')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.totalOwed', 'Total Owed')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicles.map(vehicle => {
                        const days = calculateDaysImpounded(vehicle.towDate);
                        const storageFees = calculateStorageFees(vehicle.towDate, vehicle.dailyRate);
                        const total = vehicle.towFee + vehicle.adminFee + storageFees;

                        return (
                          <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-mono font-bold">{vehicle.impoundNumber}</td>
                            <td className="p-3">
                              <div className="font-medium">
                                {vehicle.vehicleYear} {vehicle.vehicleMake} {vehicle.vehicleModel}
                              </div>
                              <div className="text-xs text-muted-foreground">{vehicle.vehicleColor}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-mono">{vehicle.licensePlate}</div>
                              <div className="text-xs text-muted-foreground">{vehicle.vehicleVin}</div>
                            </td>
                            <td className="p-3">
                              <div>{vehicle.ownerName}</div>
                              <div className="text-xs text-muted-foreground">{vehicle.ownerPhone}</div>
                            </td>
                            <td className="p-3">
                              {IMPOUND_REASONS.find(r => r.reason === vehicle.reason)?.label}
                              {vehicle.reason === 'police_hold' && (
                                <AlertTriangle className="w-4 h-4 text-red-500 inline ml-1" />
                              )}
                            </td>
                            <td className="p-3">
                              <span className={days > 30 ? 'text-red-600 font-bold' : ''}>
                                {days}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{vehicle.spotNumber || '-'}</td>
                            <td className="p-3">{getStatusBadge(vehicle.status)}</td>
                            <td className="p-3 font-bold">{formatCurrency(total)}</td>
                            <td className="p-3">
                              <button
                                onClick={() => setShowVehicleDetails(vehicle)}
                                className="p-1 hover:bg-muted rounded"
                                title={t('tools.impoundLog.viewDetails', 'View Details')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredVehicles.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      {t('tools.impoundLog.noVehiclesFoundMatchingYour', 'No vehicles found matching your criteria')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Vehicle Tab */}
        {activeTab === 'add' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t('tools.impoundLog.addImpoundedVehicle', 'Add Impounded Vehicle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vehicle Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Car className="w-4 h-4" /> Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.year', 'Year')}</label>
                      <input
                        type="text"
                        value={newVehicle.vehicleYear}
                        onChange={(e) => setNewVehicle({ ...newVehicle, vehicleYear: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.color', 'Color')}</label>
                      <input
                        type="text"
                        value={newVehicle.vehicleColor}
                        onChange={(e) => setNewVehicle({ ...newVehicle, vehicleColor: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder={t('tools.impoundLog.black', 'Black')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.make', 'Make *')}</label>
                    <input
                      type="text"
                      value={newVehicle.vehicleMake}
                      onChange={(e) => setNewVehicle({ ...newVehicle, vehicleMake: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.impoundLog.toyota', 'Toyota')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.model', 'Model')}</label>
                    <input
                      type="text"
                      value={newVehicle.vehicleModel}
                      onChange={(e) => setNewVehicle({ ...newVehicle, vehicleModel: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.impoundLog.camry', 'Camry')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.licensePlate', 'License Plate *')}</label>
                      <input
                        type="text"
                        value={newVehicle.licensePlate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder={t('tools.impoundLog.abc1234', 'ABC-1234')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.state', 'State')}</label>
                      <input
                        type="text"
                        value={newVehicle.licenseState}
                        onChange={(e) => setNewVehicle({ ...newVehicle, licenseState: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="CA"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.vin', 'VIN')}</label>
                    <input
                      type="text"
                      value={newVehicle.vehicleVin}
                      onChange={(e) => setNewVehicle({ ...newVehicle, vehicleVin: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.impoundLog.1hgbh41jxmn109186', '1HGBH41JXMN109186')}
                    />
                  </div>
                </div>

                {/* Tow Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Tow Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.reason2', 'Reason')}</label>
                    <select
                      value={newVehicle.reason}
                      onChange={(e) => setNewVehicle({ ...newVehicle, reason: e.target.value as ImpoundReason })}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {IMPOUND_REASONS.map(r => (
                        <option key={r.reason} value={r.reason}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.towedFrom', 'Towed From *')}</label>
                    <input
                      type="text"
                      value={newVehicle.towedFrom}
                      onChange={(e) => setNewVehicle({ ...newVehicle, towedFrom: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.impoundLog.123MainSt', '123 Main St')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.towDate', 'Tow Date')}</label>
                      <input
                        type="date"
                        value={newVehicle.towDate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, towDate: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.time', 'Time')}</label>
                      <input
                        type="time"
                        value={newVehicle.towTime}
                        onChange={(e) => setNewVehicle({ ...newVehicle, towTime: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.towedBy', 'Towed By')}</label>
                    <input
                      type="text"
                      value={newVehicle.towedBy}
                      onChange={(e) => setNewVehicle({ ...newVehicle, towedBy: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.impoundLog.driverName', 'Driver name')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.lotLocation', 'Lot Location')}</label>
                      <input
                        type="text"
                        value={newVehicle.lotLocation}
                        onChange={(e) => setNewVehicle({ ...newVehicle, lotLocation: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder={t('tools.impoundLog.mainLot', 'Main Lot')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.spot2', 'Spot #')}</label>
                      <input
                        type="text"
                        value={newVehicle.spotNumber}
                        onChange={(e) => setNewVehicle({ ...newVehicle, spotNumber: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="A-15"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newVehicle.hasKeys}
                      onChange={(e) => setNewVehicle({ ...newVehicle, hasKeys: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm">{t('tools.impoundLog.hasKeys', 'Has Keys')}</label>
                  </div>
                </div>

                {/* Owner & Fees */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Owner & Fees
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.ownerName', 'Owner Name')}</label>
                    <input
                      type="text"
                      value={newVehicle.ownerName}
                      onChange={(e) => setNewVehicle({ ...newVehicle, ownerName: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.impoundLog.johnDoe', 'John Doe')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={newVehicle.ownerPhone}
                      onChange={(e) => setNewVehicle({ ...newVehicle, ownerPhone: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.towFee', 'Tow Fee')}</label>
                      <input
                        type="number"
                        value={newVehicle.towFee}
                        onChange={(e) => setNewVehicle({ ...newVehicle, towFee: Number(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.adminFee', 'Admin Fee')}</label>
                      <input
                        type="number"
                        value={newVehicle.adminFee}
                        onChange={(e) => setNewVehicle({ ...newVehicle, adminFee: Number(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.dailyRate', 'Daily Rate')}</label>
                      <input
                        type="number"
                        value={newVehicle.dailyRate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, dailyRate: Number(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.policeReport', 'Police Report #')}</label>
                    <input
                      type="text"
                      value={newVehicle.policeReportNumber}
                      onChange={(e) => setNewVehicle({ ...newVehicle, policeReportNumber: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.impoundLog.optional', 'Optional')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.impoundLog.notes', 'Notes')}</label>
                    <textarea
                      value={newVehicle.notes}
                      onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      rows={3}
                      placeholder={t('tools.impoundLog.additionalNotes', 'Additional notes...')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  {t('tools.impoundLog.clear', 'Clear')}
                </button>
                <button
                  onClick={addVehicle}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.impoundLog.addVehicle', 'Add Vehicle')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Releases Tab */}
        {activeTab === 'releases' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.impoundLog.recentReleases', 'Recent Releases')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">{t('tools.impoundLog.impound2', 'Impound #')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.vehicle2', 'Vehicle')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.owner2', 'Owner')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.releasedTo', 'Released To')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.releaseDate', 'Release Date')}</th>
                        <th className="text-left p-3">{t('tools.impoundLog.totalPaid', 'Total Paid')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles
                        .filter(v => v.status === 'released')
                        .sort((a, b) => new Date(b.releaseDate || '').getTime() - new Date(a.releaseDate || '').getTime())
                        .map(vehicle => (
                          <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-mono">{vehicle.impoundNumber}</td>
                            <td className="p-3">
                              {vehicle.vehicleYear} {vehicle.vehicleMake} {vehicle.vehicleModel}
                            </td>
                            <td className="p-3">{vehicle.ownerName}</td>
                            <td className="p-3">{vehicle.releasedTo}</td>
                            <td className="p-3">{vehicle.releaseDate ? formatDate(vehicle.releaseDate) : '-'}</td>
                            <td className="p-3 font-bold">{formatCurrency(vehicle.totalOwed)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.impoundLog.vehiclesByReason', 'Vehicles by Reason')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {IMPOUND_REASONS.map(reason => {
                    const count = vehicles.filter(v => v.reason === reason.reason && v.status === 'impounded').length;
                    return (
                      <div key={reason.reason} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span>{reason.label}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('tools.impoundLog.agingReport', 'Aging Report')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: '0-7 days', min: 0, max: 7 },
                    { label: '8-14 days', min: 8, max: 14 },
                    { label: '15-30 days', min: 15, max: 30 },
                    { label: '31-60 days', min: 31, max: 60 },
                    { label: '60+ days', min: 61, max: Infinity },
                  ].map(range => {
                    const count = vehicles.filter(v => {
                      if (v.status !== 'impounded') return false;
                      const days = calculateDaysImpounded(v.towDate);
                      return days >= range.min && days <= range.max;
                    }).length;
                    return (
                      <div key={range.label} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span>{range.label}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {showVehicleDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vehicle Details - {showVehicleDetails.impoundNumber}</CardTitle>
              <button onClick={() => setShowVehicleDetails(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">{t('tools.impoundLog.vehicle3', 'Vehicle')}</h4>
                  <p>{showVehicleDetails.vehicleYear} {showVehicleDetails.vehicleMake} {showVehicleDetails.vehicleModel}</p>
                  <p className="text-sm text-muted-foreground">{showVehicleDetails.vehicleColor}</p>
                  <p className="font-mono">{showVehicleDetails.licensePlate} ({showVehicleDetails.licenseState})</p>
                  <p className="text-sm text-muted-foreground">VIN: {showVehicleDetails.vehicleVin}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{t('tools.impoundLog.owner3', 'Owner')}</h4>
                  <p>{showVehicleDetails.ownerName}</p>
                  <p>{showVehicleDetails.ownerPhone}</p>
                  <p className="text-sm text-muted-foreground">{showVehicleDetails.ownerAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">{t('tools.impoundLog.impoundInfo', 'Impound Info')}</h4>
                  <p>Reason: {IMPOUND_REASONS.find(r => r.reason === showVehicleDetails.reason)?.label}</p>
                  <p>Towed From: {showVehicleDetails.towedFrom}</p>
                  <p>Tow Date: {formatDate(showVehicleDetails.towDate)}</p>
                  <p>Days Impounded: {calculateDaysImpounded(showVehicleDetails.towDate)}</p>
                  <p>Location: {showVehicleDetails.lotLocation} - {showVehicleDetails.spotNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{t('tools.impoundLog.fees', 'Fees')}</h4>
                  <p>Tow Fee: {formatCurrency(showVehicleDetails.towFee)}</p>
                  <p>Admin Fee: {formatCurrency(showVehicleDetails.adminFee)}</p>
                  <p>Storage: {formatCurrency(calculateStorageFees(showVehicleDetails.towDate, showVehicleDetails.dailyRate))}</p>
                  <p className="font-bold text-lg">
                    Total: {formatCurrency(
                      showVehicleDetails.towFee +
                      showVehicleDetails.adminFee +
                      calculateStorageFees(showVehicleDetails.towDate, showVehicleDetails.dailyRate)
                    )}
                  </p>
                </div>
              </div>

              {showVehicleDetails.notes && (
                <div>
                  <h4 className="font-medium mb-2">{t('tools.impoundLog.notes2', 'Notes')}</h4>
                  <p className="text-muted-foreground">{showVehicleDetails.notes}</p>
                </div>
              )}

              {showVehicleDetails.status === 'impounded' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setReleaseFormData({ vehicleId: showVehicleDetails.id, releasedTo: '', authorization: '' });
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {t('tools.impoundLog.releaseVehicle2', 'Release Vehicle')}
                  </button>
                  <button
                    onClick={() => updateVehicleBackend(showVehicleDetails.id, { status: 'pending_release' })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t('tools.impoundLog.markPendingRelease', 'Mark Pending Release')}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImpoundLogTool;
