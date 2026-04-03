'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Scale,
  Ruler,
  Calendar,
  MapPin,
  Box,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface LoadItem {
  id: string;
  description: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  stackable: boolean;
  fragile: boolean;
  hazmat: boolean;
  hazmatClass?: string;
}

interface FreightLoad {
  id: string;
  loadNumber: string;
  status: 'planning' | 'confirmed' | 'loading' | 'in-transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  customer: string;
  customerContact: string;
  customerPhone: string;
  origin: string;
  originCity: string;
  originState: string;
  originZip: string;
  destination: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  equipment: 'dry-van' | 'reefer' | 'flatbed' | 'step-deck' | 'lowboy' | 'tanker' | 'container' | 'box-truck';
  trailerLength: number;
  trailerWidth: number;
  trailerHeight: number;
  maxWeight: number;
  items: LoadItem[];
  totalWeight: number;
  totalVolume: number;
  loadedPercentage: number;
  rate: number;
  rateType: 'flat' | 'per-mile' | 'per-cwt';
  distance: number;
  driverName: string;
  driverPhone: string;
  truckNumber: string;
  trailerNumber: string;
  specialInstructions: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'loads' | 'planning' | 'optimization' | 'reports';

const LOAD_STATUSES: { value: FreightLoad['status']; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: 'gray' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'loading', label: 'Loading', color: 'yellow' },
  { value: 'in-transit', label: 'In Transit', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const PRIORITIES: { value: FreightLoad['priority']; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const EQUIPMENT_TYPES: { value: FreightLoad['equipment']; label: string; maxWeight: number; dims: number[] }[] = [
  { value: 'dry-van', label: 'Dry Van', maxWeight: 45000, dims: [53, 8.5, 9] },
  { value: 'reefer', label: 'Refrigerated', maxWeight: 43500, dims: [53, 8.5, 9] },
  { value: 'flatbed', label: 'Flatbed', maxWeight: 48000, dims: [53, 8.5, 0] },
  { value: 'step-deck', label: 'Step Deck', maxWeight: 48000, dims: [53, 8.5, 10] },
  { value: 'lowboy', label: 'Lowboy', maxWeight: 40000, dims: [48, 8.5, 0] },
  { value: 'tanker', label: 'Tanker', maxWeight: 45000, dims: [42, 8, 0] },
  { value: 'container', label: 'Container', maxWeight: 44000, dims: [40, 8, 8.5] },
  { value: 'box-truck', label: 'Box Truck', maxWeight: 10000, dims: [26, 8, 8] },
];

const HAZMAT_CLASSES = [
  'Class 1 - Explosives',
  'Class 2 - Gases',
  'Class 3 - Flammable Liquids',
  'Class 4 - Flammable Solids',
  'Class 5 - Oxidizers',
  'Class 6 - Toxic/Infectious',
  'Class 7 - Radioactive',
  'Class 8 - Corrosive',
  'Class 9 - Miscellaneous',
];

// Column configuration for exports
const LOAD_COLUMNS: ColumnConfig[] = [
  { key: 'loadNumber', header: 'Load #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string', format: (value) => LOAD_STATUSES.find(s => s.value === value)?.label || value },
  { key: 'priority', header: 'Priority', type: 'string', format: (value) => PRIORITIES.find(p => p.value === value)?.label || value },
  { key: 'customer', header: 'Customer', type: 'string' },
  { key: 'originCity', header: 'Origin City', type: 'string' },
  { key: 'originState', header: 'Origin State', type: 'string' },
  { key: 'destinationCity', header: 'Destination City', type: 'string' },
  { key: 'destinationState', header: 'Destination State', type: 'string' },
  { key: 'pickupDate', header: 'Pickup Date', type: 'date' },
  { key: 'deliveryDate', header: 'Delivery Date', type: 'date' },
  { key: 'equipment', header: 'Equipment', type: 'string', format: (value) => EQUIPMENT_TYPES.find(e => e.value === value)?.label || value },
  { key: 'totalWeight', header: 'Total Weight (lbs)', type: 'number' },
  { key: 'loadedPercentage', header: 'Load %', type: 'number' },
  { key: 'rate', header: 'Rate', type: 'currency' },
  { key: 'distance', header: 'Distance (miles)', type: 'number' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'truckNumber', header: 'Truck #', type: 'string' },
  { key: 'trailerNumber', header: 'Trailer #', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

// Sample data generator
const generateSampleData = (): FreightLoad[] => [
  {
    id: '1',
    loadNumber: 'LD-2025-0001',
    status: 'confirmed',
    priority: 'high',
    customer: 'ABC Manufacturing',
    customerContact: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    origin: '123 Industrial Blvd',
    originCity: 'Los Angeles',
    originState: 'CA',
    originZip: '90001',
    destination: '456 Commerce St',
    destinationCity: 'Phoenix',
    destinationState: 'AZ',
    destinationZip: '85001',
    pickupDate: '2025-01-02',
    pickupTime: '08:00',
    deliveryDate: '2025-01-03',
    deliveryTime: '14:00',
    equipment: 'dry-van',
    trailerLength: 53,
    trailerWidth: 8.5,
    trailerHeight: 9,
    maxWeight: 45000,
    items: [
      { id: '1', description: 'Palletized Goods', quantity: 24, weight: 1500, length: 48, width: 40, height: 48, stackable: true, fragile: false, hazmat: false },
      { id: '2', description: 'Crated Machinery', quantity: 4, weight: 3500, length: 72, width: 48, height: 60, stackable: false, fragile: true, hazmat: false },
    ],
    totalWeight: 42000,
    totalVolume: 2800,
    loadedPercentage: 85,
    rate: 1850,
    rateType: 'flat',
    distance: 372,
    driverName: 'Mike Johnson',
    driverPhone: '+1 (555) 987-6543',
    truckNumber: 'TRK-101',
    trailerNumber: 'TRL-2501',
    specialInstructions: 'Dock delivery. Call 30 min before arrival.',
    notes: 'Customer prefers morning delivery.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    loadNumber: 'LD-2025-0002',
    status: 'planning',
    priority: 'normal',
    customer: 'Fresh Foods Inc',
    customerContact: 'Sarah Davis',
    customerPhone: '+1 (555) 234-5678',
    origin: '789 Cold Storage Way',
    originCity: 'Fresno',
    originState: 'CA',
    originZip: '93650',
    destination: '321 Market St',
    destinationCity: 'Las Vegas',
    destinationState: 'NV',
    destinationZip: '89101',
    pickupDate: '2025-01-04',
    pickupTime: '06:00',
    deliveryDate: '2025-01-04',
    deliveryTime: '18:00',
    equipment: 'reefer',
    trailerLength: 53,
    trailerWidth: 8.5,
    trailerHeight: 9,
    maxWeight: 43500,
    items: [
      { id: '1', description: 'Frozen Produce', quantity: 40, weight: 800, length: 48, width: 40, height: 48, stackable: true, fragile: false, hazmat: false },
    ],
    totalWeight: 32000,
    totalVolume: 3072,
    loadedPercentage: 70,
    rate: 2.85,
    rateType: 'per-mile',
    distance: 270,
    driverName: '',
    driverPhone: '',
    truckNumber: '',
    trailerNumber: '',
    specialInstructions: 'Temperature must be maintained at 32°F',
    notes: 'Awaiting driver assignment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const emptyLoad: Omit<FreightLoad, 'id' | 'createdAt' | 'updatedAt'> = {
  loadNumber: '',
  status: 'planning',
  priority: 'normal',
  customer: '',
  customerContact: '',
  customerPhone: '',
  origin: '',
  originCity: '',
  originState: '',
  originZip: '',
  destination: '',
  destinationCity: '',
  destinationState: '',
  destinationZip: '',
  pickupDate: '',
  pickupTime: '',
  deliveryDate: '',
  deliveryTime: '',
  equipment: 'dry-van',
  trailerLength: 53,
  trailerWidth: 8.5,
  trailerHeight: 9,
  maxWeight: 45000,
  items: [],
  totalWeight: 0,
  totalVolume: 0,
  loadedPercentage: 0,
  rate: 0,
  rateType: 'flat',
  distance: 0,
  driverName: '',
  driverPhone: '',
  truckNumber: '',
  trailerNumber: '',
  specialInstructions: '',
  notes: '',
};

const emptyItem: Omit<LoadItem, 'id'> = {
  description: '',
  quantity: 1,
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  stackable: true,
  fragile: false,
  hazmat: false,
};

export default function LoadPlannerTool() {
  const { t } = useTranslation();
  const {
    data: loads,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  } = useToolData<FreightLoad>('load-planner', generateSampleData);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<TabType>('loads');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<FreightLoad | null>(null);
  const [formData, setFormData] = useState<Omit<FreightLoad, 'id' | 'createdAt' | 'updatedAt'>>(emptyLoad);
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<LoadItem, 'id'>>(emptyItem);

  // Filtered loads
  const filteredLoads = useMemo(() => {
    return loads.filter((load) => {
      const matchesSearch =
        load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || load.status === statusFilter;
      const matchesEquipment = equipmentFilter === 'all' || load.equipment === equipmentFilter;
      return matchesSearch && matchesStatus && matchesEquipment;
    });
  }, [loads, searchQuery, statusFilter, equipmentFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalLoads = loads.length;
    const activeLoads = loads.filter((l) => ['confirmed', 'loading', 'in-transit'].includes(l.status)).length;
    const deliveredLoads = loads.filter((l) => l.status === 'delivered').length;
    const totalRevenue = loads.reduce((sum, l) => {
      if (l.rateType === 'flat') return sum + l.rate;
      if (l.rateType === 'per-mile') return sum + l.rate * l.distance;
      return sum + (l.rate * l.totalWeight) / 100;
    }, 0);
    const avgLoadPercentage = loads.length > 0
      ? Math.round(loads.reduce((sum, l) => sum + l.loadedPercentage, 0) / loads.length)
      : 0;
    return { totalLoads, activeLoads, deliveredLoads, totalRevenue, avgLoadPercentage };
  }, [loads]);

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    // Calculate totals
    const totalWeight = formData.items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    const totalVolume = formData.items.reduce((sum, item) => sum + (item.length * item.width * item.height * item.quantity) / 1728, 0);
    const trailerVolume = formData.trailerLength * formData.trailerWidth * formData.trailerHeight;
    const loadedPercentage = trailerVolume > 0 ? Math.round((totalVolume / trailerVolume) * 100) : 0;

    const loadData = {
      ...formData,
      totalWeight,
      totalVolume,
      loadedPercentage: Math.min(loadedPercentage, 100),
    };

    if (editingLoad) {
      await updateItem(editingLoad.id, { ...loadData, updatedAt: now });
    } else {
      await addItem({
        ...loadData,
        id: `load-${Date.now()}`,
        loadNumber: formData.loadNumber || `LD-${new Date().getFullYear()}-${String(loads.length + 1).padStart(4, '0')}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyLoad);
    setEditingLoad(null);
    setIsFormOpen(false);
    setNewItem(emptyItem);
  };

  const handleEdit = (load: FreightLoad) => {
    setEditingLoad(load);
    setFormData({
      ...load,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Load',
      message: 'Are you sure you want to delete this load? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const handleEquipmentChange = (equipment: FreightLoad['equipment']) => {
    const eq = EQUIPMENT_TYPES.find((e) => e.value === equipment);
    if (eq) {
      setFormData({
        ...formData,
        equipment,
        trailerLength: eq.dims[0],
        trailerWidth: eq.dims[1],
        trailerHeight: eq.dims[2],
        maxWeight: eq.maxWeight,
      });
    }
  };

  const addItemToLoad = () => {
    if (!newItem.description) return;
    const item: LoadItem = {
      ...newItem,
      id: `item-${Date.now()}`,
    };
    setFormData({
      ...formData,
      items: [...formData.items, item],
    });
    setNewItem(emptyItem);
  };

  const removeItemFromLoad = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.id !== itemId),
    });
  };

  const getStatusColor = (status: FreightLoad['status']) => {
    const s = LOAD_STATUSES.find((st) => st.value === status);
    return s?.color || 'gray';
  };

  const getPriorityColor = (priority: FreightLoad['priority']) => {
    const p = PRIORITIES.find((pr) => pr.value === priority);
    return p?.color || 'gray';
  };

  const formatRate = (load: FreightLoad) => {
    if (load.rateType === 'flat') return `$${load.rate.toLocaleString()}`;
    if (load.rateType === 'per-mile') return `$${load.rate.toFixed(2)}/mi`;
    return `$${load.rate.toFixed(2)}/cwt`;
  };

  const calculateTotal = (load: FreightLoad) => {
    if (load.rateType === 'flat') return load.rate;
    if (load.rateType === 'per-mile') return load.rate * load.distance;
    return (load.rate * load.totalWeight) / 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-teal-600" />
            {t('tools.loadPlanner.loadPlanner', 'Load Planner')}
          </h1>
          <p className="text-gray-600 mt-1">{t('tools.loadPlanner.planAndOptimizeFreightLoads', 'Plan and optimize freight loads')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="load-planner" toolName="Load Planner" />

          <SyncStatus state={syncState} onRetry={refresh} />
          <ExportDropdown
            data={filteredLoads}
            filename="load-planner"
            columns={LOAD_COLUMNS}
          />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.loadPlanner.newLoad', 'New Load')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.totalLoads', 'Total Loads')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalLoads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Truck className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.active', 'Active')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeLoads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.delivered', 'Delivered')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.deliveredLoads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.revenue', 'Revenue')}</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.avgLoad', 'Avg Load %')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgLoadPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {(['loads', 'planning', 'optimization', 'reports'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'loads' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.loadPlanner.searchLoads', 'Search loads...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">{t('tools.loadPlanner.allStatuses', 'All Statuses')}</option>
            {LOAD_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">{t('tools.loadPlanner.allEquipment', 'All Equipment')}</option>
            {EQUIPMENT_TYPES.map((eq) => (
              <option key={eq.value} value={eq.value}>
                {eq.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loads List */}
      {activeTab === 'loads' && (
        <div className="space-y-4">
          {filteredLoads.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.loadPlanner.noLoadsFound', 'No loads found')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.loadPlanner.createANewLoadTo', 'Create a new load to get started')}</p>
            </div>
          ) : (
            filteredLoads.map((load) => (
              <div
                key={load.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedLoadId(expandedLoadId === load.id ? null : load.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{load.loadNumber}</span>
                        <span className="text-sm text-gray-500">{load.customer}</span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(load.status)}-100 text-${getStatusColor(load.status)}-700`}
                      >
                        {LOAD_STATUSES.find((s) => s.value === load.status)?.label}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full bg-${getPriorityColor(load.priority)}-100 text-${getPriorityColor(load.priority)}-700`}
                      >
                        {PRIORITIES.find((p) => p.value === load.priority)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatRate(load)}</p>
                        <p className="text-sm text-gray-500">${calculateTotal(load).toLocaleString()} total</p>
                      </div>
                      {expandedLoadId === load.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {load.originCity}, {load.originState}
                    </div>
                    <ArrowRight className="w-4 h-4" />
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {load.destinationCity}, {load.destinationState}
                    </div>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(load.pickupDate).toLocaleDateString()}
                    </div>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <Scale className="w-4 h-4" />
                      {load.totalWeight.toLocaleString()} lbs
                    </div>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      {load.loadedPercentage}% loaded
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLoadId === load.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Route Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('tools.loadPlanner.routeDetails', 'Route Details')}</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">{t('tools.loadPlanner.origin', 'Origin:')}</span>
                            <p className="text-gray-900">{load.origin}</p>
                            <p className="text-gray-600">{load.originCity}, {load.originState} {load.originZip}</p>
                            <p className="text-gray-600">Pickup: {load.pickupDate} at {load.pickupTime}</p>
                          </div>
                          <div className="mt-3">
                            <span className="text-gray-500">{t('tools.loadPlanner.destination', 'Destination:')}</span>
                            <p className="text-gray-900">{load.destination}</p>
                            <p className="text-gray-600">{load.destinationCity}, {load.destinationState} {load.destinationZip}</p>
                            <p className="text-gray-600">Delivery: {load.deliveryDate} at {load.deliveryTime}</p>
                          </div>
                          <p className="mt-2"><span className="text-gray-500">{t('tools.loadPlanner.distance', 'Distance:')}</span> {load.distance} miles</p>
                        </div>
                      </div>

                      {/* Equipment & Driver */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('tools.loadPlanner.equipmentDriver', 'Equipment & Driver')}</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">{t('tools.loadPlanner.equipment', 'Equipment:')}</span> {EQUIPMENT_TYPES.find((e) => e.value === load.equipment)?.label}</p>
                          <p><span className="text-gray-500">{t('tools.loadPlanner.trailer', 'Trailer:')}</span> {load.trailerLength}&apos; x {load.trailerWidth}&apos; x {load.trailerHeight}&apos;</p>
                          <p><span className="text-gray-500">{t('tools.loadPlanner.maxWeight', 'Max Weight:')}</span> {load.maxWeight.toLocaleString()} lbs</p>
                          {load.driverName && (
                            <>
                              <p className="mt-3"><span className="text-gray-500">{t('tools.loadPlanner.driver', 'Driver:')}</span> {load.driverName}</p>
                              <p><span className="text-gray-500">{t('tools.loadPlanner.phone', 'Phone:')}</span> {load.driverPhone}</p>
                              <p><span className="text-gray-500">{t('tools.loadPlanner.truck', 'Truck:')}</span> {load.truckNumber}</p>
                              <p><span className="text-gray-500">{t('tools.loadPlanner.trailer2', 'Trailer:')}</span> {load.trailerNumber}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Load Items ({load.items.length})</h4>
                        <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                          {load.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                              <div>
                                <p className="font-medium text-gray-900">{item.description}</p>
                                <p className="text-gray-500">Qty: {item.quantity} | {item.weight} lbs ea</p>
                              </div>
                              <div className="flex gap-1">
                                {item.fragile && <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">{t('tools.loadPlanner.fragile', 'Fragile')}</span>}
                                {item.hazmat && <span className="px-1 py-0.5 text-xs bg-red-100 text-red-700 rounded">{t('tools.loadPlanner.hazmat', 'Hazmat')}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {(load.specialInstructions || load.notes) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {load.specialInstructions && (
                          <p className="text-sm"><span className="text-gray-500">{t('tools.loadPlanner.specialInstructions', 'Special Instructions:')}</span> {load.specialInstructions}</p>
                        )}
                        {load.notes && (
                          <p className="text-sm mt-1"><span className="text-gray-500">{t('tools.loadPlanner.notes', 'Notes:')}</span> {load.notes}</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(load);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.loadPlanner.edit', 'Edit')}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(load.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Planning Tab */}
      {activeTab === 'planning' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.loadPlanner.loadPlanningDashboard', 'Load Planning Dashboard')}</h3>
          <p className="text-gray-600">{t('tools.loadPlanner.visualLoadPlanningToolsComing', 'Visual load planning tools coming soon...')}</p>
        </div>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.loadPlanner.loadOptimization', 'Load Optimization')}</h3>
          <p className="text-gray-600">{t('tools.loadPlanner.aiPoweredLoadOptimizationSuggestions', 'AI-powered load optimization suggestions coming soon...')}</p>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            {t('tools.loadPlanner.loadReports', 'Load Reports')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.totalLoadsThisMonth', 'Total Loads This Month')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLoads}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.totalRevenue', 'Total Revenue')}</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.loadPlanner.averageLoadUtilization', 'Average Load Utilization')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgLoadPercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLoad ? t('tools.loadPlanner.editLoad', 'Edit Load') : t('tools.loadPlanner.newLoad2', 'New Load')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.loadNumber', 'Load Number')}</label>
                  <input
                    type="text"
                    value={formData.loadNumber}
                    onChange={(e) => setFormData({ ...formData, loadNumber: e.target.value })}
                    placeholder={t('tools.loadPlanner.autoGenerated', 'Auto-generated')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FreightLoad['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {LOAD_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.priority', 'Priority')}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as FreightLoad['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.equipmentType', 'Equipment Type')}</label>
                  <select
                    value={formData.equipment}
                    onChange={(e) => handleEquipmentChange(e.target.value as FreightLoad['equipment'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {EQUIPMENT_TYPES.map((eq) => (
                      <option key={eq.value} value={eq.value}>{eq.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">{t('tools.loadPlanner.customerInformation', 'Customer Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.customerName', 'Customer Name')}</label>
                    <input
                      type="text"
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.contactName', 'Contact Name')}</label>
                    <input
                      type="text"
                      value={formData.customerContact}
                      onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.phone2', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{t('tools.loadPlanner.origin2', 'Origin')}</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('tools.loadPlanner.address', 'Address')}
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder={t('tools.loadPlanner.city', 'City')}
                        value={formData.originCity}
                        onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder={t('tools.loadPlanner.state', 'State')}
                        value={formData.originState}
                        onChange={(e) => setFormData({ ...formData, originState: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder={t('tools.loadPlanner.zip', 'ZIP')}
                        value={formData.originZip}
                        onChange={(e) => setFormData({ ...formData, originZip: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{t('tools.loadPlanner.destination2', 'Destination')}</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('tools.loadPlanner.address2', 'Address')}
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder={t('tools.loadPlanner.city2', 'City')}
                        value={formData.destinationCity}
                        onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder={t('tools.loadPlanner.state2', 'State')}
                        value={formData.destinationState}
                        onChange={(e) => setFormData({ ...formData, destinationState: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder={t('tools.loadPlanner.zip2', 'ZIP')}
                        value={formData.destinationZip}
                        onChange={(e) => setFormData({ ...formData, destinationZip: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="time"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate & Distance */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.rate', 'Rate')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.rateType', 'Rate Type')}</label>
                  <select
                    value={formData.rateType}
                    onChange={(e) => setFormData({ ...formData, rateType: e.target.value as FreightLoad['rateType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="flat">{t('tools.loadPlanner.flatRate', 'Flat Rate')}</option>
                    <option value="per-mile">{t('tools.loadPlanner.perMile', 'Per Mile')}</option>
                    <option value="per-cwt">{t('tools.loadPlanner.perCwt', 'Per CWT')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.distanceMiles', 'Distance (miles)')}</label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.maxWeightLbs', 'Max Weight (lbs)')}</label>
                  <input
                    type="number"
                    value={formData.maxWeight}
                    onChange={(e) => setFormData({ ...formData, maxWeight: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Driver & Equipment Assignment */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">{t('tools.loadPlanner.driverEquipmentAssignment', 'Driver & Equipment Assignment')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.driverName', 'Driver Name')}</label>
                    <input
                      type="text"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.driverPhone', 'Driver Phone')}</label>
                    <input
                      type="tel"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.truckNumber', 'Truck Number')}</label>
                    <input
                      type="text"
                      value={formData.truckNumber}
                      onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.trailerNumber', 'Trailer Number')}</label>
                    <input
                      type="text"
                      value={formData.trailerNumber}
                      onChange={(e) => setFormData({ ...formData, trailerNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Load Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">{t('tools.loadPlanner.loadItems', 'Load Items')}</h3>
                <div className="space-y-3">
                  {/* Current Items */}
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} | {item.weight} lbs | {item.length}&quot;x{item.width}&quot;x{item.height}&quot;
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {item.stackable && <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">{t('tools.loadPlanner.stackable', 'Stackable')}</span>}
                        {item.fragile && <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">{t('tools.loadPlanner.fragile2', 'Fragile')}</span>}
                        {item.hazmat && <span className="px-1 py-0.5 text-xs bg-red-100 text-red-700 rounded">{t('tools.loadPlanner.hazmat2', 'Hazmat')}</span>}
                      </div>
                      <button
                        onClick={() => removeItemFromLoad(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Item */}
                  <div className="p-3 border border-dashed border-gray-300 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder={t('tools.loadPlanner.description', 'Description')}
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <input
                        type="number"
                        placeholder={t('tools.loadPlanner.qty', 'Qty')}
                        value={newItem.quantity || ''}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="number"
                        placeholder={t('tools.loadPlanner.weightLbs', 'Weight (lbs)')}
                        value={newItem.weight || ''}
                        onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="L x W x H"
                        onChange={(e) => {
                          const dims = e.target.value.split('x').map((d) => parseFloat(d.trim()) || 0);
                          setNewItem({ ...newItem, length: dims[0] || 0, width: dims[1] || 0, height: dims[2] || 0 });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <button
                        onClick={addItemToLoad}
                        disabled={!newItem.description}
                        className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('tools.loadPlanner.add', 'Add')}
                      </button>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newItem.stackable}
                          onChange={(e) => setNewItem({ ...newItem, stackable: e.target.checked })}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        {t('tools.loadPlanner.stackable2', 'Stackable')}
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newItem.fragile}
                          onChange={(e) => setNewItem({ ...newItem, fragile: e.target.checked })}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        {t('tools.loadPlanner.fragile3', 'Fragile')}
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newItem.hazmat}
                          onChange={(e) => setNewItem({ ...newItem, hazmat: e.target.checked })}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        {t('tools.loadPlanner.hazmat3', 'Hazmat')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.specialInstructions2', 'Special Instructions')}</label>
                  <textarea
                    rows={3}
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loadPlanner.notes2', 'Notes')}</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('tools.loadPlanner.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Save className="w-4 h-4" />
                {editingLoad ? t('tools.loadPlanner.updateLoad', 'Update Load') : t('tools.loadPlanner.createLoad', 'Create Load')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export { LoadPlannerTool };
