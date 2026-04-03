import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Edit,
  Trash2,
  ArrowRightLeft,
  User,
  MapPin,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface ToolItem {
  id: string;
  toolNumber: string;
  name: string;
  description: string;
  category: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  bin: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'retired' | 'lost';
  condition: 'new' | 'good' | 'fair' | 'poor';
  quantity: number;
  minQuantity: number;
  unitCost: number;
  totalValue: number;
  checkedOutTo: string | null;
  checkedOutDate: string | null;
  expectedReturn: string | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  maintenanceInterval: number;
  purchaseDate: string;
  warrantyExpiry: string | null;
  notes: string;
  createdAt: string;
}

interface CheckoutRecord {
  id: string;
  toolId: string;
  employee: string;
  department: string;
  checkoutDate: string;
  expectedReturn: string;
  actualReturn: string | null;
  purpose: string;
  condition: string;
}

const columns: ColumnConfig[] = [
  { key: 'toolNumber', header: 'Tool #', width: 12 },
  { key: 'name', header: 'Name', width: 20 },
  { key: 'category', header: 'Category', width: 12 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'condition', header: 'Condition', width: 10 },
  { key: 'location', header: 'Location', width: 12 },
  { key: 'quantity', header: 'Qty', width: 8 },
  { key: 'checkedOutTo', header: 'Checked Out To', width: 15 },
  { key: 'unitCost', header: 'Unit Cost', width: 10 },
  { key: 'manufacturer', header: 'Manufacturer', width: 12 },
  { key: 'lastMaintenanceDate', header: 'Last Maintenance', width: 12 },
];

const generateSampleData = (): ToolItem[] => [
  {
    id: 'TOOL-001',
    toolNumber: 'T-0001',
    name: 'Digital Caliper 6"',
    description: 'Mitutoyo digital caliper with 6-inch capacity',
    category: 'Measuring',
    type: 'Caliper',
    manufacturer: 'Mitutoyo',
    model: '500-196-30',
    serialNumber: 'MIT-2023-4521',
    location: 'Tool Crib A',
    bin: 'A-1-3',
    status: 'available',
    condition: 'good',
    quantity: 5,
    minQuantity: 2,
    unitCost: 150.00,
    totalValue: 750.00,
    checkedOutTo: null,
    checkedOutDate: null,
    expectedReturn: null,
    lastMaintenanceDate: '2024-01-10',
    nextMaintenanceDate: '2024-07-10',
    maintenanceInterval: 180,
    purchaseDate: '2023-03-15',
    warrantyExpiry: '2026-03-15',
    notes: 'Calibrated annually',
    createdAt: '2023-03-15T10:00:00Z',
  },
  {
    id: 'TOOL-002',
    toolNumber: 'T-0002',
    name: 'Torque Wrench 1/2"',
    description: 'CDI torque wrench 20-150 ft-lbs',
    category: 'Hand Tools',
    type: 'Torque Wrench',
    manufacturer: 'CDI',
    model: '2503MFRPH',
    serialNumber: 'CDI-2022-8976',
    location: 'Tool Crib A',
    bin: 'B-2-1',
    status: 'checked-out',
    condition: 'good',
    quantity: 3,
    minQuantity: 1,
    unitCost: 275.00,
    totalValue: 825.00,
    checkedOutTo: 'John Smith',
    checkedOutDate: '2024-01-15',
    expectedReturn: '2024-01-16',
    lastMaintenanceDate: '2023-12-01',
    nextMaintenanceDate: '2024-06-01',
    maintenanceInterval: 180,
    purchaseDate: '2022-08-20',
    warrantyExpiry: '2025-08-20',
    notes: 'Requires calibration certificate',
    createdAt: '2022-08-20T10:00:00Z',
  },
  {
    id: 'TOOL-003',
    toolNumber: 'T-0003',
    name: 'Drill Press',
    description: 'JET 15-inch floor drill press',
    category: 'Power Tools',
    type: 'Drill Press',
    manufacturer: 'JET',
    model: 'J-2530',
    serialNumber: 'JET-2021-3345',
    location: 'Machine Shop',
    bin: 'Fixed',
    status: 'maintenance',
    condition: 'fair',
    quantity: 1,
    minQuantity: 1,
    unitCost: 1250.00,
    totalValue: 1250.00,
    checkedOutTo: null,
    checkedOutDate: null,
    expectedReturn: null,
    lastMaintenanceDate: '2024-01-05',
    nextMaintenanceDate: '2024-04-05',
    maintenanceInterval: 90,
    purchaseDate: '2021-05-10',
    warrantyExpiry: '2024-05-10',
    notes: 'Belt replacement scheduled',
    createdAt: '2021-05-10T10:00:00Z',
  },
  {
    id: 'TOOL-004',
    toolNumber: 'T-0004',
    name: 'Micrometer Set',
    description: 'Starrett 0-4" outside micrometer set',
    category: 'Measuring',
    type: 'Micrometer',
    manufacturer: 'Starrett',
    model: 'S436.1MXRLZ',
    serialNumber: 'STR-2023-1122',
    location: 'Quality Lab',
    bin: 'Q-1-1',
    status: 'available',
    condition: 'new',
    quantity: 2,
    minQuantity: 1,
    unitCost: 450.00,
    totalValue: 900.00,
    checkedOutTo: null,
    checkedOutDate: null,
    expectedReturn: null,
    lastMaintenanceDate: null,
    nextMaintenanceDate: '2024-06-15',
    maintenanceInterval: 365,
    purchaseDate: '2023-06-15',
    warrantyExpiry: '2028-06-15',
    notes: 'Precision measuring instrument',
    createdAt: '2023-06-15T10:00:00Z',
  },
];

const ToolCribTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: tools,
    setData: setTools,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<ToolItem>('tool-crib', generateSampleData(), columns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [checkoutTool, setCheckoutTool] = useState<ToolItem | null>(null);
  const [formData, setFormData] = useState<Partial<ToolItem>>({});
  const [checkoutData, setCheckoutData] = useState({
    employee: '',
    department: '',
    expectedReturn: '',
    purpose: '',
  });

  const categories = [...new Set(tools.map((t) => t.category))];

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.toolNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tool.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || tool.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats
  const totalTools = tools.length;
  const totalValue = tools.reduce((sum, t) => sum + t.totalValue, 0);
  const availableCount = tools.filter((t) => t.status === 'available').length;
  const checkedOutCount = tools.filter((t) => t.status === 'checked-out').length;
  const maintenanceCount = tools.filter((t) => t.status === 'maintenance').length;
  const lowStockCount = tools.filter((t) => t.quantity <= t.minQuantity).length;

  const handleSave = () => {
    if (editingTool) {
      updateItem(editingTool.id, {
        ...formData,
        totalValue: (formData.quantity || 0) * (formData.unitCost || 0),
      });
    } else {
      const newTool: ToolItem = {
        id: `TOOL-${String(tools.length + 1).padStart(3, '0')}`,
        toolNumber: formData.toolNumber || `T-${String(tools.length + 1).padStart(4, '0')}`,
        name: formData.name || '',
        description: formData.description || '',
        category: formData.category || '',
        type: formData.type || '',
        manufacturer: formData.manufacturer || '',
        model: formData.model || '',
        serialNumber: formData.serialNumber || '',
        location: formData.location || '',
        bin: formData.bin || '',
        status: 'available',
        condition: formData.condition || 'new',
        quantity: formData.quantity || 1,
        minQuantity: formData.minQuantity || 1,
        unitCost: formData.unitCost || 0,
        totalValue: (formData.quantity || 1) * (formData.unitCost || 0),
        checkedOutTo: null,
        checkedOutDate: null,
        expectedReturn: null,
        lastMaintenanceDate: null,
        nextMaintenanceDate: formData.nextMaintenanceDate || null,
        maintenanceInterval: formData.maintenanceInterval || 365,
        purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
        warrantyExpiry: formData.warrantyExpiry || null,
        notes: formData.notes || '',
        createdAt: new Date().toISOString(),
      };
      addItem(newTool);
    }
    setShowModal(false);
    setEditingTool(null);
    setFormData({});
  };

  const handleCheckout = () => {
    if (checkoutTool) {
      updateItem(checkoutTool.id, {
        status: 'checked-out',
        checkedOutTo: checkoutData.employee,
        checkedOutDate: new Date().toISOString().split('T')[0],
        expectedReturn: checkoutData.expectedReturn,
      });
    }
    setShowCheckoutModal(false);
    setCheckoutTool(null);
    setCheckoutData({ employee: '', department: '', expectedReturn: '', purpose: '' });
  };

  const handleCheckin = (tool: ToolItem) => {
    updateItem(tool.id, {
      status: 'available',
      checkedOutTo: null,
      checkedOutDate: null,
      expectedReturn: null,
    });
  };

  const handleEdit = (tool: ToolItem) => {
    setEditingTool(tool);
    setFormData(tool);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Tool',
      message: 'Are you sure you want to delete this tool?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getStatusBadge = (status: ToolItem['status']) => {
    const styles = {
      available: isDark
        ? 'bg-green-900/50 text-green-300 border-green-700'
        : 'bg-green-100 text-green-800 border-green-300',
      'checked-out': isDark
        ? 'bg-blue-900/50 text-blue-300 border-blue-700'
        : 'bg-blue-100 text-blue-800 border-blue-300',
      maintenance: isDark
        ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
        : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      retired: isDark
        ? 'bg-gray-700 text-gray-300 border-gray-600'
        : 'bg-gray-100 text-gray-800 border-gray-300',
      lost: isDark
        ? 'bg-red-900/50 text-red-300 border-red-700'
        : 'bg-red-100 text-red-800 border-red-300',
    };
    const labels = {
      available: 'Available',
      'checked-out': 'Checked Out',
      maintenance: 'Maintenance',
      retired: 'Retired',
      lost: 'Lost',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getConditionBadge = (condition: ToolItem['condition']) => {
    const styles = {
      new: isDark ? 'text-green-400' : 'text-green-600',
      good: isDark ? 'text-blue-400' : 'text-blue-600',
      fair: isDark ? 'text-yellow-400' : 'text-yellow-600',
      poor: isDark ? 'text-red-400' : 'text-red-600',
    };
    return <span className={`text-xs font-medium ${styles[condition]}`}>{condition}</span>;
  };

  if (loading) {
    return (
      <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
            <Wrench className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.toolCrib.toolCrib', 'Tool Crib')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.toolCrib.toolInventoryAndCheckoutManagement', 'Tool inventory and checkout management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="tool-crib" toolName="Tool Crib" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            data={tools}
            columns={columns}
            filename="tool-crib"
          />
          <button
            onClick={() => {
              setEditingTool(null);
              setFormData({});
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            {t('tools.toolCrib.addTool', 'Add Tool')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.toolCrib.totalTools', 'Total Tools')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {totalTools}
              </p>
            </div>
            <Package className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.toolCrib.totalValue', 'Total Value')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <BarChart3 className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.toolCrib.available', 'Available')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {availableCount}
              </p>
            </div>
            <CheckCircle className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.toolCrib.checkedOut', 'Checked Out')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {checkedOutCount}
              </p>
            </div>
            <ArrowRightLeft className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.toolCrib.maintenance', 'Maintenance')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {maintenanceCount}
              </p>
            </div>
            <Clock className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.toolCrib.lowStock', 'Low Stock')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {lowStockCount}
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.toolCrib.searchToolsSerialNumbersManufacturers', 'Search tools, serial numbers, manufacturers...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.toolCrib.allStatus', 'All Status')}</option>
              <option value="available">{t('tools.toolCrib.available2', 'Available')}</option>
              <option value="checked-out">{t('tools.toolCrib.checkedOut2', 'Checked Out')}</option>
              <option value="maintenance">{t('tools.toolCrib.maintenance2', 'Maintenance')}</option>
              <option value="retired">{t('tools.toolCrib.retired', 'Retired')}</option>
              <option value="lost">{t('tools.toolCrib.lost', 'Lost')}</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.toolCrib.allCategories', 'All Categories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools Table */}
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.tool', 'Tool')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.category', 'Category')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.location', 'Location')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.status', 'Status')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.qty', 'Qty')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.checkedOutTo', 'Checked Out To')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.value', 'Value')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.toolCrib.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredTools.map((tool) => (
                <tr key={tool.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-4">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {tool.name}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {tool.toolNumber} | {tool.manufacturer} {tool.model}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        SN: {tool.serialNumber}
                      </p>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div>
                      <p>{tool.category}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {tool.type}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tool.location}
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Bin: {tool.bin}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {getStatusBadge(tool.status)}
                      <div className="text-xs">
                        Condition: {getConditionBadge(tool.condition)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className={tool.quantity <= tool.minQuantity ? (isDark ? 'text-red-400' : 'text-red-600') : ''}>
                        {tool.quantity}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Min: {tool.minQuantity}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {tool.checkedOutTo ? (
                      <div>
                        <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <User className="w-3 h-3" />
                          {tool.checkedOutTo}
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Due: {tool.expectedReturn ? new Date(tool.expectedReturn).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    ) : (
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                    )}
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${tool.totalValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {tool.status === 'available' && (
                        <button
                          onClick={() => {
                            setCheckoutTool(tool);
                            setShowCheckoutModal(true);
                          }}
                          className={`p-1 rounded hover:bg-blue-100 ${isDark ? 'hover:bg-blue-900/50 text-blue-400' : 'text-blue-600'}`}
                          title={t('tools.toolCrib.checkOut2', 'Check Out')}
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      )}
                      {tool.status === 'checked-out' && (
                        <button
                          onClick={() => handleCheckin(tool)}
                          className={`p-1 rounded hover:bg-green-100 ${isDark ? 'hover:bg-green-900/50 text-green-400' : 'text-green-600'}`}
                          title={t('tools.toolCrib.checkIn', 'Check In')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(tool)}
                        className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'text-gray-600'}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        className={`p-1 rounded hover:bg-red-100 ${isDark ? 'hover:bg-red-900/50 text-red-400' : 'text-red-600'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTools.length === 0 && (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.toolCrib.noToolsFound', 'No tools found')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Tool Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingTool ? t('tools.toolCrib.editTool', 'Edit Tool') : t('tools.toolCrib.addNewTool', 'Add New Tool')}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTool(null);
                  setFormData({});
                }}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.toolNumber', 'Tool Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.toolNumber || ''}
                    onChange={(e) => setFormData({ ...formData, toolNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.category2', 'Category *')}
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.toolCrib.measuringHandToolsPowerTools', 'Measuring, Hand Tools, Power Tools...')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.type', 'Type')}
                  </label>
                  <input
                    type="text"
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.manufacturer', 'Manufacturer')}
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.model', 'Model')}
                  </label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.serialNumber', 'Serial Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.location2', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.bin', 'Bin')}
                  </label>
                  <input
                    type="text"
                    value={formData.bin || ''}
                    onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.condition', 'Condition')}
                  </label>
                  <select
                    value={formData.condition || 'new'}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as ToolItem['condition'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="new">{t('tools.toolCrib.new', 'New')}</option>
                    <option value="good">{t('tools.toolCrib.good', 'Good')}</option>
                    <option value="fair">{t('tools.toolCrib.fair', 'Fair')}</option>
                    <option value="poor">{t('tools.toolCrib.poor', 'Poor')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.quantity', 'Quantity')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.minQuantity', 'Min Quantity')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.unitCost', 'Unit Cost ($)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitCost || ''}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.purchaseDate', 'Purchase Date')}
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.warrantyExpiry', 'Warranty Expiry')}
                  </label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry || ''}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.toolCrib.maintenanceIntervalDays', 'Maintenance Interval (days)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maintenanceInterval || ''}
                    onChange={(e) => setFormData({ ...formData, maintenanceInterval: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.toolCrib.description', 'Description')}
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.toolCrib.notes', 'Notes')}
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTool(null);
                  setFormData({});
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.toolCrib.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                {editingTool ? t('tools.toolCrib.update', 'Update') : t('tools.toolCrib.add', 'Add')} Tool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && checkoutTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.toolCrib.checkOutTool', 'Check Out Tool')}
              </h2>
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setCheckoutTool(null);
                  setCheckoutData({ employee: '', department: '', expectedReturn: '', purpose: '' });
                }}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {checkoutTool.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {checkoutTool.toolNumber} | {checkoutTool.serialNumber}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.toolCrib.employeeName', 'Employee Name *')}
                </label>
                <input
                  type="text"
                  value={checkoutData.employee}
                  onChange={(e) => setCheckoutData({ ...checkoutData, employee: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.toolCrib.department', 'Department')}
                </label>
                <input
                  type="text"
                  value={checkoutData.department}
                  onChange={(e) => setCheckoutData({ ...checkoutData, department: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.toolCrib.expectedReturnDate', 'Expected Return Date *')}
                </label>
                <input
                  type="date"
                  value={checkoutData.expectedReturn}
                  onChange={(e) => setCheckoutData({ ...checkoutData, expectedReturn: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.toolCrib.purpose', 'Purpose')}
                </label>
                <input
                  type="text"
                  value={checkoutData.purpose}
                  onChange={(e) => setCheckoutData({ ...checkoutData, purpose: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.toolCrib.jobNumberProjectEtc', 'Job number, project, etc.')}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setCheckoutTool(null);
                  setCheckoutData({ employee: '', department: '', expectedReturn: '', purpose: '' });
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.toolCrib.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleCheckout}
                disabled={!checkoutData.employee || !checkoutData.expectedReturn}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('tools.toolCrib.checkOut', 'Check Out')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ToolCribTool;
