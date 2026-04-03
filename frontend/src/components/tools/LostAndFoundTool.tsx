'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  User,
  Package,
  CheckCircle,
  Clock,
  Phone,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface LostAndFoundToolProps {
  uiConfig?: UIConfig;
}

interface LostItem {
  id: string;
  itemDescription: string;
  category: ItemCategory;
  foundLocation: string;
  roomNumber: string;
  foundDate: string;
  foundTime: string;
  foundBy: string;
  storageLocation: string;
  status: ItemStatus;
  claimedBy: string;
  claimedDate: string;
  claimantContact: string;
  idVerified: boolean;
  value: string;
  notes: string;
  createdAt: string;
}

type ItemCategory = 'electronics' | 'clothing' | 'jewelry' | 'documents' | 'bags' | 'accessories' | 'other';
type ItemStatus = 'stored' | 'claimed' | 'disposed' | 'shipped' | 'pending-claim';

const ITEM_CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'documents', label: 'Documents' },
  { value: 'bags', label: 'Bags/Luggage' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

const ITEM_STATUSES: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'stored', label: 'Stored', color: 'blue' },
  { value: 'pending-claim', label: 'Pending Claim', color: 'yellow' },
  { value: 'claimed', label: 'Claimed', color: 'green' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'disposed', label: 'Disposed', color: 'gray' },
];

const lostItemColumns: ColumnConfig[] = [
  { key: 'id', header: 'Item ID', type: 'string' },
  { key: 'itemDescription', header: 'Description', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'foundLocation', header: 'Found At', type: 'string' },
  { key: 'foundDate', header: 'Date Found', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'storageLocation', header: 'Storage', type: 'string' },
  { key: 'claimedBy', header: 'Claimed By', type: 'string' },
];

