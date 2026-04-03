'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  AlertCircle,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  PlayCircle,
  PauseCircle,
  XCircle,
  Circle,
  Flag,
  Package,
  FileText,
  BarChart3,
  Boxes,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Storage key for localStorage
const STORAGE_KEY = 'work-order-data';

// Interfaces
interface Material {
  id: string;
  work_order_id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  supplier?: string;
  part_number?: string;
  notes?: string;
  created_at: string;
}

interface LaborEntry {
  id: string;
  work_order_id: string;
  worker_name: string;
  date: string;
  hours: number;
  hourly_rate: number;
  total_cost: number;
  task_description?: string;
  created_at: string;
}

interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  assignee?: string;
  due_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  materials: Material[];
  labor_entries: LaborEntry[];
  location?: string;
  equipment?: string;
  created_at: string;
  updated_at?: string;
}

interface WorkOrderData {
  workOrders: WorkOrder[];
  lastUpdated: string;
}

interface WorkOrderToolProps {
  uiConfig?: UIConfig;
}

// Status configurations
const workOrderStatuses = [
  { value: 'pending', label: 'Pending', icon: Circle, color: 'gray' },
  { value: 'in-progress', label: 'In Progress', icon: PlayCircle, color: 'blue' },
  { value: 'on-hold', label: 'On Hold', icon: PauseCircle, color: 'yellow' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'green' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
];

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

// Column configuration for exports
const workOrderColumns: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'assignee', header: 'Assignee', type: 'string' },
  { key: 'due_date', header: 'Due Date', type: 'date' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'equipment', header: 'Equipment', type: 'string' },
  { key: 'estimated_cost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actual_cost', header: 'Actual Cost', type: 'currency' },
  { key: 'materials_count', header: 'Materials Count', type: 'number' },
  { key: 'labor_hours', header: 'Labor Hours', type: 'number' },
  { key: 'created_at', header: 'Created At', type: 'date' },
  { key: 'updated_at', header: 'Updated At', type: 'date' },
];

