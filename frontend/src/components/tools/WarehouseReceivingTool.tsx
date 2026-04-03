import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Warehouse,
  Plus,
  Search,
  Filter,
  Truck,
  Package,
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  FileText,
  Barcode,
  Boxes,
  Scale,
  Thermometer,
  Camera,
  ClipboardList,
  Edit2,
  Trash2,
  X,
  Eye,
  BarChart3,
  ArrowDownToLine,
  ArrowUpFromLine,
  Timer,
  CheckSquare,
  AlertCircle,
  MapPin,
  Hash,
  ScanLine,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Loader2 } from 'lucide-react';

interface ReceivingItem {
  id: string;
  sku: string;
  description: string;
  expectedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  uom: string;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  lotNumber?: string;
  expirationDate?: string;
  serialNumbers?: string[];
  condition: 'good' | 'damaged' | 'rejected';
  notes?: string;
  binLocation?: string;
}

interface ReceivingRecord {
  id: string;
  receivingNumber: string;
  poNumber: string;
  bolNumber?: string;
  asnNumber?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  type: 'purchase-order' | 'transfer' | 'return' | 'cross-dock';
  vendor: {
    name: string;
    id: string;
    contact: string;
    phone: string;
  };
  carrier: {
    name: string;
    tractorNumber: string;
    trailerNumber: string;
    sealNumber: string;
    driverName: string;
  };
  dock: {
    number: string;
    zone: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  arrivalTime?: string;
  startTime?: string;
  completionTime?: string;
  items: ReceivingItem[];
  totalExpected: number;
  totalReceived: number;
  totalDamaged: number;
  receivedBy: string;
  inspectedBy?: string;
  qualityChecks: {
    id: string;
    checkType: string;
    passed: boolean;
    notes?: string;
    timestamp: string;
  }[];
  photos: {
    id: string;
    url: string;
    type: 'trailer' | 'damage' | 'product' | 'seal' | 'other';
    caption: string;
  }[];
  exceptions: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
    timestamp: string;
  }[];
  notes: string;
  temperature?: {
    required: boolean;
    min?: number;
    max?: number;
    actual?: number;
    unit: 'F' | 'C';
    passed?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const WarehouseReceivingTool: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'receiving' | 'scheduled' | 'exceptions' | 'reports'>('receiving');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceivingRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ReceivingRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const columns: ColumnConfig[] = [
    { key: 'receivingNumber', header: 'Receiving #', selected: true },
    { key: 'poNumber', header: 'PO Number', selected: true },
    { key: 'bolNumber', header: 'BOL Number', selected: true },
    { key: 'status', header: 'Status', selected: true },
    { key: 'type', header: 'Type', selected: true },
    { key: 'vendorName', header: 'Vendor', selected: true },
    { key: 'carrierName', header: 'Carrier', selected: true },
    { key: 'dockNumber', header: 'Dock', selected: true },
    { key: 'scheduledDate', header: 'Scheduled Date', selected: true },
    { key: 'arrivalTime', header: 'Arrival Time', selected: false },
    { key: 'totalExpected', header: 'Expected', selected: true },
    { key: 'totalReceived', header: 'Received', selected: true },
    { key: 'totalDamaged', header: 'Damaged', selected: false },
    { key: 'receivedBy', header: 'Received By', selected: false },
  ];

  const generateSampleData = (): ReceivingRecord[] => [
    {
      id: '1',
      receivingNumber: 'RCV-2024-001234',
      poNumber: 'PO-2024-5678',
      bolNumber: 'BOL-2024-001234',
      asnNumber: 'ASN-12345',
      status: 'completed',
      type: 'purchase-order',
      vendor: {
        name: 'ABC Manufacturing Co.',
        id: 'VND-001',
        contact: 'John Smith',
        phone: '312-555-0100',
      },
      carrier: {
        name: 'Swift Transport LLC',
        tractorNumber: 'TRK-1001',
        trailerNumber: 'TRL-5001',
        sealNumber: 'SEAL-789456',
        driverName: 'Mike Wilson',
      },
      dock: {
        number: 'DOCK-5',
        zone: 'Zone A - Receiving',
      },
      scheduledDate: '2024-01-15',
      scheduledTime: '08:00',
      arrivalTime: '07:45',
      startTime: '08:00',
      completionTime: '10:30',
      items: [
        {
          id: '1',
          sku: 'SKU-12345',
          description: 'Electronic Components - Class A',
          expectedQuantity: 1000,
          receivedQuantity: 1000,
          damagedQuantity: 0,
          uom: 'EA',
          weight: 500,
          weightUnit: 'lbs',
          lotNumber: 'LOT-2024-001',
          condition: 'good',
          binLocation: 'A-01-01',
        },
        {
          id: '2',
          sku: 'SKU-12346',
          description: 'Precision Instruments',
          expectedQuantity: 500,
          receivedQuantity: 500,
          damagedQuantity: 0,
          uom: 'EA',
          weight: 250,
          weightUnit: 'lbs',
          lotNumber: 'LOT-2024-002',
          condition: 'good',
          binLocation: 'A-01-02',
        },
      ],
      totalExpected: 1500,
      totalReceived: 1500,
      totalDamaged: 0,
      receivedBy: 'Sarah Johnson',
      inspectedBy: 'Tom Anderson',
      qualityChecks: [
        {
          id: '1',
          checkType: 'Visual Inspection',
          passed: true,
          notes: 'All items in good condition',
          timestamp: '2024-01-15T09:00:00Z',
        },
        {
          id: '2',
          checkType: 'Count Verification',
          passed: true,
          notes: 'Counts match PO exactly',
          timestamp: '2024-01-15T09:30:00Z',
        },
      ],
      photos: [
        {
          id: '1',
          url: '/photos/receiving-1.jpg',
          type: 'seal',
          caption: 'Intact seal before opening',
        },
        {
          id: '2',
          url: '/photos/receiving-2.jpg',
          type: 'trailer',
          caption: 'Full trailer view',
        },
      ],
      exceptions: [],
      notes: 'Receipt completed without issues. All items put away to assigned bin locations.',
      createdAt: '2024-01-15T07:45:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      receivingNumber: 'RCV-2024-001235',
      poNumber: 'PO-2024-5679',
      bolNumber: 'BOL-2024-001235',
      status: 'in-progress',
      type: 'purchase-order',
      vendor: {
        name: 'Global Parts Inc.',
        id: 'VND-002',
        contact: 'Robert Chen',
        phone: '313-555-0300',
      },
      carrier: {
        name: 'Reliable Freight Co.',
        tractorNumber: 'TRK-2002',
        trailerNumber: 'TRL-6002',
        sealNumber: 'SEAL-123789',
        driverName: 'James Lee',
      },
      dock: {
        number: 'DOCK-3',
        zone: 'Zone B - Receiving',
      },
      scheduledDate: '2024-01-15',
      scheduledTime: '10:00',
      arrivalTime: '10:15',
      startTime: '10:30',
      items: [
        {
          id: '1',
          sku: 'SKU-23456',
          description: 'Auto Parts - Engine Components',
          expectedQuantity: 2000,
          receivedQuantity: 1500,
          damagedQuantity: 25,
          uom: 'EA',
          weight: 3000,
          weightUnit: 'lbs',
          lotNumber: 'LOT-2024-003',
          condition: 'damaged',
          notes: '25 units with packaging damage',
        },
      ],
      totalExpected: 2000,
      totalReceived: 1500,
      totalDamaged: 25,
      receivedBy: 'Lisa Brown',
      qualityChecks: [
        {
          id: '1',
          checkType: 'Visual Inspection',
          passed: false,
          notes: 'Found damaged packaging on partial shipment',
          timestamp: '2024-01-15T11:00:00Z',
        },
      ],
      photos: [
        {
          id: '1',
          url: '/photos/damage-1.jpg',
          type: 'damage',
          caption: 'Damaged packaging - 25 units affected',
        },
      ],
      exceptions: [
        {
          type: 'Damage',
          description: '25 units received with damaged packaging. Contents appear intact but require QC inspection.',
          severity: 'medium',
          resolved: false,
          timestamp: '2024-01-15T11:00:00Z',
        },
        {
          type: 'Shortage',
          description: 'Only 1500 of 2000 expected units received. Balance to follow.',
          severity: 'medium',
          resolved: false,
          timestamp: '2024-01-15T10:45:00Z',
        },
      ],
      notes: 'Partial receipt in progress. Waiting for damage inspection results.',
      temperature: {
        required: false,
        unit: 'F',
      },
      createdAt: '2024-01-15T10:15:00Z',
      updatedAt: '2024-01-15T11:30:00Z',
    },
    {
      id: '3',
      receivingNumber: 'RCV-2024-001236',
      poNumber: 'PO-2024-5680',
      status: 'scheduled',
      type: 'purchase-order',
      vendor: {
        name: 'Fresh Foods Distribution',
        id: 'VND-003',
        contact: 'Maria Garcia',
        phone: '510-555-0400',
      },
      carrier: {
        name: 'Cold Chain Logistics',
        tractorNumber: '',
        trailerNumber: '',
        sealNumber: '',
        driverName: '',
      },
      dock: {
        number: 'DOCK-1',
        zone: 'Zone C - Cold Storage',
      },
      scheduledDate: '2024-01-16',
      scheduledTime: '06:00',
      items: [
        {
          id: '1',
          sku: 'SKU-34567',
          description: 'Frozen Food Products',
          expectedQuantity: 500,
          receivedQuantity: 0,
          damagedQuantity: 0,
          uom: 'CS',
          weight: 5000,
          weightUnit: 'lbs',
          expirationDate: '2024-06-15',
          condition: 'good',
        },
      ],
      totalExpected: 500,
      totalReceived: 0,
      totalDamaged: 0,
      receivedBy: '',
      qualityChecks: [],
      photos: [],
      exceptions: [],
      notes: 'Temperature-controlled shipment. Requires immediate transfer to cold storage.',
      temperature: {
        required: true,
        min: -10,
        max: 0,
        unit: 'F',
      },
      createdAt: '2024-01-14T16:00:00Z',
      updatedAt: '2024-01-14T16:00:00Z',
    },
    {
      id: '4',
      receivingNumber: 'RCV-2024-001237',
      poNumber: 'RMA-2024-0123',
      status: 'on-hold',
      type: 'return',
      vendor: {
        name: 'Tech Solutions Inc.',
        id: 'VND-004',
        contact: 'Mark Davis',
        phone: '602-555-0500',
      },
      carrier: {
        name: 'FedEx Freight',
        tractorNumber: 'FX-8001',
        trailerNumber: 'FX-TRL-9001',
        sealNumber: 'FX-SEAL-456',
        driverName: 'David Kim',
      },
      dock: {
        number: 'DOCK-8',
        zone: 'Zone D - Returns',
      },
      scheduledDate: '2024-01-15',
      scheduledTime: '14:00',
      arrivalTime: '14:30',
      startTime: '14:45',
      items: [
        {
          id: '1',
          sku: 'SKU-45678',
          description: 'Defective Server Equipment',
          expectedQuantity: 10,
          receivedQuantity: 10,
          damagedQuantity: 10,
          uom: 'EA',
          weight: 500,
          weightUnit: 'lbs',
          serialNumbers: ['SN-001', 'SN-002', 'SN-003', 'SN-004', 'SN-005', 'SN-006', 'SN-007', 'SN-008', 'SN-009', 'SN-010'],
          condition: 'rejected',
          notes: 'Customer return - defective units',
        },
      ],
      totalExpected: 10,
      totalReceived: 10,
      totalDamaged: 10,
      receivedBy: 'Carlos Rodriguez',
      inspectedBy: 'Quality Team',
      qualityChecks: [
        {
          id: '1',
          checkType: 'RMA Verification',
          passed: true,
          notes: 'RMA numbers verified',
          timestamp: '2024-01-15T15:00:00Z',
        },
        {
          id: '2',
          checkType: 'Serial Number Check',
          passed: true,
          notes: 'All serial numbers match return authorization',
          timestamp: '2024-01-15T15:15:00Z',
        },
      ],
      photos: [],
      exceptions: [
        {
          type: 'Return Processing',
          description: 'Units received. Awaiting QA inspection and disposition decision.',
          severity: 'low',
          resolved: false,
          timestamp: '2024-01-15T15:30:00Z',
        },
      ],
      notes: 'Customer return processing. All 10 units to be inspected by QA.',
      createdAt: '2024-01-15T14:30:00Z',
      updatedAt: '2024-01-15T15:30:00Z',
    },
  ];

  const {
    data: records,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<ReceivingRecord>('warehouse-receiving', [], columns);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.receivingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.bolNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      record.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.carrier.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    const matchesTab =
      activeTab === 'receiving' ||
      (activeTab === 'scheduled' && record.status === 'scheduled') ||
      (activeTab === 'exceptions' && record.exceptions.length > 0);

    return matchesSearch && matchesStatus && matchesTab;
  });

