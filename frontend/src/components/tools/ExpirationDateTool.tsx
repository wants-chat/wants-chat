'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Package,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  RotateCcw,
  Archive,
  FileText,
  Pill,
  Building,
  TrendingDown,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface ExpiringItem {
  id: string;
  ndc: string;
  drugName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  unit: 'tablets' | 'capsules' | 'ml' | 'grams' | 'units' | 'each';
  location: string;
  unitCost: number;
  status: 'active' | 'quarantined' | 'returned' | 'destroyed';
  action: 'pending' | 'return-initiated' | 'destruction-scheduled' | 'completed';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DestructionRecord {
  id: string;
  itemId: string;
  drugName: string;
  lotNumber: string;
  quantity: number;
  destructionDate: string;
  witnessName: string;
  method: string;
  documentation: string;
  createdAt: string;
}

interface ExpirationDateToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'expiration-date-tracking';

// Column configuration for export
const ITEM_COLUMNS: ColumnConfig[] = [
  { key: 'ndc', header: 'NDC', type: 'string' },
  { key: 'drugName', header: 'Drug Name', type: 'string' },
  { key: 'strength', header: 'Strength', type: 'string' },
  { key: 'manufacturer', header: 'Manufacturer', type: 'string' },
  { key: 'lotNumber', header: 'Lot Number', type: 'string' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'action', header: 'Action Status', type: 'string' },
];

const ExpirationDateTool: React.FC<ExpirationDateToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: items,
    setData: setItems,
    syncStatus,
    lastSynced,
    sync,
  } = useToolData<ExpiringItem>(TOOL_ID, [], ITEM_COLUMNS);

  const [activeTab, setActiveTab] = useState<'expiring' | 'quarantine' | 'destruction' | 'reports'>('expiring');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDays, setFilterDays] = useState<number>(90);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpiringItem | null>(null);
  const [destructionRecords, setDestructionRecords] = useState<DestructionRecord[]>([]);

  const [formData, setFormData] = useState<Partial<ExpiringItem>>({
    ndc: '',
    drugName: '',
    strength: '',
    dosageForm: 'tablets',
    manufacturer: '',
    lotNumber: '',
    expirationDate: '',
    quantity: 0,
    unit: 'tablets',
    location: '',
    unitCost: 0,
    status: 'active',
    action: 'pending',
    notes: '',
  });

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get expiration status color
  const getExpirationStatus = (days: number) => {
    if (days <= 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Expired' };
    if (days <= 30) return { color: 'text-red-500', bg: 'bg-red-50', label: 'Critical' };
    if (days <= 60) return { color: 'text-orange-500', bg: 'bg-orange-50', label: 'Warning' };
    if (days <= 90) return { color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Attention' };
    return { color: 'text-green-500', bg: 'bg-green-50', label: 'OK' };
  };

  // Filter items based on search and days
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const days = getDaysUntilExpiration(item.expirationDate);
      const matchesSearch = !searchTerm ||
        item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ndc.includes(searchTerm) ||
        item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDays = days <= filterDays;
      return matchesSearch && matchesDays && item.status === 'active';
    }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  }, [items, searchTerm, filterDays]);

  const quarantinedItems = useMemo(() => {
    return items.filter(item => item.status === 'quarantined');
  }, [items]);

  // Stats
  const stats = useMemo(() => {
    const expired = items.filter(i => getDaysUntilExpiration(i.expirationDate) <= 0 && i.status === 'active').length;
    const critical = items.filter(i => {
      const days = getDaysUntilExpiration(i.expirationDate);
      return days > 0 && days <= 30 && i.status === 'active';
    }).length;
    const warning = items.filter(i => {
      const days = getDaysUntilExpiration(i.expirationDate);
      return days > 30 && days <= 60 && i.status === 'active';
    }).length;
    const attention = items.filter(i => {
      const days = getDaysUntilExpiration(i.expirationDate);
      return days > 60 && days <= 90 && i.status === 'active';
    }).length;
    const totalValue = filteredItems.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);

    return { expired, critical, warning, attention, totalValue };
  }, [items, filteredItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, updatedAt: new Date().toISOString() }
          : item
      ));
    } else {
      const newItem: ExpiringItem = {
        ...formData as ExpiringItem,
        id: `EXP-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setItems([...items, newItem]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      ndc: '',
      drugName: '',
      strength: '',
      dosageForm: 'tablets',
      manufacturer: '',
      lotNumber: '',
      expirationDate: '',
      quantity: 0,
      unit: 'tablets',
      location: '',
      unitCost: 0,
      status: 'active',
      action: 'pending',
      notes: '',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleQuarantine = (item: ExpiringItem) => {
    setItems(items.map(i =>
      i.id === item.id
        ? { ...i, status: 'quarantined', updatedAt: new Date().toISOString() }
        : i
    ));
  };

  const handleDestroy = (item: ExpiringItem, witnessName: string, method: string) => {
    const record: DestructionRecord = {
      id: `DEST-${Date.now()}`,
      itemId: item.id,
      drugName: item.drugName,
      lotNumber: item.lotNumber,
      quantity: item.quantity,
      destructionDate: new Date().toISOString(),
      witnessName,
      method,
      documentation: `Destroyed ${item.quantity} ${item.unit} of ${item.drugName} (Lot: ${item.lotNumber})`,
      createdAt: new Date().toISOString(),
    };

    setDestructionRecords([...destructionRecords, record]);
    setItems(items.map(i =>
      i.id === item.id
        ? { ...i, status: 'destroyed', action: 'completed', updatedAt: new Date().toISOString() }
        : i
    ));
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleEdit = (item: ExpiringItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-orange-500" />
            {t('tools.expirationDate.expirationDateTracking', 'Expiration Date Tracking')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.expirationDate.monitorDrugExpirationDatesAnd', 'Monitor drug expiration dates and manage outdated inventory')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="expiration-date" toolName="Expiration Date" />

          <SyncStatus status={syncStatus} lastSynced={lastSynced} onSync={sync} />
          <ExportDropdown data={filteredItems} columns={ITEM_COLUMNS} filename="expiration-tracking" />
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.expirationDate.addItem', 'Add Item')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{t('tools.expirationDate.expired', 'Expired')}</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-900/30 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>≤30 Days</span>
          </div>
          <p className="text-2xl font-bold text-orange-500">{stats.critical}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>31-60 Days</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{stats.warning}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>61-90 Days</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{stats.attention}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.expirationDate.atRiskValue', 'At-Risk Value')}</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">${stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {[
          { id: 'expiring', label: 'Expiring Items', icon: Calendar },
          { id: 'quarantine', label: 'Quarantine', icon: Archive },
          { id: 'destruction', label: 'Destruction Log', icon: Trash2 },
          { id: 'reports', label: 'Reports', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Expiring Items Tab */}
      {activeTab === 'expiring' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('tools.expirationDate.searchByDrugNameNdc', 'Search by drug name, NDC, or lot number...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterDays}
                onChange={(e) => setFilterDays(Number(e.target.value))}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value={30}>{t('tools.expirationDate.next30Days', 'Next 30 Days')}</option>
                <option value={60}>{t('tools.expirationDate.next60Days', 'Next 60 Days')}</option>
                <option value={90}>{t('tools.expirationDate.next90Days', 'Next 90 Days')}</option>
                <option value={180}>{t('tools.expirationDate.next6Months', 'Next 6 Months')}</option>
                <option value={365}>{t('tools.expirationDate.nextYear', 'Next Year')}</option>
              </select>
            </div>
          </div>

          {/* Items List */}
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.drug', 'Drug')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.lot', 'Lot #')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.expires', 'Expires')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.daysLeft', 'Days Left')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.qty', 'Qty')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.value', 'Value')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.location', 'Location')}</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.expirationDate.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map(item => {
                    const daysLeft = getDaysUntilExpiration(item.expirationDate);
                    const status = getExpirationStatus(daysLeft);

                    return (
                      <tr key={item.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{item.drugName}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.strength} • {item.ndc}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.lotNumber}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(item.expirationDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} days`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3 text-sm">${(item.quantity * item.unitCost).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{item.location}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleQuarantine(item)}
                              className="p-1 text-orange-500 hover:bg-orange-100 rounded"
                              title={t('tools.expirationDate.quarantine', 'Quarantine')}
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                              title={t('tools.expirationDate.edit', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="p-8 text-center">
                <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No items expiring within {filterDays} days</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quarantine Tab */}
      {activeTab === 'quarantine' && (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.drug2', 'Drug')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.lot2', 'Lot #')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.expired2', 'Expired')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.qty2', 'Qty')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.value2', 'Value')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.action', 'Action')}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.expirationDate.actions2', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {quarantinedItems.map(item => (
                  <tr key={item.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{item.drugName}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.strength}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.lotNumber}</td>
                    <td className="px-4 py-3 text-sm">{new Date(item.expirationDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-sm">${(item.quantity * item.unitCost).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.action === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        item.action === 'return-initiated' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {item.action.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            const witness = prompt('Enter witness name:');
                            if (witness) handleDestroy(item, witness, 'Incineration');
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          {t('tools.expirationDate.destroy', 'Destroy')}
                        </button>
                        <button
                          onClick={() => {
                            setItems(items.map(i =>
                              i.id === item.id
                                ? { ...i, action: 'return-initiated', updatedAt: new Date().toISOString() }
                                : i
                            ));
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {t('tools.expirationDate.return', 'Return')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quarantinedItems.length === 0 && (
            <div className="p-8 text-center">
              <Archive className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.expirationDate.noItemsInQuarantine', 'No items in quarantine')}</p>
            </div>
          )}
        </div>
      )}

      {/* Destruction Log Tab */}
      {activeTab === 'destruction' && (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.date', 'Date')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.drug3', 'Drug')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.lot3', 'Lot #')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.quantity', 'Quantity')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.method', 'Method')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.expirationDate.witness', 'Witness')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {destructionRecords.map(record => (
                  <tr key={record.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-sm">
                      {new Date(record.destructionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{record.drugName}</td>
                    <td className="px-4 py-3 text-sm">{record.lotNumber}</td>
                    <td className="px-4 py-3 text-sm">{record.quantity}</td>
                    <td className="px-4 py-3 text-sm">{record.method}</td>
                    <td className="px-4 py-3 text-sm">{record.witnessName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {destructionRecords.length === 0 && (
            <div className="p-8 text-center">
              <Trash2 className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.expirationDate.noDestructionRecords', 'No destruction records')}</p>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              {t('tools.expirationDate.monthlyExpirationReport', 'Monthly Expiration Report')}
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.expirationDate.generateAComprehensiveReportOf', 'Generate a comprehensive report of items expiring in the selected month.')}
            </p>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              {t('tools.expirationDate.generateReport', 'Generate Report')}
            </button>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              {t('tools.expirationDate.lossPreventionReport', 'Loss Prevention Report')}
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.expirationDate.trackExpiredInventoryValueAnd', 'Track expired inventory value and identify opportunities for improvement.')}
            </p>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              {t('tools.expirationDate.viewAnalytics', 'View Analytics')}
            </button>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              {t('tools.expirationDate.manufacturerReturns', 'Manufacturer Returns')}
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.expirationDate.generateReturnFormsForEligible', 'Generate return forms for eligible expired products.')}
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t('tools.expirationDate.createReturn', 'Create Return')}
            </button>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5 text-purple-500" />
              {t('tools.expirationDate.destructionRecords', 'Destruction Records')}
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.expirationDate.exportDocumentedDestructionRecordsFor', 'Export documented destruction records for compliance.')}
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              {t('tools.expirationDate.exportRecords', 'Export Records')}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-semibold">
                {editingItem ? t('tools.expirationDate.editItem', 'Edit Item') : t('tools.expirationDate.addExpiringItem', 'Add Expiring Item')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.ndc', 'NDC')}</label>
                  <input
                    type="text"
                    value={formData.ndc}
                    onChange={(e) => setFormData({ ...formData, ndc: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.expirationDate.xxxxxXxxxXx', 'XXXXX-XXXX-XX')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.lotNumber', 'Lot Number')}</label>
                  <input
                    type="text"
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.drugName', 'Drug Name')}</label>
                <input
                  type="text"
                  value={formData.drugName}
                  onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.strength', 'Strength')}</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.expirationDate.eG500mg', 'e.g., 500mg')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.dosageForm', 'Dosage Form')}</label>
                  <select
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="tablets">{t('tools.expirationDate.tablets', 'Tablets')}</option>
                    <option value="capsules">{t('tools.expirationDate.capsules', 'Capsules')}</option>
                    <option value="liquid">{t('tools.expirationDate.liquid', 'Liquid')}</option>
                    <option value="injection">{t('tools.expirationDate.injection', 'Injection')}</option>
                    <option value="cream">{t('tools.expirationDate.creamOintment', 'Cream/Ointment')}</option>
                    <option value="patch">Patch</option>
                    <option value="inhaler">{t('tools.expirationDate.inhaler', 'Inhaler')}</option>
                    <option value="suppository">{t('tools.expirationDate.suppository', 'Suppository')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.manufacturer', 'Manufacturer')}</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.expirationDate', 'Expiration Date')}</label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.location2', 'Location')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.expirationDate.eGShelfA3', 'e.g., Shelf A-3, Fridge')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.quantity2', 'Quantity')}</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.unit', 'Unit')}</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="tablets">{t('tools.expirationDate.tablets2', 'Tablets')}</option>
                    <option value="capsules">{t('tools.expirationDate.capsules2', 'Capsules')}</option>
                    <option value="ml">mL</option>
                    <option value="grams">{t('tools.expirationDate.grams', 'Grams')}</option>
                    <option value="units">{t('tools.expirationDate.units', 'Units')}</option>
                    <option value="each">{t('tools.expirationDate.each', 'Each')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.unitCost', 'Unit Cost ($)')}</label>
                  <input
                    type="number"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.expirationDate.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {t('tools.expirationDate.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? t('tools.expirationDate.update', 'Update') : t('tools.expirationDate.addItem2', 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpirationDateTool;
export { ExpirationDateTool };
