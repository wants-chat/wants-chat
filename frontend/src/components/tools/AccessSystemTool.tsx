'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Shield,
  Lock,
  Key,
  User,
  Users,
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Settings,
  Loader2,
  Calendar,
  Clock,
  FileText,
  Wifi,
  Fingerprint,
  CreditCard,
  ScanLine,
  DoorOpen,
  DoorClosed,
  History,
  Activity,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Zap
} from 'lucide-react';

// Types
type SystemType = 'keypad' | 'card_reader' | 'biometric' | 'intercom' | 'video' | 'hybrid';
type InstallStatus = 'quote' | 'scheduled' | 'in_progress' | 'completed' | 'maintenance';
type ZoneType = 'main_entry' | 'side_entry' | 'parking' | 'elevator' | 'secure_area' | 'common_area';

interface AccessZone {
  id: string;
  name: string;
  type: ZoneType;
  deviceCount: number;
  isActive: boolean;
}

interface AccessDevice {
  id: string;
  name: string;
  type: SystemType;
  serialNumber: string;
  zoneId: string;
  zoneName: string;
  installDate: string;
  warrantyExpires?: string;
  isOnline: boolean;
  lastActivity?: string;
  notes?: string;
}

interface AccessInstallation {
  id: string;
  projectNumber: string;
  createdAt: string;
  updatedAt: string;

  // Client Info
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  propertyName: string;
  propertyAddress: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'multi_family';

  // System Details
  systemType: SystemType;
  zones: AccessZone[];
  devices: AccessDevice[];
  totalDoors: number;
  totalUsers: number;

  // Project Details
  status: InstallStatus;
  scheduledDate?: string;
  startDate?: string;
  completionDate?: string;
  technicianId?: string;
  technicianName?: string;

  // Pricing
  laborCost: number;
  equipmentCost: number;
  monthlyMonitoring: number;
  totalCost: number;
  deposit: number;
  balanceDue: number;

  // Service
  maintenanceSchedule?: string;
  nextServiceDate?: string;
  warrantyExpires?: string;

  // Notes
  projectNotes?: string;
  technicalNotes?: string;
  accessCodes?: string;
}

interface AccessUser {
  id: string;
  installationId: string;
  name: string;
  email?: string;
  phone?: string;
  cardNumber?: string;
  pinCode?: string;
  accessLevel: 'full' | 'limited' | 'temporary' | 'custom';
  zones: string[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastAccess?: string;
}

// System type configurations
const SYSTEM_TYPES: { type: SystemType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'keypad', label: 'Keypad Entry', icon: <Key className="w-4 h-4" />, description: 'PIN code access control' },
  { type: 'card_reader', label: 'Card Reader', icon: <CreditCard className="w-4 h-4" />, description: 'Proximity/Smart card access' },
  { type: 'biometric', label: 'Biometric', icon: <Fingerprint className="w-4 h-4" />, description: 'Fingerprint/facial recognition' },
  { type: 'intercom', label: 'Intercom System', icon: <Phone className="w-4 h-4" />, description: 'Audio/video intercom' },
  { type: 'video', label: 'Video Access', icon: <ScanLine className="w-4 h-4" />, description: 'Video-enabled access control' },
  { type: 'hybrid', label: 'Hybrid System', icon: <Zap className="w-4 h-4" />, description: 'Multi-technology system' },
];