  const stats = {
    totalRecords: records.length,
    completed: records.filter((r) => r.status === 'completed').length,
    inProgress: records.filter((r) => r.status === 'in-progress').length,
    scheduled: records.filter((r) => r.status === 'scheduled').length,
    onHold: records.filter((r) => r.status === 'on-hold').length,
    exceptions: records.filter((r) => r.exceptions.length > 0).length,
    unitsReceived: records.reduce((sum, r) => sum + r.totalReceived, 0),
    unitsDamaged: records.reduce((sum, r) => sum + r.totalDamaged, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'on-hold':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase-order':
        return 'Purchase Order';
      case 'transfer':
        return 'Transfer';
      case 'return':
        return 'Return';
      case 'cross-dock':
        return 'Cross-Dock';
      default:
        return type;
    }
  };

  const handleSaveRecord = async (recordData: Partial<ReceivingRecord>) => {
    const now = new Date().toISOString();
    const record: ReceivingRecord = {
      id: editingRecord?.id || crypto.randomUUID(),
      receivingNumber:
        recordData.receivingNumber ||
        `RCV-${new Date().getFullYear()}-${String(records.length + 1).padStart(6, '0')}`,
      poNumber: recordData.poNumber || '',
      bolNumber: recordData.bolNumber,
      asnNumber: recordData.asnNumber,
      status: recordData.status || 'scheduled',
      type: recordData.type || 'purchase-order',
      vendor: recordData.vendor || { name: '', id: '', contact: '', phone: '' },
      carrier: recordData.carrier || {
        name: '',
        tractorNumber: '',
        trailerNumber: '',
        sealNumber: '',
        driverName: '',
      },
      dock: recordData.dock || { number: '', zone: '' },
      scheduledDate: recordData.scheduledDate || now.split('T')[0],
      scheduledTime: recordData.scheduledTime || '',
      arrivalTime: recordData.arrivalTime,
      startTime: recordData.startTime,
      completionTime: recordData.completionTime,
      items: recordData.items || [],
      totalExpected: recordData.totalExpected || 0,
      totalReceived: recordData.totalReceived || 0,
      totalDamaged: recordData.totalDamaged || 0,
      receivedBy: recordData.receivedBy || '',
      inspectedBy: recordData.inspectedBy,
      qualityChecks: recordData.qualityChecks || [],
      photos: recordData.photos || [],
      exceptions: recordData.exceptions || [],
      notes: recordData.notes || '',
      temperature: recordData.temperature,
      createdAt: editingRecord?.createdAt || now,
      updatedAt: now,
    };

    await saveItem(record);
    setShowModal(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this receiving record?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const exportData = filteredRecords.map((record) => ({
    receivingNumber: record.receivingNumber,
    poNumber: record.poNumber,
    bolNumber: record.bolNumber || '',
    status: record.status,
    type: record.type,
    vendorName: record.vendor.name,
    carrierName: record.carrier.name,
    dockNumber: record.dock.number,
    scheduledDate: record.scheduledDate,
    arrivalTime: record.arrivalTime || '',
    totalExpected: record.totalExpected,
    totalReceived: record.totalReceived,
    totalDamaged: record.totalDamaged,
    receivedBy: record.receivedBy,
  }));

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Warehouse className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tools.warehouseReceiving.warehouseReceiving', 'Warehouse Receiving')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.warehouseReceiving.manageInboundShipmentsAndReceipts', 'Manage inbound shipments and receipts')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="warehouse-receiving" toolName="Warehouse Receiving" />

            <SyncStatus status={syncStatus} lastSynced={lastSynced} />
            <ExportDropdown data={exportData} filename="warehouse-receiving" columns={columns} />
            <button
              onClick={() => {
                setEditingRecord(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.warehouseReceiving.newReceipt', 'New Receipt')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mb-4">
          {[
            { id: 'receiving', label: 'All Receipts', icon: Boxes },
            { id: 'scheduled', label: 'Scheduled', icon: Calendar },
            { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'scheduled' && stats.scheduled > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">{stats.scheduled}</span>
              )}
              {tab.id === 'exceptions' && stats.exceptions > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">{stats.exceptions}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Boxes className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.total', 'Total')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalRecords}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.completed', 'Completed')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.inProgress', 'In Progress')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.scheduled', 'Scheduled')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.scheduled}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.onHold', 'On Hold')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.onHold}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.exceptions', 'Exceptions')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.exceptions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <ArrowDownToLine className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.unitsReceived', 'Units Received')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.unitsReceived.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">{t('tools.warehouseReceiving.damaged', 'Damaged')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.unitsDamaged}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.warehouseReceiving.searchByReceivingPoBol', 'Search by receiving #, PO #, BOL #, vendor, carrier...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{t('tools.warehouseReceiving.allStatus', 'All Status')}</option>
              <option value="scheduled">{t('tools.warehouseReceiving.scheduled2', 'Scheduled')}</option>
              <option value="in-progress">{t('tools.warehouseReceiving.inProgress2', 'In Progress')}</option>
              <option value="completed">{t('tools.warehouseReceiving.completed2', 'Completed')}</option>
              <option value="on-hold">{t('tools.warehouseReceiving.onHold2', 'On Hold')}</option>
              <option value="cancelled">{t('tools.warehouseReceiving.cancelled', 'Cancelled')}</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'border-purple-500 bg-purple-50 text-purple-600 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('tools.warehouseReceiving.filters', 'Filters')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {activeTab !== 'reports' ? (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">{t('tools.warehouseReceiving.loading', 'Loading...')}</div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Warehouse className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.warehouseReceiving.noReceivingRecordsFound', 'No receiving records found')}</p>
                <button
                  onClick={() => {
                    setEditingRecord(null);
                    setShowModal(true);
                  }}
                  className="mt-3 text-purple-600 hover:text-purple-700"
                >
                  {t('tools.warehouseReceiving.createYourFirstReceipt', 'Create your first receipt')}
                </button>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          record.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : record.status === 'in-progress'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : record.status === 'scheduled'
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-orange-100 dark:bg-orange-900/30'
                        }`}
                      >
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{record.receivingNumber}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {record.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {getTypeLabel(record.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PO: {record.poNumber}
                          {record.bolNumber && ` | BOL: ${record.bolNumber}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetails(true);
                        }}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                        title={t('tools.warehouseReceiving.viewDetails', 'View Details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRecord(record);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title={t('tools.warehouseReceiving.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Vendor and Carrier Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.warehouseReceiving.vendor', 'Vendor')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{record.vendor.name}</p>
                        <p className="text-xs text-gray-500">{record.vendor.id}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.warehouseReceiving.carrier', 'Carrier')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{record.carrier.name}</p>
                        {record.carrier.trailerNumber && (
                          <p className="text-xs text-gray-500">Trailer: {record.carrier.trailerNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.warehouseReceiving.dock', 'Dock')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{record.dock.number}</p>
                        <p className="text-xs text-gray-500">{record.dock.zone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Items */}
                  {record.totalExpected > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">{t('tools.warehouseReceiving.receivingProgress', 'Receiving Progress')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {record.totalReceived} / {record.totalExpected} units
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            record.totalReceived === record.totalExpected
                              ? 'bg-green-500'
                              : record.totalReceived > 0
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                          style={{
                            width: `${Math.min((record.totalReceived / record.totalExpected) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Details Footer */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Scheduled: {new Date(record.scheduledDate).toLocaleDateString()} {record.scheduledTime}
                      </span>
                    </div>
                    {record.arrivalTime && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Timer className="w-4 h-4" />
                        <span>Arrived: {record.arrivalTime}</span>
                      </div>
                    )}
                    {record.totalDamaged > 0 && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{record.totalDamaged} damaged</span>
                      </div>
                    )}
                    {record.temperature?.required && (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          record.temperature.passed === false ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        <Thermometer className="w-4 h-4" />
                        <span>
                          Temp: {record.temperature.actual || 'Pending'}°{record.temperature.unit}
                        </span>
                      </div>
                    )}
                    {record.qualityChecks.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-purple-600">
                        <CheckSquare className="w-4 h-4" />
                        <span>
                          {record.qualityChecks.filter((c) => c.passed).length}/{record.qualityChecks.length} QC passed
                        </span>
                      </div>
                    )}
                    {record.exceptions.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>
                          {record.exceptions.filter((e) => !e.resolved).length} open exception(s)
                        </span>
                      </div>
                    )}
                    {record.receivedBy && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
                        <User className="w-4 h-4" />
                        <span>{record.receivedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Reports Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.warehouseReceiving.receivingSummary', 'Receiving Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.totalReceipts', 'Total Receipts')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.totalRecords}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.completedToday', 'Completed Today')}</span>
                  <span className="font-semibold text-green-600">
                    {records.filter((r) => r.status === 'completed' && r.completionTime?.includes(new Date().toISOString().split('T')[0])).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.inProgress3', 'In Progress')}</span>
                  <span className="font-semibold text-yellow-600">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.scheduledToday', 'Scheduled Today')}</span>
                  <span className="font-semibold text-blue-600">
                    {records.filter((r) => r.scheduledDate === new Date().toISOString().split('T')[0]).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.warehouseReceiving.unitsSummary', 'Units Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.totalExpected', 'Total Expected')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {records.reduce((sum, r) => sum + r.totalExpected, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.totalReceived', 'Total Received')}</span>
                  <span className="font-semibold text-green-600">{stats.unitsReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.totalDamaged', 'Total Damaged')}</span>
                  <span className="font-semibold text-red-600">{stats.unitsDamaged}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.warehouseReceiving.damageRate', 'Damage Rate')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.unitsReceived > 0
                      ? ((stats.unitsDamaged / stats.unitsReceived) * 100).toFixed(2)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.warehouseReceiving.dockUtilization', 'Dock Utilization')}</h3>
              <div className="space-y-3">
                {Array.from(new Set(records.map((r) => r.dock.number)))
                  .slice(0, 5)
                  .map((dock) => {
                    const dockRecords = records.filter((r) => r.dock.number === dock);
                    return (
                      <div key={dock} className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{dock}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dockRecords.length} receipt(s)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.warehouseReceiving.topVendors', 'Top Vendors')}</h3>
              <div className="space-y-3">
                {Array.from(new Set(records.map((r) => r.vendor.name)))
                  .slice(0, 5)
                  .map((vendor) => {
                    const vendorRecords = records.filter((r) => r.vendor.name === vendor);
                    const vendorUnits = vendorRecords.reduce((sum, r) => sum + r.totalReceived, 0);
                    return (
                      <div key={vendor} className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[60%]">{vendor}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {vendorUnits.toLocaleString()} units
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit Record */}
      {showModal && (
        <ReceivingFormModal
          record={editingRecord}
          onSave={handleSaveRecord}
          onClose={() => {
            setShowModal(false);
            setEditingRecord(null);
          }}
        />
      )}

      {/* Details Modal */}
      {showDetails && selectedRecord && (
        <ReceivingDetailsModal
          record={selectedRecord}
          onClose={() => {
            setShowDetails(false);
            setSelectedRecord(null);
          }}
        />
      )}

      <ConfirmDialog />
    </div>
  );
};

// Receiving Form Modal Component
const ReceivingFormModal: React.FC<{
  record: ReceivingRecord | null;
  onSave: (data: Partial<ReceivingRecord>) => void;
  onClose: () => void;
}> = ({ record, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<ReceivingRecord>>(
    record || {
      status: 'scheduled',
      type: 'purchase-order',
      vendor: { name: '', id: '', contact: '', phone: '' },
      carrier: { name: '', tractorNumber: '', trailerNumber: '', sealNumber: '', driverName: '' },
      dock: { number: '', zone: '' },
      items: [],
      qualityChecks: [],
      photos: [],
      exceptions: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {record ? t('tools.warehouseReceiving.editReceivingRecord', 'Edit Receiving Record') : t('tools.warehouseReceiving.newReceivingRecord', 'New Receiving Record')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.poNumber', 'PO Number')}</label>
              <input
                type="text"
                value={formData.poNumber || ''}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder={t('tools.warehouseReceiving.po2024Xxxx', 'PO-2024-XXXX')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.bolNumber', 'BOL Number')}</label>
              <input
                type="text"
                value={formData.bolNumber || ''}
                onChange={(e) => setFormData({ ...formData, bolNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder={t('tools.warehouseReceiving.bol2024Xxxxxx', 'BOL-2024-XXXXXX')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.status', 'Status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="scheduled">{t('tools.warehouseReceiving.scheduled3', 'Scheduled')}</option>
                <option value="in-progress">{t('tools.warehouseReceiving.inProgress4', 'In Progress')}</option>
                <option value="completed">{t('tools.warehouseReceiving.completed3', 'Completed')}</option>
                <option value="on-hold">{t('tools.warehouseReceiving.onHold3', 'On Hold')}</option>
                <option value="cancelled">{t('tools.warehouseReceiving.cancelled2', 'Cancelled')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.type', 'Type')}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="purchase-order">{t('tools.warehouseReceiving.purchaseOrder', 'Purchase Order')}</option>
                <option value="transfer">{t('tools.warehouseReceiving.transfer', 'Transfer')}</option>
                <option value="return">{t('tools.warehouseReceiving.return', 'Return')}</option>
                <option value="cross-dock">{t('tools.warehouseReceiving.crossDock', 'Cross-Dock')}</option>
              </select>
            </div>
          </div>

          {/* Vendor Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.warehouseReceiving.vendorInformation', 'Vendor Information')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.vendorName', 'Vendor Name')}
                  value={formData.vendor?.name || ''}
                  onChange={(e) => setFormData({ ...formData, vendor: { ...formData.vendor!, name: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.vendorId', 'Vendor ID')}
                  value={formData.vendor?.id || ''}
                  onChange={(e) => setFormData({ ...formData, vendor: { ...formData.vendor!, id: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.contactName', 'Contact Name')}
                  value={formData.vendor?.contact || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: { ...formData.vendor!, contact: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder={t('tools.warehouseReceiving.phone', 'Phone')}
                  value={formData.vendor?.phone || ''}
                  onChange={(e) => setFormData({ ...formData, vendor: { ...formData.vendor!, phone: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Carrier Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.warehouseReceiving.carrierInformation', 'Carrier Information')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.carrierName', 'Carrier Name')}
                  value={formData.carrier?.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier: { ...formData.carrier!, name: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.tractor', 'Tractor #')}
                  value={formData.carrier?.tractorNumber || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier: { ...formData.carrier!, tractorNumber: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.trailer', 'Trailer #')}
                  value={formData.carrier?.trailerNumber || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier: { ...formData.carrier!, trailerNumber: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.seal', 'Seal #')}
                  value={formData.carrier?.sealNumber || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier: { ...formData.carrier!, sealNumber: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.driverName', 'Driver Name')}
                  value={formData.carrier?.driverName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier: { ...formData.carrier!, driverName: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Dock Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.warehouseReceiving.dockAssignment', 'Dock Assignment')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.dockNumberEGDock', 'Dock Number (e.g., DOCK-1)')}
                  value={formData.dock?.number || ''}
                  onChange={(e) => setFormData({ ...formData, dock: { ...formData.dock!, number: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.warehouseReceiving.zoneEGZoneA', 'Zone (e.g., Zone A - Receiving)')}
                  value={formData.dock?.zone || ''}
                  onChange={(e) => setFormData({ ...formData, dock: { ...formData.dock!, zone: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.scheduledDate', 'Scheduled Date')}</label>
              <input
                type="date"
                value={formData.scheduledDate || ''}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.scheduledTime', 'Scheduled Time')}</label>
              <input
                type="time"
                value={formData.scheduledTime || ''}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.expectedUnits', 'Expected Units')}</label>
              <input
                type="number"
                value={formData.totalExpected || ''}
                onChange={(e) => setFormData({ ...formData, totalExpected: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.receivedUnits', 'Received Units')}</label>
              <input
                type="number"
                value={formData.totalReceived || ''}
                onChange={(e) => setFormData({ ...formData, totalReceived: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.damagedUnits', 'Damaged Units')}</label>
              <input
                type="number"
                value={formData.totalDamaged || ''}
                onChange={(e) => setFormData({ ...formData, totalDamaged: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.warehouseReceiving.notes', 'Notes')}</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              placeholder={t('tools.warehouseReceiving.anyAdditionalNotes', 'Any additional notes...')}
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            {t('tools.warehouseReceiving.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {record ? t('tools.warehouseReceiving.updateRecord', 'Update Record') : t('tools.warehouseReceiving.createRecord', 'Create Record')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Receiving Details Modal
const ReceivingDetailsModal: React.FC<{
  record: ReceivingRecord;
  onClose: () => void;
}> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{record.receivingNumber}</h2>
            <p className="text-sm text-gray-500">{t('tools.warehouseReceiving.receivingRecordDetails', 'Receiving Record Details')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              {t('tools.warehouseReceiving.export', 'Export')}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">{t('tools.warehouseReceiving.status2', 'Status')}</p>
              <p
                className={`font-semibold ${
                  record.status === 'completed'
                    ? 'text-green-600'
                    : record.status === 'in-progress'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`}
              >
                {record.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">{t('tools.warehouseReceiving.poNumber2', 'PO Number')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{record.poNumber}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">{t('tools.warehouseReceiving.bolNumber2', 'BOL Number')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{record.bolNumber || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">{t('tools.warehouseReceiving.dock2', 'Dock')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{record.dock.number}</p>
            </div>
          </div>

          {/* Vendor and Carrier */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.warehouseReceiving.vendor2', 'Vendor')}</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{record.vendor.name}</p>
                <p className="text-gray-600 dark:text-gray-400">ID: {record.vendor.id}</p>
                <p className="text-gray-600 dark:text-gray-400">Contact: {record.vendor.contact}</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: {record.vendor.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.warehouseReceiving.carrier2', 'Carrier')}</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{record.carrier.name}</p>
                <p className="text-gray-600 dark:text-gray-400">Tractor: {record.carrier.tractorNumber || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">Trailer: {record.carrier.trailerNumber || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">Seal: {record.carrier.sealNumber || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">Driver: {record.carrier.driverName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.warehouseReceiving.timeline', 'Timeline')}</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-sm">
                <p className="text-gray-500">{t('tools.warehouseReceiving.scheduled4', 'Scheduled')}</p>
                <p className="font-medium">
                  {new Date(record.scheduledDate).toLocaleDateString()} {record.scheduledTime}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">{t('tools.warehouseReceiving.arrival', 'Arrival')}</p>
                <p className="font-medium">{record.arrivalTime || 'Pending'}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">{t('tools.warehouseReceiving.start', 'Start')}</p>
                <p className="font-medium">{record.startTime || 'Pending'}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">{t('tools.warehouseReceiving.completion', 'Completion')}</p>
                <p className="font-medium">{record.completionTime || 'Pending'}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          {record.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.warehouseReceiving.itemsReceived', 'Items Received')}</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left">{t('tools.warehouseReceiving.sku', 'SKU')}</th>
                      <th className="px-4 py-2 text-left">{t('tools.warehouseReceiving.description', 'Description')}</th>
                      <th className="px-4 py-2 text-center">{t('tools.warehouseReceiving.expected', 'Expected')}</th>
                      <th className="px-4 py-2 text-center">{t('tools.warehouseReceiving.received', 'Received')}</th>
                      <th className="px-4 py-2 text-center">{t('tools.warehouseReceiving.damaged2', 'Damaged')}</th>
                      <th className="px-4 py-2 text-center">{t('tools.warehouseReceiving.condition', 'Condition')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.items.map((item) => (
                      <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2 font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-center">{item.expectedQuantity}</td>
                        <td className="px-4 py-2 text-center">{item.receivedQuantity}</td>
                        <td className="px-4 py-2 text-center text-red-600">{item.damagedQuantity}</td>
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.condition === 'good'
                                ? 'bg-green-100 text-green-800'
                                : item.condition === 'damaged'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 font-semibold">
                        {t('tools.warehouseReceiving.total2', 'Total')}
                      </td>
                      <td className="px-4 py-2 text-center font-semibold">{record.totalExpected}</td>
                      <td className="px-4 py-2 text-center font-semibold">{record.totalReceived}</td>
                      <td className="px-4 py-2 text-center font-semibold text-red-600">{record.totalDamaged}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Quality Checks */}
          {record.qualityChecks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.warehouseReceiving.qualityChecks', 'Quality Checks')}</h3>
              <div className="space-y-2">
                {record.qualityChecks.map((check) => (
                  <div
                    key={check.id}
                    className={`p-3 rounded-lg flex items-start gap-3 ${
                      check.passed
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {check.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{check.checkType}</p>
                      {check.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{check.notes}</p>}
                      <p className="text-xs text-gray-500 mt-1">{new Date(check.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions */}
          {record.exceptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.warehouseReceiving.exceptions2', 'Exceptions')}</h3>
              <div className="space-y-2">
                {record.exceptions.map((exception, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      exception.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : exception.severity === 'medium'
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 ${
                            exception.severity === 'high'
                              ? 'text-red-600'
                              : exception.severity === 'medium'
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{exception.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{exception.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(exception.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          exception.resolved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {exception.resolved ? t('tools.warehouseReceiving.resolved', 'Resolved') : t('tools.warehouseReceiving.open', 'Open')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.warehouseReceiving.notes2', 'Notes')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                {record.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseReceivingTool;
