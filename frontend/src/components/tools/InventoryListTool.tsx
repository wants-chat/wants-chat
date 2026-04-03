'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Package,
  Box,
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Camera,
  Truck,
  Filter,
  Download,
  CheckSquare,
  Square,
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
interface InventoryItem {
  id: string;
  name: string;
  description: string;
  room: string;
  category: string;
  quantity: number;
  estimatedValue: number;
  estimatedWeight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cubicFeet: number;
  isFragile: boolean;
  requiresDisassembly: boolean;
  requiresSpecialHandling: boolean;
  specialInstructions: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  boxNumber: string;
  isPacked: boolean;
  isLoaded: boolean;
  isDelivered: boolean;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface InventoryList {
  id: string;
  name: string;
  jobId: string;
  customerName: string;
  moveDate: string;
  items: InventoryItem[];
  totalItems: number;
  totalValue: number;
  totalWeight: number;
  totalCubicFeet: number;
  packedCount: number;
  loadedCount: number;
  deliveredCount: number;
  status: 'draft' | 'in_progress' | 'packed' | 'loaded' | 'delivered' | 'complete';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Column configuration for exports
const inventoryColumns: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'room', header: 'Room', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Qty', type: 'number' },
  { key: 'estimatedValue', header: 'Value', type: 'currency' },
  { key: 'estimatedWeight', header: 'Weight (lbs)', type: 'number' },
  { key: 'cubicFeet', header: 'Cu Ft', type: 'number' },
  { key: 'boxNumber', header: 'Box #', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'isFragile', header: 'Fragile', type: 'boolean' },
  { key: 'isPacked', header: 'Packed', type: 'boolean' },
  { key: 'isLoaded', header: 'Loaded', type: 'boolean' },
  { key: 'isDelivered', header: 'Delivered', type: 'boolean' },
];

const listColumns: ColumnConfig[] = [
  { key: 'id', header: 'List ID', type: 'string' },
  { key: 'name', header: 'List Name', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'moveDate', header: 'Move Date', type: 'date' },
  { key: 'totalItems', header: 'Total Items', type: 'number' },
  { key: 'totalValue', header: 'Total Value', type: 'currency' },
  { key: 'totalWeight', header: 'Total Weight', type: 'number' },
  { key: 'totalCubicFeet', header: 'Total Cu Ft', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Categories and Rooms
const CATEGORIES = [
  'Furniture',
  'Electronics',
  'Appliances',
  'Kitchenware',
  'Clothing',
  'Decor',
  'Books & Media',
  'Sports & Recreation',
  'Tools & Hardware',
  'Office Equipment',
  'Antiques & Collectibles',
  'Outdoor & Garden',
  'Miscellaneous',
];

const ROOMS = [
  'Living Room',
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Kitchen',
  'Dining Room',
  'Bathroom',
  'Office',
  'Garage',
  'Basement',
  'Attic',
  'Laundry Room',
  'Outdoor',
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

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

const calculateCubicFeet = (l: number, w: number, h: number) => {
  return Number(((l * w * h) / 1728).toFixed(2)); // Convert cubic inches to cubic feet
};

interface InventoryListToolProps {
  uiConfig?: UIConfig;
}

export const InventoryListTool: React.FC<InventoryListToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: inventoryLists,
    addItem: addList,
    updateItem: updateList,
    deleteItem: deleteList,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<InventoryList>('inventory-lists', [], listColumns);

  // UI State
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [showListForm, setShowListForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'room' | 'value' | 'weight'>('room');

  // List Form State
  const [listForm, setListForm] = useState({
    name: '',
    jobId: '',
    customerName: '',
    moveDate: '',
    notes: '',
  });

  // Item Form State
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    room: 'Living Room',
    category: 'Furniture',
    quantity: 1,
    estimatedValue: 0,
    estimatedWeight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    cubicFeet: 0,
    isFragile: false,
    requiresDisassembly: false,
    requiresSpecialHandling: false,
    specialInstructions: '',
    condition: 'good',
    boxNumber: '',
    isPacked: false,
    isLoaded: false,
    isDelivered: false,
    photos: [],
  });

  // Get active list
  const activeList = useMemo(() => {
    return inventoryLists.find((list) => list.id === activeListId) || null;
  }, [inventoryLists, activeListId]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    if (!activeList) return [];

    let items = [...activeList.items];

    // Apply search
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.boxNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply room filter
    if (filterRoom !== 'all') {
      items = items.filter((item) => item.room === filterRoom);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      items = items.filter((item) => item.category === filterCategory);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      items = items.filter((item) => {
        switch (filterStatus) {
          case 'not_packed':
            return !item.isPacked;
          case 'packed':
            return item.isPacked && !item.isLoaded;
          case 'loaded':
            return item.isLoaded && !item.isDelivered;
          case 'delivered':
            return item.isDelivered;
          default:
            return true;
        }
      });
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'room':
          return a.room.localeCompare(b.room) || a.name.localeCompare(b.name);
        case 'value':
          return b.estimatedValue - a.estimatedValue;
        case 'weight':
          return b.estimatedWeight - a.estimatedWeight;
        default:
          return 0;
      }
    });

    return items;
  }, [activeList, searchTerm, filterRoom, filterCategory, filterStatus, sortBy]);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.customer || params.jobId) {
        setListForm((prev) => ({
          ...prev,
          customerName: params.customer || prev.customerName,
          jobId: params.jobId || prev.jobId,
          moveDate: params.moveDate || prev.moveDate,
        }));
        setShowListForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Create new list
  const createList = () => {
    if (!listForm.name) {
      setValidationMessage('Please enter a list name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newList: InventoryList = {
      id: generateId(),
      ...listForm,
      items: [],
      totalItems: 0,
      totalValue: 0,
      totalWeight: 0,
      totalCubicFeet: 0,
      packedCount: 0,
      loadedCount: 0,
      deliveredCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addList(newList);
    setActiveListId(newList.id);
    setShowListForm(false);
    setListForm({
      name: '',
      jobId: '',
      customerName: '',
      moveDate: '',
      notes: '',
    });
  };

  // Add item to list
  const addItem = () => {
    if (!activeList || !itemForm.name) {
      setValidationMessage('Please enter an item name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const cubicFeet = calculateCubicFeet(
      itemForm.dimensions?.length || 0,
      itemForm.dimensions?.width || 0,
      itemForm.dimensions?.height || 0
    );

    const newItem: InventoryItem = {
      id: editingItem?.id || generateId(),
      name: itemForm.name || '',
      description: itemForm.description || '',
      room: itemForm.room || 'Living Room',
      category: itemForm.category || 'Furniture',
      quantity: itemForm.quantity || 1,
      estimatedValue: itemForm.estimatedValue || 0,
      estimatedWeight: itemForm.estimatedWeight || 0,
      dimensions: itemForm.dimensions || { length: 0, width: 0, height: 0 },
      cubicFeet,
      isFragile: itemForm.isFragile || false,
      requiresDisassembly: itemForm.requiresDisassembly || false,
      requiresSpecialHandling: itemForm.requiresSpecialHandling || false,
      specialInstructions: itemForm.specialInstructions || '',
      condition: itemForm.condition || 'good',
      boxNumber: itemForm.boxNumber || '',
      isPacked: itemForm.isPacked || false,
      isLoaded: itemForm.isLoaded || false,
      isDelivered: itemForm.isDelivered || false,
      photos: itemForm.photos || [],
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedItems: InventoryItem[];
    if (editingItem) {
      updatedItems = activeList.items.map((item) => (item.id === editingItem.id ? newItem : item));
    } else {
      updatedItems = [...activeList.items, newItem];
    }

    // Recalculate totals
    const totals = updatedItems.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + item.quantity,
        totalValue: acc.totalValue + item.estimatedValue * item.quantity,
        totalWeight: acc.totalWeight + item.estimatedWeight * item.quantity,
        totalCubicFeet: acc.totalCubicFeet + item.cubicFeet * item.quantity,
        packedCount: acc.packedCount + (item.isPacked ? item.quantity : 0),
        loadedCount: acc.loadedCount + (item.isLoaded ? item.quantity : 0),
        deliveredCount: acc.deliveredCount + (item.isDelivered ? item.quantity : 0),
      }),
      { totalItems: 0, totalValue: 0, totalWeight: 0, totalCubicFeet: 0, packedCount: 0, loadedCount: 0, deliveredCount: 0 }
    );

    updateList(activeList.id, {
      items: updatedItems,
      ...totals,
      updatedAt: new Date().toISOString(),
    });

    resetItemForm();
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    if (!activeList) return;

    const updatedItems = activeList.items.filter((item) => item.id !== itemId);
    const totals = updatedItems.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + item.quantity,
        totalValue: acc.totalValue + item.estimatedValue * item.quantity,
        totalWeight: acc.totalWeight + item.estimatedWeight * item.quantity,
        totalCubicFeet: acc.totalCubicFeet + item.cubicFeet * item.quantity,
        packedCount: acc.packedCount + (item.isPacked ? item.quantity : 0),
        loadedCount: acc.loadedCount + (item.isLoaded ? item.quantity : 0),
        deliveredCount: acc.deliveredCount + (item.isDelivered ? item.quantity : 0),
      }),
      { totalItems: 0, totalValue: 0, totalWeight: 0, totalCubicFeet: 0, packedCount: 0, loadedCount: 0, deliveredCount: 0 }
    );

    updateList(activeList.id, {
      items: updatedItems,
      ...totals,
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle item status
  const toggleItemStatus = (itemId: string, field: 'isPacked' | 'isLoaded' | 'isDelivered') => {
    if (!activeList) return;

    const updatedItems = activeList.items.map((item) => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: !item[field] };
        // Auto-cascade: if loaded, must be packed; if delivered, must be loaded
        if (field === 'isLoaded' && updated.isLoaded) updated.isPacked = true;
        if (field === 'isDelivered' && updated.isDelivered) {
          updated.isPacked = true;
          updated.isLoaded = true;
        }
        return updated;
      }
      return item;
    });

    const totals = updatedItems.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + item.quantity,
        totalValue: acc.totalValue + item.estimatedValue * item.quantity,
        totalWeight: acc.totalWeight + item.estimatedWeight * item.quantity,
        totalCubicFeet: acc.totalCubicFeet + item.cubicFeet * item.quantity,
        packedCount: acc.packedCount + (item.isPacked ? item.quantity : 0),
        loadedCount: acc.loadedCount + (item.isLoaded ? item.quantity : 0),
        deliveredCount: acc.deliveredCount + (item.isDelivered ? item.quantity : 0),
      }),
      { totalItems: 0, totalValue: 0, totalWeight: 0, totalCubicFeet: 0, packedCount: 0, loadedCount: 0, deliveredCount: 0 }
    );

    updateList(activeList.id, {
      items: updatedItems,
      ...totals,
      updatedAt: new Date().toISOString(),
    });
  };

  // Edit item
  const editItem = (item: InventoryItem) => {
    setItemForm(item);
    setEditingItem(item);
    setShowItemForm(true);
  };

  // Reset item form
  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      room: 'Living Room',
      category: 'Furniture',
      quantity: 1,
      estimatedValue: 0,
      estimatedWeight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      cubicFeet: 0,
      isFragile: false,
      requiresDisassembly: false,
      requiresSpecialHandling: false,
      specialInstructions: '',
      condition: 'good',
      boxNumber: '',
      isPacked: false,
      isLoaded: false,
      isDelivered: false,
      photos: [],
    });
    setEditingItem(null);
    setShowItemForm(false);
  };

  // Export handlers
  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf' | 'clipboard' | 'print') => {
    const exportData = activeList ? filteredItems : inventoryLists;
    const columns = activeList ? inventoryColumns : listColumns;
    const filename = activeList ? `inventory-${activeList.name}` : 'inventory-lists';
    const title = activeList ? `Inventory: ${activeList.name}` : 'Inventory Lists';

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
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'packed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'loaded':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'complete':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'fair':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'poor':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tools.inventoryList.movingInventoryChecklist', 'Moving Inventory Checklist')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.inventoryList.trackAndManageMovingInventory', 'Track and manage moving inventory items')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="inventory-list" toolName="Inventory List" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} error={syncError} onForceSync={forceSync} />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Active List or List Selection */}
      {!activeList ? (
        // List Selection View
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold dark:text-white">{t('tools.inventoryList.inventoryLists', 'Inventory Lists')}</h2>
            <button
              onClick={() => setShowListForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.inventoryList.newList', 'New List')}
            </button>
          </div>

          {/* New List Form */}
          {showListForm && (
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.inventoryList.createNewInventoryList', 'Create New Inventory List')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.inventoryList.listName', 'List Name *')}
                    value={listForm.name}
                    onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.inventoryList.jobId', 'Job ID')}
                    value={listForm.jobId}
                    onChange={(e) => setListForm({ ...listForm, jobId: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.inventoryList.customerName', 'Customer Name')}
                    value={listForm.customerName}
                    onChange={(e) => setListForm({ ...listForm, customerName: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="date"
                    value={listForm.moveDate}
                    onChange={(e) => setListForm({ ...listForm, moveDate: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <textarea
                  placeholder={t('tools.inventoryList.notes', 'Notes')}
                  value={listForm.notes}
                  onChange={(e) => setListForm({ ...listForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <div className="flex gap-2">
                  <button onClick={createList} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    {t('tools.inventoryList.createList', 'Create List')}
                  </button>
                  <button
                    onClick={() => setShowListForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.inventoryList.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lists Grid */}
          {inventoryLists.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.inventoryList.noInventoryListsYetCreate', 'No inventory lists yet. Create your first list to get started.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryLists.map((list) => (
                <Card key={list.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveListId(list.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold dark:text-white">{list.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(list.status)}`}>{list.status.replace('_', ' ')}</span>
                    </div>
                    {list.customerName && <p className="text-sm text-gray-500 dark:text-gray-400">{list.customerName}</p>}
                    {list.moveDate && <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(list.moveDate)}</p>}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('tools.inventoryList.items', 'Items:')}</span>
                        <span className="ml-1 font-medium dark:text-white">{list.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('tools.inventoryList.value', 'Value:')}</span>
                        <span className="ml-1 font-medium dark:text-white">{formatCurrency(list.totalValue)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('tools.inventoryList.weight', 'Weight:')}</span>
                        <span className="ml-1 font-medium dark:text-white">{list.totalWeight} lbs</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('tools.inventoryList.cuFt', 'Cu Ft:')}</span>
                        <span className="ml-1 font-medium dark:text-white">{list.totalCubicFeet}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <div
                        className="flex-1 h-2 bg-yellow-200 dark:bg-yellow-800 rounded"
                        style={{ width: `${(list.packedCount / Math.max(list.totalItems, 1)) * 100}%` }}
                      />
                      <div
                        className="flex-1 h-2 bg-orange-200 dark:bg-orange-800 rounded"
                        style={{ width: `${(list.loadedCount / Math.max(list.totalItems, 1)) * 100}%` }}
                      />
                      <div
                        className="flex-1 h-2 bg-green-200 dark:bg-green-800 rounded"
                        style={{ width: `${(list.deliveredCount / Math.max(list.totalItems, 1)) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Packed: {list.packedCount}</span>
                      <span>Loaded: {list.loadedCount}</span>
                      <span>Delivered: {list.deliveredCount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Active List View
        <div className="space-y-4">
          {/* List Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveListId(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 dark:text-white" />
              </button>
              <div>
                <h2 className="text-lg font-semibold dark:text-white">{activeList.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeList.customerName} {activeList.moveDate && `| ${formatDate(activeList.moveDate)}`}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(activeList.status)}`}>
                {activeList.status.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={() => setShowItemForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.inventoryList.addItem', 'Add Item')}
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activeList.totalItems}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.inventoryList.totalItems', 'Total Items')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(activeList.totalValue)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.inventoryList.totalValue', 'Total Value')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeList.totalWeight}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.inventoryList.totalLbs', 'Total lbs')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activeList.totalCubicFeet}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.inventoryList.cuFt2', 'Cu Ft')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{activeList.packedCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.inventoryList.packed', 'Packed')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activeList.loadedCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.inventoryList.loaded', 'Loaded')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeList.deliveredCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.inventoryList.delivered', 'Delivered')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Add/Edit Item Form */}
          {showItemForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingItem ? t('tools.inventoryList.editItem', 'Edit Item') : t('tools.inventoryList.addItem2', 'Add Item')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.inventoryList.itemName', 'Item Name *')}
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <select
                    value={itemForm.room}
                    onChange={(e) => setItemForm({ ...itemForm, room: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {ROOMS.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.inventoryList.quantity', 'Quantity')}</label>
                    <input
                      type="number"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.inventoryList.value2', 'Value ($)')}</label>
                    <input
                      type="number"
                      value={itemForm.estimatedValue}
                      onChange={(e) => setItemForm({ ...itemForm, estimatedValue: parseFloat(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.inventoryList.weightLbs', 'Weight (lbs)')}</label>
                    <input
                      type="number"
                      value={itemForm.estimatedWeight}
                      onChange={(e) => setItemForm({ ...itemForm, estimatedWeight: parseFloat(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.inventoryList.box', 'Box #')}</label>
                    <input
                      type="text"
                      value={itemForm.boxNumber}
                      onChange={(e) => setItemForm({ ...itemForm, boxNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.inventoryList.lengthIn', 'Length (in)')}</label>
                    <input
                      type="number"
                      value={itemForm.dimensions?.length}
                      onChange={(e) =>
                        setItemForm({ ...itemForm, dimensions: { ...itemForm.dimensions!, length: parseFloat(e.target.value) || 0 } })
                      }
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.inventoryList.widthIn', 'Width (in)')}</label>
                    <input
                      type="number"
                      value={itemForm.dimensions?.width}
                      onChange={(e) =>
                        setItemForm({ ...itemForm, dimensions: { ...itemForm.dimensions!, width: parseFloat(e.target.value) || 0 } })
                      }
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.inventoryList.heightIn', 'Height (in)')}</label>
                    <input
                      type="number"
                      value={itemForm.dimensions?.height}
                      onChange={(e) =>
                        setItemForm({ ...itemForm, dimensions: { ...itemForm.dimensions!, height: parseFloat(e.target.value) || 0 } })
                      }
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemForm.isFragile}
                      onChange={(e) => setItemForm({ ...itemForm, isFragile: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.inventoryList.fragile', 'Fragile')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemForm.requiresDisassembly}
                      onChange={(e) => setItemForm({ ...itemForm, requiresDisassembly: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.inventoryList.requiresDisassembly', 'Requires Disassembly')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemForm.requiresSpecialHandling}
                      onChange={(e) => setItemForm({ ...itemForm, requiresSpecialHandling: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.inventoryList.specialHandling', 'Special Handling')}</span>
                  </label>
                  <select
                    value={itemForm.condition}
                    onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value as any })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="excellent">{t('tools.inventoryList.excellent', 'Excellent')}</option>
                    <option value="good">{t('tools.inventoryList.good', 'Good')}</option>
                    <option value="fair">{t('tools.inventoryList.fair', 'Fair')}</option>
                    <option value="poor">{t('tools.inventoryList.poor', 'Poor')}</option>
                  </select>
                </div>

                <textarea
                  placeholder={t('tools.inventoryList.specialInstructions', 'Special Instructions')}
                  value={itemForm.specialInstructions}
                  onChange={(e) => setItemForm({ ...itemForm, specialInstructions: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />

                <div className="flex gap-2">
                  <button onClick={addItem} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingItem ? t('tools.inventoryList.updateItem', 'Update Item') : t('tools.inventoryList.addItem3', 'Add Item')}
                  </button>
                  <button
                    onClick={resetItemForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.inventoryList.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder={t('tools.inventoryList.searchItems', 'Search items...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">{t('tools.inventoryList.allRooms', 'All Rooms')}</option>
              {ROOMS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">{t('tools.inventoryList.allCategories', 'All Categories')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">{t('tools.inventoryList.allStatus', 'All Status')}</option>
              <option value="not_packed">{t('tools.inventoryList.notPacked', 'Not Packed')}</option>
              <option value="packed">{t('tools.inventoryList.packed2', 'Packed')}</option>
              <option value="loaded">{t('tools.inventoryList.loaded2', 'Loaded')}</option>
              <option value="delivered">{t('tools.inventoryList.delivered2', 'Delivered')}</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="room">{t('tools.inventoryList.sortByRoom', 'Sort by Room')}</option>
              <option value="name">{t('tools.inventoryList.sortByName', 'Sort by Name')}</option>
              <option value="value">{t('tools.inventoryList.sortByValue', 'Sort by Value')}</option>
              <option value="weight">{t('tools.inventoryList.sortByWeight', 'Sort by Weight')}</option>
            </select>
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Box className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.inventoryList.noItemsFoundAddYour', 'No items found. Add your first item to get started.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Status Checkboxes */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleItemStatus(item.id, 'isPacked')}
                          className={`p-1 rounded ${item.isPacked ? 'text-yellow-600' : 'text-gray-400'}`}
                          title={t('tools.inventoryList.packed3', 'Packed')}
                        >
                          {item.isPacked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => toggleItemStatus(item.id, 'isLoaded')}
                          className={`p-1 rounded ${item.isLoaded ? 'text-orange-600' : 'text-gray-400'}`}
                          title={t('tools.inventoryList.loaded3', 'Loaded')}
                        >
                          {item.isLoaded ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => toggleItemStatus(item.id, 'isDelivered')}
                          className={`p-1 rounded ${item.isDelivered ? 'text-green-600' : 'text-gray-400'}`}
                          title={t('tools.inventoryList.delivered3', 'Delivered')}
                        >
                          {item.isDelivered ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium dark:text-white">{item.name}</h4>
                          {item.quantity > 1 && <span className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</span>}
                          {item.isFragile && <AlertTriangle className="w-4 h-4 text-red-500" title={t('tools.inventoryList.fragile2', 'Fragile')} />}
                          {item.boxNumber && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                              Box {item.boxNumber}
                            </span>
                          )}
                          <span className={`text-xs capitalize ${getConditionColor(item.condition)}`}>{item.condition}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.room} | {item.category}
                        </p>
                      </div>

                      {/* Value & Weight */}
                      <div className="text-right text-sm">
                        <p className="font-medium dark:text-white">{formatCurrency(item.estimatedValue)}</p>
                        <p className="text-gray-500 dark:text-gray-400">{item.estimatedWeight} lbs</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => editItem(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {item.specialInstructions && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">{item.specialInstructions}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default InventoryListTool;