const generateSampleItems = (): LostItem[] => {
  const today = new Date();
  return [
    {
      id: 'LF-001',
      itemDescription: 'Black iPhone 14 with blue case',
      category: 'electronics',
      foundLocation: 'Lobby - Seating Area',
      roomNumber: '',
      foundDate: today.toISOString().split('T')[0],
      foundTime: '09:30',
      foundBy: 'Maria Garcia',
      storageLocation: 'Front Desk Safe',
      status: 'stored',
      claimedBy: '',
      claimedDate: '',
      claimantContact: '',
      idVerified: false,
      value: 'High',
      notes: 'Guest called asking about lost phone',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'LF-002',
      itemDescription: 'Gold wedding ring',
      category: 'jewelry',
      foundLocation: 'Room 201',
      roomNumber: '201',
      foundDate: new Date(today.getTime() - 86400000).toISOString().split('T')[0],
      foundTime: '14:00',
      foundBy: 'James Wilson',
      storageLocation: 'Security Office Safe',
      status: 'pending-claim',
      claimedBy: 'John Smith',
      claimedDate: '',
      claimantContact: '+1 555-0101',
      idVerified: false,
      value: 'High',
      notes: 'Guest confirmed losing ring, coming to collect',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'LF-003',
      itemDescription: 'Blue umbrella',
      category: 'accessories',
      foundLocation: 'Restaurant',
      roomNumber: '',
      foundDate: new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0],
      foundTime: '20:15',
      foundBy: 'Restaurant Staff',
      storageLocation: 'Lost & Found Closet',
      status: 'stored',
      claimedBy: '',
      claimedDate: '',
      claimantContact: '',
      idVerified: false,
      value: 'Low',
      notes: '',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const LostAndFoundTool: React.FC<LostAndFoundToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const itemsData = useToolData<LostItem>(
    'lost-and-found',
    generateSampleItems(),
    lostItemColumns,
    { autoSave: true }
  );

  const items = itemsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ItemStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | ''>('');

  const [newItem, setNewItem] = useState<Partial<LostItem>>({
    itemDescription: '',
    category: 'other',
    foundLocation: '',
    roomNumber: '',
    foundDate: new Date().toISOString().split('T')[0],
    foundTime: new Date().toTimeString().slice(0, 5),
    foundBy: '',
    storageLocation: '',
    status: 'stored',
    value: 'Low',
    notes: '',
  });

  const handleAddItem = () => {
    if (!newItem.itemDescription || !newItem.foundLocation) return;
    const item: LostItem = {
      id: `LF-${Date.now().toString().slice(-6)}`,
      itemDescription: newItem.itemDescription || '',
      category: newItem.category as ItemCategory || 'other',
      foundLocation: newItem.foundLocation || '',
      roomNumber: newItem.roomNumber || '',
      foundDate: newItem.foundDate || new Date().toISOString().split('T')[0],
      foundTime: newItem.foundTime || new Date().toTimeString().slice(0, 5),
      foundBy: newItem.foundBy || '',
      storageLocation: newItem.storageLocation || '',
      status: 'stored',
      claimedBy: '',
      claimedDate: '',
      claimantContact: '',
      idVerified: false,
      value: newItem.value || 'Low',
      notes: newItem.notes || '',
      createdAt: new Date().toISOString(),
    };
    itemsData.addItem(item);
    setNewItem({
      itemDescription: '',
      category: 'other',
      foundLocation: '',
      roomNumber: '',
      foundDate: new Date().toISOString().split('T')[0],
      foundTime: new Date().toTimeString().slice(0, 5),
      foundBy: '',
      storageLocation: '',
      status: 'stored',
      value: 'Low',
      notes: '',
    });
    setShowForm(false);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    itemsData.updateItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Delete this item record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) itemsData.deleteItem(id);
  };

  const handleClaimItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setEditingItem({ ...item, status: 'pending-claim' });
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Data',
      message: 'Reset all items to sample data?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) itemsData.resetToDefault(generateSampleItems());
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!i.itemDescription.toLowerCase().includes(q) &&
            !i.foundLocation.toLowerCase().includes(q) &&
            !i.claimedBy.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && i.status !== filterStatus) return false;
      if (filterCategory && i.category !== filterCategory) return false;
      return true;
    });
  }, [items, searchQuery, filterStatus, filterCategory]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      stored: items.filter(i => i.status === 'stored').length,
      pendingClaim: items.filter(i => i.status === 'pending-claim').length,
      claimed: items.filter(i => i.status === 'claimed').length,
    };
  }, [items]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: ItemStatus) => {
    const colors: Record<string, string> = {
      stored: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      'pending-claim': isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      claimed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      shipped: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
      disposed: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
    };
    return colors[status] || colors.stored;
  };

  const renderForm = (item: Partial<LostItem>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<LostItem>) => setEditingItem({ ...editingItem!, ...updates })
      : (updates: Partial<LostItem>) => setNewItem({ ...newItem, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.itemDescription', 'Item Description *')}</label>
            <input type="text" value={item.itemDescription || ''} onChange={(e) => setData({ itemDescription: e.target.value })} placeholder={t('tools.lostAndFound.describeTheItem', 'Describe the item')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.category', 'Category')}</label>
            <select value={item.category || 'other'} onChange={(e) => setData({ category: e.target.value as ItemCategory })} className={inputClass}>
              {ITEM_CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.foundLocation', 'Found Location *')}</label>
            <input type="text" value={item.foundLocation || ''} onChange={(e) => setData({ foundLocation: e.target.value })} placeholder={t('tools.lostAndFound.whereWasItFound', 'Where was it found?')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.roomNumber', 'Room Number')}</label>
            <input type="text" value={item.roomNumber || ''} onChange={(e) => setData({ roomNumber: e.target.value })} placeholder={t('tools.lostAndFound.ifApplicable', 'If applicable')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.foundBy', 'Found By')}</label>
            <input type="text" value={item.foundBy || ''} onChange={(e) => setData({ foundBy: e.target.value })} placeholder={t('tools.lostAndFound.staffName', 'Staff name')} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.dateFound', 'Date Found')}</label>
            <input type="date" value={item.foundDate || ''} onChange={(e) => setData({ foundDate: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.timeFound', 'Time Found')}</label>
            <input type="time" value={item.foundTime || ''} onChange={(e) => setData({ foundTime: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.storageLocation', 'Storage Location')}</label>
            <input type="text" value={item.storageLocation || ''} onChange={(e) => setData({ storageLocation: e.target.value })} placeholder={t('tools.lostAndFound.whereStored', 'Where stored')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.value', 'Value')}</label>
            <select value={item.value || 'Low'} onChange={(e) => setData({ value: e.target.value })} className={inputClass}>
              <option value="Low">{t('tools.lostAndFound.low', 'Low')}</option>
              <option value="Medium">{t('tools.lostAndFound.medium', 'Medium')}</option>
              <option value="High">{t('tools.lostAndFound.high', 'High')}</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.status', 'Status')}</label>
                <select value={item.status || 'stored'} onChange={(e) => setData({ status: e.target.value as ItemStatus })} className={inputClass}>
                  {ITEM_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.claimedBy', 'Claimed By')}</label>
                <input type="text" value={item.claimedBy || ''} onChange={(e) => setData({ claimedBy: e.target.value })} placeholder={t('tools.lostAndFound.claimantName', 'Claimant name')} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.claimantContact', 'Claimant Contact')}</label>
                <input type="text" value={item.claimantContact || ''} onChange={(e) => setData({ claimantContact: e.target.value })} placeholder={t('tools.lostAndFound.phoneEmail', 'Phone/email')} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={item.idVerified || false} onChange={(e) => setData({ idVerified: e.target.checked })} className="w-4 h-4 text-[#0D9488] rounded" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.idVerified', 'ID Verified')}</span>
              </label>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lostAndFound.notes', 'Notes')}</label>
          <textarea value={item.notes || ''} onChange={(e) => setData({ notes: e.target.value })} placeholder={t('tools.lostAndFound.additionalNotes', 'Additional notes...')} rows={2} className={inputClass} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl"><Search className="w-6 h-6 text-[#0D9488]" /></div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lostAndFound.lostAndFound', 'Lost and Found')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lostAndFound.trackLostItemsAndManage', 'Track lost items and manage claims')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="lost-and-found" toolName="Lost And Found" />

              <SyncStatus isSynced={itemsData.isSynced} isSaving={itemsData.isSaving} lastSaved={itemsData.lastSaved} syncError={itemsData.syncError} onForceSync={() => itemsData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => itemsData.exportCSV({ filename: 'lost-and-found' })} onExportExcel={() => itemsData.exportExcel({ filename: 'lost-and-found' })} onExportJSON={() => itemsData.exportJSON({ filename: 'lost-and-found' })} onExportPDF={() => itemsData.exportPDF({ filename: 'lost-and-found', title: 'Lost and Found Log' })} onPrint={() => itemsData.print('Lost and Found')} onCopyToClipboard={() => itemsData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><RefreshCw className="w-4 h-4" />{t('tools.lostAndFound.reset', 'Reset')}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lostAndFound.totalItems', 'Total Items')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lostAndFound.inStorage', 'In Storage')}</p><p className="text-2xl font-bold text-blue-500">{stats.stored}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lostAndFound.pendingClaim', 'Pending Claim')}</p><p className="text-2xl font-bold text-yellow-500">{stats.pendingClaim}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lostAndFound.claimed', 'Claimed')}</p><p className="text-2xl font-bold text-green-500">{stats.claimed}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.lostAndFound.searchItems', 'Search items...')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ItemCategory | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.lostAndFound.allCategories', 'All Categories')}</option>
            {ITEM_CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ItemStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.lostAndFound.allStatuses', 'All Statuses')}</option>
            {ITEM_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"><Plus className="w-5 h-5" />{t('tools.lostAndFound.logItem', 'Log Item')}</button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lostAndFound.logFoundItem', 'Log Found Item')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newItem)}
            <button onClick={handleAddItem} disabled={!newItem.itemDescription || !newItem.foundLocation} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />{t('tools.lostAndFound.logItem2', 'Log Item')}</button>
          </div>
        )}

        {editingItem && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lostAndFound.editItem', 'Edit Item')}</h3>
              <button onClick={() => setEditingItem(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingItem, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateItem} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.lostAndFound.save', 'Save')}</button>
              <button onClick={() => setEditingItem(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.lostAndFound.cancel', 'Cancel')}</button>
            </div>
          </div>
        )}

        {/* Item List */}
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div key={item.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.itemDescription}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>{ITEM_STATUSES.find(s => s.value === item.status)?.label}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.id}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Package className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{ITEM_CATEGORIES.find(c => c.value === item.category)?.label}</span></div>
                    <div className="flex items-center gap-2"><MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.foundLocation}</span></div>
                    <div className="flex items-center gap-2"><Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{new Date(item.foundDate).toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-2"><MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.storageLocation || 'Not specified'}</span></div>
                  </div>
                  {item.claimedBy && <p className={`text-sm mt-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><User className="w-4 h-4" />Claimant: {item.claimedBy}</p>}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {item.status === 'stored' && (<button onClick={() => handleClaimItem(item.id)} className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20" title={t('tools.lostAndFound.processClaim', 'Process Claim')}><CheckCircle className="w-4 h-4" /></button>)}
                  <button onClick={() => setEditingItem(item)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
                  <button onClick={() => handleDeleteItem(item.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <Search className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.lostAndFound.noLostItemsFound', 'No lost items found.')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default LostAndFoundTool;
