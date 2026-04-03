'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Briefcase,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Star,
  TrendingUp,
  FileText,
  Users,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Clock,
  Calendar,
  Hash,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface FreightBroker {
  id: string;
  mcNumber: string;
  dotNumber: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: 'active' | 'pending' | 'suspended' | 'blacklisted';
  rating: number;
  creditScore: 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A';
  paymentTerms: number;
  avgPaymentDays: number;
  totalLoads: number;
  totalRevenue: number;
  avgRatePerMile: number;
  lastLoadDate: string | null;
  quickPay: boolean;
  quickPayFee: number;
  factorable: boolean;
  preferredLanes: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface BrokerLoad {
  id: string;
  brokerId: string;
  loadNumber: string;
  rate: number;
  miles: number;
  pickupDate: string;
  deliveryDate: string;
  origin: string;
  destination: string;
  status: 'pending' | 'booked' | 'in-transit' | 'delivered' | 'paid' | 'disputed';
  invoiceNumber: string | null;
  invoiceDate: string | null;
  paidDate: string | null;
  notes: string;
}

type TabType = 'brokers' | 'loads' | 'payments' | 'analytics';

const BROKER_STATUSES: { value: FreightBroker['status']; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'suspended', label: 'Suspended', color: 'orange' },
  { value: 'blacklisted', label: 'Blacklisted', color: 'red' },
];

const CREDIT_SCORES: { value: FreightBroker['creditScore']; label: string; color: string }[] = [
  { value: 'A', label: 'A - Excellent', color: 'green' },
  { value: 'B', label: 'B - Good', color: 'blue' },
  { value: 'C', label: 'C - Fair', color: 'yellow' },
  { value: 'D', label: 'D - Poor', color: 'orange' },
  { value: 'F', label: 'F - Bad', color: 'red' },
  { value: 'N/A', label: 'N/A', color: 'gray' },
];

// Column configuration for exports
const BROKER_COLUMNS: ColumnConfig[] = [
  { key: 'mcNumber', header: 'MC #', type: 'string' },
  { key: 'companyName', header: 'Company', type: 'string' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'status', header: 'Status', type: 'string', format: (value) => BROKER_STATUSES.find(s => s.value === value)?.label || value },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'creditScore', header: 'Credit', type: 'string' },
  { key: 'paymentTerms', header: 'Terms (days)', type: 'number' },
  { key: 'totalLoads', header: 'Total Loads', type: 'number' },
  { key: 'totalRevenue', header: 'Total Revenue', type: 'currency' },
  { key: 'avgRatePerMile', header: 'Avg $/Mile', type: 'currency' },
];