const STATUS_CONFIG: Record<InstallStatus, { label: string; color: string; bgColor: string }> = {
  quote: { label: 'Quote', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  scheduled: { label: 'Scheduled', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  in_progress: { label: 'In Progress', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
  maintenance: { label: 'Maintenance', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
};

const ZONE_TYPES: { type: ZoneType; label: string }[] = [
  { type: 'main_entry', label: 'Main Entry' },
  { type: 'side_entry', label: 'Side Entry' },
  { type: 'parking', label: 'Parking' },
  { type: 'elevator', label: 'Elevator' },
  { type: 'secure_area', label: 'Secure Area' },
  { type: 'common_area', label: 'Common Area' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateProjectNumber = () => `ACC-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'projectNumber', header: 'Project #', type: 'string' },
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'propertyName', header: 'Property', type: 'string' },
  { key: 'propertyAddress', header: 'Address', type: 'string' },
  { key: 'systemType', header: 'System Type', type: 'string' },
  { key: 'totalDoors', header: 'Total Doors', type: 'number' },
  { key: 'totalUsers', header: 'Total Users', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'laborCost', header: 'Labor Cost', type: 'currency' },
  { key: 'equipmentCost', header: 'Equipment Cost', type: 'currency' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'monthlyMonitoring', header: 'Monthly Fee', type: 'currency' },
  { key: 'scheduledDate', header: 'Scheduled', type: 'date' },
  { key: 'completionDate', header: 'Completed', type: 'date' },
];

interface AccessSystemToolProps {
  uiConfig?: UIConfig;
}

export function AccessSystemTool({ uiConfig }: AccessSystemToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: installations,
    setData: setInstallations,
    addItem: addInstallation,
    updateItem: updateInstallation,
    deleteItem: deleteInstallation,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<AccessInstallation>('access-system-installations', [], COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'projects' | 'new' | 'users' | 'monitoring' | 'reports'>('projects');
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState<AccessInstallation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstallStatus | 'all'>('all');
  const [showZoneModal, setShowZoneModal] = useState(false);

  // Form state for new installation
  const [newInstallation, setNewInstallation] = useState<Partial<AccessInstallation>>({
    systemType: 'keypad',
    propertyType: 'commercial',
    status: 'quote',
    zones: [],
    devices: [],
    totalDoors: 0,
    totalUsers: 0,
    laborCost: 0,
    equipmentCost: 0,
    monthlyMonitoring: 0,
    totalCost: 0,
    deposit: 0,
    balanceDue: 0,
  });

  // New zone form
  const [newZone, setNewZone] = useState<Partial<AccessZone>>({
    type: 'main_entry',
    deviceCount: 1,
    isActive: true,
  });

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Toast state for validation messages
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Load access users from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('access_system_users');
    if (saved) {
      try {
        setAccessUsers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load access users:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('access_system_users', JSON.stringify(accessUsers));
  }, [accessUsers]);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery editing - restore all saved form fields
      if (params.isEditFromGallery) {
        setNewInstallation({
          systemType: params.systemType || 'keypad',
          propertyType: params.propertyType || 'commercial',
          status: params.status || 'quote',
          zones: params.zones || [],
          devices: params.devices || [],
          totalDoors: params.totalDoors || 0,
          totalUsers: params.totalUsers || 0,
          laborCost: params.laborCost || 0,
          equipmentCost: params.equipmentCost || 0,
          monthlyMonitoring: params.monthlyMonitoring || 0,
          totalCost: params.totalCost || 0,
          deposit: params.deposit || 0,
          balanceDue: params.balanceDue || 0,
          clientName: params.clientName || '',
          clientPhone: params.clientPhone || '',
          clientEmail: params.clientEmail || '',
          propertyName: params.propertyName || '',
          propertyAddress: params.propertyAddress || '',
          projectNotes: params.projectNotes || '',
        });
        setActiveTab('new');
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else if (params.clientName || params.client || params.propertyName || params.address) {
        // Regular prefill from AI
        setNewInstallation({
          ...newInstallation,
          clientName: params.clientName || params.client || '',
          clientPhone: params.phone || '',
          clientEmail: params.email || '',
          propertyName: params.propertyName || '',
          propertyAddress: params.address || '',
          projectNotes: params.notes || '',
        });
        setActiveTab('new');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate totals when costs change
  useEffect(() => {
    const total = (newInstallation.laborCost || 0) + (newInstallation.equipmentCost || 0);
    const balance = total - (newInstallation.deposit || 0);
    setNewInstallation(prev => ({
      ...prev,
      totalCost: total,
      balanceDue: balance,
    }));
  }, [newInstallation.laborCost, newInstallation.equipmentCost, newInstallation.deposit]);

  // Filtered installations
  const filteredInstallations = useMemo(() => {
    return installations
      .filter(inst => {
        const matchesSearch = searchQuery === '' ||
          inst.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [installations, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = installations.filter(i => ['scheduled', 'in_progress', 'maintenance'].includes(i.status));
    const completed = installations.filter(i => i.status === 'completed');
    const totalRevenue = completed.reduce((sum, i) => sum + i.totalCost, 0);
    const monthlyRecurring = installations.reduce((sum, i) => sum + (i.monthlyMonitoring || 0), 0);
    const totalDoors = installations.reduce((sum, i) => sum + i.totalDoors, 0);
    const totalUsers = installations.reduce((sum, i) => sum + i.totalUsers, 0);

    return {
      totalProjects: installations.length,
      activeProjects: active.length,
      completedProjects: completed.length,
      totalRevenue,
      monthlyRecurring,
      totalDoors,
      totalUsers,
    };
  }, [installations]);

  // Add zone to installation
  const addZone = () => {
    if (!newZone.name) {
      setValidationMessage('Please enter a zone name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const zone: AccessZone = {
      id: generateId(),
      name: newZone.name || '',
      type: newZone.type || 'main_entry',
      deviceCount: newZone.deviceCount || 1,
      isActive: true,
    };

    setNewInstallation(prev => ({
      ...prev,
      zones: [...(prev.zones || []), zone],
      totalDoors: (prev.totalDoors || 0) + zone.deviceCount,
    }));

    setNewZone({
      type: 'main_entry',
      deviceCount: 1,
      isActive: true,
    });
    setShowZoneModal(false);
  };

  // Remove zone
  const removeZone = (zoneId: string) => {
    const zone = newInstallation.zones?.find(z => z.id === zoneId);
    if (zone) {
      setNewInstallation(prev => ({
        ...prev,
        zones: prev.zones?.filter(z => z.id !== zoneId) || [],
        totalDoors: (prev.totalDoors || 0) - zone.deviceCount,
      }));
    }
  };

  // Create new installation
  const createInstallation = () => {
    if (!newInstallation.clientName || !newInstallation.clientPhone || !newInstallation.propertyAddress) {
      setValidationMessage('Please fill in required fields: Client Name, Phone, and Property Address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const installation: AccessInstallation = {
      id: generateId(),
      projectNumber: generateProjectNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientName: newInstallation.clientName || '',
      clientPhone: newInstallation.clientPhone || '',
      clientEmail: newInstallation.clientEmail || '',
      propertyName: newInstallation.propertyName || '',
      propertyAddress: newInstallation.propertyAddress || '',
      propertyType: newInstallation.propertyType || 'commercial',
      systemType: newInstallation.systemType || 'keypad',
      zones: newInstallation.zones || [],
      devices: [],
      totalDoors: newInstallation.totalDoors || 0,
      totalUsers: newInstallation.totalUsers || 0,
      status: 'quote',
      laborCost: newInstallation.laborCost || 0,
      equipmentCost: newInstallation.equipmentCost || 0,
      monthlyMonitoring: newInstallation.monthlyMonitoring || 0,
      totalCost: newInstallation.totalCost || 0,
      deposit: newInstallation.deposit || 0,
      balanceDue: newInstallation.balanceDue || 0,
      projectNotes: newInstallation.projectNotes,
    };

    addInstallation(installation);

    // Call onSaveCallback if this is a gallery edit
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback({
        toolId: 'access-system',
        clientName: newInstallation.clientName,
        clientPhone: newInstallation.clientPhone,
        clientEmail: newInstallation.clientEmail,
        propertyName: newInstallation.propertyName,
        propertyAddress: newInstallation.propertyAddress,
        propertyType: newInstallation.propertyType,
        systemType: newInstallation.systemType,
        zones: newInstallation.zones,
        totalDoors: newInstallation.totalDoors,
        totalUsers: newInstallation.totalUsers,
        laborCost: newInstallation.laborCost,
        equipmentCost: newInstallation.equipmentCost,
        monthlyMonitoring: newInstallation.monthlyMonitoring,
        totalCost: newInstallation.totalCost,
        deposit: newInstallation.deposit,
        balanceDue: newInstallation.balanceDue,
        projectNotes: newInstallation.projectNotes,
      });
    }

    resetForm();
    setActiveTab('projects');
  };

  // Reset form
  const resetForm = () => {
    setNewInstallation({
      systemType: 'keypad',
      propertyType: 'commercial',
      status: 'quote',
      zones: [],
      devices: [],
      totalDoors: 0,
      totalUsers: 0,
      laborCost: 0,
      equipmentCost: 0,
      monthlyMonitoring: 0,
      totalCost: 0,
      deposit: 0,
      balanceDue: 0,
    });
    setIsEditing(false);
    setSelectedInstallation(null);
  };

  // Update status
  const updateStatus = (installationId: string, status: InstallStatus) => {
    const updates: Partial<AccessInstallation> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'in_progress' && !installations.find(i => i.id === installationId)?.startDate) {
      updates.startDate = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completionDate = new Date().toISOString();
    }

    updateInstallation(installationId, updates);
  };

  // Card styles
  const cardClass = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClass = isDark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
        {validationMessage}
      </div>
    )}
    <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-500" />
              {t('tools.accessSystem.accessSystemInstallations', 'Access System Installations')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.accessSystem.manageAccessControlSystemInstallations', 'Manage access control system installations and monitoring')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="access-system" toolName="Access System" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onCopy={copyToClipboard}
              onPrint={print}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.accessSystem.totalProjects', 'Total Projects')}</p>
                  <p className="text-xl font-bold">{stats.totalProjects}</p>
                </div>
                <FileText className="w-6 h-6 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.accessSystem.active', 'Active')}</p>
                  <p className="text-xl font-bold text-orange-500">{stats.activeProjects}</p>
                </div>
                <Activity className="w-6 h-6 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.accessSystem.completed', 'Completed')}</p>
                  <p className="text-xl font-bold text-green-500">{stats.completedProjects}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.accessSystem.totalDoors', 'Total Doors')}</p>
                  <p className="text-xl font-bold">{stats.totalDoors}</p>
                </div>
                <DoorClosed className="w-6 h-6 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.accessSystem.totalUsers', 'Total Users')}</p>
                  <p className="text-xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-6 h-6 text-cyan-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.accessSystem.revenue', 'Revenue')}</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.accessSystem.monthly', 'Monthly')}</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.monthlyRecurring)}</p>
                </div>
                <RefreshCw className="w-6 h-6 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['projects', 'new', 'users', 'monitoring', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'projects' && <FileText className="w-4 h-4 inline mr-2" />}
              {tab === 'new' && <Plus className="w-4 h-4 inline mr-2" />}
              {tab === 'users' && <Users className="w-4 h-4 inline mr-2" />}
              {tab === 'monitoring' && <Activity className="w-4 h-4 inline mr-2" />}
              {tab === 'reports' && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.accessSystem.searchByClientProjectProperty', 'Search by client, project #, property...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InstallStatus | 'all')}
                className={`px-4 py-2 rounded-lg border ${inputClass}`}
              >
                <option value="all">{t('tools.accessSystem.allStatuses', 'All Statuses')}</option>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Projects List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : filteredInstallations.length === 0 ? (
              <Card className={cardClass}>
                <CardContent className="p-12 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.accessSystem.noAccessSystemInstallationsFound', 'No access system installations found')}
                  </p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {t('tools.accessSystem.newInstallation', 'New Installation')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInstallations.map(inst => {
                  const systemConfig = SYSTEM_TYPES.find(s => s.type === inst.systemType);
                  return (
                    <Card key={inst.id} className={`${cardClass} hover:shadow-lg transition-shadow`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-bold">{inst.projectNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[inst.status].bgColor} ${STATUS_CONFIG[inst.status].color}`}>
                                {STATUS_CONFIG[inst.status].label}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{inst.clientName}</span>
                              <span className="text-gray-400">|</span>
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{inst.clientPhone}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {inst.propertyName || inst.propertyAddress}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                {systemConfig?.icon}
                                {systemConfig?.label}
                              </span>
                              <span className="flex items-center gap-1">
                                <DoorClosed className="w-4 h-4 text-gray-400" />
                                {inst.totalDoors} doors
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                {inst.totalUsers} users
                              </span>
                              {inst.scheduledDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {formatDate(inst.scheduledDate)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <p className="text-sm text-gray-400">{t('tools.accessSystem.totalCost', 'Total Cost')}</p>
                              <p className="font-bold">{formatCurrency(inst.totalCost)}</p>
                              {inst.monthlyMonitoring > 0 && (
                                <p className="text-xs text-gray-400">+ {formatCurrency(inst.monthlyMonitoring)}/mo</p>
                              )}
                            </div>

                            <select
                              value={inst.status}
                              onChange={(e) => updateStatus(inst.id, e.target.value as InstallStatus)}
                              className={`px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                            >
                              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                <option key={status} value={status}>{config.label}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                setNewInstallation(inst);
                                setIsEditing(true);
                                setActiveTab('new');
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Delete Installation',
                                  message: 'Are you sure you want to delete this installation? This action cannot be undone.',
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'danger',
                                });
                                if (confirmed) {
                                  deleteInstallation(inst.id);
                                }
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* New Installation Tab */}
        {activeTab === 'new' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isEditing ? t('tools.accessSystem.editInstallation', 'Edit Installation') : t('tools.accessSystem.newAccessSystemInstallation', 'New Access System Installation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.accessSystem.clientInformation', 'Client Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.clientName', 'Client Name *')}</label>
                    <input
                      type="text"
                      value={newInstallation.clientName || ''}
                      onChange={(e) => setNewInstallation({ ...newInstallation, clientName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.phone', 'Phone *')}</label>
                    <input
                      type="tel"
                      value={newInstallation.clientPhone || ''}
                      onChange={(e) => setNewInstallation({ ...newInstallation, clientPhone: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.email', 'Email')}</label>
                    <input
                      type="email"
                      value={newInstallation.clientEmail || ''}
                      onChange={(e) => setNewInstallation({ ...newInstallation, clientEmail: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.accessSystem.propertyDetails', 'Property Details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.propertyName', 'Property Name')}</label>
                    <input
                      type="text"
                      value={newInstallation.propertyName || ''}
                      onChange={(e) => setNewInstallation({ ...newInstallation, propertyName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.accessSystem.buildingName', 'Building Name')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.propertyType', 'Property Type')}</label>
                    <select
                      value={newInstallation.propertyType || 'commercial'}
                      onChange={(e) => setNewInstallation({ ...newInstallation, propertyType: e.target.value as any })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    >
                      <option value="residential">{t('tools.accessSystem.residential', 'Residential')}</option>
                      <option value="commercial">{t('tools.accessSystem.commercial', 'Commercial')}</option>
                      <option value="industrial">{t('tools.accessSystem.industrial', 'Industrial')}</option>
                      <option value="multi_family">{t('tools.accessSystem.multiFamily', 'Multi-Family')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.propertyAddress', 'Property Address *')}</label>
                    <input
                      type="text"
                      value={newInstallation.propertyAddress || ''}
                      onChange={(e) => setNewInstallation({ ...newInstallation, propertyAddress: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* System Type */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.accessSystem.systemType', 'System Type')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SYSTEM_TYPES.map(system => (
                    <button
                      key={system.type}
                      onClick={() => setNewInstallation({ ...newInstallation, systemType: system.type })}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        newInstallation.systemType === system.type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {system.icon}
                        <span className="font-medium">{system.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{system.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{t('tools.accessSystem.accessZones', 'Access Zones')}</h3>
                  <button
                    onClick={() => setShowZoneModal(true)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    {t('tools.accessSystem.addZone', 'Add Zone')}
                  </button>
                </div>

                {(newInstallation.zones || []).length === 0 ? (
                  <p className="text-gray-400 text-sm">{t('tools.accessSystem.noZonesAddedYet', 'No zones added yet')}</p>
                ) : (
                  <div className="space-y-2">
                    {newInstallation.zones?.map(zone => (
                      <div
                        key={zone.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <div>
                          <span className="font-medium">{zone.name}</span>
                          <span className="text-gray-400 text-sm ml-2">
                            ({ZONE_TYPES.find(z => z.type === zone.type)?.label}) - {zone.deviceCount} door(s)
                          </span>
                        </div>
                        <button
                          onClick={() => removeZone(zone.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Count */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.estimatedUsers', 'Estimated Users')}</label>
                <input
                  type="number"
                  min="0"
                  value={newInstallation.totalUsers || 0}
                  onChange={(e) => setNewInstallation({ ...newInstallation, totalUsers: parseInt(e.target.value) || 0 })}
                  className={`w-full max-w-xs px-4 py-2 rounded-lg border ${inputClass}`}
                />
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.accessSystem.pricing', 'Pricing')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.laborCost', 'Labor Cost')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInstallation.laborCost || 0}
                      onChange={(e) => setNewInstallation({ ...newInstallation, laborCost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.equipmentCost', 'Equipment Cost')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInstallation.equipmentCost || 0}
                      onChange={(e) => setNewInstallation({ ...newInstallation, equipmentCost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.monthlyMonitoring', 'Monthly Monitoring')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInstallation.monthlyMonitoring || 0}
                      onChange={(e) => setNewInstallation({ ...newInstallation, monthlyMonitoring: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.deposit', 'Deposit')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInstallation.deposit || 0}
                      onChange={(e) => setNewInstallation({ ...newInstallation, deposit: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <div className="flex-1 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.accessSystem.totalCost2', 'Total Cost')}</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(newInstallation.totalCost || 0)}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.accessSystem.balanceDue', 'Balance Due')}</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(newInstallation.balanceDue || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.projectNotes', 'Project Notes')}</label>
                <textarea
                  value={newInstallation.projectNotes || ''}
                  onChange={(e) => setNewInstallation({ ...newInstallation, projectNotes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={isEditing ? () => {
                    if (newInstallation.id) {
                      updateInstallation(newInstallation.id, {
                        ...newInstallation,
                        updatedAt: new Date().toISOString(),
                      } as Partial<AccessInstallation>);
                    }
                    resetForm();
                    setActiveTab('projects');
                  } : createInstallation}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  {isEditing ? <Save className="w-4 h-4 inline mr-2" /> : <Plus className="w-4 h-4 inline mr-2" />}
                  {isEditing ? t('tools.accessSystem.saveChanges', 'Save Changes') : t('tools.accessSystem.createInstallation', 'Create Installation')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-6 py-3 rounded-lg font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {t('tools.accessSystem.cancel', 'Cancel')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('tools.accessSystem.accessUsers', 'Access Users')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.accessSystem.userManagementComingSoon', 'User management coming soon')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t('tools.accessSystem.systemMonitoring', 'System Monitoring')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.accessSystem.liveMonitoringComingSoon', 'Live monitoring coming soon')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('tools.accessSystem.reports', 'Reports')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-4">{t('tools.accessSystem.projectsByStatus', 'Projects by Status')}</h4>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = installations.filter(i => i.status === status).length;
                    return (
                      <div key={status} className="flex justify-between py-2 border-b border-gray-600/20 last:border-0">
                        <span className={config.color}>{config.label}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-4">{t('tools.accessSystem.projectsBySystemType', 'Projects by System Type')}</h4>
                  {SYSTEM_TYPES.map(system => {
                    const count = installations.filter(i => i.systemType === system.type).length;
                    if (count === 0) return null;
                    return (
                      <div key={system.type} className="flex justify-between py-2 border-b border-gray-600/20 last:border-0">
                        <span className="flex items-center gap-2">{system.icon} {system.label}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Zone Modal */}
        {showZoneModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className={`${cardClass} w-full max-w-md`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Add Access Zone
                  <button onClick={() => setShowZoneModal(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.zoneName', 'Zone Name *')}</label>
                  <input
                    type="text"
                    value={newZone.name || ''}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    placeholder={t('tools.accessSystem.frontEntrance', 'Front Entrance')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.zoneType', 'Zone Type')}</label>
                  <select
                    value={newZone.type || 'main_entry'}
                    onChange={(e) => setNewZone({ ...newZone, type: e.target.value as ZoneType })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                  >
                    {ZONE_TYPES.map(zone => (
                      <option key={zone.type} value={zone.type}>{zone.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.accessSystem.numberOfDoors', 'Number of Doors')}</label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.deviceCount || 1}
                    onChange={(e) => setNewZone({ ...newZone, deviceCount: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addZone}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {t('tools.accessSystem.addZone2', 'Add Zone')}
                  </button>
                  <button
                    onClick={() => setShowZoneModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    {t('tools.accessSystem.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default AccessSystemTool;