// Sample data generator
const generateSampleData = (): WorkOrder[] => {
  const sampleWorkOrders: WorkOrder[] = [
    {
      id: 'wo-001',
      title: 'HVAC System Repair - Building A',
      description: 'Replace faulty compressor unit and check refrigerant levels',
      priority: 'high',
      status: 'in-progress',
      assignee: 'John Smith',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_cost: 2500,
      actual_cost: 1800,
      location: 'Building A - Floor 3',
      equipment: 'Carrier AC Unit Model XYZ',
      materials: [
        {
          id: 'mat-001',
          work_order_id: 'wo-001',
          name: 'Compressor Unit',
          quantity: 1,
          unit: 'pcs',
          unit_cost: 850,
          total_cost: 850,
          supplier: 'HVAC Supply Co.',
          part_number: 'CMP-2024-001',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mat-002',
          work_order_id: 'wo-001',
          name: 'Refrigerant R-410A',
          quantity: 5,
          unit: 'lbs',
          unit_cost: 45,
          total_cost: 225,
          supplier: 'CoolGas Inc.',
          part_number: 'R410A-5LB',
          created_at: new Date().toISOString(),
        },
      ],
      labor_entries: [
        {
          id: 'lab-001',
          work_order_id: 'wo-001',
          worker_name: 'John Smith',
          date: new Date().toISOString().split('T')[0],
          hours: 4,
          hourly_rate: 75,
          total_cost: 300,
          task_description: 'Diagnostic and compressor removal',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'wo-002',
      title: 'Electrical Panel Upgrade',
      description: 'Upgrade main electrical panel from 100A to 200A service',
      priority: 'urgent',
      status: 'pending',
      assignee: 'Mike Johnson',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_cost: 4500,
      location: 'Warehouse - Main Building',
      equipment: 'Square D Panel 200A',
      materials: [],
      labor_entries: [],
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'wo-003',
      title: 'Roof Leak Repair',
      description: 'Patch leaking section of roof near ventilation unit',
      priority: 'medium',
      status: 'completed',
      assignee: 'Bob Williams',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_cost: 800,
      actual_cost: 750,
      location: 'Building B - Roof',
      materials: [
        {
          id: 'mat-003',
          work_order_id: 'wo-003',
          name: 'Roofing Sealant',
          quantity: 3,
          unit: 'tubes',
          unit_cost: 25,
          total_cost: 75,
          supplier: 'BuildMart',
          created_at: new Date().toISOString(),
        },
      ],
      labor_entries: [
        {
          id: 'lab-002',
          work_order_id: 'wo-003',
          worker_name: 'Bob Williams',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hours: 6,
          hourly_rate: 65,
          total_cost: 390,
          task_description: 'Roof repair and sealing',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  return sampleWorkOrders;
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const WorkOrderTool: React.FC<WorkOrderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'materials' | 'labor' | 'reports'>('orders');

  // Use tool data hook for backend sync
  const {
    data: workOrders,
    setData: setWorkOrders,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    forceSync,
  } = useToolData<WorkOrder>('work-orders', generateSampleData(), workOrderColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [saving, setSaving] = useState(false);

  // Material modal states
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedOrderForMaterial, setSelectedOrderForMaterial] = useState<WorkOrder | null>(null);
  const [savingMaterial, setSavingMaterial] = useState(false);

  // Labor modal states
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [editingLabor, setEditingLabor] = useState<LaborEntry | null>(null);
  const [selectedOrderForLabor, setSelectedOrderForLabor] = useState<WorkOrder | null>(null);
  const [savingLabor, setSavingLabor] = useState(false);

  // Selected order for detail view
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Form states
  const [orderFormData, setOrderFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as WorkOrder['priority'],
    status: 'pending' as WorkOrder['status'],
    assignee: '',
    due_date: '',
    estimated_cost: 0,
    location: '',
    equipment: '',
  });

  const [materialFormData, setMaterialFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    unit_cost: 0,
    supplier: '',
    part_number: '',
    notes: '',
  });

  const [laborFormData, setLaborFormData] = useState({
    worker_name: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    hourly_rate: 0,
    task_description: '',
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
    totalLaborHours: 0,
    totalMaterialsCost: 0,
  });

  // Calculate stats
  const calculateStats = (orders: WorkOrder[]) => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const inProgress = orders.filter(o => o.status === 'in-progress').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const totalEstimatedCost = orders.reduce((sum, o) => sum + (o.estimated_cost || 0), 0);
    const totalActualCost = orders.reduce((sum, o) => sum + (o.actual_cost || 0), 0);
    const totalLaborHours = orders.reduce((sum, o) =>
      sum + o.labor_entries.reduce((s, l) => s + l.hours, 0), 0);
    const totalMaterialsCost = orders.reduce((sum, o) =>
      sum + o.materials.reduce((s, m) => s + m.total_cost, 0), 0);

    setStats({
      total,
      pending,
      inProgress,
      completed,
      totalEstimatedCost,
      totalActualCost,
      totalLaborHours,
      totalMaterialsCost,
    });
  };

  // Filter work orders
  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assignee?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesPriority = !filterPriority || order.priority === filterPriority;
    const matchesAssignee = !filterAssignee || order.assignee === filterAssignee;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  // Get unique assignees for filter
  const uniqueAssignees = [...new Set(workOrders.map(o => o.assignee).filter(Boolean))];

  useEffect(() => {
    calculateStats(workOrders);
  }, [workOrders]);

  // Handle prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.projectName) {
        setOrderFormData({
          title: params.title || params.projectName || '',
          description: params.description || '',
          priority: 'medium',
          status: 'pending',
          assignee: '',
          due_date: '',
          estimated_cost: params.amount || 0,
          location: params.location || '',
          equipment: '',
        });
        setShowOrderModal(true);
      }
    }
  }, [uiConfig?.params]);

  // Open order modal for new order
  const handleAddOrder = () => {
    setEditingOrder(null);
    setOrderFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assignee: '',
      due_date: '',
      estimated_cost: 0,
      location: '',
      equipment: '',
    });
    setShowOrderModal(true);
  };

  // Open order modal for editing
  const handleEditOrder = (order: WorkOrder) => {
    setEditingOrder(order);
    setOrderFormData({
      title: order.title,
      description: order.description || '',
      priority: order.priority,
      status: order.status,
      assignee: order.assignee || '',
      due_date: order.due_date || '',
      estimated_cost: order.estimated_cost || 0,
      location: order.location || '',
      equipment: order.equipment || '',
    });
    setShowOrderModal(true);
  };

  // Save work order
  const handleSaveOrder = () => {
    if (!orderFormData.title.trim()) {
      setError('Work order title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingOrder) {
        updateItem(editingOrder.id, {
          ...orderFormData,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newOrder: WorkOrder = {
          id: generateId('wo'),
          ...orderFormData,
          materials: [],
          labor_entries: [],
          created_at: new Date().toISOString(),
        };
        addItem(newOrder);
      }

      setShowOrderModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save work order');
    } finally {
      setSaving(false);
    }
  };

  // Delete work order
  const handleDeleteOrder = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Work Order',
      message: 'Are you sure you want to delete this work order? All associated materials and labor entries will also be deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    deleteItem(id);
    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
    }
  };

  // Open material modal
  const handleAddMaterial = (order: WorkOrder) => {
    setSelectedOrderForMaterial(order);
    setEditingMaterial(null);
    setMaterialFormData({
      name: '',
      quantity: 1,
      unit: 'pcs',
      unit_cost: 0,
      supplier: '',
      part_number: '',
      notes: '',
    });
    setShowMaterialModal(true);
  };

  // Edit material
  const handleEditMaterial = (order: WorkOrder, material: Material) => {
    setSelectedOrderForMaterial(order);
    setEditingMaterial(material);
    setMaterialFormData({
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      unit_cost: material.unit_cost,
      supplier: material.supplier || '',
      part_number: material.part_number || '',
      notes: material.notes || '',
    });
    setShowMaterialModal(true);
  };

  // Save material
  const handleSaveMaterial = () => {
    if (!materialFormData.name.trim() || !selectedOrderForMaterial) {
      setError('Material name is required');
      return;
    }

    try {
      setSavingMaterial(true);
      setError(null);

      const totalCost = materialFormData.quantity * materialFormData.unit_cost;

      let updatedMaterials: Material[];
      if (editingMaterial) {
        updatedMaterials = selectedOrderForMaterial.materials.map(m =>
          m.id === editingMaterial.id
            ? { ...m, ...materialFormData, total_cost: totalCost }
            : m
        );
      } else {
        const newMaterial: Material = {
          id: generateId('mat'),
          work_order_id: selectedOrderForMaterial.id,
          ...materialFormData,
          total_cost: totalCost,
          created_at: new Date().toISOString(),
        };
        updatedMaterials = [...selectedOrderForMaterial.materials, newMaterial];
      }

      // Update actual cost
      const materialsCost = updatedMaterials.reduce((sum, m) => sum + m.total_cost, 0);
      const laborCost = selectedOrderForMaterial.labor_entries.reduce((sum, l) => sum + l.total_cost, 0);

      updateItem(selectedOrderForMaterial.id, {
        materials: updatedMaterials,
        actual_cost: materialsCost + laborCost,
        updated_at: new Date().toISOString(),
      });

      setShowMaterialModal(false);

      // Update selected order if viewing
      if (selectedOrder?.id === selectedOrderForMaterial.id) {
        const updated = workOrders.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save material');
    } finally {
      setSavingMaterial(false);
    }
  };

  // Delete material
  const handleDeleteMaterial = async (order: WorkOrder, materialId: string) => {
    const confirmed = await confirm({
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    const updatedMaterials = order.materials.filter(m => m.id !== materialId);
    const materialsCost = updatedMaterials.reduce((sum, m) => sum + m.total_cost, 0);
    const laborCost = order.labor_entries.reduce((sum, l) => sum + l.total_cost, 0);

    updateItem(order.id, {
      materials: updatedMaterials,
      actual_cost: materialsCost + laborCost,
      updated_at: new Date().toISOString(),
    });

    if (selectedOrder?.id === order.id) {
      const updated = workOrders.find(o => o.id === order.id);
      if (updated) setSelectedOrder(updated);
    }
  };

  // Open labor modal
  const handleAddLabor = (order: WorkOrder) => {
    setSelectedOrderForLabor(order);
    setEditingLabor(null);
    setLaborFormData({
      worker_name: '',
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      hourly_rate: 0,
      task_description: '',
    });
    setShowLaborModal(true);
  };

  // Edit labor entry
  const handleEditLabor = (order: WorkOrder, labor: LaborEntry) => {
    setSelectedOrderForLabor(order);
    setEditingLabor(labor);
    setLaborFormData({
      worker_name: labor.worker_name,
      date: labor.date,
      hours: labor.hours,
      hourly_rate: labor.hourly_rate,
      task_description: labor.task_description || '',
    });
    setShowLaborModal(true);
  };

  // Save labor entry
  const handleSaveLabor = () => {
    if (!laborFormData.worker_name.trim() || !selectedOrderForLabor) {
      setError('Worker name is required');
      return;
    }

    try {
      setSavingLabor(true);
      setError(null);

      const totalCost = laborFormData.hours * laborFormData.hourly_rate;

      let updatedLabor: LaborEntry[];
      if (editingLabor) {
        updatedLabor = selectedOrderForLabor.labor_entries.map(l =>
          l.id === editingLabor.id
            ? { ...l, ...laborFormData, total_cost: totalCost }
            : l
        );
      } else {
        const newLabor: LaborEntry = {
          id: generateId('lab'),
          work_order_id: selectedOrderForLabor.id,
          ...laborFormData,
          total_cost: totalCost,
          created_at: new Date().toISOString(),
        };
        updatedLabor = [...selectedOrderForLabor.labor_entries, newLabor];
      }

      // Update actual cost
      const materialsCost = selectedOrderForLabor.materials.reduce((sum, m) => sum + m.total_cost, 0);
      const laborCost = updatedLabor.reduce((sum, l) => sum + l.total_cost, 0);

      updateItem(selectedOrderForLabor.id, {
        labor_entries: updatedLabor,
        actual_cost: materialsCost + laborCost,
        updated_at: new Date().toISOString(),
      });

      setShowLaborModal(false);

      if (selectedOrder?.id === selectedOrderForLabor.id) {
        const updated = workOrders.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save labor entry');
    } finally {
      setSavingLabor(false);
    }
  };

  // Delete labor entry
  const handleDeleteLabor = async (order: WorkOrder, laborId: string) => {
    const confirmed = await confirm({
      title: 'Delete Labor Entry',
      message: 'Are you sure you want to delete this labor entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    const updatedLabor = order.labor_entries.filter(l => l.id !== laborId);
    const materialsCost = order.materials.reduce((sum, m) => sum + m.total_cost, 0);
    const laborCost = updatedLabor.reduce((sum, l) => sum + l.total_cost, 0);

    updateItem(order.id, {
      labor_entries: updatedLabor,
      actual_cost: materialsCost + laborCost,
      updated_at: new Date().toISOString(),
    });

    if (selectedOrder?.id === order.id) {
      const updated = workOrders.find(o => o.id === order.id);
      if (updated) setSelectedOrder(updated);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusObj = workOrderStatuses.find(s => s.value === status);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colorMap[statusObj?.color || 'gray'] || colorMap.gray;
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorityLevels.find(p => p.value === priority);
    const colorMap: Record<string, string> = {
      gray: 'text-gray-500',
      blue: 'text-blue-500',
      orange: 'text-orange-500',
      red: 'text-red-500',
    };
    return colorMap[priorityObj?.color || 'gray'] || colorMap.gray;
  };

  const getPriorityBgColor = (priority: string) => {
    const priorityObj = priorityLevels.find(p => p.value === priority);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colorMap[priorityObj?.color || 'gray'] || colorMap.gray;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Tabs configuration
  const tabs = [
    { id: 'orders', label: 'Orders', icon: FileText },
    { id: 'materials', label: 'Materials', icon: Boxes },
    { id: 'labor', label: 'Labor', icon: Timer },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  // Get all materials across all orders
  const allMaterials = workOrders.flatMap(o => o.materials.map(m => ({ ...m, orderTitle: o.title })));

  // Get all labor entries across all orders
  const allLabor = workOrders.flatMap(o => o.labor_entries.map(l => ({ ...l, orderTitle: o.title })));

  // Prepare data for export with computed fields
  const getExportData = () => {
    return filteredOrders.map(order => ({
      ...order,
      materials_count: order.materials.length,
      labor_hours: order.labor_entries.reduce((sum, l) => sum + l.hours, 0),
    }));
  };

  // Export handlers using hook methods
  const handleExportCSV = () => {
    exportCSV({ filename: 'work-orders' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'work-orders' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'work-orders' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'work-orders',
      title: 'Work Order Report',
      subtitle: `${filteredOrders.length} orders | Generated from Work Order Management`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print('Work Order Report');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard();
  };

  return (
    <>
      <ConfirmDialog />
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-white to-orange-50 border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Wrench className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.workOrder.workOrderManagement', 'Work Order Management')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.workOrder.manufacturingConstructionOrders', 'Manufacturing & Construction Orders')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="work-order" toolName="Work Order" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              disabled={filteredOrders.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={handleAddOrder}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.workOrder.newWorkOrder', 'New Work Order')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `${isDark ? 'text-orange-400 border-b-2 border-orange-400' : 'text-orange-600 border-b-2 border-orange-500'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {activeTab === 'orders' && (
        <div className={`grid grid-cols-4 gap-4 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalOrders', 'Total Orders')}</p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-blue-500" />
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.inProgress', 'In Progress')}</p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.completed', 'Completed')}</p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <p className="text-2xl font-bold text-orange-500">{formatCurrency(stats.totalEstimatedCost)}</p>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalEstimated', 'Total Estimated')}</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {activeTab === 'orders' && (
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.workOrder.searchWorkOrders', 'Search work orders...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-3 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              >
                <option value="">{t('tools.workOrder.allStatuses', 'All Statuses')}</option>
                {workOrderStatuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              >
                <option value="">{t('tools.workOrder.allPriorities', 'All Priorities')}</option>
                {priorityLevels.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              >
                <option value="">{t('tools.workOrder.allAssignees', 'All Assignees')}</option>
                {uniqueAssignees.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="px-4 pb-4">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('tools.workOrder.noWorkOrdersFound', 'No work orders found')}</p>
                <button onClick={handleAddOrder} className="mt-2 text-orange-500 hover:underline">
                  {t('tools.workOrder.createYourFirstWorkOrder', 'Create your first work order')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Flag className={`w-4 h-4 ${getPriorityColor(order.priority)}`} />
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {order.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {workOrderStatuses.find(s => s.value === order.status)?.label}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBgColor(order.priority)}`}>
                            {priorityLevels.find(p => p.value === order.priority)?.label}
                          </span>
                        </div>

                        {order.description && (
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {order.description}
                          </p>
                        )}

                        <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.assignee && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {order.assignee}
                            </span>
                          )}
                          {order.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Due: {formatDate(order.due_date)}
                            </span>
                          )}
                          {order.location && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" /> {order.location}
                            </span>
                          )}
                          {order.estimated_cost && order.estimated_cost > 0 && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <DollarSign className="w-3 h-3" /> Est: {formatCurrency(order.estimated_cost)}
                            </span>
                          )}
                          {order.actual_cost !== undefined && order.actual_cost > 0 && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <DollarSign className="w-3 h-3" /> Actual: {formatCurrency(order.actual_cost)}
                            </span>
                          )}
                        </div>

                        {/* Materials & Labor Summary */}
                        <div className={`flex gap-4 mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <span className="flex items-center gap-1">
                            <Boxes className="w-3 h-3" /> {order.materials.length} materials
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" /> {order.labor_entries.reduce((s, l) => s + l.hours, 0)} labor hrs
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddMaterial(order)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          title={t('tools.workOrder.addMaterial3', 'Add Material')}
                        >
                          <Boxes className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleAddLabor(order)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          title={t('tools.workOrder.addLabor2', 'Add Labor')}
                        >
                          <Timer className="w-4 h-4 text-purple-500" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          title={t('tools.workOrder.viewDetails', 'View Details')}
                        >
                          <FileText className="w-4 h-4 text-orange-500" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder?.id === order.id && (
                      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        {/* Materials */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Boxes className="w-4 h-4 inline mr-1" /> Materials ({order.materials.length})
                            </h5>
                            <button
                              onClick={() => handleAddMaterial(order)}
                              className="text-xs text-blue-500 hover:underline"
                            >
                              {t('tools.workOrder.addMaterial', '+ Add Material')}
                            </button>
                          </div>
                          {order.materials.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.workOrder.noMaterialsAdded', 'No materials added')}</p>
                          ) : (
                            <div className="space-y-2">
                              {order.materials.map(mat => (
                                <div key={mat.id} className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                  <div>
                                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{mat.name}</span>
                                    <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {mat.quantity} {mat.unit} @ {formatCurrency(mat.unit_cost)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-orange-500">{formatCurrency(mat.total_cost)}</span>
                                    <button onClick={() => handleEditMaterial(order, mat)} className="p-1">
                                      <Edit2 className="w-3 h-3 text-gray-400" />
                                    </button>
                                    <button onClick={() => handleDeleteMaterial(order, mat.id)} className="p-1">
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Labor */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Timer className="w-4 h-4 inline mr-1" /> Labor ({order.labor_entries.length})
                            </h5>
                            <button
                              onClick={() => handleAddLabor(order)}
                              className="text-xs text-purple-500 hover:underline"
                            >
                              {t('tools.workOrder.addLabor', '+ Add Labor')}
                            </button>
                          </div>
                          {order.labor_entries.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.workOrder.noLaborEntriesAdded', 'No labor entries added')}</p>
                          ) : (
                            <div className="space-y-2">
                              {order.labor_entries.map(lab => (
                                <div key={lab.id} className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                  <div>
                                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{lab.worker_name}</span>
                                    <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {lab.hours}h @ {formatCurrency(lab.hourly_rate)}/hr - {formatDate(lab.date)}
                                    </span>
                                    {lab.task_description && (
                                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{lab.task_description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-purple-500">{formatCurrency(lab.total_cost)}</span>
                                    <button onClick={() => handleEditLabor(order, lab)} className="p-1">
                                      <Edit2 className="w-3 h-3 text-gray-400" />
                                    </button>
                                    <button onClick={() => handleDeleteLabor(order, lab.id)} className="p-1">
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalMaterials', 'Total Materials')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{allMaterials.length}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalCost', 'Total Cost')}</p>
                <p className="text-2xl font-bold text-blue-500">{formatCurrency(stats.totalMaterialsCost)}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.uniqueSuppliers', 'Unique Suppliers')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {[...new Set(allMaterials.map(m => m.supplier).filter(Boolean))].length}
                </p>
              </div>
            </div>

            {allMaterials.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Boxes className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('tools.workOrder.noMaterialsTrackedYet', 'No materials tracked yet')}</p>
              </div>
            ) : (
              <div className={`rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.material', 'Material')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.workOrder', 'Work Order')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.quantity', 'Quantity')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.unitCost', 'Unit Cost')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.total', 'Total')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.supplier', 'Supplier')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {allMaterials.map(mat => (
                      <tr key={mat.id} className={isDark ? 'bg-gray-800' : 'bg-white'}>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{mat.name}</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{mat.orderTitle}</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{mat.quantity} {mat.unit}</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(mat.unit_cost)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-500">{formatCurrency(mat.total_cost)}</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{mat.supplier || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Labor Tab */}
        {activeTab === 'labor' && (
          <div className="space-y-4">
            <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalEntries', 'Total Entries')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{allLabor.length}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalHours', 'Total Hours')}</p>
                <p className="text-2xl font-bold text-purple-500">{stats.totalLaborHours}h</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalLaborCost', 'Total Labor Cost')}</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatCurrency(allLabor.reduce((sum, l) => sum + l.total_cost, 0))}
                </p>
              </div>
            </div>

            {allLabor.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Timer className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('tools.workOrder.noLaborEntriesTrackedYet', 'No labor entries tracked yet')}</p>
              </div>
            ) : (
              <div className={`rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.worker', 'Worker')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.workOrder2', 'Work Order')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.date', 'Date')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.hours', 'Hours')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.rate', 'Rate')}</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.total2', 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {allLabor.map(lab => (
                      <tr key={lab.id} className={isDark ? 'bg-gray-800' : 'bg-white'}>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{lab.worker_name}</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{lab.orderTitle}</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(lab.date)}</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{lab.hours}h</td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(lab.hourly_rate)}/hr</td>
                        <td className="px-4 py-3 text-sm font-medium text-purple-500">{formatCurrency(lab.total_cost)}</td>
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
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.workOrder.costOverview', 'Cost Overview')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.estimatedTotal', 'Estimated Total:')}</span>
                    <span className="text-sm font-medium text-orange-500">{formatCurrency(stats.totalEstimatedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.actualTotal', 'Actual Total:')}</span>
                    <span className="text-sm font-medium text-emerald-500">{formatCurrency(stats.totalActualCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.materialsCost', 'Materials Cost:')}</span>
                    <span className="text-sm font-medium text-blue-500">{formatCurrency(stats.totalMaterialsCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.laborCost', 'Labor Cost:')}</span>
                    <span className="text-sm font-medium text-purple-500">
                      {formatCurrency(allLabor.reduce((sum, l) => sum + l.total_cost, 0))}
                    </span>
                  </div>
                  <div className={`pt-2 mt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.workOrder.variance', 'Variance:')}</span>
                      <span className={`text-sm font-medium ${stats.totalEstimatedCost - stats.totalActualCost >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(stats.totalEstimatedCost - stats.totalActualCost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.workOrder.statusBreakdown', 'Status Breakdown')}</h4>
                <div className="space-y-2">
                  {workOrderStatuses.map(status => {
                    const count = workOrders.filter(o => o.status === status.value).length;
                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={status.value}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{status.label}</span>
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{count} ({percentage}%)</span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div
                            className={`h-2 rounded-full ${
                              status.color === 'gray' ? 'bg-gray-500' :
                              status.color === 'blue' ? 'bg-blue-500' :
                              status.color === 'yellow' ? 'bg-yellow-500' :
                              status.color === 'green' ? 'bg-emerald-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.workOrder.priorityDistribution', 'Priority Distribution')}</h4>
              <div className="grid grid-cols-4 gap-4">
                {priorityLevels.map(priority => {
                  const count = workOrders.filter(o => o.priority === priority.value).length;
                  return (
                    <div key={priority.value} className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <p className={`text-2xl font-bold ${getPriorityColor(priority.value)}`}>{count}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{priority.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overdue Orders Alert */}
            {workOrders.filter(o =>
              o.due_date &&
              new Date(o.due_date) < new Date() &&
              !['completed', 'cancelled'].includes(o.status)
            ).length > 0 && (
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h4 className={`font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>{t('tools.workOrder.overdueWorkOrders', 'Overdue Work Orders')}</h4>
                </div>
                <div className="space-y-2">
                  {workOrders.filter(o =>
                    o.due_date &&
                    new Date(o.due_date) < new Date() &&
                    !['completed', 'cancelled'].includes(o.status)
                  ).map(order => (
                    <div key={order.id} className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{order.title}</span>
                      <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}>Due: {formatDate(order.due_date!)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Work Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingOrder ? t('tools.workOrder.editWorkOrder', 'Edit Work Order') : t('tools.workOrder.newWorkOrder2', 'New Work Order')}
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.workOrder.title', 'Title *')}
                </label>
                <input
                  type="text"
                  value={orderFormData.title}
                  onChange={(e) => setOrderFormData({ ...orderFormData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.workOrder.enterWorkOrderTitle', 'Enter work order title')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.workOrder.description', 'Description')}
                </label>
                <textarea
                  value={orderFormData.description}
                  onChange={(e) => setOrderFormData({ ...orderFormData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.workOrder.workOrderDescription', 'Work order description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.priority', 'Priority')}
                  </label>
                  <select
                    value={orderFormData.priority}
                    onChange={(e) => setOrderFormData({ ...orderFormData, priority: e.target.value as WorkOrder['priority'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {priorityLevels.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.status', 'Status')}
                  </label>
                  <select
                    value={orderFormData.status}
                    onChange={(e) => setOrderFormData({ ...orderFormData, status: e.target.value as WorkOrder['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {workOrderStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.assignee', 'Assignee')}
                  </label>
                  <input
                    type="text"
                    value={orderFormData.assignee}
                    onChange={(e) => setOrderFormData({ ...orderFormData, assignee: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.workOrder.assignedWorker', 'Assigned worker')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.dueDate', 'Due Date')}
                  </label>
                  <input
                    type="date"
                    value={orderFormData.due_date}
                    onChange={(e) => setOrderFormData({ ...orderFormData, due_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.estimatedCost', 'Estimated Cost')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      value={orderFormData.estimated_cost}
                      onChange={(e) => setOrderFormData({ ...orderFormData, estimated_cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.location', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={orderFormData.location}
                    onChange={(e) => setOrderFormData({ ...orderFormData, location: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.workOrder.workLocation', 'Work location')}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.workOrder.equipment', 'Equipment')}
                </label>
                <input
                  type="text"
                  value={orderFormData.equipment}
                  onChange={(e) => setOrderFormData({ ...orderFormData, equipment: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.workOrder.relatedEquipment', 'Related equipment')}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowOrderModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.workOrder.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t('tools.workOrder.saving', 'Saving...') : t('tools.workOrder.saveWorkOrder', 'Save Work Order')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingMaterial ? t('tools.workOrder.editMaterial', 'Edit Material') : t('tools.workOrder.addMaterial2', 'Add Material')}
                </h3>
                {selectedOrderForMaterial && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Order: {selectedOrderForMaterial.title}
                  </p>
                )}
              </div>
              <button onClick={() => setShowMaterialModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.workOrder.materialName', 'Material Name *')}
                </label>
                <input
                  type="text"
                  value={materialFormData.name}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.workOrder.enterMaterialName', 'Enter material name')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.quantity2', 'Quantity')}
                  </label>
                  <input
                    type="number"
                    value={materialFormData.quantity}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, quantity: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.unit', 'Unit')}
                  </label>
                  <select
                    value={materialFormData.unit}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, unit: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="pcs">pcs</option>
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                    <option value="ft">ft</option>
                    <option value="m">m</option>
                    <option value="gal">gal</option>
                    <option value="L">L</option>
                    <option value="sqft">sqft</option>
                    <option value="rolls">rolls</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.unitCost2', 'Unit Cost')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      value={materialFormData.unit_cost}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, unit_cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.supplier2', 'Supplier')}
                  </label>
                  <input
                    type="text"
                    value={materialFormData.supplier}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, supplier: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.workOrder.supplierName', 'Supplier name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.partNumber', 'Part Number')}
                  </label>
                  <input
                    type="text"
                    value={materialFormData.part_number}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, part_number: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.workOrder.part', 'Part #')}
                  />
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalCost2', 'Total Cost:')}</span>
                  <span className="text-lg font-bold text-blue-500">
                    {formatCurrency(materialFormData.quantity * materialFormData.unit_cost)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowMaterialModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.workOrder.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSaveMaterial}
                disabled={savingMaterial}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {savingMaterial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingMaterial ? t('tools.workOrder.saving2', 'Saving...') : t('tools.workOrder.saveMaterial', 'Save Material')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Labor Modal */}
      {showLaborModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingLabor ? t('tools.workOrder.editLaborEntry', 'Edit Labor Entry') : t('tools.workOrder.addLaborEntry', 'Add Labor Entry')}
                </h3>
                {selectedOrderForLabor && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Order: {selectedOrderForLabor.title}
                  </p>
                )}
              </div>
              <button onClick={() => setShowLaborModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.workOrder.workerName', 'Worker Name *')}
                </label>
                <input
                  type="text"
                  value={laborFormData.worker_name}
                  onChange={(e) => setLaborFormData({ ...laborFormData, worker_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.workOrder.enterWorkerName', 'Enter worker name')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.date2', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={laborFormData.date}
                    onChange={(e) => setLaborFormData({ ...laborFormData, date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.hours2', 'Hours')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={laborFormData.hours}
                    onChange={(e) => setLaborFormData({ ...laborFormData, hours: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.workOrder.hourlyRate', 'Hourly Rate')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      value={laborFormData.hourly_rate}
                      onChange={(e) => setLaborFormData({ ...laborFormData, hourly_rate: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.workOrder.taskDescription', 'Task Description')}
                </label>
                <textarea
                  value={laborFormData.task_description}
                  onChange={(e) => setLaborFormData({ ...laborFormData, task_description: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.workOrder.descriptionOfWorkPerformed', 'Description of work performed')}
                />
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workOrder.totalCost3', 'Total Cost:')}</span>
                  <span className="text-lg font-bold text-purple-500">
                    {formatCurrency(laborFormData.hours * laborFormData.hourly_rate)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowLaborModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.workOrder.cancel3', 'Cancel')}
              </button>
              <button
                onClick={handleSaveLabor}
                disabled={savingLabor}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                {savingLabor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingLabor ? t('tools.workOrder.saving3', 'Saving...') : t('tools.workOrder.saveLaborEntry', 'Save Labor Entry')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default WorkOrderTool;
