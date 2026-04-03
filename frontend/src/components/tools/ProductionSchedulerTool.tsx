'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Factory,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Circle,
  AlertTriangle,
  BarChart3,
  Users,
  Package,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
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

// Interfaces
interface ProductionOrder {
  id: string;
  order_number: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  work_center: string;
  start_date: string;
  end_date: string;
  actual_start?: string;
  actual_end?: string;
  assigned_team?: string;
  machine?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface ProductionSchedulerToolProps {
  uiConfig?: any;
}

// Status configurations
const orderStatuses = [
  { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'gray' },
  { value: 'in-progress', label: 'In Progress', icon: PlayCircle, color: 'blue' },
  { value: 'on-hold', label: 'On Hold', icon: PauseCircle, color: 'yellow' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'green' },
  { value: 'cancelled', label: 'Cancelled', icon: X, color: 'red' },
];

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

// Column configuration for exports
const productionColumns: ColumnConfig[] = [
  { key: 'order_number', header: 'Order #', type: 'string' },
  { key: 'product_name', header: 'Product', type: 'string' },
  { key: 'product_code', header: 'Code', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'work_center', header: 'Work Center', type: 'string' },
  { key: 'start_date', header: 'Start Date', type: 'date' },
  { key: 'end_date', header: 'End Date', type: 'date' },
  { key: 'assigned_team', header: 'Team', type: 'string' },
  { key: 'machine', header: 'Machine', type: 'string' },
  { key: 'created_at', header: 'Created', type: 'date' },
];

// Generate sample data
const generateSampleData = (): ProductionOrder[] => {
  return [
    {
      id: 'po-001',
      order_number: 'PO-2024-001',
      product_name: 'Aluminum Housing Assembly',
      product_code: 'AHA-5000',
      quantity: 500,
      unit: 'pcs',
      priority: 'high',
      status: 'in-progress',
      work_center: 'CNC Machining',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_team: 'Team Alpha',
      machine: 'CNC-001',
      notes: 'Rush order for key customer',
      created_at: new Date().toISOString(),
    },
    {
      id: 'po-002',
      order_number: 'PO-2024-002',
      product_name: 'Steel Bracket Set',
      product_code: 'SBS-3200',
      quantity: 1000,
      unit: 'sets',
      priority: 'medium',
      status: 'scheduled',
      work_center: 'Welding',
      start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_team: 'Team Beta',
      machine: 'WLD-002',
      created_at: new Date().toISOString(),
    },
    {
      id: 'po-003',
      order_number: 'PO-2024-003',
      product_name: 'Plastic Component Cover',
      product_code: 'PCC-1500',
      quantity: 2000,
      unit: 'pcs',
      priority: 'low',
      status: 'completed',
      work_center: 'Injection Molding',
      start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      actual_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_team: 'Team Gamma',
      machine: 'INJ-003',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const ProductionSchedulerTool: React.FC<ProductionSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use tool data hook for backend sync
  const {
    data: orders,
    setData: setOrders,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<ProductionOrder>('production-scheduler', generateSampleData(), productionColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    order_number: '',
    product_name: '',
    product_code: '',
    quantity: 0,
    unit: 'pcs',
    priority: 'medium' as ProductionOrder['priority'],
    status: 'scheduled' as ProductionOrder['status'],
    work_center: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    assigned_team: '',
    machine: '',
    notes: '',
  });

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesPriority = !filterPriority || order.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const stats = {
    total: orders.length,
    scheduled: orders.filter(o => o.status === 'scheduled').length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalQuantity: orders.reduce((sum, o) => sum + o.quantity, 0),
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingOrder) {
        updateItem(editingOrder.id, {
          ...formData,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newOrder: ProductionOrder = {
          id: generateId('po'),
          ...formData,
          created_at: new Date().toISOString(),
        };
        addItem(newOrder);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      order_number: '',
      product_name: '',
      product_code: '',
      quantity: 0,
      unit: 'pcs',
      priority: 'medium',
      status: 'scheduled',
      work_center: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      assigned_team: '',
      machine: '',
      notes: '',
    });
    setEditingOrder(null);
  };

  const openEditModal = (order: ProductionOrder) => {
    setEditingOrder(order);
    setFormData({
      order_number: order.order_number,
      product_name: order.product_name,
      product_code: order.product_code,
      quantity: order.quantity,
      unit: order.unit,
      priority: order.priority,
      status: order.status,
      work_center: order.work_center,
      start_date: order.start_date,
      end_date: order.end_date,
      assigned_team: order.assigned_team || '',
      machine: order.machine || '',
      notes: order.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Production Order',
      message: 'Are you sure you want to delete this production order?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    const colors: Record<string, string> = {
      gray: 'bg-gray-500/20 text-gray-400',
      blue: 'bg-blue-500/20 text-blue-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      green: 'bg-green-500/20 text-green-400',
      red: 'bg-red-500/20 text-red-400',
    };
    return colors[statusConfig?.color || 'gray'];
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-500/20 text-gray-400',
      medium: 'bg-blue-500/20 text-blue-400',
      high: 'bg-orange-500/20 text-orange-400',
      urgent: 'bg-red-500/20 text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-xl`}>
              <Factory className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.productionScheduler.productionScheduler', 'Production Scheduler')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.productionScheduler.scheduleAndTrackProductionOrders', 'Schedule and track production orders')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="production-scheduler" toolName="Production Scheduler" />

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
              onExportCSV={() => exportToCSV(orders, productionColumns, { filename: 'production-schedule' })}
              onExportExcel={() => exportToExcel(orders, productionColumns, { filename: 'production-schedule' })}
              onExportJSON={() => exportToJSON(orders, { filename: 'production-schedule' })}
              onExportPDF={() => exportToPDF(orders, productionColumns, { filename: 'production-schedule', title: 'Production Schedule' })}
              onPrint={() => printData(orders, productionColumns, { title: 'Production Schedule' })}
              onCopyToClipboard={() => copyUtil(orders, productionColumns)}
              disabled={orders.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.productionScheduler.newOrder', 'New Order')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduler.totalOrders', 'Total Orders')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduler.scheduled', 'Scheduled')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.scheduled}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduler.inProgress', 'In Progress')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.inProgress}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduler.completed', 'Completed')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduler.totalUnits', 'Total Units')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalQuantity.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.productionScheduler.searchOrders', 'Search orders...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.productionScheduler.allStatuses', 'All Statuses')}</option>
                {orderStatuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.productionScheduler.allPriorities', 'All Priorities')}</option>
                {priorityLevels.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.order', 'Order #')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.product', 'Product')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.quantity', 'Quantity')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.workCenter', 'Work Center')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.schedule', 'Schedule')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.priority', 'Priority')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.status', 'Status')}</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{order.order_number}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className={isDark ? 'text-white' : 'text-gray-900'}>{order.product_name}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{order.product_code}</div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {order.quantity.toLocaleString()} {order.unit}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{order.work_center}</td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(order.start_date).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        to {new Date(order.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                        {priorityLevels.find(p => p.value === order.priority)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {orderStatuses.find(s => s.value === order.status)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(order)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <Factory className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.productionScheduler.noProductionOrdersFound', 'No production orders found')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingOrder ? t('tools.productionScheduler.editProductionOrder', 'Edit Production Order') : t('tools.productionScheduler.newProductionOrder', 'New Production Order')}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.orderNumber', 'Order Number *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.order_number}
                      onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.productionScheduler.po2024001', 'PO-2024-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.productName', 'Product Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.productCode', 'Product Code *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.product_code}
                      onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.quantity2', 'Quantity *')}</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.unit', 'Unit')}</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="pcs">{t('tools.productionScheduler.pieces', 'Pieces')}</option>
                        <option value="sets">{t('tools.productionScheduler.sets', 'Sets')}</option>
                        <option value="kg">{t('tools.productionScheduler.kilograms', 'Kilograms')}</option>
                        <option value="m">{t('tools.productionScheduler.meters', 'Meters')}</option>
                        <option value="l">{t('tools.productionScheduler.liters', 'Liters')}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.workCenter2', 'Work Center *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.work_center}
                      onChange={(e) => setFormData({ ...formData, work_center: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.machine', 'Machine')}</label>
                    <input
                      type="text"
                      value={formData.machine}
                      onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.startDate', 'Start Date *')}</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.endDate', 'End Date *')}</label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.priority2', 'Priority')}</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProductionOrder['priority'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {priorityLevels.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.status2', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductionOrder['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {orderStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.assignedTeam', 'Assigned Team')}</label>
                    <input
                      type="text"
                      value={formData.assigned_team}
                      onChange={(e) => setFormData({ ...formData, assigned_team: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduler.notes', 'Notes')}</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.productionScheduler.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingOrder ? t('tools.productionScheduler.update', 'Update') : t('tools.productionScheduler.create', 'Create')} Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ProductionSchedulerTool;
