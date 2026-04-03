'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Wrench,
  Settings,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  DollarSign,
  Wrench as Tool,
  Zap,
  ThermometerSun,
  Gauge,
  Timer,
  FileText,
  Camera,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
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

interface EquipmentRepairPoolToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type RepairStatus = 'pending' | 'in-progress' | 'awaiting-parts' | 'completed' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type EquipmentType = 'pump' | 'filter' | 'heater' | 'chlorinator' | 'cleaner' | 'lights' | 'controller' | 'valve' | 'motor' | 'plumbing' | 'deck-equipment' | 'other';

interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  poolAddress: string;
  equipmentType: EquipmentType;
  equipmentBrand: string;
  equipmentModel: string;
  problemDescription: string;
  diagnosis: string;
  status: RepairStatus;
  priority: Priority;
  assignedTechnician: string;
  estimatedCost: number;
  actualCost: number;
  laborHours: number;
  laborRate: number;
  partsUsed: string[];
  partsCost: number;
  warrantyStatus: 'in-warranty' | 'out-of-warranty' | 'extended' | 'unknown';
  createdDate: string;
  scheduledDate: string;
  completedDate?: string;
  notes: string;
  photos: string[];
  createdAt: string;
}

interface Part {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  cost: number;
  quantity: number;
  supplier: string;
}

// Constants
const EQUIPMENT_TYPES: { type: EquipmentType; label: string; icon: React.ReactNode }[] = [
  { type: 'pump', label: 'Pump', icon: <Gauge className="w-4 h-4" /> },
  { type: 'filter', label: 'Filter', icon: <Settings className="w-4 h-4" /> },
  { type: 'heater', label: 'Heater', icon: <ThermometerSun className="w-4 h-4" /> },
  { type: 'chlorinator', label: 'Salt Chlorinator', icon: <Zap className="w-4 h-4" /> },
  { type: 'cleaner', label: 'Pool Cleaner', icon: <Tool className="w-4 h-4" /> },
  { type: 'lights', label: 'Pool Lights', icon: <Zap className="w-4 h-4" /> },
  { type: 'controller', label: 'Automation Controller', icon: <Settings className="w-4 h-4" /> },
  { type: 'valve', label: 'Valve/Actuator', icon: <Settings className="w-4 h-4" /> },
  { type: 'motor', label: 'Motor', icon: <Gauge className="w-4 h-4" /> },
  { type: 'plumbing', label: 'Plumbing', icon: <Wrench className="w-4 h-4" /> },
  { type: 'deck-equipment', label: 'Deck Equipment', icon: <Tool className="w-4 h-4" /> },
  { type: 'other', label: 'Other', icon: <Wrench className="w-4 h-4" /> },
];

