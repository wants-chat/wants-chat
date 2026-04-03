import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Truck,
  Package,
  MapPin,
  Calendar,
  Download,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Phone,
  FileText,
  Image,
  Signature,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Edit2,
  Trash2,
  X,
  Eye,
  BarChart3,
  Timer,
  Star,
  AlertCircle,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Loader2 } from 'lucide-react';

interface DeliveryPhoto {
  id: string;
  url: string;
  type: 'package' | 'location' | 'signature' | 'damage' | 'other';
  caption: string;
  timestamp: string;
}

interface ProofOfDelivery {
  id: string;
  podNumber: string;
  bolNumber: string;
  proNumber: string;
  status: 'pending' | 'delivered' | 'partial' | 'refused' | 'damaged' | 'exception';
  deliveryType: 'residential' | 'commercial' | 'dock' | 'curbside' | 'white-glove';
  consignee: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    contact: string;
    phone: string;
  };
  driver: {
    name: string;
    id: string;
    phone: string;
  };
  scheduledDate: string;
  scheduledTimeWindow: string;
  actualDeliveryDate?: string;
  actualDeliveryTime?: string;
  receivedBy: string;
  receiverTitle?: string;
  signatureUrl?: string;
  photos: DeliveryPhoto[];
  itemsDelivered: {
    id: string;
    description: string;
    quantity: number;
    quantityReceived: number;
    condition: 'good' | 'damaged' | 'missing';
    notes?: string;
  }[];
  totalItems: number;
  totalReceived: number;
  deliveryNotes: string;
  customerRating?: number;
  customerFeedback?: string;
  exceptions: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ProofOfDeliveryTool: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'deliveries' | 'pending' | 'exceptions' | 'reports'>('deliveries');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPOD, setEditingPOD] = useState<ProofOfDelivery | null>(null);
  const [selectedPOD, setSelectedPOD] = useState<ProofOfDelivery | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const columns: ColumnConfig[] = [
    { key: 'podNumber', header: 'POD Number', selected: true },
    { key: 'bolNumber', header: 'BOL Number', selected: true },
    { key: 'proNumber', header: 'PRO Number', selected: true },
    { key: 'status', header: 'Status', selected: true },
    { key: 'deliveryType', header: 'Delivery Type', selected: true },
    { key: 'consigneeName', header: 'Consignee', selected: true },
    { key: 'consigneeCity', header: 'City', selected: true },
    { key: 'driverName', header: 'Driver', selected: true },
    { key: 'scheduledDate', header: 'Scheduled Date', selected: true },
    { key: 'actualDeliveryDate', header: 'Actual Delivery', selected: true },
    { key: 'receivedBy', header: 'Received By', selected: true },
    { key: 'totalItems', header: 'Total Items', selected: false },
    { key: 'totalReceived', header: 'Total Received', selected: false },
    { key: 'customerRating', header: 'Rating', selected: false },
  ];

  const generateSampleData = (): ProofOfDelivery[] => [
    {
      id: '1',
      podNumber: 'POD-2024-001234',
      bolNumber: 'BOL-2024-001234',
      proNumber: 'PRO-789456',
      status: 'delivered',
      deliveryType: 'commercial',
      consignee: {
        name: 'XYZ Distribution Center',
        address: '456 Warehouse Way',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        contact: 'Sarah Johnson',
        phone: '214-555-0200',
      },
      driver: {
        name: 'Mike Wilson',
        id: 'DRV-1001',
        phone: '555-123-4567',
      },
      scheduledDate: '2024-01-15',
      scheduledTimeWindow: '08:00 AM - 12:00 PM',
      actualDeliveryDate: '2024-01-15',
      actualDeliveryTime: '10:45 AM',
      receivedBy: 'Sarah Johnson',
      receiverTitle: 'Receiving Manager',
      signatureUrl: '/signatures/pod-001234.png',
      photos: [
        {
          id: '1',
          url: '/photos/delivery-1.jpg',
          type: 'package',
          caption: 'All pallets unloaded at dock B',
          timestamp: '2024-01-15T10:42:00Z',
        },
        {
          id: '2',
          url: '/photos/delivery-2.jpg',
          type: 'location',
          caption: 'Delivery location - Dock B',
          timestamp: '2024-01-15T10:40:00Z',
        },
      ],
      itemsDelivered: [
        {
          id: '1',
          description: 'Electronic Components - Class A',
          quantity: 24,
          quantityReceived: 24,
          condition: 'good',
        },
        {
          id: '2',
          description: 'Precision Instruments',
          quantity: 12,
          quantityReceived: 12,
          condition: 'good',
        },
      ],
      totalItems: 36,
      totalReceived: 36,
      deliveryNotes: 'All items delivered in good condition. Customer satisfied.',
      customerRating: 5,
      customerFeedback: 'Great service! Driver was professional and on time.',
      exceptions: [],
      gpsCoordinates: {
        latitude: 32.7767,
        longitude: -96.797,
      },
      createdAt: '2024-01-15T10:45:00Z',
      updatedAt: '2024-01-15T10:50:00Z',
    },
    {
      id: '2',
      podNumber: 'POD-2024-001235',
      bolNumber: 'BOL-2024-001235',
      proNumber: 'PRO-789457',
      status: 'partial',
      deliveryType: 'dock',
      consignee: {
        name: 'Metro Auto Assembly',
        address: '321 Factory Lane',
        city: 'Louisville',
        state: 'KY',
        zip: '40201',
        contact: 'Lisa Brown',
        phone: '502-555-0400',
      },
      driver: {
        name: 'Tom Anderson',
        id: 'DRV-2002',
        phone: '555-234-5678',
      },
      scheduledDate: '2024-01-12',
      scheduledTimeWindow: '06:00 AM - 10:00 AM',
      actualDeliveryDate: '2024-01-12',
      actualDeliveryTime: '09:15 AM',
      receivedBy: 'Lisa Brown',
      receiverTitle: 'Dock Supervisor',
      signatureUrl: '/signatures/pod-001235.png',
      photos: [
        {
          id: '1',
          url: '/photos/delivery-3.jpg',
          type: 'damage',
          caption: 'Damaged pallet - 2 units affected',
          timestamp: '2024-01-12T09:10:00Z',
        },
      ],
      itemsDelivered: [
        {
          id: '1',
          description: 'Auto Parts - Engine Components',
          quantity: 48,
          quantityReceived: 46,
          condition: 'damaged',
          notes: '2 units with visible damage to packaging',
        },
      ],
      totalItems: 48,
      totalReceived: 46,
      deliveryNotes: '2 units damaged during transit. Claim filed.',
      customerRating: 3,
      customerFeedback: 'Some items were damaged. Otherwise delivery was on time.',
      exceptions: [
        {
          type: 'Damage',
          description: '2 units of engine components showed visible damage to outer packaging',
          timestamp: '2024-01-12T09:10:00Z',
        },
      ],
      gpsCoordinates: {
        latitude: 38.2527,
        longitude: -85.7585,
      },
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:30:00Z',
    },
    {
      id: '3',
      podNumber: 'POD-2024-001236',
      bolNumber: 'BOL-2024-001236',
      proNumber: 'PRO-789458',
      status: 'pending',
      deliveryType: 'residential',
      consignee: {
        name: 'John Smith',
        address: '123 Oak Street',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        contact: 'John Smith',
        phone: '512-555-0100',
      },
      driver: {
        name: 'Carlos Rodriguez',
        id: 'DRV-3003',
        phone: '555-345-6789',
      },
      scheduledDate: '2024-01-16',
      scheduledTimeWindow: '02:00 PM - 06:00 PM',
      receivedBy: '',
      photos: [],
      itemsDelivered: [
        {
          id: '1',
          description: 'Furniture - Living Room Set',
          quantity: 5,
          quantityReceived: 0,
          condition: 'good',
        },
      ],
      totalItems: 5,
      totalReceived: 0,
      deliveryNotes: '',
      exceptions: [],
      createdAt: '2024-01-15T14:00:00Z',
      updatedAt: '2024-01-15T14:00:00Z',
    },
    {
      id: '4',
      podNumber: 'POD-2024-001237',
      bolNumber: 'BOL-2024-001237',
      proNumber: 'PRO-789459',
      status: 'refused',
      deliveryType: 'commercial',
      consignee: {
        name: 'Tech Solutions Inc.',
        address: '999 Business Park',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85001',
        contact: 'Mark Davis',
        phone: '602-555-0500',
      },
      driver: {
        name: 'James Lee',
        id: 'DRV-4004',
        phone: '555-456-7890',
      },
      scheduledDate: '2024-01-14',
      scheduledTimeWindow: '10:00 AM - 02:00 PM',
      actualDeliveryDate: '2024-01-14',
      actualDeliveryTime: '11:30 AM',
      receivedBy: 'Mark Davis',
      receiverTitle: 'Facilities Manager',
      photos: [
        {
          id: '1',
          url: '/photos/refused-1.jpg',
          type: 'other',
          caption: 'Refused - Wrong items shipped',
          timestamp: '2024-01-14T11:30:00Z',
        },
      ],
      itemsDelivered: [
        {
          id: '1',
          description: 'Server Equipment',
          quantity: 10,
          quantityReceived: 0,
          condition: 'good',
          notes: 'Customer ordered different model',
        },
      ],
      totalItems: 10,
      totalReceived: 0,
      deliveryNotes: 'Customer refused delivery - wrong items shipped. Return to sender.',
      exceptions: [
        {
          type: 'Refusal',
          description: 'Customer refused entire shipment. Items shipped do not match order.',
          timestamp: '2024-01-14T11:30:00Z',
        },
      ],
      gpsCoordinates: {
        latitude: 33.4484,
        longitude: -112.074,
      },
      createdAt: '2024-01-14T11:30:00Z',
      updatedAt: '2024-01-14T12:00:00Z',
    },
  ];

  const {
    data: pods,
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
  } = useToolData<ProofOfDelivery>('proof-of-delivery', [], columns);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const filteredPODs = pods.filter((pod) => {
    const matchesSearch =
      pod.podNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.bolNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.proNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.consignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.driver.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || pod.status === statusFilter;

    const matchesTab =
      activeTab === 'deliveries' ||
      (activeTab === 'pending' && pod.status === 'pending') ||
      (activeTab === 'exceptions' && pod.exceptions.length > 0);

    return matchesSearch && matchesStatus && matchesTab;
  });

  const stats = {
    totalDeliveries: pods.length,
    completed: pods.filter((p) => p.status === 'delivered').length,
    pending: pods.filter((p) => p.status === 'pending').length,
    partial: pods.filter((p) => p.status === 'partial').length,
    refused: pods.filter((p) => p.status === 'refused').length,
    exceptions: pods.filter((p) => p.exceptions.length > 0).length,
    avgRating:
      pods.filter((p) => p.customerRating).length > 0
        ? (
            pods.filter((p) => p.customerRating).reduce((sum, p) => sum + (p.customerRating || 0), 0) /
            pods.filter((p) => p.customerRating).length
          ).toFixed(1)
        : 'N/A',
    onTimeDelivery:
      pods.filter((p) => p.status === 'delivered').length > 0
        ? Math.round(
            (pods.filter(
              (p) => p.status === 'delivered' && p.actualDeliveryDate === p.scheduledDate
            ).length /
              pods.filter((p) => p.status === 'delivered').length) *
              100
          )
        : 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'partial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'refused':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'damaged':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'exception':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4" />;
      case 'refused':
        return <XCircle className="w-4 h-4" />;
      case 'damaged':
        return <AlertCircle className="w-4 h-4" />;
      case 'exception':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const renderRating = (rating: number | undefined) => {
    if (!rating) return <span className="text-gray-400">{t('tools.proofOfDelivery.notRated', 'Not rated')}</span>;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSavePOD = async (podData: Partial<ProofOfDelivery>) => {
    const now = new Date().toISOString();
    const pod: ProofOfDelivery = {
      id: editingPOD?.id || crypto.randomUUID(),
      podNumber: podData.podNumber || `POD-${new Date().getFullYear()}-${String(pods.length + 1).padStart(6, '0')}`,
      bolNumber: podData.bolNumber || '',
      proNumber: podData.proNumber || '',
      status: podData.status || 'pending',
      deliveryType: podData.deliveryType || 'commercial',
      consignee: podData.consignee || {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        contact: '',
        phone: '',
      },
      driver: podData.driver || { name: '', id: '', phone: '' },
      scheduledDate: podData.scheduledDate || now.split('T')[0],
      scheduledTimeWindow: podData.scheduledTimeWindow || '',
      actualDeliveryDate: podData.actualDeliveryDate,
      actualDeliveryTime: podData.actualDeliveryTime,
      receivedBy: podData.receivedBy || '',
      receiverTitle: podData.receiverTitle,
      signatureUrl: podData.signatureUrl,
      photos: podData.photos || [],
      itemsDelivered: podData.itemsDelivered || [],
      totalItems: podData.totalItems || 0,
      totalReceived: podData.totalReceived || 0,
      deliveryNotes: podData.deliveryNotes || '',
      customerRating: podData.customerRating,
      customerFeedback: podData.customerFeedback,
      exceptions: podData.exceptions || [],
      gpsCoordinates: podData.gpsCoordinates,
      createdAt: editingPOD?.createdAt || now,
      updatedAt: now,
    };

    await saveItem(pod);
    setShowModal(false);
    setEditingPOD(null);
  };

  const handleDeletePOD = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Proof of Delivery',
      message: 'Are you sure you want to delete this proof of delivery?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const exportData = filteredPODs.map((pod) => ({
    podNumber: pod.podNumber,
    bolNumber: pod.bolNumber,
    proNumber: pod.proNumber,
    status: pod.status,
    deliveryType: pod.deliveryType,
    consigneeName: pod.consignee.name,
    consigneeCity: pod.consignee.city,
    driverName: pod.driver.name,
    scheduledDate: pod.scheduledDate,
    actualDeliveryDate: pod.actualDeliveryDate || '',
    receivedBy: pod.receivedBy,
    totalItems: pod.totalItems,
    totalReceived: pod.totalReceived,
    customerRating: pod.customerRating || '',
  }));

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tools.proofOfDelivery.proofOfDelivery', 'Proof of Delivery')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.proofOfDelivery.captureAndManageDeliveryConfirmations', 'Capture and manage delivery confirmations')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="proof-of-delivery" toolName="Proof Of Delivery" />

            <SyncStatus status={syncStatus} lastSynced={lastSynced} />
            <ExportDropdown data={exportData} filename="proof-of-delivery" columns={columns} />
            <button
              onClick={() => {
                setEditingPOD(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.proofOfDelivery.newPod', 'New POD')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mb-4">
          {[
            { id: 'deliveries', label: 'All Deliveries', icon: Package },
            { id: 'pending', label: 'Pending', icon: Clock },
            { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'pending' && stats.pending > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {stats.pending}
                </span>
              )}
              {tab.id === 'exceptions' && stats.exceptions > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                  {stats.exceptions}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.total', 'Total')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalDeliveries}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.completed', 'Completed')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.pending', 'Pending')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.partial', 'Partial')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.partial}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.refused', 'Refused')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.refused}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.exceptions', 'Exceptions')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.exceptions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Star className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.avgRating', 'Avg Rating')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.avgRating}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Timer className="w-4 h-4" />
            <span className="text-sm">{t('tools.proofOfDelivery.onTime', 'On-Time')}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.onTimeDelivery}%</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.proofOfDelivery.searchByPodBolPro', 'Search by POD#, BOL#, PRO#, consignee, driver...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{t('tools.proofOfDelivery.allStatus', 'All Status')}</option>
              <option value="pending">{t('tools.proofOfDelivery.pending2', 'Pending')}</option>
              <option value="delivered">{t('tools.proofOfDelivery.delivered', 'Delivered')}</option>
              <option value="partial">{t('tools.proofOfDelivery.partial2', 'Partial')}</option>
              <option value="refused">{t('tools.proofOfDelivery.refused2', 'Refused')}</option>
              <option value="damaged">{t('tools.proofOfDelivery.damaged', 'Damaged')}</option>
              <option value="exception">{t('tools.proofOfDelivery.exception', 'Exception')}</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('tools.proofOfDelivery.filters', 'Filters')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {activeTab !== 'reports' ? (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">{t('tools.proofOfDelivery.loading', 'Loading...')}</div>
            ) : filteredPODs.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.proofOfDelivery.noDeliveriesFound', 'No deliveries found')}</p>
                <button
                  onClick={() => {
                    setEditingPOD(null);
                    setShowModal(true);
                  }}
                  className="mt-3 text-green-600 hover:text-green-700"
                >
                  {t('tools.proofOfDelivery.createYourFirstPod', 'Create your first POD')}
                </button>
              </div>
            ) : (
              filteredPODs.map((pod) => (
                <div
                  key={pod.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          pod.status === 'delivered'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : pod.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                      >
                        {getStatusIcon(pod.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{pod.podNumber}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              pod.status
                            )}`}
                          >
                            {pod.status.charAt(0).toUpperCase() + pod.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          BOL: {pod.bolNumber} | PRO: {pod.proNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedPOD(pod);
                          setShowDetails(true);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        title={t('tools.proofOfDelivery.viewDetails', 'View Details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPOD(pod);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title={t('tools.proofOfDelivery.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePOD(pod.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.proofOfDelivery.consignee', 'Consignee')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{pod.consignee.name}</p>
                        <p className="text-xs text-gray-500">
                          {pod.consignee.city}, {pod.consignee.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.proofOfDelivery.driver', 'Driver')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{pod.driver.name}</p>
                        <p className="text-xs text-gray-500">{pod.driver.id}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.proofOfDelivery.scheduled', 'Scheduled')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(pod.scheduledDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">{pod.scheduledTimeWindow}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Footer */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>
                        {pod.totalReceived}/{pod.totalItems} items
                      </span>
                    </div>
                    {pod.actualDeliveryDate && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {new Date(pod.actualDeliveryDate).toLocaleDateString()} at {pod.actualDeliveryTime}
                        </span>
                      </div>
                    )}
                    {pod.receivedBy && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>Signed by: {pod.receivedBy}</span>
                      </div>
                    )}
                    {pod.signatureUrl && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <Signature className="w-4 h-4" />
                        <span>{t('tools.proofOfDelivery.signatureCaptured', 'Signature captured')}</span>
                      </div>
                    )}
                    {pod.photos.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-purple-600">
                        <Camera className="w-4 h-4" />
                        <span>{pod.photos.length} photo(s)</span>
                      </div>
                    )}
                    {pod.exceptions.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{pod.exceptions.length} exception(s)</span>
                      </div>
                    )}
                    <div className="ml-auto">{renderRating(pod.customerRating)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Reports Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.proofOfDelivery.deliveryPerformance', 'Delivery Performance')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.totalDeliveries', 'Total Deliveries')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.totalDeliveries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.successful', 'Successful')}</span>
                  <span className="font-semibold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.partialDeliveries', 'Partial Deliveries')}</span>
                  <span className="font-semibold text-orange-600">{stats.partial}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.refused3', 'Refused')}</span>
                  <span className="font-semibold text-red-600">{stats.refused}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.onTimeRate', 'On-Time Rate')}</span>
                  <span className="font-semibold text-blue-600">{stats.onTimeDelivery}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.proofOfDelivery.customerSatisfaction', 'Customer Satisfaction')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.averageRating', 'Average Rating')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.avgRating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">5 Star Ratings</span>
                  <span className="font-semibold text-green-600">
                    {pods.filter((p) => p.customerRating === 5).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.withFeedback', 'With Feedback')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {pods.filter((p) => p.customerFeedback).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('tools.proofOfDelivery.exceptionsReported', 'Exceptions Reported')}</span>
                  <span className="font-semibold text-red-600">{stats.exceptions}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.proofOfDelivery.recentCustomerFeedback', 'Recent Customer Feedback')}</h3>
              <div className="space-y-3">
                {pods
                  .filter((p) => p.customerFeedback)
                  .slice(0, 5)
                  .map((pod) => (
                    <div key={pod.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{pod.consignee.name}</span>
                          {renderRating(pod.customerRating)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pod.customerFeedback}</p>
                        <p className="text-xs text-gray-400 mt-1">{pod.podNumber}</p>
                      </div>
                    </div>
                  ))}
                {pods.filter((p) => p.customerFeedback).length === 0 && (
                  <p className="text-gray-500 text-center py-4">{t('tools.proofOfDelivery.noCustomerFeedbackYet', 'No customer feedback yet')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit POD */}
      {showModal && (
        <PODFormModal
          pod={editingPOD}
          onSave={handleSavePOD}
          onClose={() => {
            setShowModal(false);
            setEditingPOD(null);
          }}
        />
      )}

      {/* Details Modal */}
      {showDetails && selectedPOD && (
        <PODDetailsModal
          pod={selectedPOD}
          onClose={() => {
            setShowDetails(false);
            setSelectedPOD(null);
          }}
        />
      )}

      <ConfirmDialog />
    </div>
  );
};

// POD Form Modal Component
const PODFormModal: React.FC<{
  pod: ProofOfDelivery | null;
  onSave: (data: Partial<ProofOfDelivery>) => void;
  onClose: () => void;
}> = ({ pod, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<ProofOfDelivery>>(
    pod || {
      status: 'pending',
      deliveryType: 'commercial',
      consignee: { name: '', address: '', city: '', state: '', zip: '', contact: '', phone: '' },
      driver: { name: '', id: '', phone: '' },
      scheduledTimeWindow: '',
      itemsDelivered: [],
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
            {pod ? t('tools.proofOfDelivery.editProofOfDelivery', 'Edit Proof of Delivery') : t('tools.proofOfDelivery.createProofOfDelivery', 'Create Proof of Delivery')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.bolNumber', 'BOL Number')}</label>
              <input
                type="text"
                value={formData.bolNumber || ''}
                onChange={(e) => setFormData({ ...formData, bolNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder={t('tools.proofOfDelivery.bol2024Xxxxxx', 'BOL-2024-XXXXXX')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.proNumber', 'PRO Number')}</label>
              <input
                type="text"
                value={formData.proNumber || ''}
                onChange={(e) => setFormData({ ...formData, proNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder={t('tools.proofOfDelivery.proXxxxxx', 'PRO-XXXXXX')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.status', 'Status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="pending">{t('tools.proofOfDelivery.pending3', 'Pending')}</option>
                <option value="delivered">{t('tools.proofOfDelivery.delivered2', 'Delivered')}</option>
                <option value="partial">{t('tools.proofOfDelivery.partial3', 'Partial')}</option>
                <option value="refused">{t('tools.proofOfDelivery.refused4', 'Refused')}</option>
                <option value="damaged">{t('tools.proofOfDelivery.damaged2', 'Damaged')}</option>
                <option value="exception">{t('tools.proofOfDelivery.exception2', 'Exception')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.deliveryType', 'Delivery Type')}</label>
              <select
                value={formData.deliveryType}
                onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="commercial">{t('tools.proofOfDelivery.commercial', 'Commercial')}</option>
                <option value="residential">{t('tools.proofOfDelivery.residential', 'Residential')}</option>
                <option value="dock">{t('tools.proofOfDelivery.dock', 'Dock')}</option>
                <option value="curbside">{t('tools.proofOfDelivery.curbside', 'Curbside')}</option>
                <option value="white-glove">{t('tools.proofOfDelivery.whiteGlove', 'White Glove')}</option>
              </select>
            </div>
          </div>

          {/* Consignee Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.proofOfDelivery.consigneeInformation', 'Consignee Information')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.companyRecipientName', 'Company/Recipient Name')}
                  value={formData.consignee?.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: { ...formData.consignee!, name: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.address', 'Address')}
                  value={formData.consignee?.address || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: { ...formData.consignee!, address: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.city', 'City')}
                  value={formData.consignee?.city || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: { ...formData.consignee!, city: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.state', 'State')}
                  value={formData.consignee?.state || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: { ...formData.consignee!, state: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.zip', 'ZIP')}
                  value={formData.consignee?.zip || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: { ...formData.consignee!, zip: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.contactName', 'Contact Name')}
                  value={formData.consignee?.contact || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: { ...formData.consignee!, contact: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder={t('tools.proofOfDelivery.phone', 'Phone')}
                  value={formData.consignee?.phone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: { ...formData.consignee!, phone: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.proofOfDelivery.driverInformation', 'Driver Information')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder={t('tools.proofOfDelivery.driverName', 'Driver Name')}
                value={formData.driver?.name || ''}
                onChange={(e) => setFormData({ ...formData, driver: { ...formData.driver!, name: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
              <input
                type="text"
                placeholder={t('tools.proofOfDelivery.driverId', 'Driver ID')}
                value={formData.driver?.id || ''}
                onChange={(e) => setFormData({ ...formData, driver: { ...formData.driver!, id: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
              <input
                type="tel"
                placeholder={t('tools.proofOfDelivery.driverPhone', 'Driver Phone')}
                value={formData.driver?.phone || ''}
                onChange={(e) => setFormData({ ...formData, driver: { ...formData.driver!, phone: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.scheduledDate', 'Scheduled Date')}</label>
              <input
                type="date"
                value={formData.scheduledDate || ''}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.timeWindow', 'Time Window')}</label>
              <input
                type="text"
                placeholder={t('tools.proofOfDelivery.eG0800Am', 'e.g., 08:00 AM - 12:00 PM')}
                value={formData.scheduledTimeWindow || ''}
                onChange={(e) => setFormData({ ...formData, scheduledTimeWindow: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Delivery Confirmation */}
          {formData.status !== 'pending' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.proofOfDelivery.actualDeliveryDate', 'Actual Delivery Date')}
                </label>
                <input
                  type="date"
                  value={formData.actualDeliveryDate || ''}
                  onChange={(e) => setFormData({ ...formData, actualDeliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.proofOfDelivery.actualDeliveryTime', 'Actual Delivery Time')}
                </label>
                <input
                  type="time"
                  value={formData.actualDeliveryTime || ''}
                  onChange={(e) => setFormData({ ...formData, actualDeliveryTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.receivedBy', 'Received By')}</label>
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.nameOfPersonReceiving', 'Name of person receiving')}
                  value={formData.receivedBy || ''}
                  onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.title', 'Title')}</label>
                <input
                  type="text"
                  placeholder={t('tools.proofOfDelivery.eGReceivingManager', 'e.g., Receiving Manager')}
                  value={formData.receiverTitle || ''}
                  onChange={(e) => setFormData({ ...formData, receiverTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.proofOfDelivery.deliveryNotes', 'Delivery Notes')}</label>
            <textarea
              value={formData.deliveryNotes || ''}
              onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              placeholder={t('tools.proofOfDelivery.anyNotesAboutTheDelivery', 'Any notes about the delivery...')}
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            {t('tools.proofOfDelivery.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {pod ? t('tools.proofOfDelivery.updatePod', 'Update POD') : t('tools.proofOfDelivery.createPod', 'Create POD')}
          </button>
        </div>
      </div>
    </div>
  );
};

// POD Details Modal
const PODDetailsModal: React.FC<{
  pod: ProofOfDelivery;
  onClose: () => void;
}> = ({ pod, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{pod.podNumber}</h2>
            <p className="text-sm text-gray-500">{t('tools.proofOfDelivery.proofOfDeliveryDetails', 'Proof of Delivery Details')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              {t('tools.proofOfDelivery.exportPdf', 'Export PDF')}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-lg ${
              pod.status === 'delivered'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : pod.status === 'pending'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  pod.status === 'delivered'
                    ? 'bg-green-100 dark:bg-green-900'
                    : pod.status === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-900'
                    : 'bg-red-100 dark:bg-red-900'
                }`}
              >
                {pod.status === 'delivered' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : pod.status === 'pending' ? (
                  <Clock className="w-6 h-6 text-yellow-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Status: {pod.status.charAt(0).toUpperCase() + pod.status.slice(1)}
                </p>
                {pod.actualDeliveryDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Delivered on {new Date(pod.actualDeliveryDate).toLocaleDateString()} at {pod.actualDeliveryTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.proofOfDelivery.consignee2', 'Consignee')}</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{pod.consignee.name}</p>
                <p className="text-gray-600 dark:text-gray-400">{pod.consignee.address}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {pod.consignee.city}, {pod.consignee.state} {pod.consignee.zip}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Contact: {pod.consignee.contact}</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: {pod.consignee.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.proofOfDelivery.driver2', 'Driver')}</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{pod.driver.name}</p>
                <p className="text-gray-600 dark:text-gray-400">ID: {pod.driver.id}</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: {pod.driver.phone}</p>
              </div>
            </div>
          </div>

          {/* Items Delivered */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.proofOfDelivery.itemsDelivered', 'Items Delivered')}</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left">{t('tools.proofOfDelivery.description', 'Description')}</th>
                    <th className="px-4 py-2 text-center">{t('tools.proofOfDelivery.ordered', 'Ordered')}</th>
                    <th className="px-4 py-2 text-center">{t('tools.proofOfDelivery.received', 'Received')}</th>
                    <th className="px-4 py-2 text-center">{t('tools.proofOfDelivery.condition', 'Condition')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pod.itemsDelivered.map((item) => (
                    <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-center">{item.quantityReceived}</td>
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
                    <td className="px-4 py-2 font-semibold">{t('tools.proofOfDelivery.total2', 'Total')}</td>
                    <td className="px-4 py-2 text-center font-semibold">{pod.totalItems}</td>
                    <td className="px-4 py-2 text-center font-semibold">{pod.totalReceived}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Signature & Photos */}
          {(pod.signatureUrl || pod.photos.length > 0) && (
            <div className="grid grid-cols-2 gap-6">
              {pod.signatureUrl && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.proofOfDelivery.signature', 'Signature')}</h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="text-center text-gray-400">
                      <Signature className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Signed by: {pod.receivedBy}</p>
                      {pod.receiverTitle && <p className="text-xs">{pod.receiverTitle}</p>}
                    </div>
                  </div>
                </div>
              )}
              {pod.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Photos ({pod.photos.length})</h3>
                  <div className="flex gap-2 flex-wrap">
                    {pod.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                      >
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exceptions */}
          {pod.exceptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.proofOfDelivery.exceptions2', 'Exceptions')}</h3>
              <div className="space-y-2">
                {pod.exceptions.map((exception, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-400">{exception.type}</p>
                        <p className="text-sm text-red-600 dark:text-red-400">{exception.description}</p>
                        <p className="text-xs text-red-500 mt-1">
                          {new Date(exception.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Feedback */}
          {(pod.deliveryNotes || pod.customerFeedback) && (
            <div className="grid grid-cols-2 gap-6">
              {pod.deliveryNotes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.proofOfDelivery.deliveryNotes2', 'Delivery Notes')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    {pod.deliveryNotes}
                  </p>
                </div>
              )}
              {pod.customerFeedback && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.proofOfDelivery.customerFeedback', 'Customer Feedback')}</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (pod.customerRating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{pod.customerFeedback}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProofOfDeliveryTool;
