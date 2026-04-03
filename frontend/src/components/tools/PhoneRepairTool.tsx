'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Smartphone,
  User,
  Wrench,
  Package,
  Clock,
  DollarSign,
  Shield,
  AlertTriangle,
  FileText,
  Users,
  ShoppingCart,
  RefreshCw,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Clipboard,
  Battery,
  Monitor,
  Camera,
  Mic,
  Speaker,
  Wifi,
  Bluetooth,
  Volume2,
  Power,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
}

interface DiagnosticItem {
  id: string;
  name: string;
  checked: boolean;
  status: 'pass' | 'fail' | 'not_tested';
  notes: string;
}

interface PartItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  cost: number;
  price: number;
  minStock: number;
  supplier: string;
}

interface RepairJob {
  id: string;
  ticketNumber: string;
  customerId: string;
  deviceMake: string;
  deviceModel: string;
  imei: string;
  serialNumber: string;
  issue: string;
  issueDetails: string;
  status: 'intake' | 'diagnosing' | 'waiting_parts' | 'in_repair' | 'testing' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  technicianId: string;
  diagnostics: DiagnosticItem[];
  partsUsed: { partId: string; quantity: number; price: number }[];
  laborCost: number;
  estimatedCost: number;
  finalCost: number;
  warrantyMonths: number;
  warrantyExpiry: string;
  dataBackupAcknowledged: boolean;
  conditionBefore: string;
  conditionAfter: string;
  intakeDate: string;
  estimatedCompletion: string;
  completedDate: string;
  notes: string;
}

interface Technician {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
}

interface PartOrder {
  id: string;
  partId: string;
  quantity: number;
  supplier: string;
  status: 'pending' | 'ordered' | 'shipped' | 'received';
  orderDate: string;
  expectedDate: string;
  cost: number;
  notes: string;
}

interface TradeIn {
  id: string;
  deviceMake: string;
  deviceModel: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  imei: string;
  customerId: string;
  estimatedValue: number;
  finalValue: number;
  status: 'pending' | 'evaluated' | 'accepted' | 'declined' | 'completed';
  notes: string;
  createdAt: string;
}

interface Accessory {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  compatible: string[];
}

interface AccessorySale {
  id: string;
  accessoryId: string;
  quantity: number;
  price: number;
  customerId: string;
  repairJobId?: string;
  date: string;
}

// Default data
const defaultDiagnostics: Omit<DiagnosticItem, 'id'>[] = [
  { name: 'Screen Display', checked: false, status: 'not_tested', notes: '' },
  { name: 'Touch Response', checked: false, status: 'not_tested', notes: '' },
  { name: 'Battery Health', checked: false, status: 'not_tested', notes: '' },
  { name: 'Charging Port', checked: false, status: 'not_tested', notes: '' },
  { name: 'Front Camera', checked: false, status: 'not_tested', notes: '' },
  { name: 'Rear Camera', checked: false, status: 'not_tested', notes: '' },
  { name: 'Speakers', checked: false, status: 'not_tested', notes: '' },
  { name: 'Microphone', checked: false, status: 'not_tested', notes: '' },
  { name: 'WiFi', checked: false, status: 'not_tested', notes: '' },
  { name: 'Bluetooth', checked: false, status: 'not_tested', notes: '' },
  { name: 'Cellular Signal', checked: false, status: 'not_tested', notes: '' },
  { name: 'Physical Buttons', checked: false, status: 'not_tested', notes: '' },
  { name: 'Face ID / Touch ID', checked: false, status: 'not_tested', notes: '' },
  { name: 'Water Damage Indicator', checked: false, status: 'not_tested', notes: '' },
];

const deviceMakes = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'LG', 'Motorola', 'Sony', 'Nokia', 'Other'];

const partCategories = ['Screen', 'Battery', 'Charging Port', 'Camera', 'Speaker', 'Microphone', 'Back Glass', 'Frame', 'Buttons', 'Flex Cable', 'Other'];

const repairStatuses: { value: RepairJob['status']; label: string; color: string }[] = [
  { value: 'intake', label: 'Intake', color: 'bg-gray-500' },
  { value: 'diagnosing', label: 'Diagnosing', color: 'bg-blue-500' },
  { value: 'waiting_parts', label: 'Waiting for Parts', color: 'bg-yellow-500' },
  { value: 'in_repair', label: 'In Repair', color: 'bg-orange-500' },
  { value: 'testing', label: 'Testing', color: 'bg-purple-500' },
  { value: 'ready', label: 'Ready for Pickup', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

// Column configurations for export
const customerColumns: ColumnConfig[] = [
  { key: 'id', header: 'Customer ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const repairJobColumns: ColumnConfig[] = [
  { key: 'id', header: 'Job ID', type: 'string' },
  { key: 'ticketNumber', header: 'Ticket #', type: 'string' },
  { key: 'deviceMake', header: 'Make', type: 'string' },
  { key: 'deviceModel', header: 'Model', type: 'string' },
  { key: 'imei', header: 'IMEI', type: 'string' },
  { key: 'issue', header: 'Issue', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'estimatedCost', header: 'Est. Cost', type: 'currency' },
  { key: 'finalCost', header: 'Final Cost', type: 'currency' },
  { key: 'intakeDate', header: 'Intake Date', type: 'date' },
  { key: 'completedDate', header: 'Completed Date', type: 'date' },
];

const partColumns: ColumnConfig[] = [
  { key: 'id', header: 'Part ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
];

const technicianColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'specialty', header: 'Specialty', type: 'string' },
  { key: 'active', header: 'Active', type: 'boolean' },
];

const partOrderColumns: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'partId', header: 'Part ID', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'expectedDate', header: 'Expected Date', type: 'date' },
  { key: 'cost', header: 'Cost', type: 'currency' },
];

