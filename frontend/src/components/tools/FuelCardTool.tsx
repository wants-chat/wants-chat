'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Fuel,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  MapPin,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Filter,
  User,
  Droplet,
  Receipt,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface FuelTransaction {
  id: string;
  transactionId: string;
  cardNumber: string;
  cardHolder: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  date: string;
  time: string;
  stationName: string;
  stationAddress: string;
  stationCity: string;
  stationState: string;
  fuelType: 'diesel' | 'unleaded' | 'premium' | 'def';
  gallons: number;
  pricePerGallon: number;
  totalAmount: number;
  odometer: number;
  mpg: number | null;
  receiptNumber: string;
  authorized: boolean;
  flagged: boolean;
  flagReason: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface FuelCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  driverId: string;
  vehicleId: string;
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  currentSpend: number;
  allowedFuelTypes: string[];
  expirationDate: string;
  pin: string;
  notes: string;
}

type TabType = 'transactions' | 'cards' | 'analytics' | 'alerts';

const FUEL_TYPES: { value: FuelTransaction['fuelType']; label: string; color: string }[] = [
  { value: 'diesel', label: 'Diesel', color: 'yellow' },
  { value: 'unleaded', label: 'Unleaded', color: 'green' },
  { value: 'premium', label: 'Premium', color: 'purple' },
  { value: 'def', label: 'DEF', color: 'blue' },
];

const CARD_STATUSES: { value: FuelCard['status']; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'suspended', label: 'Suspended', color: 'yellow' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'expired', label: 'Expired', color: 'gray' },
];