const STATUS_COLORS: Record<RepairStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'awaiting-parts': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const WARRANTY_COLORS: Record<string, string> = {
  'in-warranty': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'out-of-warranty': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  extended: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  unknown: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const COMMON_PARTS: Part[] = [
  { id: '1', name: 'Pump Seal', partNumber: 'PS-100', category: 'pump', cost: 25, quantity: 10, supplier: 'Pool Parts Co' },
  { id: '2', name: 'Filter Cartridge', partNumber: 'FC-200', category: 'filter', cost: 75, quantity: 5, supplier: 'Filter Supply' },
  { id: '3', name: 'Heater Igniter', partNumber: 'HI-300', category: 'heater', cost: 150, quantity: 3, supplier: 'Heater Parts Inc' },
  { id: '4', name: 'Salt Cell', partNumber: 'SC-400', category: 'chlorinator', cost: 400, quantity: 2, supplier: 'Chlorinator Pro' },
  { id: '5', name: 'Motor Capacitor', partNumber: 'MC-500', category: 'motor', cost: 35, quantity: 8, supplier: 'Motor Parts' },
  { id: '6', name: 'O-Ring Kit', partNumber: 'OR-600', category: 'general', cost: 15, quantity: 20, supplier: 'Pool Parts Co' },
  { id: '7', name: 'Impeller', partNumber: 'IMP-700', category: 'pump', cost: 65, quantity: 4, supplier: 'Pump Supply' },
  { id: '8', name: 'Control Board', partNumber: 'CB-800', category: 'controller', cost: 250, quantity: 2, supplier: 'Electronics Plus' },
];

// Column configuration for exports
const REPAIR_COLUMNS: ColumnConfig[] = [
  { key: 'ticketNumber', header: 'Ticket #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'equipmentType', header: 'Equipment', type: 'string' },
  { key: 'problemDescription', header: 'Problem', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'assignedTechnician', header: 'Technician', type: 'string' },
  { key: 'estimatedCost', header: 'Est. Cost', type: 'currency' },
  { key: 'scheduledDate', header: 'Scheduled', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateTicketNumber = () => `RPR-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const EquipmentRepairPoolTool: React.FC<EquipmentRepairPoolToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: repairs,
    addItem: addRepairToBackend,
    updateItem: updateRepairBackend,
    deleteItem: deleteRepairBackend,
    isSynced: repairsSynced,
    isSaving: repairsSaving,
    lastSaved: repairsLastSaved,
    syncError: repairsSyncError,
    forceSync: forceRepairsSync,
  } = useToolData<RepairTicket>('pool-equipment-repairs', [], REPAIR_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'parts'>('active');
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairTicket | null>(null);
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');

  // Form states
  const [newRepair, setNewRepair] = useState<Partial<RepairTicket>>({
    customerName: '',
    poolAddress: '',
    equipmentType: 'pump',
    equipmentBrand: '',
    equipmentModel: '',
    problemDescription: '',
    diagnosis: '',
    status: 'pending',
    priority: 'medium',
    assignedTechnician: '',
    estimatedCost: 0,
    actualCost: 0,
    laborHours: 0,
    laborRate: 85,
    partsUsed: [],
    partsCost: 0,
    warrantyStatus: 'unknown',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
    photos: [],
  });

  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  // Technicians
  const [technicians] = useState([
    { id: '1', name: 'John Smith', specialty: 'pumps' },
    { id: '2', name: 'Mike Johnson', specialty: 'heaters' },
    { id: '3', name: 'Sarah Williams', specialty: 'automation' },
    { id: '4', name: 'Tom Davis', specialty: 'general' },
  ]);

  // Filtered repairs
  const filteredRepairs = useMemo(() => {
    return repairs.filter(repair => {
      const matchesSearch = searchTerm === '' ||
        repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.problemDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
      const matchesEquipment = filterEquipment === 'all' || repair.equipmentType === filterEquipment;
      return matchesSearch && matchesStatus && matchesEquipment;
    }).sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [repairs, searchTerm, filterStatus, filterEquipment]);

  // Active and completed repairs
  const activeRepairs = useMemo(() =>
    filteredRepairs.filter(r => r.status !== 'completed' && r.status !== 'cancelled'),
  [filteredRepairs]);

  const completedRepairs = useMemo(() =>
    filteredRepairs.filter(r => r.status === 'completed'),
  [filteredRepairs]);

  // Stats
  const stats = useMemo(() => {
    const pending = repairs.filter(r => r.status === 'pending').length;
    const inProgress = repairs.filter(r => r.status === 'in-progress').length;
    const awaitingParts = repairs.filter(r => r.status === 'awaiting-parts').length;
    const completedThisMonth = repairs.filter(r => {
      if (r.status !== 'completed' || !r.completedDate) return false;
      const completed = new Date(r.completedDate);
      const now = new Date();
      return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = completedThisMonth.reduce((sum, r) => sum + r.actualCost, 0);
    const avgRepairTime = completedRepairs.length > 0
      ? completedRepairs.reduce((sum, r) => sum + r.laborHours, 0) / completedRepairs.length
      : 0;

    return {
      pending,
      inProgress,
      awaitingParts,
      completedThisMonth: completedThisMonth.length,
      monthlyRevenue,
      avgRepairTime: avgRepairTime.toFixed(1),
    };
  }, [repairs, completedRepairs]);

  // Add repair
  const handleAddRepair = () => {
    if (!newRepair.customerName || !newRepair.problemDescription) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const partsCost = selectedParts.reduce((sum, partId) => {
      const part = COMMON_PARTS.find(p => p.id === partId);
      return sum + (part?.cost || 0);
    }, 0);

    const laborCost = (newRepair.laborHours || 0) * (newRepair.laborRate || 85);
    const estimatedCost = partsCost + laborCost;

    const repair: RepairTicket = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      customerId: generateId(),
      customerName: newRepair.customerName || '',
      poolAddress: newRepair.poolAddress || '',
      equipmentType: newRepair.equipmentType || 'pump',
      equipmentBrand: newRepair.equipmentBrand || '',
      equipmentModel: newRepair.equipmentModel || '',
      problemDescription: newRepair.problemDescription || '',
      diagnosis: newRepair.diagnosis || '',
      status: 'pending',
      priority: newRepair.priority || 'medium',
      assignedTechnician: newRepair.assignedTechnician || '',
      estimatedCost,
      actualCost: 0,
      laborHours: newRepair.laborHours || 0,
      laborRate: newRepair.laborRate || 85,
      partsUsed: selectedParts.map(id => COMMON_PARTS.find(p => p.id === id)?.name || ''),
      partsCost,
      warrantyStatus: newRepair.warrantyStatus || 'unknown',
      createdDate: new Date().toISOString().split('T')[0],
      scheduledDate: newRepair.scheduledDate || new Date().toISOString().split('T')[0],
      notes: newRepair.notes || '',
      photos: [],
      createdAt: new Date().toISOString(),
    };

    addRepairToBackend(repair);
    setShowRepairForm(false);
    resetRepairForm();
  };

  // Update repair status
  const updateRepairStatus = (repairId: string, status: RepairStatus) => {
    const updates: Partial<RepairTicket> = { status };
    if (status === 'completed') {
      updates.completedDate = new Date().toISOString().split('T')[0];
      const repair = repairs.find(r => r.id === repairId);
      if (repair) {
        updates.actualCost = repair.estimatedCost;
      }
    }
    updateRepairBackend(repairId, updates);
  };

  // Delete repair
  const handleDeleteRepair = async (repairId: string) => {
    const confirmed = await confirm({
      title: 'Delete Repair',
      message: 'Are you sure you want to delete this repair ticket?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteRepairBackend(repairId);
    }
  };

  // Reset form
  const resetRepairForm = () => {
    setNewRepair({
      customerName: '',
      poolAddress: '',
      equipmentType: 'pump',
      equipmentBrand: '',
      equipmentModel: '',
      problemDescription: '',
      diagnosis: '',
      status: 'pending',
      priority: 'medium',
      assignedTechnician: '',
      estimatedCost: 0,
      actualCost: 0,
      laborHours: 0,
      laborRate: 85,
      partsUsed: [],
      partsCost: 0,
      warrantyStatus: 'unknown',
      scheduledDate: new Date().toISOString().split('T')[0],
      notes: '',
      photos: [],
    });
    setSelectedParts([]);
  };

  const getEquipmentIcon = (type: EquipmentType) => {
    const equipment = EQUIPMENT_TYPES.find(e => e.type === type);
    return equipment?.icon || <Wrench className="w-4 h-4" />;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.equipmentRepairPool.poolEquipmentRepair', 'Pool Equipment Repair')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.equipmentRepairPool.trackAndManagePoolEquipment', 'Track and manage pool equipment repairs and maintenance')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="equipment-repair-pool" toolName="Equipment Repair Pool" />

              <SyncStatus
                isSynced={repairsSynced}
                isSaving={repairsSaving}
                lastSaved={repairsLastSaved}
                syncError={repairsSyncError}
                onForceSync={forceRepairsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(repairs, REPAIR_COLUMNS, { filename: 'pool-equipment-repairs' })}
                onExportExcel={() => exportToExcel(repairs, REPAIR_COLUMNS, { filename: 'pool-equipment-repairs' })}
                onExportJSON={() => exportToJSON(repairs, { filename: 'pool-equipment-repairs' })}
                onExportPDF={async () => {
                  await exportToPDF(repairs, REPAIR_COLUMNS, {
                    filename: 'pool-equipment-repairs',
                    title: 'Pool Equipment Repair Report',
                    subtitle: `${repairs.length} repairs | ${formatCurrency(stats.monthlyRevenue)} this month`,
                  });
                }}
                onPrint={() => printData(repairs, REPAIR_COLUMNS, { title: 'Pool Equipment Repairs' })}
                onCopyToClipboard={async () => copyUtil(repairs, REPAIR_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'active', label: 'Active Repairs', icon: <Wrench className="w-4 h-4" />, count: activeRepairs.length },
              { id: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, count: completedRepairs.length },
              { id: 'parts', label: 'Parts Inventory', icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Pending', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'bg-gray-500' },
            { label: 'In Progress', value: stats.inProgress, icon: <Wrench className="w-5 h-5" />, color: 'bg-blue-500' },
            { label: 'Awaiting Parts', value: stats.awaitingParts, icon: <Timer className="w-5 h-5" />, color: 'bg-yellow-500' },
            { label: 'Completed (Month)', value: stats.completedThisMonth, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-500' },
            { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-500' },
            { label: 'Avg. Repair Hours', value: stats.avgRepairTime, icon: <Timer className="w-5 h-5" />, color: 'bg-purple-500' },
          ].map((stat, idx) => (
            <div key={idx} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <span className="text-white">{stat.icon}</span>
                </div>
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </span>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Active Repairs Tab */}
        {activeTab === 'active' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.equipmentRepairPool.searchRepairs', 'Search repairs...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <select
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.equipmentRepairPool.allEquipment', 'All Equipment')}</option>
                {EQUIPMENT_TYPES.map((eq) => (
                  <option key={eq.type} value={eq.type}>{eq.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowRepairForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.equipmentRepairPool.newRepair', 'New Repair')}
              </button>
            </div>

            {/* Repairs List */}
            <div className="space-y-4">
              {activeRepairs.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.equipmentRepairPool.noActiveRepairsCreateA', 'No active repairs. Create a new repair ticket to get started.')}</p>
                </div>
              ) : (
                activeRepairs.map((repair) => (
                  <div
                    key={repair.id}
                    className={`border rounded-lg p-4 ${
                      theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    } ${repair.priority === 'urgent' ? 'border-l-4 border-l-red-500' : repair.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''} transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {getEquipmentIcon(repair.equipmentType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {repair.ticketNumber}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_COLORS[repair.priority]}`}>
                              {repair.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[repair.status]}`}>
                              {repair.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {repair.customerName} | {EQUIPMENT_TYPES.find(e => e.type === repair.equipmentType)?.label}
                          </p>
                          {repair.equipmentBrand && (
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {repair.equipmentBrand} {repair.equipmentModel}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRepairId(selectedRepairId === repair.id ? null : repair.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRepair(repair.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-red-400 hover:bg-gray-600'
                              : 'bg-gray-100 text-red-600 hover:bg-gray-200'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {repair.problemDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          {formatDate(repair.scheduledDate)}
                        </span>
                      </div>
                      {repair.assignedTechnician && (
                        <div className="flex items-center gap-1">
                          <Wrench className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            {repair.assignedTechnician}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Est. {formatCurrency(repair.estimatedCost)}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${WARRANTY_COLORS[repair.warrantyStatus]}`}>
                        {repair.warrantyStatus.replace('-', ' ')}
                      </span>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {repair.status === 'pending' && (
                        <button
                          onClick={() => updateRepairStatus(repair.id, 'in-progress')}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          {t('tools.equipmentRepairPool.startRepair', 'Start Repair')}
                        </button>
                      )}
                      {repair.status === 'in-progress' && (
                        <>
                          <button
                            onClick={() => updateRepairStatus(repair.id, 'awaiting-parts')}
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                          >
                            {t('tools.equipmentRepairPool.awaitingParts', 'Awaiting Parts')}
                          </button>
                          <button
                            onClick={() => updateRepairStatus(repair.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            {t('tools.equipmentRepairPool.complete', 'Complete')}
                          </button>
                        </>
                      )}
                      {repair.status === 'awaiting-parts' && (
                        <button
                          onClick={() => updateRepairStatus(repair.id, 'in-progress')}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          {t('tools.equipmentRepairPool.partsReceived', 'Parts Received')}
                        </button>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {selectedRepairId === repair.id && (
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {t('tools.equipmentRepairPool.details', 'Details')}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                <strong>{t('tools.equipmentRepairPool.address', 'Address:')}</strong> {repair.poolAddress || 'N/A'}
                              </p>
                              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                <strong>{t('tools.equipmentRepairPool.laborHours', 'Labor Hours:')}</strong> {repair.laborHours}h @ {formatCurrency(repair.laborRate)}/hr
                              </p>
                              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                <strong>{t('tools.equipmentRepairPool.partsCost', 'Parts Cost:')}</strong> {formatCurrency(repair.partsCost)}
                              </p>
                              {repair.diagnosis && (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                  <strong>{t('tools.equipmentRepairPool.diagnosis', 'Diagnosis:')}</strong> {repair.diagnosis}
                                </p>
                              )}
                            </div>
                          </div>
                          {repair.partsUsed.length > 0 && (
                            <div>
                              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('tools.equipmentRepairPool.partsUsed', 'Parts Used')}
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {repair.partsUsed.map((part, idx) => (
                                  <li key={idx} className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    {part}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {repair.notes && (
                          <div className="mt-4">
                            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {t('tools.equipmentRepairPool.notes', 'Notes')}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {repair.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Completed Repairs Tab */}
        {activeTab === 'completed' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.equipmentRepairPool.completedRepairs', 'Completed Repairs')}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.ticket', 'Ticket')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.customer', 'Customer')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.equipment', 'Equipment')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.completed', 'Completed')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.labor', 'Labor')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.total', 'Total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {completedRepairs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.equipmentRepairPool.noCompletedRepairsYet', 'No completed repairs yet.')}
                      </td>
                    </tr>
                  ) : (
                    completedRepairs.map((repair) => (
                      <tr key={repair.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {repair.ticketNumber}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {repair.customerName}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {EQUIPMENT_TYPES.find(e => e.type === repair.equipmentType)?.label}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {repair.completedDate ? formatDate(repair.completedDate) : '-'}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {repair.laborHours}h
                        </td>
                        <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(repair.actualCost || repair.estimatedCost)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Parts Inventory Tab */}
        {activeTab === 'parts' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.equipmentRepairPool.partsInventory', 'Parts Inventory')}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.partName', 'Part Name')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.part', 'Part #')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.category', 'Category')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.cost', 'Cost')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.qty', 'Qty')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.equipmentRepairPool.supplier', 'Supplier')}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_PARTS.map((part) => (
                    <tr key={part.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {part.name}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {part.partNumber}
                      </td>
                      <td className={`py-3 px-4 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {part.category}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatCurrency(part.cost)}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`px-2 py-0.5 rounded ${
                          part.quantity < 3 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          part.quantity < 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {part.quantity}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {part.supplier}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Repair Modal */}
        {showRepairForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.equipmentRepairPool.newRepairTicket', 'New Repair Ticket')}
                </h3>
                <button onClick={() => setShowRepairForm(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.customerName', 'Customer Name *')}
                    </label>
                    <input
                      type="text"
                      value={newRepair.customerName}
                      onChange={(e) => setNewRepair({ ...newRepair, customerName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.poolAddress', 'Pool Address')}
                    </label>
                    <input
                      type="text"
                      value={newRepair.poolAddress}
                      onChange={(e) => setNewRepair({ ...newRepair, poolAddress: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Equipment Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.equipmentType', 'Equipment Type')}
                    </label>
                    <select
                      value={newRepair.equipmentType}
                      onChange={(e) => setNewRepair({ ...newRepair, equipmentType: e.target.value as EquipmentType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {EQUIPMENT_TYPES.map((eq) => (
                        <option key={eq.type} value={eq.type}>{eq.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.brand', 'Brand')}
                    </label>
                    <input
                      type="text"
                      value={newRepair.equipmentBrand}
                      onChange={(e) => setNewRepair({ ...newRepair, equipmentBrand: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.equipmentRepairPool.eGPentairHayward', 'e.g., Pentair, Hayward')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.model', 'Model')}
                    </label>
                    <input
                      type="text"
                      value={newRepair.equipmentModel}
                      onChange={(e) => setNewRepair({ ...newRepair, equipmentModel: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.equipmentRepairPool.problemDescription', 'Problem Description *')}
                  </label>
                  <textarea
                    value={newRepair.problemDescription}
                    onChange={(e) => setNewRepair({ ...newRepair, problemDescription: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.equipmentRepairPool.describeTheProblem', 'Describe the problem...')}
                  />
                </div>

                {/* Priority and Scheduling */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.priority', 'Priority')}
                    </label>
                    <select
                      value={newRepair.priority}
                      onChange={(e) => setNewRepair({ ...newRepair, priority: e.target.value as Priority })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="low">{t('tools.equipmentRepairPool.low', 'Low')}</option>
                      <option value="medium">{t('tools.equipmentRepairPool.medium', 'Medium')}</option>
                      <option value="high">{t('tools.equipmentRepairPool.high', 'High')}</option>
                      <option value="urgent">{t('tools.equipmentRepairPool.urgent', 'Urgent')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.scheduledDate', 'Scheduled Date')}
                    </label>
                    <input
                      type="date"
                      value={newRepair.scheduledDate}
                      onChange={(e) => setNewRepair({ ...newRepair, scheduledDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.assignTechnician', 'Assign Technician')}
                    </label>
                    <select
                      value={newRepair.assignedTechnician}
                      onChange={(e) => setNewRepair({ ...newRepair, assignedTechnician: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.equipmentRepairPool.selectTechnician', 'Select technician...')}</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.name}>{tech.name} ({tech.specialty})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Warranty and Labor */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.warrantyStatus', 'Warranty Status')}
                    </label>
                    <select
                      value={newRepair.warrantyStatus}
                      onChange={(e) => setNewRepair({ ...newRepair, warrantyStatus: e.target.value as RepairTicket['warrantyStatus'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="unknown">{t('tools.equipmentRepairPool.unknown', 'Unknown')}</option>
                      <option value="in-warranty">{t('tools.equipmentRepairPool.inWarranty', 'In Warranty')}</option>
                      <option value="out-of-warranty">{t('tools.equipmentRepairPool.outOfWarranty', 'Out of Warranty')}</option>
                      <option value="extended">{t('tools.equipmentRepairPool.extendedWarranty', 'Extended Warranty')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.estLaborHours', 'Est. Labor Hours')}
                    </label>
                    <input
                      type="number"
                      value={newRepair.laborHours}
                      onChange={(e) => setNewRepair({ ...newRepair, laborHours: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      step="0.5"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.equipmentRepairPool.laborRateHr', 'Labor Rate ($/hr)')}
                    </label>
                    <input
                      type="number"
                      value={newRepair.laborRate}
                      onChange={(e) => setNewRepair({ ...newRepair, laborRate: parseFloat(e.target.value) || 85 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      step="5"
                      min="0"
                    />
                  </div>
                </div>

                {/* Parts Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.equipmentRepairPool.partsNeeded', 'Parts Needed')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg dark:border-gray-600">
                    {COMMON_PARTS.map((part) => (
                      <label key={part.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedParts.includes(part.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParts([...selectedParts, part.id]);
                            } else {
                              setSelectedParts(selectedParts.filter(id => id !== part.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {part.name} ({formatCurrency(part.cost)})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.equipmentRepairPool.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={newRepair.notes}
                    onChange={(e) => setNewRepair({ ...newRepair, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.equipmentRepairPool.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowRepairForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.equipmentRepairPool.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddRepair}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {t('tools.equipmentRepairPool.createTicket', 'Create Ticket')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default EquipmentRepairPoolTool;
