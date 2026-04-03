import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Truck,
  Package,
  MapPin,
  Calendar,
  Download,
  Printer,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Phone,
  Mail,
  Hash,
  Weight,
  Box,
  DollarSign,
  FileCheck,
  Send,
  Eye,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  BarChart3,
  TrendingUp,
  Boxes,
  Scale,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Loader2 } from 'lucide-react';

interface BOLItem {
  id: string;
  description: string;
  quantity: number;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  class: string;
  nmfcNumber: string;
  hazmat: boolean;
  hazmatClass?: string;
  packagingType: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
}

interface BillOfLading {
  id: string;
  bolNumber: string;
  proNumber: string;
  status: 'draft' | 'issued' | 'in-transit' | 'delivered' | 'cancelled';
  type: 'straight' | 'order' | 'negotiable';
  date: string;
  shipper: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    contact: string;
    phone: string;
    email: string;
  };
  consignee: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    contact: string;
    phone: string;
    email: string;
  };
  carrier: {
    name: string;
    scac: string;
    mcNumber: string;
    driverName: string;
    driverPhone: string;
    tractorNumber: string;
    trailerNumber: string;
  };
  items: BOLItem[];
  totalWeight: number;
  totalPieces: number;
  freightCharges: number;
  freightTerms: 'prepaid' | 'collect' | 'third-party';
  specialInstructions: string;
  pickupDate: string;
  deliveryDate?: string;
  signedByShipper: boolean;
  signedByCarrier: boolean;
  signedByConsignee: boolean;
  createdAt: string;
  updatedAt: string;
}