// Sample data
const generateSampleData = (): FreightBroker[] => [
  {
    id: '1',
    mcNumber: 'MC-123456',
    dotNumber: 'DOT-789012',
    companyName: 'Premier Freight Solutions',
    contactName: 'Mike Anderson',
    contactTitle: 'Load Coordinator',
    phone: '+1 (555) 123-4567',
    email: 'mike@premierfreight.com',
    address: '123 Broker Blvd',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    status: 'active',
    rating: 4.5,
    creditScore: 'A',
    paymentTerms: 30,
    avgPaymentDays: 28,
    totalLoads: 45,
    totalRevenue: 125000,
    avgRatePerMile: 2.85,
    lastLoadDate: '2025-01-01',
    quickPay: true,
    quickPayFee: 3,
    factorable: true,
    preferredLanes: ['Chicago-LA', 'Dallas-Phoenix', 'Atlanta-Miami'],
    notes: 'Great to work with. Always pays on time.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    mcNumber: 'MC-234567',
    dotNumber: 'DOT-890123',
    companyName: 'Nationwide Logistics',
    contactName: 'Sarah Wilson',
    contactTitle: 'Dispatch Manager',
    phone: '+1 (555) 234-5678',
    email: 'sarah@nationwidelogistics.com',
    address: '456 Transport Ave',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    status: 'active',
    rating: 4.2,
    creditScore: 'B',
    paymentTerms: 45,
    avgPaymentDays: 42,
    totalLoads: 32,
    totalRevenue: 89500,
    avgRatePerMile: 2.65,
    lastLoadDate: '2024-12-28',
    quickPay: true,
    quickPayFee: 2.5,
    factorable: true,
    preferredLanes: ['Dallas-Houston', 'Phoenix-Denver'],
    notes: 'Good rates but sometimes slow to pay.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    mcNumber: 'MC-345678',
    dotNumber: 'DOT-901234',
    companyName: 'Express Freight Co',
    contactName: 'Tom Brown',
    contactTitle: 'Owner',
    phone: '+1 (555) 345-6789',
    email: 'tom@expressfreight.com',
    address: '789 Carrier Lane',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001',
    status: 'pending',
    rating: 0,
    creditScore: 'N/A',
    paymentTerms: 30,
    avgPaymentDays: 0,
    totalLoads: 0,
    totalRevenue: 0,
    avgRatePerMile: 0,
    lastLoadDate: null,
    quickPay: false,
    quickPayFee: 0,
    factorable: false,
    preferredLanes: [],
    notes: 'New broker - needs verification',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const emptyBroker: Omit<FreightBroker, 'id' | 'createdAt' | 'updatedAt'> = {
  mcNumber: '',
  dotNumber: '',
  companyName: '',
  contactName: '',
  contactTitle: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  status: 'pending',
  rating: 0,
  creditScore: 'N/A',
  paymentTerms: 30,
  avgPaymentDays: 0,
  totalLoads: 0,
  totalRevenue: 0,
  avgRatePerMile: 0,
  lastLoadDate: null,
  quickPay: false,
  quickPayFee: 0,
  factorable: false,
  preferredLanes: [],
  notes: '',
};

export default function FreightBrokerTool() {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const {
    data: brokers,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  } = useToolData<FreightBroker>('freight-broker', generateSampleData);

  const [activeTab, setActiveTab] = useState<TabType>('brokers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<FreightBroker | null>(null);
  const [formData, setFormData] = useState<Omit<FreightBroker, 'id' | 'createdAt' | 'updatedAt'>>(emptyBroker);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);

  // Filtered brokers
  const filteredBrokers = useMemo(() => {
    return brokers.filter((broker) => {
      const matchesSearch =
        broker.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broker.mcNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broker.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broker.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || broker.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [brokers, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalBrokers = brokers.length;
    const activeBrokers = brokers.filter((b) => b.status === 'active').length;
    const totalRevenue = brokers.reduce((sum, b) => sum + b.totalRevenue, 0);
    const totalLoads = brokers.reduce((sum, b) => sum + b.totalLoads, 0);
    const avgRating = brokers.filter(b => b.rating > 0).reduce((sum, b, _, arr) => sum + b.rating / arr.length, 0);
    return { totalBrokers, activeBrokers, totalRevenue, totalLoads, avgRating };
  }, [brokers]);

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    if (editingBroker) {
      await updateItem(editingBroker.id, { ...formData, updatedAt: now });
    } else {
      await addItem({
        ...formData,
        id: `broker-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyBroker);
    setEditingBroker(null);
    setIsFormOpen(false);
  };

  const handleEdit = (broker: FreightBroker) => {
    setEditingBroker(broker);
    setFormData({ ...broker });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Broker',
      message: 'Are you sure you want to delete this broker? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const getStatusColor = (status: FreightBroker['status']) => {
    return BROKER_STATUSES.find(s => s.value === status)?.color || 'gray';
  };

  const getCreditColor = (credit: FreightBroker['creditScore']) => {
    return CREDIT_SCORES.find(c => c.value === credit)?.color || 'gray';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-violet-600" />
            {t('tools.freightBroker.freightBrokerManagement', 'Freight Broker Management')}
          </h1>
          <p className="text-gray-600 mt-1">{t('tools.freightBroker.manageBrokerRelationshipsAndTrack', 'Manage broker relationships and track performance')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="freight-broker" toolName="Freight Broker" />

          <SyncStatus state={syncState} onRetry={refresh} />
          <ExportDropdown
            data={filteredBrokers}
            filename="freight-brokers"
            columns={BROKER_COLUMNS}
          />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.freightBroker.addBroker', 'Add Broker')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Building2 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.freightBroker.totalBrokers', 'Total Brokers')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBrokers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.freightBroker.active', 'Active')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeBrokers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.freightBroker.totalLoads', 'Total Loads')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalLoads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.freightBroker.totalRevenue', 'Total Revenue')}</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.freightBroker.avgRating', 'Avg Rating')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {(['brokers', 'loads', 'payments', 'analytics'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'brokers' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.freightBroker.searchBrokers', 'Search brokers...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">{t('tools.freightBroker.allStatuses', 'All Statuses')}</option>
            {BROKER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Brokers List */}
      {activeTab === 'brokers' && (
        <div className="space-y-4">
          {filteredBrokers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.freightBroker.noBrokersFound', 'No brokers found')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.freightBroker.addANewBrokerTo', 'Add a new broker to get started')}</p>
            </div>
          ) : (
            filteredBrokers.map((broker) => (
              <div
                key={broker.id}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${
                  selectedBrokerId === broker.id ? 'ring-2 ring-violet-500' : ''
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedBrokerId(selectedBrokerId === broker.id ? null : broker.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{broker.companyName}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${getStatusColor(broker.status)}-100 text-${getStatusColor(broker.status)}-700`}>
                            {BROKER_STATUSES.find(s => s.value === broker.status)?.label}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${getCreditColor(broker.creditScore)}-100 text-${getCreditColor(broker.creditScore)}-700`}>
                            Credit: {broker.creditScore}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{broker.mcNumber} | {broker.dotNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {broker.rating > 0 && renderStars(broker.rating)}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(broker);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(broker.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {broker.contactName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {broker.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {broker.city}, {broker.state}
                    </div>
                    <span className="text-gray-400">|</span>
                    <span>{broker.totalLoads} loads</span>
                    <span>${broker.totalRevenue.toLocaleString()} revenue</span>
                    {broker.avgRatePerMile > 0 && (
                      <span>${broker.avgRatePerMile.toFixed(2)}/mi avg</span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedBrokerId === broker.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('tools.freightBroker.contactInformation', 'Contact Information')}</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">{t('tools.freightBroker.contact', 'Contact:')}</span> {broker.contactName} ({broker.contactTitle})</p>
                          <p><span className="text-gray-500">{t('tools.freightBroker.phone', 'Phone:')}</span> {broker.phone}</p>
                          <p><span className="text-gray-500">{t('tools.freightBroker.email', 'Email:')}</span> {broker.email}</p>
                          <p><span className="text-gray-500">{t('tools.freightBroker.address', 'Address:')}</span> {broker.address}, {broker.city}, {broker.state} {broker.zip}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('tools.freightBroker.paymentTerms', 'Payment Terms')}</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">{t('tools.freightBroker.terms', 'Terms:')}</span> Net {broker.paymentTerms} days</p>
                          <p><span className="text-gray-500">{t('tools.freightBroker.avgPayment', 'Avg Payment:')}</span> {broker.avgPaymentDays} days</p>
                          <p><span className="text-gray-500">{t('tools.freightBroker.quickPay', 'Quick Pay:')}</span> {broker.quickPay ? `Yes (${broker.quickPayFee}% fee)` : 'No'}</p>
                          <p><span className="text-gray-500">{t('tools.freightBroker.factorable', 'Factorable:')}</span> {broker.factorable ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('tools.freightBroker.preferredLanes', 'Preferred Lanes')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {broker.preferredLanes.length > 0 ? (
                            broker.preferredLanes.map((lane, idx) => (
                              <span key={idx} className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                                {lane}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">{t('tools.freightBroker.noPreferredLanesSet', 'No preferred lanes set')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {broker.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm"><span className="text-gray-500">{t('tools.freightBroker.notes', 'Notes:')}</span> {broker.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Loads Tab */}
      {activeTab === 'loads' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.freightBroker.brokerLoads', 'Broker Loads')}</h3>
          <p className="text-gray-600">{t('tools.freightBroker.loadHistoryByBrokerComing', 'Load history by broker coming soon...')}</p>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.freightBroker.paymentTracking', 'Payment Tracking')}</h3>
          <p className="text-gray-600">{t('tools.freightBroker.paymentTrackingAndAgingReports', 'Payment tracking and aging reports coming soon...')}</p>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            {t('tools.freightBroker.brokerAnalytics', 'Broker Analytics')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.freightBroker.totalRevenueFromBrokers', 'Total Revenue from Brokers')}</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.freightBroker.totalLoadsHauled', 'Total Loads Hauled')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLoads}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.freightBroker.averageBrokerRating', 'Average Broker Rating')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)} / 5</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBroker ? t('tools.freightBroker.editBroker', 'Edit Broker') : t('tools.freightBroker.addFreightBroker', 'Add Freight Broker')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.mcNumber', 'MC Number')}</label>
                  <input
                    type="text"
                    value={formData.mcNumber}
                    onChange={(e) => setFormData({ ...formData, mcNumber: e.target.value })}
                    placeholder={t('tools.freightBroker.mcXxxxxx', 'MC-XXXXXX')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.dotNumber', 'DOT Number')}</label>
                  <input
                    type="text"
                    value={formData.dotNumber}
                    onChange={(e) => setFormData({ ...formData, dotNumber: e.target.value })}
                    placeholder={t('tools.freightBroker.dotXxxxxx', 'DOT-XXXXXX')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FreightBroker['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  >
                    {BROKER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.companyName', 'Company Name')}</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.contactName', 'Contact Name')}</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.email2', 'Email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.address2', 'Address')}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.city', 'City')}</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.state', 'State')}</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.creditScore', 'Credit Score')}</label>
                  <select
                    value={formData.creditScore}
                    onChange={(e) => setFormData({ ...formData, creditScore: e.target.value as FreightBroker['creditScore'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  >
                    {CREDIT_SCORES.map((score) => (
                      <option key={score.value} value={score.value}>{score.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.paymentTermsDays', 'Payment Terms (days)')}</label>
                  <input
                    type="number"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.quickPay2', 'Quick Pay')}</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.quickPay}
                        onChange={(e) => setFormData({ ...formData, quickPay: e.target.checked })}
                        className="rounded border-gray-300 text-violet-600"
                      />
                      <span className="text-sm">{t('tools.freightBroker.offersQuickPay', 'Offers Quick Pay')}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.quickPayFee', 'Quick Pay Fee (%)')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.quickPayFee}
                    onChange={(e) => setFormData({ ...formData, quickPayFee: parseFloat(e.target.value) || 0 })}
                    disabled={!formData.quickPay}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.freightBroker.notes2', 'Notes')}</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('tools.freightBroker.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                <Save className="w-4 h-4" />
                {editingBroker ? t('tools.freightBroker.updateBroker', 'Update Broker') : t('tools.freightBroker.addBroker2', 'Add Broker')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export { FreightBrokerTool };