// Column configuration for exports
const TRANSACTION_COLUMNS: ColumnConfig[] = [
  { key: 'transactionId', header: 'Transaction ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'vehicleId', header: 'Vehicle', type: 'string' },
  { key: 'stationName', header: 'Station', type: 'string' },
  { key: 'stationCity', header: 'City', type: 'string' },
  { key: 'fuelType', header: 'Fuel Type', type: 'string', format: (value) => FUEL_TYPES.find(f => f.value === value)?.label || value },
  { key: 'gallons', header: 'Gallons', type: 'number' },
  { key: 'pricePerGallon', header: '$/Gallon', type: 'currency' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'odometer', header: 'Odometer', type: 'number' },
  { key: 'mpg', header: 'MPG', type: 'number' },
  { key: 'flagged', header: 'Flagged', type: 'boolean' },
];

// Sample data
const generateSampleData = (): FuelTransaction[] => [
  {
    id: '1',
    transactionId: 'TXN-2025-0001',
    cardNumber: '****4521',
    cardHolder: 'John Smith',
    driverId: 'DRV-001',
    driverName: 'John Smith',
    vehicleId: 'TRK-101',
    date: '2025-01-02',
    time: '11:35',
    stationName: 'Love\'s Travel Stop',
    stationAddress: '1234 Highway 10',
    stationCity: 'Quartzsite',
    stationState: 'AZ',
    fuelType: 'diesel',
    gallons: 125.5,
    pricePerGallon: 3.459,
    totalAmount: 434.10,
    odometer: 125720,
    mpg: 7.8,
    receiptNumber: 'R-45678',
    authorized: true,
    flagged: false,
    flagReason: null,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    transactionId: 'TXN-2025-0002',
    cardNumber: '****4521',
    cardHolder: 'John Smith',
    driverId: 'DRV-001',
    driverName: 'John Smith',
    vehicleId: 'TRK-101',
    date: '2025-01-01',
    time: '15:20',
    stationName: 'Pilot Flying J',
    stationAddress: '5678 Interstate Blvd',
    stationCity: 'Phoenix',
    stationState: 'AZ',
    fuelType: 'diesel',
    gallons: 98.2,
    pricePerGallon: 3.529,
    totalAmount: 346.55,
    odometer: 124750,
    mpg: 8.1,
    receiptNumber: 'R-45123',
    authorized: true,
    flagged: false,
    flagReason: null,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    transactionId: 'TXN-2024-9998',
    cardNumber: '****7832',
    cardHolder: 'Sarah Davis',
    driverId: 'DRV-002',
    driverName: 'Sarah Davis',
    vehicleId: 'TRK-105',
    date: '2024-12-31',
    time: '09:45',
    stationName: 'TA Petro',
    stationAddress: '999 Truck Plaza Dr',
    stationCity: 'Tucson',
    stationState: 'AZ',
    fuelType: 'diesel',
    gallons: 150.0,
    pricePerGallon: 3.899,
    totalAmount: 584.85,
    odometer: 89500,
    mpg: 6.5,
    receiptNumber: 'R-44999',
    authorized: true,
    flagged: true,
    flagReason: 'Unusual transaction amount - exceeds daily average by 50%',
    notes: 'Long haul trip to California',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const generateSampleCards = (): FuelCard[] => [
  {
    id: '1',
    cardNumber: '4521-XXXX-XXXX-4521',
    cardHolder: 'John Smith',
    driverId: 'DRV-001',
    vehicleId: 'TRK-101',
    status: 'active',
    dailyLimit: 500,
    weeklyLimit: 2500,
    monthlyLimit: 8000,
    currentSpend: 780.65,
    allowedFuelTypes: ['diesel', 'def'],
    expirationDate: '2026-12-31',
    pin: '****',
    notes: '',
  },
  {
    id: '2',
    cardNumber: '7832-XXXX-XXXX-7832',
    cardHolder: 'Sarah Davis',
    driverId: 'DRV-002',
    vehicleId: 'TRK-105',
    status: 'active',
    dailyLimit: 600,
    weeklyLimit: 3000,
    monthlyLimit: 10000,
    currentSpend: 584.85,
    allowedFuelTypes: ['diesel', 'def'],
    expirationDate: '2026-06-30',
    pin: '****',
    notes: '',
  },
];

const emptyTransaction: Omit<FuelTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
  transactionId: '',
  cardNumber: '',
  cardHolder: '',
  driverId: '',
  driverName: '',
  vehicleId: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  stationName: '',
  stationAddress: '',
  stationCity: '',
  stationState: '',
  fuelType: 'diesel',
  gallons: 0,
  pricePerGallon: 0,
  totalAmount: 0,
  odometer: 0,
  mpg: null,
  receiptNumber: '',
  authorized: true,
  flagged: false,
  flagReason: null,
  notes: '',
};

export default function FuelCardTool() {
  const { t } = useTranslation();
  const {
    data: transactions,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  } = useToolData<FuelTransaction>('fuel-card', generateSampleData);

  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [cards] = useState<FuelCard[]>(generateSampleCards);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FuelTransaction | null>(null);
  const [formData, setFormData] = useState<Omit<FuelTransaction, 'id' | 'createdAt' | 'updatedAt'>>(emptyTransaction);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.stationName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !dateFilter || txn.date === dateFilter;
      const matchesFuelType = fuelTypeFilter === 'all' || txn.fuelType === fuelTypeFilter;
      return matchesSearch && matchesDate && matchesFuelType;
    });
  }, [transactions, searchQuery, dateFilter, fuelTypeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalGallons = transactions.reduce((sum, t) => sum + t.gallons, 0);
    const totalSpend = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const avgPricePerGallon = totalGallons > 0 ? totalSpend / totalGallons : 0;
    const avgMpg = transactions.filter(t => t.mpg).reduce((sum, t, _, arr) => sum + (t.mpg || 0) / arr.length, 0);
    const flaggedCount = transactions.filter(t => t.flagged).length;
    return { totalTransactions, totalGallons, totalSpend, avgPricePerGallon, avgMpg, flaggedCount };
  }, [transactions]);

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    const totalAmount = formData.gallons * formData.pricePerGallon;

    if (editingTransaction) {
      await updateItem(editingTransaction.id, { ...formData, totalAmount, updatedAt: now });
    } else {
      await addItem({
        ...formData,
        totalAmount,
        id: `txn-${Date.now()}`,
        transactionId: formData.transactionId || `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(4, '0')}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyTransaction);
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const handleEdit = (txn: FuelTransaction) => {
    setEditingTransaction(txn);
    setFormData({ ...txn });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this transaction?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const getFuelTypeColor = (fuelType: FuelTransaction['fuelType']) => {
    return FUEL_TYPES.find(f => f.value === fuelType)?.color || 'gray';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Fuel className="w-7 h-7 text-amber-600" />
            {t('tools.fuelCard.fuelCardTracking', 'Fuel Card Tracking')}
          </h1>
          <p className="text-gray-600 mt-1">{t('tools.fuelCard.trackFuelPurchasesAndCard', 'Track fuel purchases and card usage')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="fuel-card" toolName="Fuel Card" />

          <SyncStatus state={syncState} onRetry={refresh} />
          <ExportDropdown
            data={filteredTransactions}
            filename="fuel-transactions"
            columns={TRANSACTION_COLUMNS}
          />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.fuelCard.addTransaction', 'Add Transaction')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.fuelCard.transactions', 'Transactions')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Droplet className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.fuelCard.totalGallons', 'Total Gallons')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalGallons.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.fuelCard.totalSpend', 'Total Spend')}</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalSpend.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.fuelCard.avgGallon', 'Avg $/Gallon')}</p>
              <p className="text-xl font-bold text-gray-900">${stats.avgPricePerGallon.toFixed(3)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Fuel className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.fuelCard.avgMpg', 'Avg MPG')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgMpg.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.flaggedCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${stats.flaggedCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.fuelCard.flagged', 'Flagged')}</p>
              <p className={`text-xl font-bold ${stats.flaggedCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.flaggedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {(['transactions', 'cards', 'analytics', 'alerts'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'transactions' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.fuelCard.searchTransactions', 'Search transactions...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{t('tools.fuelCard.allFuelTypes', 'All Fuel Types')}</option>
            {FUEL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Transactions List */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.fuelCard.noTransactionsFound', 'No transactions found')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.fuelCard.addANewFuelTransaction', 'Add a new fuel transaction to get started')}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.fuelCard.dateTime', 'Date/Time')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.fuelCard.driverVehicle', 'Driver/Vehicle')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.fuelCard.station', 'Station')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.fuelCard.fuel', 'Fuel')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tools.fuelCard.gallons', 'Gallons')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">$/Gal</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tools.fuelCard.total', 'Total')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tools.fuelCard.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className={`hover:bg-gray-50 ${txn.flagged ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{txn.date}</div>
                      <div className="text-xs text-gray-500">{txn.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{txn.driverName}</div>
                      <div className="text-xs text-gray-500">{txn.vehicleId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{txn.stationName}</div>
                      <div className="text-xs text-gray-500">{txn.stationCity}, {txn.stationState}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getFuelTypeColor(txn.fuelType)}-100 text-${getFuelTypeColor(txn.fuelType)}-700`}>
                        {FUEL_TYPES.find(f => f.value === txn.fuelType)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">{txn.gallons.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">${txn.pricePerGallon.toFixed(3)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-medium text-gray-900">${txn.totalAmount.toFixed(2)}</span>
                        {txn.flagged && <AlertTriangle className="w-4 h-4 text-red-500" title={txn.flagReason || 'Flagged'} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(txn)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(txn.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{card.cardNumber}</h3>
                    <p className="text-sm text-gray-500">{card.cardHolder}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${CARD_STATUSES.find(s => s.value === card.status)?.color}-100 text-${CARD_STATUSES.find(s => s.value === card.status)?.color}-700`}>
                  {CARD_STATUSES.find(s => s.value === card.status)?.label}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{t('tools.fuelCard.monthlySpend', 'Monthly Spend')}</span>
                    <span className="text-gray-900">${card.currentSpend.toFixed(2)} / ${card.monthlyLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${card.currentSpend / card.monthlyLimit > 0.9 ? 'bg-red-500' : card.currentSpend / card.monthlyLimit > 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((card.currentSpend / card.monthlyLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Daily: ${card.dailyLimit}</span>
                  <span>Weekly: ${card.weeklyLimit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{t('tools.fuelCard.allowed', 'Allowed:')}</span>
                  {card.allowedFuelTypes.map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{type}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Expires: {card.expirationDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            {t('tools.fuelCard.fuelAnalytics', 'Fuel Analytics')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.fuelCard.averageCostPerMile', 'Average Cost per Mile')}</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.avgMpg > 0 ? (stats.avgPricePerGallon / stats.avgMpg).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.fuelCard.totalFuelCostThisMonth', 'Total Fuel Cost This Month')}</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSpend.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.fuelCard.fleetAverageMpg', 'Fleet Average MPG')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgMpg.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {t('tools.fuelCard.flaggedTransactions', 'Flagged Transactions')}
          </h3>
          {transactions.filter(t => t.flagged).length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('tools.fuelCard.noFlaggedTransactions', 'No flagged transactions')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.filter(t => t.flagged).map((txn) => (
                <div key={txn.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{txn.transactionId}</h4>
                      <p className="text-sm text-gray-600">{txn.driverName} - {txn.vehicleId}</p>
                    </div>
                    <p className="font-bold text-red-600">${txn.totalAmount.toFixed(2)}</p>
                  </div>
                  <p className="mt-2 text-sm text-red-700">{txn.flagReason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTransaction ? t('tools.fuelCard.editTransaction', 'Edit Transaction') : t('tools.fuelCard.newFuelTransaction', 'New Fuel Transaction')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.date', 'Date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.time', 'Time')}</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.receipt', 'Receipt #')}</label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.driverName', 'Driver Name')}</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.vehicleId', 'Vehicle ID')}</label>
                  <input
                    type="text"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.cardNumber', 'Card Number')}</label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.stationName', 'Station Name')}</label>
                  <input
                    type="text"
                    value={formData.stationName}
                    onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.stationCity', 'Station City')}</label>
                  <input
                    type="text"
                    value={formData.stationCity}
                    onChange={(e) => setFormData({ ...formData, stationCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.fuelType', 'Fuel Type')}</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelTransaction['fuelType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {FUEL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.gallons2', 'Gallons')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.gallons}
                    onChange={(e) => setFormData({ ...formData, gallons: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.priceGallon', 'Price/Gallon')}</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.pricePerGallon}
                    onChange={(e) => setFormData({ ...formData, pricePerGallon: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.odometer', 'Odometer')}</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.fuelCard.notes', 'Notes')}</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('tools.fuelCard.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                <Save className="w-4 h-4" />
                {editingTransaction ? t('tools.fuelCard.update', 'Update') : t('tools.fuelCard.addTransaction2', 'Add Transaction')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export { FuelCardTool };