const tradeInColumns: ColumnConfig[] = [
  { key: 'id', header: 'Trade-in ID', type: 'string' },
  { key: 'deviceMake', header: 'Make', type: 'string' },
  { key: 'deviceModel', header: 'Model', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'imei', header: 'IMEI', type: 'string' },
  { key: 'estimatedValue', header: 'Est. Value', type: 'currency' },
  { key: 'finalValue', header: 'Final Value', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const accessoryColumns: ColumnConfig[] = [
  { key: 'id', header: 'Accessory ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
];

const accessorySaleColumns: ColumnConfig[] = [
  { key: 'id', header: 'Sale ID', type: 'string' },
  { key: 'accessoryId', header: 'Accessory ID', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
];

// Default technicians data
const defaultTechnicians: Technician[] = [
  { id: '1', name: 'John Smith', specialty: 'iPhone', active: true },
  { id: '2', name: 'Jane Doe', specialty: 'Samsung', active: true },
  { id: '3', name: 'Mike Johnson', specialty: 'General', active: true },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);
const generateTicketNumber = () => `REP-${Date.now().toString(36).toUpperCase()}`;

interface PhoneRepairToolProps {
  uiConfig?: UIConfig;
}

export const PhoneRepairTool: React.FC<PhoneRepairToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Initialize hooks for each data type with backend sync
  const customersData = useToolData<Customer>(
    'phone-repair-customers',
    [],
    customerColumns,
    { autoSave: true }
  );

  const {
    data: repairJobsRawData,
    addItem: addRepairJobItem,
    updateItem: updateRepairJobItem,
    deleteItem: deleteRepairJobItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<RepairJob>(
    'phone-repair-jobs',
    [],
    repairJobColumns,
    { autoSave: true }
  );

  // Create a compatible repairJobsData object for existing code
  const repairJobsData = {
    data: repairJobsRawData,
    addItem: addRepairJobItem,
    updateItem: updateRepairJobItem,
    deleteItem: deleteRepairJobItem,
  };

  const partsData = useToolData<PartItem>(
    'phone-repair-parts',
    [],
    partColumns,
    { autoSave: true }
  );

  const techniciansData = useToolData<Technician>(
    'phone-repair-technicians',
    defaultTechnicians,
    technicianColumns,
    { autoSave: true }
  );

  const partOrdersData = useToolData<PartOrder>(
    'phone-repair-part-orders',
    [],
    partOrderColumns,
    { autoSave: true }
  );

  const tradeInsData = useToolData<TradeIn>(
    'phone-repair-trade-ins',
    [],
    tradeInColumns,
    { autoSave: true }
  );

  const accessoriesData = useToolData<Accessory>(
    'phone-repair-accessories',
    [],
    accessoryColumns,
    { autoSave: true }
  );

  const accessorySalesData = useToolData<AccessorySale>(
    'phone-repair-accessory-sales',
    [],
    accessorySaleColumns,
    { autoSave: true }
  );

  // Create a unified data object for compatibility with existing code
  const data = useMemo(() => ({
    customers: customersData.data,
    repairJobs: repairJobsData.data,
    parts: partsData.data,
    technicians: techniciansData.data,
    partOrders: partOrdersData.data,
    tradeIns: tradeInsData.data,
    accessories: accessoriesData.data,
    accessorySales: accessorySalesData.data,
  }), [
    customersData.data,
    repairJobsData.data,
    partsData.data,
    techniciansData.data,
    partOrdersData.data,
    tradeInsData.data,
    accessoriesData.data,
    accessorySalesData.data,
  ]);
  const [activeTab, setActiveTab] = useState<'repairs' | 'customers' | 'inventory' | 'orders' | 'tradein' | 'accessories' | 'reports'>('repairs');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  // Form states
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const [repairForm, setRepairForm] = useState<Partial<RepairJob>>({});
  const [partForm, setPartForm] = useState<Partial<PartItem>>({});
  const [orderForm, setOrderForm] = useState<Partial<PartOrder>>({});
  const [tradeInForm, setTradeInForm] = useState<Partial<TradeIn>>({});
  const [accessoryForm, setAccessoryForm] = useState<Partial<Accessory>>({});

  // Customer functions
  const addCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;
    const newCustomer: Customer = {
      id: generateId(),
      name: customerForm.name || '',
      email: customerForm.email || '',
      phone: customerForm.phone || '',
      address: customerForm.address || '',
      notes: customerForm.notes || '',
      createdAt: new Date().toISOString(),
    };
    customersData.addItem(newCustomer);
    setCustomerForm({});
    setShowForm(false);
  };

  const updateCustomer = (id: string) => {
    customersData.updateItem(id, customerForm);
    setEditingId(null);
    setCustomerForm({});
  };

  const deleteCustomer = (id: string) => {
    customersData.deleteItem(id);
  };

  // Repair job functions
  const createDiagnostics = (): DiagnosticItem[] => {
    return defaultDiagnostics.map(d => ({ ...d, id: generateId() }));
  };

  const addRepairJob = () => {
    if (!repairForm.customerId || !repairForm.deviceMake || !repairForm.deviceModel) return;
    const newJob: RepairJob = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      customerId: repairForm.customerId || '',
      deviceMake: repairForm.deviceMake || '',
      deviceModel: repairForm.deviceModel || '',
      imei: repairForm.imei || '',
      serialNumber: repairForm.serialNumber || '',
      issue: repairForm.issue || '',
      issueDetails: repairForm.issueDetails || '',
      status: 'intake',
      priority: repairForm.priority || 'normal',
      technicianId: repairForm.technicianId || '',
      diagnostics: createDiagnostics(),
      partsUsed: [],
      laborCost: 0,
      estimatedCost: repairForm.estimatedCost || 0,
      finalCost: 0,
      warrantyMonths: repairForm.warrantyMonths || 3,
      warrantyExpiry: '',
      dataBackupAcknowledged: repairForm.dataBackupAcknowledged || false,
      conditionBefore: repairForm.conditionBefore || '',
      conditionAfter: '',
      intakeDate: new Date().toISOString(),
      estimatedCompletion: repairForm.estimatedCompletion || '',
      completedDate: '',
      notes: repairForm.notes || '',
    };
    repairJobsData.addItem(newJob);
    setRepairForm({});
    setShowForm(false);
  };

  const updateRepairJob = (id: string, updates: Partial<RepairJob>) => {
    const job = data.repairJobs.find((j: RepairJob) => j.id === id);
    if (!job) return;

    const updatedJob = { ...updates };
    if (updates.status === 'completed' && !job.completedDate) {
      updatedJob.completedDate = new Date().toISOString();
      const warrantyDate = new Date();
      warrantyDate.setMonth(warrantyDate.getMonth() + (job.warrantyMonths || 3));
      updatedJob.warrantyExpiry = warrantyDate.toISOString();
    }
    repairJobsData.updateItem(id, updatedJob);
  };

  const updateDiagnostic = (jobId: string, diagId: string, updates: Partial<DiagnosticItem>) => {
    const job = data.repairJobs.find((j: RepairJob) => j.id === jobId);
    if (!job) return;
    const updatedDiagnostics = job.diagnostics.map((d: DiagnosticItem) =>
      d.id === diagId ? { ...d, ...updates } : d
    );
    updateRepairJob(jobId, { diagnostics: updatedDiagnostics });
  };

  const addPartToJob = (jobId: string, partId: string, quantity: number) => {
    const job = data.repairJobs.find((j: RepairJob) => j.id === jobId);
    const part = data.parts.find((p: PartItem) => p.id === partId);
    if (!job || !part) return;

    const existingPart = job.partsUsed.find((p: { partId: string }) => p.partId === partId);
    let updatedParts;
    if (existingPart) {
      updatedParts = job.partsUsed.map((p: { partId: string; quantity: number; price: number }) =>
        p.partId === partId ? { ...p, quantity: p.quantity + quantity } : p
      );
    } else {
      updatedParts = [...job.partsUsed, { partId, quantity, price: part.price }];
    }

    // Update part inventory
    partsData.updateItem(partId, { quantity: part.quantity - quantity });
    // Update repair job with parts
    repairJobsData.updateItem(jobId, { partsUsed: updatedParts });
  };

  const deleteRepairJob = (id: string) => {
    repairJobsData.deleteItem(id);
  };

  // Parts inventory functions
  const addPart = () => {
    if (!partForm.name || !partForm.sku) return;
    const newPart: PartItem = {
      id: generateId(),
      name: partForm.name || '',
      sku: partForm.sku || '',
      category: partForm.category || 'Other',
      quantity: partForm.quantity || 0,
      cost: partForm.cost || 0,
      price: partForm.price || 0,
      minStock: partForm.minStock || 5,
      supplier: partForm.supplier || '',
    };
    partsData.addItem(newPart);
    setPartForm({});
    setShowForm(false);
  };

  const updatePart = (id: string) => {
    partsData.updateItem(id, partForm);
    setEditingId(null);
    setPartForm({});
  };

  const deletePart = (id: string) => {
    partsData.deleteItem(id);
  };

  // Part orders functions
  const addPartOrder = () => {
    if (!orderForm.partId || !orderForm.quantity) return;
    const newOrder: PartOrder = {
      id: generateId(),
      partId: orderForm.partId || '',
      quantity: orderForm.quantity || 0,
      supplier: orderForm.supplier || '',
      status: 'pending',
      orderDate: new Date().toISOString(),
      expectedDate: orderForm.expectedDate || '',
      cost: orderForm.cost || 0,
      notes: orderForm.notes || '',
    };
    partOrdersData.addItem(newOrder);
    setOrderForm({});
    setShowForm(false);
  };

  const updatePartOrder = (id: string, updates: Partial<PartOrder>) => {
    const order = data.partOrders.find((o: PartOrder) => o.id === id);
    if (!order) return;

    // If received, add to inventory
    if (updates.status === 'received' && order.status !== 'received') {
      const part = data.parts.find((p: PartItem) => p.id === order.partId);
      if (part) {
        partsData.updateItem(order.partId, { quantity: part.quantity + order.quantity });
      }
    }
    partOrdersData.updateItem(id, updates);
  };

  // Trade-in functions
  const addTradeIn = () => {
    if (!tradeInForm.deviceMake || !tradeInForm.deviceModel || !tradeInForm.customerId) return;
    const newTradeIn: TradeIn = {
      id: generateId(),
      deviceMake: tradeInForm.deviceMake || '',
      deviceModel: tradeInForm.deviceModel || '',
      condition: tradeInForm.condition || 'good',
      imei: tradeInForm.imei || '',
      customerId: tradeInForm.customerId || '',
      estimatedValue: tradeInForm.estimatedValue || 0,
      finalValue: 0,
      status: 'pending',
      notes: tradeInForm.notes || '',
      createdAt: new Date().toISOString(),
    };
    tradeInsData.addItem(newTradeIn);
    setTradeInForm({});
    setShowForm(false);
  };

  const updateTradeIn = (id: string, updates: Partial<TradeIn>) => {
    tradeInsData.updateItem(id, updates);
  };

  // Accessory functions
  const addAccessory = () => {
    if (!accessoryForm.name || !accessoryForm.sku) return;
    const newAccessory: Accessory = {
      id: generateId(),
      name: accessoryForm.name || '',
      category: accessoryForm.category || 'Other',
      sku: accessoryForm.sku || '',
      price: accessoryForm.price || 0,
      cost: accessoryForm.cost || 0,
      quantity: accessoryForm.quantity || 0,
      compatible: accessoryForm.compatible || [],
    };
    accessoriesData.addItem(newAccessory);
    setAccessoryForm({});
    setShowForm(false);
  };

  const sellAccessory = (accessoryId: string, quantity: number, customerId: string, repairJobId?: string) => {
    const accessory = data.accessories.find((a: Accessory) => a.id === accessoryId);
    if (!accessory || accessory.quantity < quantity) return;

    const sale: AccessorySale = {
      id: generateId(),
      accessoryId,
      quantity,
      price: accessory.price * quantity,
      customerId,
      repairJobId,
      date: new Date().toISOString(),
    };

    // Update accessory quantity
    accessoriesData.updateItem(accessoryId, { quantity: accessory.quantity - quantity });
    // Add the sale
    accessorySalesData.addItem(sale);
  };

  // Filtered data
  const filteredRepairJobs = useMemo(() => {
    return data.repairJobs.filter((job: RepairJob) => {
      const customer = data.customers.find((c: Customer) => c.id === job.customerId);
      const matchesSearch = searchTerm === '' ||
        job.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.deviceMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.imei.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.repairJobs, data.customers, searchTerm, statusFilter]);

  const lowStockParts = useMemo(() => {
    return data.parts.filter((p: PartItem) => p.quantity <= p.minStock);
  }, [data.parts]);

  // Stats
  const stats = useMemo(() => {
    const activeJobs = data.repairJobs.filter((j: RepairJob) => !['completed', 'cancelled'].includes(j.status));
    const completedToday = data.repairJobs.filter((j: RepairJob) => {
      if (!j.completedDate) return false;
      const today = new Date().toDateString();
      return new Date(j.completedDate).toDateString() === today;
    });
    const totalRevenue = data.repairJobs.reduce((sum: number, j: RepairJob) => sum + (j.finalCost || 0), 0);
    const pendingTradeIns = data.tradeIns.filter((t: TradeIn) => t.status === 'pending');

    return {
      activeJobs: activeJobs.length,
      completedToday: completedToday.length,
      totalRevenue,
      lowStock: lowStockParts.length,
      pendingTradeIns: pendingTradeIns.length,
    };
  }, [data, lowStockParts]);

  const getCustomerName = (customerId: string) => {
    const customer = data.customers.find((c: Customer) => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const getTechnicianName = (techId: string) => {
    const tech = data.technicians.find((t: Technician) => t.id === techId);
    return tech?.name || 'Unassigned';
  };

  const getPartName = (partId: string) => {
    const part = data.parts.find((p: PartItem) => p.id === partId);
    return part?.name || 'Unknown';
  };

  const getStatusInfo = (status: RepairJob['status']) => {
    return repairStatuses.find(s => s.value === status) || repairStatuses[0];
  };

  const calculateJobTotal = (job: RepairJob) => {
    const partsTotal = job.partsUsed.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return partsTotal + job.laborCost;
  };

  // Render functions
  const renderTab = (id: typeof activeTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setShowForm(false);
        setEditingId(null);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-[#0D9488] text-white'
          : theme === 'dark'
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const renderInput = (
    label: string,
    value: string | number | undefined,
    onChange: (value: string) => void,
    type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'datetime-local' = 'text',
    placeholder?: string,
    required?: boolean
  ) => (
    <div>
      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border ${
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
      />
    </div>
  );

  const renderSelect = (
    label: string,
    value: string | undefined,
    onChange: (value: string) => void,
    options: { value: string; label: string }[],
    required?: boolean
  ) => (
    <div>
      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border ${
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'
        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderTextArea = (
    label: string,
    value: string | undefined,
    onChange: (value: string) => void,
    placeholder?: string,
    rows: number = 3
  ) => (
    <div>
      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border ${
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        } focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none`}
      />
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.phoneRepair.phoneRepairShopManager', 'Phone Repair Shop Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.phoneRepair.manageRepairsInventoryCustomersAnd', 'Manage repairs, inventory, customers, and more')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="phone-repair" toolName="Phone Repair" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = repairJobsData.data.map(job => {
                    const customer = customersData.data.find(c => c.id === job.customerId);
                    return {
                      ...job,
                      customerName: customer?.name || 'Unknown',
                    };
                  });
                  exportToCSV(exportData, repairJobColumns, { filename: 'phone-repair-jobs' });
                }}
                onExportExcel={() => {
                  const exportData = repairJobsData.data.map(job => {
                    const customer = customersData.data.find(c => c.id === job.customerId);
                    return {
                      ...job,
                      customerName: customer?.name || 'Unknown',
                    };
                  });
                  exportToExcel(exportData, repairJobColumns, { filename: 'phone-repair-jobs' });
                }}
                onExportJSON={() => {
                  const exportData = repairJobsData.data.map(job => {
                    const customer = customersData.data.find(c => c.id === job.customerId);
                    return {
                      ...job,
                      customerName: customer?.name || 'Unknown',
                    };
                  });
                  exportToJSON(exportData, { filename: 'phone-repair-jobs' });
                }}
                onExportPDF={async () => {
                  const exportData = repairJobsData.data.map(job => {
                    const customer = customersData.data.find(c => c.id === job.customerId);
                    return {
                      ...job,
                      customerName: customer?.name || 'Unknown',
                    };
                  });
                  await exportToPDF(exportData, repairJobColumns, {
                    filename: 'phone-repair-jobs',
                    title: 'Phone Repair Jobs Report',
                    subtitle: `${repairJobsData.data.length} repair jobs | ${customersData.data.length} customers`,
                  });
                }}
                onPrint={() => {
                  const exportData = repairJobsData.data.map(job => {
                    const customer = customersData.data.find(c => c.id === job.customerId);
                    return {
                      ...job,
                      customerName: customer?.name || 'Unknown',
                    };
                  });
                  printData(exportData, repairJobColumns, { title: 'Phone Repair Jobs' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = repairJobsData.data.map(job => {
                    const customer = customersData.data.find(c => c.id === job.customerId);
                    return {
                      ...job,
                      customerName: customer?.name || 'Unknown',
                    };
                  });
                  await copyUtil(exportData, repairJobColumns);
                }}
                theme={theme}
              />
            </div>
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.phoneRepair.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`}>{t('tools.phoneRepair.activeRepairs', 'Active Repairs')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>{stats.activeJobs}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-green-600'}`}>{t('tools.phoneRepair.completedToday', 'Completed Today')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-green-700'}`}>{stats.completedToday}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-purple-600'}`}>{t('tools.phoneRepair.totalRevenue', 'Total Revenue')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-purple-700'}`}>${stats.totalRevenue.toFixed(2)}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-red-50'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-red-600'}`}>{t('tools.phoneRepair.lowStock', 'Low Stock')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-red-700'}`}>{stats.lowStock}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-yellow-600'}`}>{t('tools.phoneRepair.pendingTradeIns', 'Pending Trade-ins')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-yellow-700'}`}>{stats.pendingTradeIns}</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {renderTab('repairs', 'Repairs', <Wrench className="w-4 h-4" />)}
            {renderTab('customers', 'Customers', <User className="w-4 h-4" />)}
            {renderTab('inventory', 'Inventory', <Package className="w-4 h-4" />)}
            {renderTab('orders', 'Orders', <ShoppingCart className="w-4 h-4" />)}
            {renderTab('tradein', 'Trade-ins', <RefreshCw className="w-4 h-4" />)}
            {renderTab('accessories', 'Accessories', <ShoppingBag className="w-4 h-4" />)}
          </div>
        </div>

        {/* Main Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Repairs Tab */}
          {activeTab === 'repairs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 flex gap-4">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('tools.phoneRepair.searchByTicketDeviceCustomer', 'Search by ticket, device, customer, IMEI...')}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="all">{t('tools.phoneRepair.allStatus', 'All Status')}</option>
                    {repairStatuses.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setRepairForm({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.phoneRepair.newRepair', 'New Repair')}
                </button>
              </div>

              {/* New Repair Form */}
              {showForm && (
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.phoneRepair.newRepairIntake', 'New Repair Intake')}
                  </h3>

                  {/* Data Backup Disclaimer */}
                  <div className={`mb-6 p-4 rounded-lg border-l-4 border-yellow-500 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'}`}>
                          {t('tools.phoneRepair.dataBackupDisclaimer', 'Data Backup Disclaimer')}
                        </h4>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'}`}>
                          {t('tools.phoneRepair.weAreNotResponsibleFor', 'We are not responsible for any data loss during the repair process. Customer acknowledges they have backed up their data or accepts the risk of data loss.')}
                        </p>
                        <label className="flex items-center gap-2 mt-3">
                          <input
                            type="checkbox"
                            checked={repairForm.dataBackupAcknowledged || false}
                            onChange={(e) => setRepairForm({ ...repairForm, dataBackupAcknowledged: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                          />
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
                            {t('tools.phoneRepair.customerAcknowledgesDataBackupDisclaimer', 'Customer acknowledges data backup disclaimer')}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderSelect(
                      'Customer',
                      repairForm.customerId,
                      (v) => setRepairForm({ ...repairForm, customerId: v }),
                      data.customers.map((c: Customer) => ({ value: c.id, label: `${c.name} (${c.phone})` })),
                      true
                    )}
                    {renderSelect(
                      'Device Make',
                      repairForm.deviceMake,
                      (v) => setRepairForm({ ...repairForm, deviceMake: v }),
                      deviceMakes.map((m) => ({ value: m, label: m })),
                      true
                    )}
                    {renderInput(
                      'Device Model',
                      repairForm.deviceModel,
                      (v) => setRepairForm({ ...repairForm, deviceModel: v }),
                      'text',
                      'e.g., iPhone 14 Pro',
                      true
                    )}
                    {renderInput(
                      'IMEI',
                      repairForm.imei,
                      (v) => setRepairForm({ ...repairForm, imei: v }),
                      'text',
                      '15-digit IMEI number'
                    )}
                    {renderInput(
                      'Serial Number',
                      repairForm.serialNumber,
                      (v) => setRepairForm({ ...repairForm, serialNumber: v }),
                      'text',
                      'Device serial number'
                    )}
                    {renderInput(
                      'Issue',
                      repairForm.issue,
                      (v) => setRepairForm({ ...repairForm, issue: v }),
                      'text',
                      'e.g., Cracked Screen'
                    )}
                    {renderSelect(
                      'Priority',
                      repairForm.priority,
                      (v) => setRepairForm({ ...repairForm, priority: v as RepairJob['priority'] }),
                      [
                        { value: 'low', label: 'Low' },
                        { value: 'normal', label: 'Normal' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' },
                      ]
                    )}
                    {renderSelect(
                      'Technician',
                      repairForm.technicianId,
                      (v) => setRepairForm({ ...repairForm, technicianId: v }),
                      data.technicians.filter((t: Technician) => t.active).map((t: Technician) => ({ value: t.id, label: t.name }))
                    )}
                    {renderInput(
                      'Estimated Cost ($)',
                      repairForm.estimatedCost,
                      (v) => setRepairForm({ ...repairForm, estimatedCost: parseFloat(v) || 0 }),
                      'number',
                      '0.00'
                    )}
                    {renderInput(
                      'Warranty (months)',
                      repairForm.warrantyMonths,
                      (v) => setRepairForm({ ...repairForm, warrantyMonths: parseInt(v) || 3 }),
                      'number',
                      '3'
                    )}
                    {renderInput(
                      'Est. Completion',
                      repairForm.estimatedCompletion,
                      (v) => setRepairForm({ ...repairForm, estimatedCompletion: v }),
                      'datetime-local'
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {renderTextArea(
                      'Issue Details',
                      repairForm.issueDetails,
                      (v) => setRepairForm({ ...repairForm, issueDetails: v }),
                      'Detailed description of the issue...'
                    )}
                    {renderTextArea(
                      'Device Condition (Before)',
                      repairForm.conditionBefore,
                      (v) => setRepairForm({ ...repairForm, conditionBefore: v }),
                      'Note any existing damage, scratches, etc...'
                    )}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addRepairJob}
                      disabled={!repairForm.customerId || !repairForm.deviceMake || !repairForm.deviceModel}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.phoneRepair.createRepairTicket', 'Create Repair Ticket')}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      } transition-colors`}
                    >
                      {t('tools.phoneRepair.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Repair Jobs List */}
              <div className="space-y-4">
                {filteredRepairJobs.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.phoneRepair.noRepairJobsFound', 'No repair jobs found')}</p>
                  </div>
                ) : (
                  filteredRepairJobs.map((job: RepairJob) => {
                    const statusInfo = getStatusInfo(job.status);
                    const isExpanded = expandedJob === job.id;
                    return (
                      <div
                        key={job.id}
                        className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {job.ticketNumber}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs text-white ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                  {job.priority === 'urgent' && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-red-500 text-white">{t('tools.phoneRepair.urgent', 'URGENT')}</span>
                                  )}
                                  {job.priority === 'high' && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-orange-500 text-white">{t('tools.phoneRepair.high', 'HIGH')}</span>
                                  )}
                                </div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {job.deviceMake} {job.deviceModel} - {getCustomerName(job.customerId)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className={`text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <div>Tech: {getTechnicianName(job.technicianId)}</div>
                                <div>{new Date(job.intakeDate).toLocaleDateString()}</div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              ) : (
                                <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} p-4`}>
                            {/* Status Update */}
                            <div className="mb-4">
                              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.phoneRepair.updateStatus', 'Update Status')}
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {repairStatuses.map((s) => (
                                  <button
                                    key={s.value}
                                    onClick={() => updateRepairJob(job.id, { status: s.value })}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      job.status === s.value
                                        ? `${s.color} text-white`
                                        : theme === 'dark'
                                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Device Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.phoneRepair.issue', 'Issue')}</div>
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{job.issue || 'N/A'}</div>
                              </div>
                              <div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.phoneRepair.imei', 'IMEI')}</div>
                                <div className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{job.imei || 'N/A'}</div>
                              </div>
                              <div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.phoneRepair.estimatedCost', 'Estimated Cost')}</div>
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${job.estimatedCost.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.phoneRepair.warranty', 'Warranty')}</div>
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{job.warrantyMonths} months</div>
                              </div>
                            </div>

                            {/* Diagnostics */}
                            <div className="mb-4">
                              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('tools.phoneRepair.diagnosticChecklist', 'Diagnostic Checklist')}
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {job.diagnostics.map((diag: DiagnosticItem) => (
                                  <div
                                    key={diag.id}
                                    className={`flex items-center justify-between p-2 rounded ${
                                      theme === 'dark' ? 'bg-gray-600' : 'bg-white border border-gray-200'
                                    }`}
                                  >
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {diag.name}
                                    </span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => updateDiagnostic(job.id, diag.id, { status: 'pass', checked: true })}
                                        className={`p-1 rounded ${
                                          diag.status === 'pass' ? 'bg-green-500 text-white' : theme === 'dark' ? 'bg-gray-500' : 'bg-gray-200'
                                        }`}
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => updateDiagnostic(job.id, diag.id, { status: 'fail', checked: true })}
                                        className={`p-1 rounded ${
                                          diag.status === 'fail' ? 'bg-red-500 text-white' : theme === 'dark' ? 'bg-gray-500' : 'bg-gray-200'
                                        }`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Parts Used */}
                            <div className="mb-4">
                              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('tools.phoneRepair.partsUsed', 'Parts Used')}
                              </h4>
                              {job.partsUsed.length > 0 ? (
                                <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                                  <table className="w-full">
                                    <thead className={theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}>
                                      <tr>
                                        <th className={`px-4 py-2 text-left text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.part', 'Part')}</th>
                                        <th className={`px-4 py-2 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.qty', 'Qty')}</th>
                                        <th className={`px-4 py-2 text-right text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.price', 'Price')}</th>
                                        <th className={`px-4 py-2 text-right text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.total', 'Total')}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {job.partsUsed.map((p: { partId: string; quantity: number; price: number }, idx: number) => (
                                        <tr key={idx} className={theme === 'dark' ? 'bg-gray-700' : 'bg-white'}>
                                          <td className={`px-4 py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getPartName(p.partId)}</td>
                                          <td className={`px-4 py-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.quantity}</td>
                                          <td className={`px-4 py-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${p.price.toFixed(2)}</td>
                                          <td className={`px-4 py-2 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${(p.price * p.quantity).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.phoneRepair.noPartsAddedYet', 'No parts added yet')}</p>
                              )}
                              {data.parts.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  <select
                                    id={`part-select-${job.id}`}
                                    className={`flex-1 px-3 py-2 rounded-lg border ${
                                      theme === 'dark'
                                        ? 'bg-gray-600 border-gray-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                  >
                                    <option value="">{t('tools.phoneRepair.selectPartToAdd', 'Select part to add...')}</option>
                                    {data.parts.filter((p: PartItem) => p.quantity > 0).map((p: PartItem) => (
                                      <option key={p.id} value={p.id}>{p.name} (${p.price}) - {p.quantity} in stock</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => {
                                      const select = document.getElementById(`part-select-${job.id}`) as HTMLSelectElement;
                                      if (select.value) {
                                        addPartToJob(job.id, select.value, 1);
                                        select.value = '';
                                      }
                                    }}
                                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                                  >
                                    {t('tools.phoneRepair.add', 'Add')}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Labor & Pricing */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t('tools.phoneRepair.laborCost', 'Labor Cost ($)')}
                                </label>
                                <input
                                  type="number"
                                  value={job.laborCost}
                                  onChange={(e) => updateRepairJob(job.id, { laborCost: parseFloat(e.target.value) || 0 })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t('tools.phoneRepair.partsTotal', 'Parts Total')}
                                </label>
                                <div className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                  ${job.partsUsed.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t('tools.phoneRepair.jobTotal', 'Job Total')}
                                </label>
                                <div className={`px-3 py-2 rounded-lg font-bold ${theme === 'dark' ? 'bg-gray-600 text-green-400' : 'bg-gray-100 text-green-600'}`}>
                                  ${calculateJobTotal(job).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t('tools.phoneRepair.finalCost', 'Final Cost ($)')}
                                </label>
                                <input
                                  type="number"
                                  value={job.finalCost}
                                  onChange={(e) => updateRepairJob(job.id, { finalCost: parseFloat(e.target.value) || 0 })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Condition Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t('tools.phoneRepair.conditionBefore', 'Condition Before')}
                                </label>
                                <div className={`p-3 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                  {job.conditionBefore || 'Not documented'}
                                </div>
                              </div>
                              <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t('tools.phoneRepair.conditionAfter', 'Condition After')}
                                </label>
                                <textarea
                                  value={job.conditionAfter}
                                  onChange={(e) => updateRepairJob(job.id, { conditionAfter: e.target.value })}
                                  placeholder={t('tools.phoneRepair.documentConditionAfterRepair', 'Document condition after repair...')}
                                  rows={2}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } resize-none`}
                                />
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-4">
                              <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('tools.phoneRepair.repairNotes', 'Repair Notes')}
                              </label>
                              <textarea
                                value={job.notes}
                                onChange={(e) => updateRepairJob(job.id, { notes: e.target.value })}
                                placeholder={t('tools.phoneRepair.addNotesAboutTheRepair', 'Add notes about the repair...')}
                                rows={2}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } resize-none`}
                              />
                            </div>

                            {/* Warranty Info */}
                            {job.status === 'completed' && job.warrantyExpiry && (
                              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-green-500" />
                                  <span className={`font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                                    Warranty valid until: {new Date(job.warrantyExpiry).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => deleteRepairJob(job.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.phoneRepair.customers', 'Customers')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setCustomerForm({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.phoneRepair.addCustomer', 'Add Customer')}
                </button>
              </div>

              {showForm && (
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.phoneRepair.newCustomer', 'New Customer')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('Name', customerForm.name, (v) => setCustomerForm({ ...customerForm, name: v }), 'text', 'Full name', true)}
                    {renderInput('Phone', customerForm.phone, (v) => setCustomerForm({ ...customerForm, phone: v }), 'tel', 'Phone number', true)}
                    {renderInput('Email', customerForm.email, (v) => setCustomerForm({ ...customerForm, email: v }), 'email', 'Email address')}
                    {renderInput('Address', customerForm.address, (v) => setCustomerForm({ ...customerForm, address: v }), 'text', 'Address')}
                  </div>
                  <div className="mt-4">
                    {renderTextArea('Notes', customerForm.notes, (v) => setCustomerForm({ ...customerForm, notes: v }), 'Customer notes...')}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addCustomer}
                      disabled={!customerForm.name || !customerForm.phone}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.phoneRepair.saveCustomer', 'Save Customer')}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {t('tools.phoneRepair.cancel2', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {data.customers.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.phoneRepair.noCustomersYet', 'No customers yet')}</p>
                  </div>
                ) : (
                  data.customers.map((customer: Customer) => (
                    <div
                      key={customer.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.name}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {customer.phone} {customer.email && `| ${customer.email}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(customer.id);
                              setCustomerForm(customer);
                            }}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {editingId === customer.id && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput('Name', customerForm.name, (v) => setCustomerForm({ ...customerForm, name: v }), 'text', 'Full name')}
                            {renderInput('Phone', customerForm.phone, (v) => setCustomerForm({ ...customerForm, phone: v }), 'tel', 'Phone number')}
                            {renderInput('Email', customerForm.email, (v) => setCustomerForm({ ...customerForm, email: v }), 'email', 'Email address')}
                            {renderInput('Address', customerForm.address, (v) => setCustomerForm({ ...customerForm, address: v }), 'text', 'Address')}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => updateCustomer(customer.id)}
                              className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                            >
                              {t('tools.phoneRepair.save', 'Save')}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setCustomerForm({});
                              }}
                              className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                              {t('tools.phoneRepair.cancel3', 'Cancel')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.phoneRepair.partsInventory', 'Parts Inventory')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setPartForm({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.phoneRepair.addPart', 'Add Part')}
                </button>
              </div>

              {/* Low Stock Alert */}
              {lowStockParts.length > 0 && (
                <div className={`p-4 rounded-lg border-l-4 border-red-500 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                      {t('tools.phoneRepair.lowStockAlert', 'Low Stock Alert')}
                    </span>
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-600'}`}>
                    {lowStockParts.map((p: PartItem) => p.name).join(', ')}
                  </div>
                </div>
              )}

              {showForm && (
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.phoneRepair.newPart', 'New Part')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderInput('Part Name', partForm.name, (v) => setPartForm({ ...partForm, name: v }), 'text', 'e.g., iPhone 14 Pro Screen', true)}
                    {renderInput('SKU', partForm.sku, (v) => setPartForm({ ...partForm, sku: v }), 'text', 'Part SKU', true)}
                    {renderSelect('Category', partForm.category, (v) => setPartForm({ ...partForm, category: v }), partCategories.map(c => ({ value: c, label: c })))}
                    {renderInput('Quantity', partForm.quantity, (v) => setPartForm({ ...partForm, quantity: parseInt(v) || 0 }), 'number', '0')}
                    {renderInput('Cost ($)', partForm.cost, (v) => setPartForm({ ...partForm, cost: parseFloat(v) || 0 }), 'number', '0.00')}
                    {renderInput('Price ($)', partForm.price, (v) => setPartForm({ ...partForm, price: parseFloat(v) || 0 }), 'number', '0.00')}
                    {renderInput('Min Stock', partForm.minStock, (v) => setPartForm({ ...partForm, minStock: parseInt(v) || 5 }), 'number', '5')}
                    {renderInput('Supplier', partForm.supplier, (v) => setPartForm({ ...partForm, supplier: v }), 'text', 'Supplier name')}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addPart}
                      disabled={!partForm.name || !partForm.sku}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.phoneRepair.savePart', 'Save Part')}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {t('tools.phoneRepair.cancel4', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.part2', 'Part')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.sku', 'SKU')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.category', 'Category')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.qty2', 'Qty')}</th>
                      <th className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.cost', 'Cost')}</th>
                      <th className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.price2', 'Price')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.parts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`px-4 py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.phoneRepair.noPartsInInventory', 'No parts in inventory')}
                        </td>
                      </tr>
                    ) : (
                      data.parts.map((part: PartItem) => (
                        <tr key={part.id} className={`border-t ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                          <td className={`px-4 py-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{part.name}</td>
                          <td className={`px-4 py-3 font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{part.sku}</td>
                          <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{part.category}</td>
                          <td className={`px-4 py-3 text-center ${part.quantity <= part.minStock ? 'text-red-500 font-bold' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {part.quantity}
                          </td>
                          <td className={`px-4 py-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>${part.cost.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${part.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(part.id);
                                  setPartForm(part);
                                }}
                                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deletePart(part.id)}
                                className="p-1 rounded hover:bg-red-100 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.phoneRepair.partsOrders', 'Parts Orders')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setOrderForm({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.phoneRepair.newOrder', 'New Order')}
                </button>
              </div>

              {showForm && (
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.phoneRepair.newPartsOrder', 'New Parts Order')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderSelect('Part', orderForm.partId, (v) => setOrderForm({ ...orderForm, partId: v }), data.parts.map((p: PartItem) => ({ value: p.id, label: p.name })), true)}
                    {renderInput('Quantity', orderForm.quantity, (v) => setOrderForm({ ...orderForm, quantity: parseInt(v) || 0 }), 'number', '1', true)}
                    {renderInput('Supplier', orderForm.supplier, (v) => setOrderForm({ ...orderForm, supplier: v }), 'text', 'Supplier name')}
                    {renderInput('Cost ($)', orderForm.cost, (v) => setOrderForm({ ...orderForm, cost: parseFloat(v) || 0 }), 'number', '0.00')}
                    {renderInput('Expected Date', orderForm.expectedDate, (v) => setOrderForm({ ...orderForm, expectedDate: v }), 'date')}
                  </div>
                  <div className="mt-4">
                    {renderTextArea('Notes', orderForm.notes, (v) => setOrderForm({ ...orderForm, notes: v }), 'Order notes...')}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addPartOrder}
                      disabled={!orderForm.partId || !orderForm.quantity}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.phoneRepair.createOrder', 'Create Order')}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {t('tools.phoneRepair.cancel5', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {data.partOrders.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.phoneRepair.noOrdersYet', 'No orders yet')}</p>
                  </div>
                ) : (
                  data.partOrders.map((order: PartOrder) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {getPartName(order.partId)} x{order.quantity}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {order.supplier || 'No supplier'} | ${order.cost.toFixed(2)} | Expected: {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : 'TBD'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updatePartOrder(order.id, { status: e.target.value as PartOrder['status'] })}
                            className={`px-3 py-1 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="pending">{t('tools.phoneRepair.pending', 'Pending')}</option>
                            <option value="ordered">{t('tools.phoneRepair.ordered', 'Ordered')}</option>
                            <option value="shipped">{t('tools.phoneRepair.shipped', 'Shipped')}</option>
                            <option value="received">{t('tools.phoneRepair.received', 'Received')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Trade-in Tab */}
          {activeTab === 'tradein' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.phoneRepair.tradeInBuyback', 'Trade-in / Buyback')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setTradeInForm({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.phoneRepair.newTradeIn', 'New Trade-in')}
                </button>
              </div>

              {showForm && (
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.phoneRepair.newTradeInEvaluation', 'New Trade-in Evaluation')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderSelect('Customer', tradeInForm.customerId, (v) => setTradeInForm({ ...tradeInForm, customerId: v }), data.customers.map((c: Customer) => ({ value: c.id, label: c.name })), true)}
                    {renderSelect('Device Make', tradeInForm.deviceMake, (v) => setTradeInForm({ ...tradeInForm, deviceMake: v }), deviceMakes.map(m => ({ value: m, label: m })), true)}
                    {renderInput('Device Model', tradeInForm.deviceModel, (v) => setTradeInForm({ ...tradeInForm, deviceModel: v }), 'text', 'e.g., iPhone 13 Pro', true)}
                    {renderInput('IMEI', tradeInForm.imei, (v) => setTradeInForm({ ...tradeInForm, imei: v }), 'text', 'IMEI number')}
                    {renderSelect('Condition', tradeInForm.condition, (v) => setTradeInForm({ ...tradeInForm, condition: v as TradeIn['condition'] }), [
                      { value: 'excellent', label: 'Excellent' },
                      { value: 'good', label: 'Good' },
                      { value: 'fair', label: 'Fair' },
                      { value: 'poor', label: 'Poor' },
                    ])}
                    {renderInput('Estimated Value ($)', tradeInForm.estimatedValue, (v) => setTradeInForm({ ...tradeInForm, estimatedValue: parseFloat(v) || 0 }), 'number', '0.00')}
                  </div>
                  <div className="mt-4">
                    {renderTextArea('Notes', tradeInForm.notes, (v) => setTradeInForm({ ...tradeInForm, notes: v }), 'Evaluation notes...')}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addTradeIn}
                      disabled={!tradeInForm.customerId || !tradeInForm.deviceMake || !tradeInForm.deviceModel}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.phoneRepair.createTradeIn', 'Create Trade-in')}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {t('tools.phoneRepair.cancel6', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {data.tradeIns.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.phoneRepair.noTradeInsYet', 'No trade-ins yet')}</p>
                  </div>
                ) : (
                  data.tradeIns.map((tradeIn: TradeIn) => (
                    <div
                      key={tradeIn.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {tradeIn.deviceMake} {tradeIn.deviceModel}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getCustomerName(tradeIn.customerId)} | Condition: {tradeIn.condition} | Est. Value: ${tradeIn.estimatedValue.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={tradeIn.status}
                            onChange={(e) => updateTradeIn(tradeIn.id, { status: e.target.value as TradeIn['status'] })}
                            className={`px-3 py-1 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="pending">{t('tools.phoneRepair.pending2', 'Pending')}</option>
                            <option value="evaluated">{t('tools.phoneRepair.evaluated', 'Evaluated')}</option>
                            <option value="accepted">{t('tools.phoneRepair.accepted', 'Accepted')}</option>
                            <option value="declined">{t('tools.phoneRepair.declined', 'Declined')}</option>
                            <option value="completed">{t('tools.phoneRepair.completed', 'Completed')}</option>
                          </select>
                          {tradeIn.status === 'evaluated' && (
                            <input
                              type="number"
                              placeholder={t('tools.phoneRepair.final', 'Final $')}
                              value={tradeIn.finalValue || ''}
                              onChange={(e) => updateTradeIn(tradeIn.id, { finalValue: parseFloat(e.target.value) || 0 })}
                              className={`w-24 px-2 py-1 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Accessories Tab */}
          {activeTab === 'accessories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.phoneRepair.accessories', 'Accessories')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setAccessoryForm({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.phoneRepair.addAccessory', 'Add Accessory')}
                </button>
              </div>

              {showForm && (
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.phoneRepair.newAccessory', 'New Accessory')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderInput('Name', accessoryForm.name, (v) => setAccessoryForm({ ...accessoryForm, name: v }), 'text', 'e.g., iPhone 14 Case', true)}
                    {renderInput('SKU', accessoryForm.sku, (v) => setAccessoryForm({ ...accessoryForm, sku: v }), 'text', 'SKU', true)}
                    {renderSelect('Category', accessoryForm.category, (v) => setAccessoryForm({ ...accessoryForm, category: v }), [
                      { value: 'Case', label: 'Case' },
                      { value: 'Screen Protector', label: 'Screen Protector' },
                      { value: 'Charger', label: 'Charger' },
                      { value: 'Cable', label: 'Cable' },
                      { value: 'Headphones', label: 'Headphones' },
                      { value: 'Mount', label: 'Mount' },
                      { value: 'Other', label: 'Other' },
                    ])}
                    {renderInput('Quantity', accessoryForm.quantity, (v) => setAccessoryForm({ ...accessoryForm, quantity: parseInt(v) || 0 }), 'number', '0')}
                    {renderInput('Cost ($)', accessoryForm.cost, (v) => setAccessoryForm({ ...accessoryForm, cost: parseFloat(v) || 0 }), 'number', '0.00')}
                    {renderInput('Price ($)', accessoryForm.price, (v) => setAccessoryForm({ ...accessoryForm, price: parseFloat(v) || 0 }), 'number', '0.00')}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addAccessory}
                      disabled={!accessoryForm.name || !accessoryForm.sku}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.phoneRepair.saveAccessory', 'Save Accessory')}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {t('tools.phoneRepair.cancel7', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.accessory', 'Accessory')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.sku2', 'SKU')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.category2', 'Category')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.qty3', 'Qty')}</th>
                      <th className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.price3', 'Price')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.phoneRepair.sell', 'Sell')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.accessories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`px-4 py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.phoneRepair.noAccessoriesInInventory', 'No accessories in inventory')}
                        </td>
                      </tr>
                    ) : (
                      data.accessories.map((acc: Accessory) => (
                        <tr key={acc.id} className={`border-t ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                          <td className={`px-4 py-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{acc.name}</td>
                          <td className={`px-4 py-3 font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{acc.sku}</td>
                          <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{acc.category}</td>
                          <td className={`px-4 py-3 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{acc.quantity}</td>
                          <td className={`px-4 py-3 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${acc.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                if (acc.quantity > 0 && data.customers.length > 0) {
                                  sellAccessory(acc.id, 1, data.customers[0].id);
                                }
                              }}
                              disabled={acc.quantity === 0}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                acc.quantity > 0
                                  ? t('tools.phoneRepair.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white') : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              }`}
                            >
                              {t('tools.phoneRepair.sell2', 'Sell')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Recent Accessory Sales */}
              {data.accessorySales.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.phoneRepair.recentSales', 'Recent Sales')}
                  </h3>
                  <div className="space-y-2">
                    {data.accessorySales.slice(-10).reverse().map((sale: AccessorySale) => {
                      const accessory = data.accessories.find((a: Accessory) => a.id === sale.accessoryId);
                      return (
                        <div
                          key={sale.id}
                          className={`flex justify-between items-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            {accessory?.name || 'Unknown'} x{sale.quantity}
                          </span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            ${sale.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.phoneRepair.aboutPhoneRepairShopManager', 'About Phone Repair Shop Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive tool for managing your phone/device repair business. Track device intake, customer information,
            diagnostic checklists, parts inventory, repair status, pricing, warranty, technician assignments, parts ordering,
            trade-in valuations, and accessory sales. All data is saved locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhoneRepairTool;