const ShipmentBOLTool: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'bols' | 'create' | 'templates' | 'reports'>('bols');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBOL, setEditingBOL] = useState<BillOfLading | null>(null);
  const [selectedBOL, setSelectedBOL] = useState<BillOfLading | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const columns: ColumnConfig[] = [
    { key: 'bolNumber', header: 'BOL Number', selected: true },
    { key: 'proNumber', header: 'PRO Number', selected: true },
    { key: 'status', header: 'Status', selected: true },
    { key: 'type', header: 'Type', selected: true },
    { key: 'date', header: 'Date', selected: true },
    { key: 'shipperName', header: 'Shipper', selected: true },
    { key: 'consigneeName', header: 'Consignee', selected: true },
    { key: 'carrierName', header: 'Carrier', selected: true },
    { key: 'totalWeight', header: 'Total Weight', selected: true },
    { key: 'totalPieces', header: 'Total Pieces', selected: true },
    { key: 'freightCharges', header: 'Freight Charges', selected: false },
    { key: 'freightTerms', header: 'Freight Terms', selected: false },
    { key: 'pickupDate', header: 'Pickup Date', selected: true },
    { key: 'deliveryDate', header: 'Delivery Date', selected: false },
  ];

  const generateSampleData = (): BillOfLading[] => [
    {
      id: '1',
      bolNumber: 'BOL-2024-001234',
      proNumber: 'PRO-789456',
      status: 'in-transit',
      type: 'straight',
      date: '2024-01-15',
      shipper: {
        name: 'ABC Manufacturing Co.',
        address: '123 Industrial Blvd',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        contact: 'John Smith',
        phone: '312-555-0100',
        email: 'jsmith@abcmfg.com',
      },
      consignee: {
        name: 'XYZ Distribution Center',
        address: '456 Warehouse Way',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        contact: 'Sarah Johnson',
        phone: '214-555-0200',
        email: 'sjohnson@xyzdist.com',
      },
      carrier: {
        name: 'Swift Transport LLC',
        scac: 'SWFT',
        mcNumber: 'MC-123456',
        driverName: 'Mike Wilson',
        driverPhone: '555-123-4567',
        tractorNumber: 'TRK-1001',
        trailerNumber: 'TRL-5001',
      },
      items: [
        {
          id: '1',
          description: 'Electronic Components - Class A',
          quantity: 24,
          weight: 1200,
          weightUnit: 'lbs',
          class: '85',
          nmfcNumber: '116030',
          hazmat: false,
          packagingType: 'Pallets',
          dimensions: { length: 48, width: 40, height: 48, unit: 'in' },
        },
        {
          id: '2',
          description: 'Precision Instruments',
          quantity: 12,
          weight: 600,
          weightUnit: 'lbs',
          class: '100',
          nmfcNumber: '116035',
          hazmat: false,
          packagingType: 'Crates',
          dimensions: { length: 36, width: 24, height: 24, unit: 'in' },
        },
      ],
      totalWeight: 1800,
      totalPieces: 36,
      freightCharges: 2450.0,
      freightTerms: 'prepaid',
      specialInstructions: 'Handle with care. Temperature sensitive items.',
      pickupDate: '2024-01-15',
      deliveryDate: undefined,
      signedByShipper: true,
      signedByCarrier: true,
      signedByConsignee: false,
      createdAt: '2024-01-14T10:30:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
    },
    {
      id: '2',
      bolNumber: 'BOL-2024-001235',
      proNumber: 'PRO-789457',
      status: 'delivered',
      type: 'straight',
      date: '2024-01-10',
      shipper: {
        name: 'Global Parts Inc.',
        address: '789 Commerce Dr',
        city: 'Detroit',
        state: 'MI',
        zip: '48201',
        contact: 'Robert Chen',
        phone: '313-555-0300',
        email: 'rchen@globalparts.com',
      },
      consignee: {
        name: 'Metro Auto Assembly',
        address: '321 Factory Lane',
        city: 'Louisville',
        state: 'KY',
        zip: '40201',
        contact: 'Lisa Brown',
        phone: '502-555-0400',
        email: 'lbrown@metroauto.com',
      },
      carrier: {
        name: 'Reliable Freight Co.',
        scac: 'RELF',
        mcNumber: 'MC-234567',
        driverName: 'Tom Anderson',
        driverPhone: '555-234-5678',
        tractorNumber: 'TRK-2002',
        trailerNumber: 'TRL-6002',
      },
      items: [
        {
          id: '1',
          description: 'Auto Parts - Engine Components',
          quantity: 48,
          weight: 4800,
          weightUnit: 'lbs',
          class: '70',
          nmfcNumber: '120110',
          hazmat: false,
          packagingType: 'Pallets',
        },
      ],
      totalWeight: 4800,
      totalPieces: 48,
      freightCharges: 3200.0,
      freightTerms: 'collect',
      specialInstructions: 'Deliver to receiving dock B.',
      pickupDate: '2024-01-10',
      deliveryDate: '2024-01-12',
      signedByShipper: true,
      signedByCarrier: true,
      signedByConsignee: true,
      createdAt: '2024-01-09T14:00:00Z',
      updatedAt: '2024-01-12T16:30:00Z',
    },
    {
      id: '3',
      bolNumber: 'BOL-2024-001236',
      proNumber: 'PRO-789458',
      status: 'draft',
      type: 'order',
      date: '2024-01-16',
      shipper: {
        name: 'Chemical Solutions Ltd.',
        address: '555 Industrial Park',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        contact: 'David Martinez',
        phone: '713-555-0500',
        email: 'dmartinez@chemsol.com',
      },
      consignee: {
        name: 'Plastics Manufacturing Co.',
        address: '888 Production Blvd',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
        contact: 'Karen White',
        phone: '404-555-0600',
        email: 'kwhite@plasticsmfg.com',
      },
      carrier: {
        name: 'HazMat Express',
        scac: 'HAZX',
        mcNumber: 'MC-345678',
        driverName: '',
        driverPhone: '',
        tractorNumber: '',
        trailerNumber: '',
      },
      items: [
        {
          id: '1',
          description: 'Industrial Solvents',
          quantity: 20,
          weight: 3000,
          weightUnit: 'lbs',
          class: '55',
          nmfcNumber: '46780',
          hazmat: true,
          hazmatClass: 'Class 3 - Flammable Liquids',
          packagingType: 'Drums',
        },
      ],
      totalWeight: 3000,
      totalPieces: 20,
      freightCharges: 4500.0,
      freightTerms: 'prepaid',
      specialInstructions: 'HAZMAT shipment. Driver must have HAZMAT endorsement.',
      pickupDate: '2024-01-18',
      deliveryDate: undefined,
      signedByShipper: false,
      signedByCarrier: false,
      signedByConsignee: false,
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
    },
  ];

  const {
    data: bols,
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
  } = useToolData<BillOfLading>('shipment-bol', [], columns);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const filteredBOLs = bols.filter((bol) => {
    const matchesSearch =
      bol.bolNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bol.proNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bol.shipper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bol.consignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bol.carrier.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || bol.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalBOLs: bols.length,
    inTransit: bols.filter((b) => b.status === 'in-transit').length,
    delivered: bols.filter((b) => b.status === 'delivered').length,
    drafts: bols.filter((b) => b.status === 'draft').length,
    totalWeight: bols.reduce((sum, b) => sum + b.totalWeight, 0),
    totalRevenue: bols
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.freightCharges, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'issued':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-transit':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'issued':
        return <Send className="w-4 h-4" />;
      case 'in-transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleSaveBOL = async (bolData: Partial<BillOfLading>) => {
    const now = new Date().toISOString();
    const bol: BillOfLading = {
      id: editingBOL?.id || crypto.randomUUID(),
      bolNumber: bolData.bolNumber || `BOL-${new Date().getFullYear()}-${String(bols.length + 1).padStart(6, '0')}`,
      proNumber: bolData.proNumber || `PRO-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      status: bolData.status || 'draft',
      type: bolData.type || 'straight',
      date: bolData.date || now.split('T')[0],
      shipper: bolData.shipper || {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        contact: '',
        phone: '',
        email: '',
      },
      consignee: bolData.consignee || {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        contact: '',
        phone: '',
        email: '',
      },
      carrier: bolData.carrier || {
        name: '',
        scac: '',
        mcNumber: '',
        driverName: '',
        driverPhone: '',
        tractorNumber: '',
        trailerNumber: '',
      },
      items: bolData.items || [],
      totalWeight: bolData.totalWeight || 0,
      totalPieces: bolData.totalPieces || 0,
      freightCharges: bolData.freightCharges || 0,
      freightTerms: bolData.freightTerms || 'prepaid',
      specialInstructions: bolData.specialInstructions || '',
      pickupDate: bolData.pickupDate || now.split('T')[0],
      deliveryDate: bolData.deliveryDate,
      signedByShipper: bolData.signedByShipper || false,
      signedByCarrier: bolData.signedByCarrier || false,
      signedByConsignee: bolData.signedByConsignee || false,
      createdAt: editingBOL?.createdAt || now,
      updatedAt: now,
    };

    await saveItem(bol);
    setShowModal(false);
    setEditingBOL(null);
  };

  const handleDeleteBOL = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Bill of Lading',
      message: 'Are you sure you want to delete this Bill of Lading?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const handleDuplicateBOL = (bol: BillOfLading) => {
    const newBOL: Partial<BillOfLading> = {
      ...bol,
      id: undefined,
      bolNumber: `BOL-${new Date().getFullYear()}-${String(bols.length + 1).padStart(6, '0')}`,
      proNumber: `PRO-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      status: 'draft',
      signedByShipper: false,
      signedByCarrier: false,
      signedByConsignee: false,
    };
    setEditingBOL(null);
    handleSaveBOL(newBOL);
  };

  const exportData = filteredBOLs.map((bol) => ({
    bolNumber: bol.bolNumber,
    proNumber: bol.proNumber,
    status: bol.status,
    type: bol.type,
    date: bol.date,
    shipperName: bol.shipper.name,
    consigneeName: bol.consignee.name,
    carrierName: bol.carrier.name,
    totalWeight: bol.totalWeight,
    totalPieces: bol.totalPieces,
    freightCharges: bol.freightCharges,
    freightTerms: bol.freightTerms,
    pickupDate: bol.pickupDate,
    deliveryDate: bol.deliveryDate || '',
  }));

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tools.shipmentBOL.billOfLading', 'Bill of Lading')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.shipmentBOL.generateAndManageShippingDocuments', 'Generate and manage shipping documents')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="shipment-b-o-l" toolName="Shipment B O L" />

            <SyncStatus status={syncStatus} lastSynced={lastSynced} />
            <ExportDropdown data={exportData} filename="bills-of-lading" columns={columns} />
            <button
              onClick={() => {
                setEditingBOL(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.shipmentBOL.newBol', 'New BOL')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mb-4">
          {[
            { id: 'bols', label: 'All BOLs', icon: FileText },
            { id: 'create', label: 'Quick Create', icon: Plus },
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{t('tools.shipmentBOL.totalBols', 'Total BOLs')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalBOLs}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Truck className="w-4 h-4" />
            <span className="text-sm">{t('tools.shipmentBOL.inTransit', 'In Transit')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inTransit}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{t('tools.shipmentBOL.delivered', 'Delivered')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.delivered}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t('tools.shipmentBOL.drafts', 'Drafts')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.drafts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Scale className="w-4 h-4" />
            <span className="text-sm">{t('tools.shipmentBOL.totalWeight', 'Total Weight')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.totalWeight.toLocaleString()} lbs
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-indigo-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{t('tools.shipmentBOL.totalRevenue', 'Total Revenue')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ${stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.shipmentBOL.searchByBolProShipper', 'Search by BOL#, PRO#, shipper, consignee, carrier...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{t('tools.shipmentBOL.allStatus', 'All Status')}</option>
              <option value="draft">{t('tools.shipmentBOL.draft', 'Draft')}</option>
              <option value="issued">{t('tools.shipmentBOL.issued', 'Issued')}</option>
              <option value="in-transit">{t('tools.shipmentBOL.inTransit2', 'In Transit')}</option>
              <option value="delivered">{t('tools.shipmentBOL.delivered2', 'Delivered')}</option>
              <option value="cancelled">{t('tools.shipmentBOL.cancelled', 'Cancelled')}</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('tools.shipmentBOL.filters', 'Filters')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {activeTab === 'bols' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">{t('tools.shipmentBOL.loading', 'Loading...')}</div>
            ) : filteredBOLs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.shipmentBOL.noBillsOfLadingFound', 'No bills of lading found')}</p>
                <button
                  onClick={() => {
                    setEditingBOL(null);
                    setShowModal(true);
                  }}
                  className="mt-3 text-indigo-600 hover:text-indigo-700"
                >
                  {t('tools.shipmentBOL.createYourFirstBol', 'Create your first BOL')}
                </button>
              </div>
            ) : (
              filteredBOLs.map((bol) => (
                <div
                  key={bol.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{bol.bolNumber}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              bol.status
                            )}`}
                          >
                            {getStatusIcon(bol.status)}
                            {bol.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PRO: {bol.proNumber} | {bol.type.charAt(0).toUpperCase() + bol.type.slice(1)} BOL
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedBOL(bol);
                          setShowPreview(true);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                        title={t('tools.shipmentBOL.preview', 'Preview')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateBOL(bol)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title={t('tools.shipmentBOL.duplicate', 'Duplicate')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBOL(bol);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        title={t('tools.shipmentBOL.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBOL(bol.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Shipment Flow */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.shipmentBOL.shipper', 'Shipper')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{bol.shipper.name}</p>
                        <p className="text-xs text-gray-500">
                          {bol.shipper.city}, {bol.shipper.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.shipmentBOL.carrier', 'Carrier')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{bol.carrier.name}</p>
                        <p className="text-xs text-gray-500">SCAC: {bol.carrier.scac}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.shipmentBOL.consignee', 'Consignee')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{bol.consignee.name}</p>
                        <p className="text-xs text-gray-500">
                          {bol.consignee.city}, {bol.consignee.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{bol.totalPieces} pieces</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Weight className="w-4 h-4" />
                      <span>{bol.totalWeight.toLocaleString()} lbs</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      <span>${bol.freightCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Pickup: {new Date(bol.pickupDate).toLocaleDateString()}</span>
                    </div>
                    {bol.deliveryDate && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Delivered: {new Date(bol.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {bol.items.some((item) => item.hazmat) && (
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{t('tools.shipmentBOL.hazmat', 'HAZMAT')}</span>
                      </div>
                    )}
                  </div>

                  {/* Signature Status */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500">{t('tools.shipmentBOL.signatures', 'Signatures:')}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs ${
                          bol.signedByShipper ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {bol.signedByShipper ? <CheckCircle className="w-3 h-3 inline mr-1" /> : null}
                        Shipper
                      </span>
                      <span
                        className={`text-xs ${
                          bol.signedByCarrier ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {bol.signedByCarrier ? <CheckCircle className="w-3 h-3 inline mr-1" /> : null}
                        Carrier
                      </span>
                      <span
                        className={`text-xs ${
                          bol.signedByConsignee ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {bol.signedByConsignee ? <CheckCircle className="w-3 h-3 inline mr-1" /> : null}
                        Consignee
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.shipmentBOL.quickCreateBol', 'Quick Create BOL')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('tools.shipmentBOL.useTheNewBolButton', 'Use the "New BOL" button or click below to create a new Bill of Lading with the full form.')}
            </p>
            <button
              onClick={() => {
                setEditingBOL(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('tools.shipmentBOL.createNewBillOfLading', 'Create New Bill of Lading')}
            </button>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.shipmentBOL.bolTemplates', 'BOL Templates')}</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('tools.shipmentBOL.saveFrequentlyUsedShipperConsignee', 'Save frequently used shipper/consignee combinations as templates for faster BOL creation.')}
            </p>
            <div className="mt-6 text-center py-8">
              <Copy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">{t('tools.shipmentBOL.noTemplatesSavedYet', 'No templates saved yet')}</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.shipmentBOL.bolSummary', 'BOL Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.shipmentBOL.totalBolsCreated', 'Total BOLs Created')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.totalBOLs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.shipmentBOL.delivered3', 'Delivered')}</span>
                  <span className="font-semibold text-green-600">{stats.delivered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.shipmentBOL.inTransit3', 'In Transit')}</span>
                  <span className="font-semibold text-yellow-600">{stats.inTransit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.shipmentBOL.pendingDraft', 'Pending/Draft')}</span>
                  <span className="font-semibold text-gray-600">{stats.drafts}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.shipmentBOL.freightSummary', 'Freight Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.shipmentBOL.totalWeightShipped', 'Total Weight Shipped')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.totalWeight.toLocaleString()} lbs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.shipmentBOL.totalRevenue2', 'Total Revenue')}</span>
                  <span className="font-semibold text-green-600">${stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.shipmentBOL.averagePerBol', 'Average per BOL')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${stats.totalBOLs > 0 ? Math.round(stats.totalRevenue / stats.totalBOLs).toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit BOL */}
      {showModal && (
        <BOLFormModal
          bol={editingBOL}
          onSave={handleSaveBOL}
          onClose={() => {
            setShowModal(false);
            setEditingBOL(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && selectedBOL && (
        <BOLPreviewModal
          bol={selectedBOL}
          onClose={() => {
            setShowPreview(false);
            setSelectedBOL(null);
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

// BOL Form Modal Component
const BOLFormModal: React.FC<{
  bol: BillOfLading | null;
  onSave: (data: Partial<BillOfLading>) => void;
  onClose: () => void;
}> = ({ bol, onSave, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<BillOfLading>>(
    bol || {
      type: 'straight',
      freightTerms: 'prepaid',
      shipper: { name: '', address: '', city: '', state: '', zip: '', contact: '', phone: '', email: '' },
      consignee: { name: '', address: '', city: '', state: '', zip: '', contact: '', phone: '', email: '' },
      carrier: { name: '', scac: '', mcNumber: '', driverName: '', driverPhone: '', tractorNumber: '', trailerNumber: '' },
      items: [],
      specialInstructions: '',
    }
  );

  const steps = ['Basic Info', 'Shipper', 'Consignee', 'Carrier', 'Items', 'Review'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {bol ? t('tools.shipmentBOL.editBillOfLading', 'Edit Bill of Lading') : t('tools.shipmentBOL.createBillOfLading', 'Create Bill of Lading')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-900">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <button
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  activeStep === index
                    ? 'bg-indigo-600 text-white'
                    : activeStep > index
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </button>
              {index < steps.length - 1 && <ChevronDown className="w-4 h-4 rotate-[-90deg] text-gray-400" />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          {/* Step content would go here - simplified for brevity */}
          <div className="space-y-4">
            {activeStep === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.bolType', 'BOL Type')}</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="straight">{t('tools.shipmentBOL.straightBol', 'Straight BOL')}</option>
                      <option value="order">{t('tools.shipmentBOL.orderBol', 'Order BOL')}</option>
                      <option value="negotiable">{t('tools.shipmentBOL.negotiableBol', 'Negotiable BOL')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.shipmentBOL.freightTerms', 'Freight Terms')}
                    </label>
                    <select
                      value={formData.freightTerms}
                      onChange={(e) => setFormData({ ...formData, freightTerms: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="prepaid">{t('tools.shipmentBOL.prepaid', 'Prepaid')}</option>
                      <option value="collect">{t('tools.shipmentBOL.collect', 'Collect')}</option>
                      <option value="third-party">{t('tools.shipmentBOL.thirdParty', 'Third Party')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.pickupDate', 'Pickup Date')}</label>
                    <input
                      type="date"
                      value={formData.pickupDate || ''}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.shipmentBOL.freightCharges2', 'Freight Charges ($)')}
                    </label>
                    <input
                      type="number"
                      value={formData.freightCharges || ''}
                      onChange={(e) => setFormData({ ...formData, freightCharges: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              </>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{t('tools.shipmentBOL.shipperInformation', 'Shipper Information')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.companyName', 'Company Name')}</label>
                    <input
                      type="text"
                      value={formData.shipper?.name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, shipper: { ...formData.shipper!, name: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.address', 'Address')}</label>
                    <input
                      type="text"
                      value={formData.shipper?.address || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, shipper: { ...formData.shipper!, address: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.city', 'City')}</label>
                    <input
                      type="text"
                      value={formData.shipper?.city || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, shipper: { ...formData.shipper!, city: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.state', 'State')}</label>
                      <input
                        type="text"
                        value={formData.shipper?.state || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, shipper: { ...formData.shipper!, state: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.zip', 'ZIP')}</label>
                      <input
                        type="text"
                        value={formData.shipper?.zip || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, shipper: { ...formData.shipper!, zip: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.contact', 'Contact')}</label>
                    <input
                      type="text"
                      value={formData.shipper?.contact || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, shipper: { ...formData.shipper!, contact: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.shipper?.phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, shipper: { ...formData.shipper!, phone: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{t('tools.shipmentBOL.consigneeInformation', 'Consignee Information')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.companyName2', 'Company Name')}</label>
                    <input
                      type="text"
                      value={formData.consignee?.name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, consignee: { ...formData.consignee!, name: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.address2', 'Address')}</label>
                    <input
                      type="text"
                      value={formData.consignee?.address || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, consignee: { ...formData.consignee!, address: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.city2', 'City')}</label>
                    <input
                      type="text"
                      value={formData.consignee?.city || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, consignee: { ...formData.consignee!, city: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.state2', 'State')}</label>
                      <input
                        type="text"
                        value={formData.consignee?.state || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, consignee: { ...formData.consignee!, state: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.zip2', 'ZIP')}</label>
                      <input
                        type="text"
                        value={formData.consignee?.zip || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, consignee: { ...formData.consignee!, zip: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.contact2', 'Contact')}</label>
                    <input
                      type="text"
                      value={formData.consignee?.contact || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, consignee: { ...formData.consignee!, contact: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.phone2', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.consignee?.phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, consignee: { ...formData.consignee!, phone: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{t('tools.shipmentBOL.carrierInformation', 'Carrier Information')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.carrierName', 'Carrier Name')}</label>
                    <input
                      type="text"
                      value={formData.carrier?.name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, carrier: { ...formData.carrier!, name: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.scacCode', 'SCAC Code')}</label>
                    <input
                      type="text"
                      value={formData.carrier?.scac || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, carrier: { ...formData.carrier!, scac: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.mcNumber', 'MC Number')}</label>
                    <input
                      type="text"
                      value={formData.carrier?.mcNumber || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, carrier: { ...formData.carrier!, mcNumber: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.driverName', 'Driver Name')}</label>
                    <input
                      type="text"
                      value={formData.carrier?.driverName || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, carrier: { ...formData.carrier!, driverName: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.driverPhone', 'Driver Phone')}</label>
                    <input
                      type="tel"
                      value={formData.carrier?.driverPhone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, carrier: { ...formData.carrier!, driverPhone: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.tractor', 'Tractor #')}</label>
                    <input
                      type="text"
                      value={formData.carrier?.tractorNumber || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, carrier: { ...formData.carrier!, tractorNumber: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.shipmentBOL.trailer', 'Trailer #')}</label>
                    <input
                      type="text"
                      value={formData.carrier?.trailerNumber || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, carrier: { ...formData.carrier!, trailerNumber: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{t('tools.shipmentBOL.freightItems', 'Freight Items')}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: BOLItem = {
                        id: crypto.randomUUID(),
                        description: '',
                        quantity: 1,
                        weight: 0,
                        weightUnit: 'lbs',
                        class: '',
                        nmfcNumber: '',
                        hazmat: false,
                        packagingType: 'Pallets',
                      };
                      setFormData({ ...formData, items: [...(formData.items || []), newItem] });
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.shipmentBOL.addItem', 'Add Item')}
                  </button>
                </div>
                {(formData.items || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{t('tools.shipmentBOL.noItemsAddedYetClick', 'No items added yet. Click "Add Item" to begin.')}</p>
                ) : (
                  (formData.items || []).map((item, index) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-500">Item #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              items: (formData.items || []).filter((i) => i.id !== item.id),
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder={t('tools.shipmentBOL.description2', 'Description')}
                            value={item.description}
                            onChange={(e) => {
                              const updated = (formData.items || []).map((i) =>
                                i.id === item.id ? { ...i, description: e.target.value } : i
                              );
                              setFormData({ ...formData, items: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder={t('tools.shipmentBOL.qty2', 'Qty')}
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = (formData.items || []).map((i) =>
                                i.id === item.id ? { ...i, quantity: parseInt(e.target.value) || 0 } : i
                              );
                              setFormData({ ...formData, items: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder={t('tools.shipmentBOL.weight2', 'Weight')}
                            value={item.weight}
                            onChange={(e) => {
                              const updated = (formData.items || []).map((i) =>
                                i.id === item.id ? { ...i, weight: parseFloat(e.target.value) || 0 } : i
                              );
                              setFormData({ ...formData, items: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder={t('tools.shipmentBOL.class2', 'Class')}
                            value={item.class}
                            onChange={(e) => {
                              const updated = (formData.items || []).map((i) =>
                                i.id === item.id ? { ...i, class: e.target.value } : i
                              );
                              setFormData({ ...formData, items: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{t('tools.shipmentBOL.reviewSpecialInstructions', 'Review & Special Instructions')}</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.shipmentBOL.specialInstructions2', 'Special Instructions')}
                  </label>
                  <textarea
                    value={formData.specialInstructions || ''}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder={t('tools.shipmentBOL.enterAnySpecialHandlingInstructions', 'Enter any special handling instructions, delivery notes, etc.')}
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.shipmentBOL.summary', 'Summary')}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">{t('tools.shipmentBOL.shipper2', 'Shipper:')}</span> {formData.shipper?.name || 'Not set'}
                    </div>
                    <div>
                      <span className="text-gray-500">{t('tools.shipmentBOL.consignee2', 'Consignee:')}</span> {formData.consignee?.name || 'Not set'}
                    </div>
                    <div>
                      <span className="text-gray-500">{t('tools.shipmentBOL.carrier2', 'Carrier:')}</span> {formData.carrier?.name || 'Not set'}
                    </div>
                    <div>
                      <span className="text-gray-500">{t('tools.shipmentBOL.items', 'Items:')}</span> {(formData.items || []).length}
                    </div>
                    <div>
                      <span className="text-gray-500">{t('tools.shipmentBOL.totalWeight2', 'Total Weight:')}</span>{' '}
                      {(formData.items || []).reduce((sum, i) => sum + i.weight, 0).toLocaleString()} lbs
                    </div>
                    <div>
                      <span className="text-gray-500">{t('tools.shipmentBOL.freightCharges', 'Freight Charges:')}</span> ${(formData.freightCharges || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            {t('tools.shipmentBOL.previous', 'Previous')}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              {t('tools.shipmentBOL.cancel', 'Cancel')}
            </button>
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {t('tools.shipmentBOL.next', 'Next')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSave(formData)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {bol ? t('tools.shipmentBOL.updateBol', 'Update BOL') : t('tools.shipmentBOL.createBol', 'Create BOL')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// BOL Preview Modal
const BOLPreviewModal: React.FC<{
  bol: BillOfLading;
  onClose: () => void;
}> = ({ bol, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tools.shipmentBOL.billOfLadingPreview', 'Bill of Lading Preview')}</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Printer className="w-4 h-4" />
              {t('tools.shipmentBOL.print', 'Print')}
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              {t('tools.shipmentBOL.downloadPdf', 'Download PDF')}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* BOL Document Preview */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 max-w-3xl mx-auto">
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.shipmentBOL.billOfLading2', 'BILL OF LADING')}</h1>
              <p className="text-sm text-gray-600">
                {bol.type.toUpperCase()} - {bol.freightTerms.toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-300 p-3">
                <h3 className="font-bold text-sm text-gray-700 mb-2">{t('tools.shipmentBOL.bolNumber', 'BOL Number')}</h3>
                <p className="text-lg font-mono">{bol.bolNumber}</p>
              </div>
              <div className="border border-gray-300 p-3">
                <h3 className="font-bold text-sm text-gray-700 mb-2">{t('tools.shipmentBOL.proNumber', 'PRO Number')}</h3>
                <p className="text-lg font-mono">{bol.proNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-300 p-3">
                <h3 className="font-bold text-sm text-gray-700 mb-2">{t('tools.shipmentBOL.shipper3', 'SHIPPER')}</h3>
                <p className="font-semibold">{bol.shipper.name}</p>
                <p>{bol.shipper.address}</p>
                <p>
                  {bol.shipper.city}, {bol.shipper.state} {bol.shipper.zip}
                </p>
                <p className="mt-2 text-sm">Contact: {bol.shipper.contact}</p>
                <p className="text-sm">Phone: {bol.shipper.phone}</p>
              </div>
              <div className="border border-gray-300 p-3">
                <h3 className="font-bold text-sm text-gray-700 mb-2">{t('tools.shipmentBOL.consignee3', 'CONSIGNEE')}</h3>
                <p className="font-semibold">{bol.consignee.name}</p>
                <p>{bol.consignee.address}</p>
                <p>
                  {bol.consignee.city}, {bol.consignee.state} {bol.consignee.zip}
                </p>
                <p className="mt-2 text-sm">Contact: {bol.consignee.contact}</p>
                <p className="text-sm">Phone: {bol.consignee.phone}</p>
              </div>
            </div>

            <div className="border border-gray-300 p-3 mb-4">
              <h3 className="font-bold text-sm text-gray-700 mb-2">{t('tools.shipmentBOL.carrier3', 'CARRIER')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold">{bol.carrier.name}</p>
                  <p className="text-sm">SCAC: {bol.carrier.scac}</p>
                  <p className="text-sm">MC#: {bol.carrier.mcNumber}</p>
                </div>
                <div>
                  <p className="text-sm">Driver: {bol.carrier.driverName}</p>
                  <p className="text-sm">Phone: {bol.carrier.driverPhone}</p>
                </div>
                <div>
                  <p className="text-sm">Tractor: {bol.carrier.tractorNumber}</p>
                  <p className="text-sm">Trailer: {bol.carrier.trailerNumber}</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left border-b border-gray-300">{t('tools.shipmentBOL.description', 'Description')}</th>
                    <th className="p-2 text-center border-b border-gray-300">{t('tools.shipmentBOL.qty', 'Qty')}</th>
                    <th className="p-2 text-center border-b border-gray-300">{t('tools.shipmentBOL.weight', 'Weight')}</th>
                    <th className="p-2 text-center border-b border-gray-300">{t('tools.shipmentBOL.class', 'Class')}</th>
                    <th className="p-2 text-center border-b border-gray-300">{t('tools.shipmentBOL.nmfc', 'NMFC')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bol.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="p-2">
                        {item.description}
                        {item.hazmat && <span className="ml-2 text-red-600 font-bold">{t('tools.shipmentBOL.hazmat2', 'HAZMAT')}</span>}
                      </td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">
                        {item.weight} {item.weightUnit}
                      </td>
                      <td className="p-2 text-center">{item.class}</td>
                      <td className="p-2 text-center">{item.nmfcNumber}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="p-2 font-bold">{t('tools.shipmentBOL.total', 'TOTAL')}</td>
                    <td className="p-2 text-center font-bold">{bol.totalPieces}</td>
                    <td className="p-2 text-center font-bold">{bol.totalWeight} lbs</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {bol.specialInstructions && (
              <div className="border border-gray-300 p-3 mb-4">
                <h3 className="font-bold text-sm text-gray-700 mb-2">{t('tools.shipmentBOL.specialInstructions', 'SPECIAL INSTRUCTIONS')}</h3>
                <p className="text-sm">{bol.specialInstructions}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-300 p-3 text-center">
                <p className="text-xs text-gray-500 mb-8">{t('tools.shipmentBOL.shipperSignature', 'SHIPPER SIGNATURE')}</p>
                <div className="border-t border-gray-400 pt-2">
                  {bol.signedByShipper && <span className="text-green-600 text-sm">{t('tools.shipmentBOL.signed', 'Signed')}</span>}
                </div>
              </div>
              <div className="border border-gray-300 p-3 text-center">
                <p className="text-xs text-gray-500 mb-8">{t('tools.shipmentBOL.carrierSignature', 'CARRIER SIGNATURE')}</p>
                <div className="border-t border-gray-400 pt-2">
                  {bol.signedByCarrier && <span className="text-green-600 text-sm">{t('tools.shipmentBOL.signed2', 'Signed')}</span>}
                </div>
              </div>
              <div className="border border-gray-300 p-3 text-center">
                <p className="text-xs text-gray-500 mb-8">{t('tools.shipmentBOL.consigneeSignature', 'CONSIGNEE SIGNATURE')}</p>
                <div className="border-t border-gray-400 pt-2">
                  {bol.signedByConsignee && <span className="text-green-600 text-sm">{t('tools.shipmentBOL.signed3', 'Signed')}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentBOLTool;
