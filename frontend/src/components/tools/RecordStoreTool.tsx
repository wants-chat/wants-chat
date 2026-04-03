'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Disc3,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Headphones,
  Music,
  FileText,
  Truck,
  DollarSign,
  Star,
  Clock,
  Tag,
  Filter,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  Archive,
  ListChecks,
  Mic2,
  Store,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface RecordStoreToolProps {
  uiConfig?: UIConfig;
}

// Types
type RecordCondition = 'M' | 'NM' | 'VG+' | 'VG' | 'G+' | 'G' | 'F' | 'P';
type RecordFormat = 'LP' | '7"' | '10"' | '12"' | 'EP' | 'Box Set' | 'Picture Disc' | 'Colored Vinyl';
type RecordStatus = 'in_stock' | 'sold' | 'on_hold' | 'consignment';
type TabType = 'inventory' | 'wantlist' | 'intake' | 'rsd' | 'preorders' | 'listening' | 'performances' | 'consignment' | 'orders';

interface Record {
  id: string;
  artist: string;
  title: string;
  format: RecordFormat;
  label: string;
  catalogNumber: string;
  condition: RecordCondition;
  sleeveCondition: RecordCondition;
  genre: string;
  price: number;
  cost: number;
  isNew: boolean;
  status: RecordStatus;
  notes: string;
  pricingResearch: string;
  dateAdded: string;
  dateSold?: string;
  consignorId?: string;
  location: string;
}

interface WantListItem {
  id: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  artist: string;
  title: string;
  format: RecordFormat;
  maxPrice: number;
  notes: string;
  dateAdded: string;
  fulfilled: boolean;
}

interface IntakeItem {
  id: string;
  type: 'buy' | 'trade';
  customerName: string;
  customerContact: string;
  items: {
    artist: string;
    title: string;
    format: RecordFormat;
    condition: RecordCondition;
    offeredPrice: number;
  }[];
  totalOffered: number;
  status: 'pending' | 'accepted' | 'declined';
  notes: string;
  dateSubmitted: string;
}

interface RSDItem {
  id: string;
  artist: string;
  title: string;
  format: RecordFormat;
  releaseDate: string;
  quantityOrdered: number;
  quantityReceived: number;
  price: number;
  customerHolds: string[];
  notes: string;
}

interface PreOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  artist: string;
  title: string;
  format: RecordFormat;
  releaseDate: string;
  price: number;
  depositPaid: number;
  status: 'pending' | 'ordered' | 'received' | 'picked_up' | 'cancelled';
  notes: string;
  dateOrdered: string;
}

interface ListeningSession {
  id: string;
  station: number;
  recordId?: string;
  artist: string;
  title: string;
  startTime: string;
  endTime?: string;
  customerName?: string;
  notes: string;
}

interface Performance {
  id: string;
  artist: string;
  date: string;
  time: string;
  duration: number;
  type: 'album_release' | 'signing' | 'live_set' | 'dj_set' | 'workshop';
  description: string;
  expectedAttendance: number;
  equipmentNeeded: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

interface Consignor {
  id: string;
  name: string;
  contact: string;
  email: string;
  commissionRate: number;
  records: string[];
  totalSales: number;
  amountOwed: number;
  dateJoined: string;
  notes: string;
}

interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: {
    recordId: string;
    artist: string;
    title: string;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  dateOrdered: string;
  dateShipped?: string;
  notes: string;
}

const GENRES = [
  'Rock', 'Jazz', 'Blues', 'Soul', 'Funk', 'Hip-Hop', 'Electronic', 'Classical',
  'Country', 'Folk', 'Reggae', 'Punk', 'Metal', 'Pop', 'R&B', 'World', 'Soundtrack', 'Other'
];

const CONDITIONS: { value: RecordCondition; label: string; description: string }[] = [
  { value: 'M', label: 'Mint', description: 'Perfect, unplayed condition' },
  { value: 'NM', label: 'Near Mint', description: 'Nearly perfect, minimal signs of handling' },
  { value: 'VG+', label: 'Very Good Plus', description: 'Shows some signs of play, light surface noise' },
  { value: 'VG', label: 'Very Good', description: 'Surface noise evident, light scratches' },
  { value: 'G+', label: 'Good Plus', description: 'Plays through without skipping' },
  { value: 'G', label: 'Good', description: 'Significant wear, still plays' },
  { value: 'F', label: 'Fair', description: 'Heavy wear, may skip' },
  { value: 'P', label: 'Poor', description: 'Barely playable' }
];

const FORMATS: RecordFormat[] = ['LP', '7"', '10"', '12"', 'EP', 'Box Set', 'Picture Disc', 'Colored Vinyl'];

// Column configuration for export functionality
const RECORD_COLUMNS: ColumnConfig[] = [
  { key: 'artist', header: 'Artist', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'format', header: 'Format', type: 'string' },
  { key: 'label', header: 'Label', type: 'string' },
  { key: 'catalogNumber', header: 'Catalog #', type: 'string' },
  { key: 'condition', header: 'Record Condition', type: 'string' },
  { key: 'sleeveCondition', header: 'Sleeve Condition', type: 'string' },
  { key: 'genre', header: 'Genre', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'isNew', header: 'New/Sealed', type: 'boolean' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'pricingResearch', header: 'Pricing Research', type: 'string' },
  { key: 'dateAdded', header: 'Date Added', type: 'date' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export const RecordStoreTool: React.FC<RecordStoreToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<RecordCondition | ''>('');
  const [statusFilter, setStatusFilter] = useState<RecordStatus | ''>('');
  const [isNewFilter, setIsNewFilter] = useState<boolean | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for backend persistence of records
  const {
    data: records,
    setData: setRecords,
    addItem: addRecord,
    updateItem: updateRecord,
    deleteItem: deleteRecord,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Record>('record-store', [], RECORD_COLUMNS);

  // Secondary data state (these still use localStorage for now)
  const [wantList, setWantList] = useState<WantListItem[]>([]);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>([]);
  const [rsdItems, setRsdItems] = useState<RSDItem[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [listeningSessions, setListeningSessions] = useState<ListeningSession[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);

  // Modal state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showWantListModal, setShowWantListModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showRsdModal, setShowRsdModal] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [showListeningModal, setShowListeningModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showConsignorModal, setShowConsignorModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Edit state
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [editingWantList, setEditingWantList] = useState<WantListItem | null>(null);
  const [editingIntake, setEditingIntake] = useState<IntakeItem | null>(null);
  const [editingRsd, setEditingRsd] = useState<RSDItem | null>(null);
  const [editingPreOrder, setEditingPreOrder] = useState<PreOrder | null>(null);
  const [editingListening, setEditingListening] = useState<ListeningSession | null>(null);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [editingConsignor, setEditingConsignor] = useState<Consignor | null>(null);
  const [editingOrder, setEditingOrder] = useState<OnlineOrder | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill artist name
      if (params.artist || params.artistName) {
        hasChanges = true;
      }

      // Prefill album/record title
      if (params.title || params.albumTitle || params.itemName) {
        hasChanges = true;
      }

      // Prefill price
      if (params.price || params.amount) {
        hasChanges = true;
      }

      // Prefill customer name
      if (params.customerName || params.name) {
        hasChanges = true;
      }

      // Prefill genre
      if (params.genre) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Load secondary data from localStorage (records are handled by useToolData hook)
  useEffect(() => {
    const savedData = localStorage.getItem('recordStoreTool_secondary');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWantList(parsed.wantList || []);
        setIntakeItems(parsed.intakeItems || []);
        setRsdItems(parsed.rsdItems || []);
        setPreOrders(parsed.preOrders || []);
        setListeningSessions(parsed.listeningSessions || []);
        setPerformances(parsed.performances || []);
        setConsignors(parsed.consignors || []);
        setOnlineOrders(parsed.onlineOrders || []);
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
  }, []);

  // Save secondary data to localStorage (records are handled by useToolData hook)
  useEffect(() => {
    const data = {
      wantList,
      intakeItems,
      rsdItems,
      preOrders,
      listeningSessions,
      performances,
      consignors,
      onlineOrders
    };
    localStorage.setItem('recordStoreTool_secondary', JSON.stringify(data));
  }, [wantList, intakeItems, rsdItems, preOrders, listeningSessions, performances, consignors, onlineOrders]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchQuery === '' ||
        record.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.catalogNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = genreFilter === '' || record.genre === genreFilter;
      const matchesCondition = conditionFilter === '' || record.condition === conditionFilter;
      const matchesStatus = statusFilter === '' || record.status === statusFilter;
      const matchesNew = isNewFilter === null || record.isNew === isNewFilter;

      return matchesSearch && matchesGenre && matchesCondition && matchesStatus && matchesNew;
    });
  }, [records, searchQuery, genreFilter, conditionFilter, statusFilter, isNewFilter]);

  // Stats
  const stats = useMemo(() => {
    const inStock = records.filter(r => r.status === 'in_stock');
    const totalValue = inStock.reduce((sum, r) => sum + r.price, 0);
    const totalCost = inStock.reduce((sum, r) => sum + r.cost, 0);
    const newRecords = inStock.filter(r => r.isNew).length;
    const usedRecords = inStock.filter(r => !r.isNew).length;
    const pendingWants = wantList.filter(w => !w.fulfilled).length;
    const pendingOrders = onlineOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const upcomingPerformances = performances.filter(p => p.status === 'scheduled' || p.status === 'confirmed').length;

    return {
      totalRecords: inStock.length,
      totalValue,
      totalCost,
      potentialProfit: totalValue - totalCost,
      newRecords,
      usedRecords,
      pendingWants,
      pendingOrders,
      upcomingPerformances
    };
  }, [records, wantList, onlineOrders, performances]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'wantlist', label: 'Want Lists', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'intake', label: 'Buy/Trade', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'rsd', label: 'RSD', icon: <Calendar className="w-4 h-4" /> },
    { id: 'preorders', label: 'Pre-Orders', icon: <Clock className="w-4 h-4" /> },
    { id: 'listening', label: 'Listening', icon: <Headphones className="w-4 h-4" /> },
    { id: 'performances', label: 'Events', icon: <Mic2 className="w-4 h-4" /> },
    { id: 'consignment', label: 'Consignment', icon: <Users className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <Truck className="w-4 h-4" /> }
  ];

  // Record Form
  const RecordForm = ({ record, onSave, onCancel }: { record: Record | null; onSave: (record: Record) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Record>>(record || {
      artist: '',
      title: '',
      format: 'LP',
      label: '',
      catalogNumber: '',
      condition: 'VG+',
      sleeveCondition: 'VG+',
      genre: '',
      price: 0,
      cost: 0,
      isNew: false,
      status: 'in_stock',
      notes: '',
      pricingResearch: '',
      location: ''
    });

    const handleSubmit = () => {
      if (!formData.artist || !formData.title) {
        setValidationMessage('Please fill in artist and title');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }

      const newRecord: Record = {
        id: record?.id || generateId(),
        artist: formData.artist || '',
        title: formData.title || '',
        format: formData.format || 'LP',
        label: formData.label || '',
        catalogNumber: formData.catalogNumber || '',
        condition: formData.condition || 'VG+',
        sleeveCondition: formData.sleeveCondition || 'VG+',
        genre: formData.genre || '',
        price: formData.price || 0,
        cost: formData.cost || 0,
        isNew: formData.isNew || false,
        status: formData.status || 'in_stock',
        notes: formData.notes || '',
        pricingResearch: formData.pricingResearch || '',
        dateAdded: record?.dateAdded || new Date().toISOString(),
        consignorId: formData.consignorId,
        location: formData.location || ''
      };

      onSave(newRecord);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {record ? t('tools.recordStore.editRecord', 'Edit Record') : t('tools.recordStore.addNewRecord', 'Add New Record')}
              </h2>
              <button onClick={onCancel} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.artist', 'Artist *')}</label>
                <input
                  type="text"
                  value={formData.artist || ''}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.title', 'Title *')}</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.format', 'Format')}</label>
                <select
                  value={formData.format || 'LP'}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as RecordFormat })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.genre', 'Genre')}</label>
                <select
                  value={formData.genre || ''}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.recordStore.selectGenre', 'Select Genre')}</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Label</label>
                <input
                  type="text"
                  value={formData.label || ''}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.catalog', 'Catalog #')}</label>
                <input
                  type="text"
                  value={formData.catalogNumber || ''}
                  onChange={(e) => setFormData({ ...formData, catalogNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.recordCondition', 'Record Condition')}</label>
                <select
                  value={formData.condition || 'VG+'}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as RecordCondition })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.value} - {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.sleeveCondition', 'Sleeve Condition')}</label>
                <select
                  value={formData.sleeveCondition || 'VG+'}
                  onChange={(e) => setFormData({ ...formData, sleeveCondition: e.target.value as RecordCondition })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.value} - {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.price', 'Price ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.cost', 'Cost ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost || ''}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.status', 'Status')}</label>
                <select
                  value={formData.status || 'in_stock'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RecordStatus })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="in_stock">{t('tools.recordStore.inStock', 'In Stock')}</option>
                  <option value="sold">{t('tools.recordStore.sold', 'Sold')}</option>
                  <option value="on_hold">{t('tools.recordStore.onHold', 'On Hold')}</option>
                  <option value="consignment">{t('tools.recordStore.consignment', 'Consignment')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.location', 'Location')}</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={t('tools.recordStore.eGBinA12', 'e.g., Bin A-12')}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew || false}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.newSealed', 'New/Sealed')}</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.pricingResearchNotes', 'Pricing Research Notes')}</label>
                <textarea
                  value={formData.pricingResearch || ''}
                  onChange={(e) => setFormData({ ...formData, pricingResearch: e.target.value })}
                  placeholder={t('tools.recordStore.discogsMedianEbaySoldListings', 'Discogs median, eBay sold listings, etc.')}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.recordStore.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
              >
                {record ? t('tools.recordStore.update', 'Update') : t('tools.recordStore.add', 'Add')} Record
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Want List Form
  const WantListForm = ({ item, onSave, onCancel }: { item: WantListItem | null; onSave: (item: WantListItem) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<WantListItem>>(item || {
      customerName: '',
      customerContact: '',
      artist: '',
      title: '',
      format: 'LP',
      maxPrice: 0,
      notes: '',
      fulfilled: false
    });

    const handleSubmit = () => {
      if (!formData.customerName || !formData.artist) {
        setValidationMessage('Please fill in customer name and artist');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }

      const newItem: WantListItem = {
        id: item?.id || generateId(),
        customerId: item?.customerId || generateId(),
        customerName: formData.customerName || '',
        customerContact: formData.customerContact || '',
        artist: formData.artist || '',
        title: formData.title || '',
        format: formData.format || 'LP',
        maxPrice: formData.maxPrice || 0,
        notes: formData.notes || '',
        dateAdded: item?.dateAdded || new Date().toISOString(),
        fulfilled: formData.fulfilled || false
      };

      onSave(newItem);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item ? t('tools.recordStore.editWantList', 'Edit Want List') : t('tools.recordStore.addToWantList', 'Add to Want List')}
              </h2>
              <button onClick={onCancel} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.customerName', 'Customer Name *')}</label>
                <input
                  type="text"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.contactPhoneEmail', 'Contact (Phone/Email)')}</label>
                <input
                  type="text"
                  value={formData.customerContact || ''}
                  onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.artist2', 'Artist *')}</label>
                <input
                  type="text"
                  value={formData.artist || ''}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.title2', 'Title')}</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.format2', 'Format')}</label>
                  <select
                    value={formData.format || 'LP'}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as RecordFormat })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.maxPrice', 'Max Price ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxPrice || ''}
                    onChange={(e) => setFormData({ ...formData, maxPrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recordStore.notes2', 'Notes')}</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.recordStore.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
              >
                {item ? t('tools.recordStore.update2', 'Update') : t('tools.recordStore.add2', 'Add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handlers - using useToolData hook functions
  const handleSaveRecord = (record: Record) => {
    if (editingRecord) {
      updateRecord(record.id, record);
    } else {
      addRecord(record);
    }
    setShowRecordModal(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this record?');
    if (confirmed) {
      deleteRecord(id);
    }
  };

  const handleSaveWantList = (item: WantListItem) => {
    if (editingWantList) {
      setWantList(wantList.map(w => w.id === item.id ? item : w));
    } else {
      setWantList([...wantList, item]);
    }
    setShowWantListModal(false);
    setEditingWantList(null);
  };

  const handleDeleteWantList = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this want list item?');
    if (confirmed) {
      setWantList(wantList.filter(w => w.id !== id));
    }
  };

  const handleFulfillWantList = (id: string) => {
    setWantList(wantList.map(w => w.id === id ? { ...w, fulfilled: true } : w));
  };

  const getConditionColor = (condition: RecordCondition) => {
    switch (condition) {
      case 'M': return 'text-green-500';
      case 'NM': return 'text-green-400';
      case 'VG+': return 'text-blue-500';
      case 'VG': return 'text-blue-400';
      case 'G+': return 'text-yellow-500';
      case 'G': return 'text-yellow-400';
      case 'F': return 'text-orange-500';
      case 'P': return 'text-red-500';
      default: return '';
    }
  };

  const getStatusBadge = (status: RecordStatus) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500/20 text-green-500';
      case 'sold': return 'bg-gray-500/20 text-gray-500';
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-500';
      case 'consignment': return 'bg-purple-500/20 text-purple-500';
      default: return '';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Disc3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.recordStoreManager', 'Record Store Manager')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.recordStore.vinylInventoryCustomerWantsAnd', 'Vinyl inventory, customer wants, and store operations')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <WidgetEmbedButton toolSlug="record-store" toolName="Record Store" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'record-store-inventory' })}
                  onExportExcel={() => exportExcel({ filename: 'record-store-inventory' })}
                  onExportJSON={() => exportJSON({ filename: 'record-store-inventory' })}
                  onExportPDF={() => exportPDF({
                    filename: 'record-store-inventory',
                    title: 'Record Store Inventory',
                    orientation: 'landscape'
                  })}
                  onPrint={() => print('Record Store Inventory')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={filteredRecords.length === 0}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">{t('tools.recordStore.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-[#0D9488]" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recordStore.inStock2', 'In Stock')}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalRecords}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stats.newRecords} new / {stats.usedRecords} used
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recordStore.totalValue', 'Total Value')}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalValue.toFixed(2)}</div>
                <div className={`text-xs text-green-500`}>
                  +${stats.potentialProfit.toFixed(2)} profit
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ListChecks className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recordStore.wantLists', 'Want Lists')}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingWants}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.recordStore.pendingRequests', 'pending requests')}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recordStore.orders', 'Orders')}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingOrders}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.recordStore.toFulfill', 'to fulfill')}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Mic2 className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recordStore.events', 'Events')}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.upcomingPerformances}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  upcoming
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div>
                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        placeholder={t('tools.recordStore.searchByArtistTitleLabel', 'Search by artist, title, label, catalog #...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.recordStore.allGenres', 'All Genres')}</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value as RecordCondition | '')}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.recordStore.allConditions', 'All Conditions')}</option>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.value} - {c.label}</option>)}
                  </select>
                  <select
                    value={isNewFilter === null ? '' : isNewFilter ? 'new' : 'used'}
                    onChange={(e) => setIsNewFilter(e.target.value === '' ? null : e.target.value === 'new')}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.recordStore.newUsed', 'New & Used')}</option>
                    <option value="new">{t('tools.recordStore.newOnly', 'New Only')}</option>
                    <option value="used">{t('tools.recordStore.usedOnly', 'Used Only')}</option>
                  </select>
                  <button
                    onClick={() => { setShowRecordModal(true); setEditingRecord(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.addRecord', 'Add Record')}
                  </button>
                </div>

                {/* Records List */}
                <div className="space-y-3">
                  {filteredRecords.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Disc3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.recordStore.noRecordsFoundAddYour', 'No records found. Add your first record to get started!')}</p>
                    </div>
                  ) : (
                    filteredRecords.map(record => (
                      <div
                        key={record.id}
                        className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {record.artist} - {record.title}
                              </h3>
                              {record.isNew && (
                                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded">{t('tools.recordStore.new', 'NEW')}</span>
                              )}
                              <span className={`px-2 py-0.5 text-xs rounded ${getStatusBadge(record.status)}`}>
                                {record.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span>{record.format}</span>
                                <span>{record.label}</span>
                                {record.catalogNumber && <span>#{record.catalogNumber}</span>}
                                <span>{record.genre}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>Record: <span className={getConditionColor(record.condition)}>{record.condition}</span></span>
                                <span>Sleeve: <span className={getConditionColor(record.sleeveCondition)}>{record.sleeveCondition}</span></span>
                                {record.location && <span>Location: {record.location}</span>}
                              </div>
                              {record.pricingResearch && (
                                <div className="text-xs italic">{record.pricingResearch}</div>
                              )}
                              {record.notes && (
                                <div className="text-xs">{record.notes}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${record.price.toFixed(2)}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Cost: ${record.cost.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditingRecord(record); setShowRecordModal(true); }}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-500'}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Want List Tab */}
            {activeTab === 'wantlist' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.customerWantLists', 'Customer Want Lists')}
                  </h3>
                  <button
                    onClick={() => { setShowWantListModal(true); setEditingWantList(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.addRequest', 'Add Request')}
                  </button>
                </div>

                <div className="space-y-3">
                  {wantList.filter(w => !w.fulfilled).length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.recordStore.noPendingWantListRequests', 'No pending want list requests.')}</p>
                    </div>
                  ) : (
                    wantList.filter(w => !w.fulfilled).map(item => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.artist} {item.title && `- ${item.title}`}
                            </h4>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div>Customer: {item.customerName}</div>
                              {item.customerContact && <div>Contact: {item.customerContact}</div>}
                              <div>Format: {item.format} | Max: ${item.maxPrice.toFixed(2)}</div>
                              {item.notes && <div className="text-xs mt-1">{item.notes}</div>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFulfillWantList(item.id)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30"
                              title={t('tools.recordStore.markAsFulfilled', 'Mark as Fulfilled')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingWantList(item); setShowWantListModal(true); }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWantList(item.id)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-500'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Fulfilled section */}
                {wantList.filter(w => w.fulfilled).length > 0 && (
                  <div className="mt-8">
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.recordStore.recentlyFulfilled', 'Recently Fulfilled')}
                    </h4>
                    <div className="space-y-2">
                      {wantList.filter(w => w.fulfilled).slice(0, 5).map(item => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} opacity-60`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              {item.artist} {item.title && `- ${item.title}`} ({item.customerName})
                            </span>
                            <Check className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Buy/Trade Intake Tab */}
            {activeTab === 'intake' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.buyTradeIntake', 'Buy/Trade Intake')}
                  </h3>
                  <button
                    onClick={() => { setValidationMessage('Intake form coming soon!'); setTimeout(() => setValidationMessage(null), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.newIntake', 'New Intake')}
                  </button>
                </div>
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.recordStore.trackCustomerCollectionsBeingBought', 'Track customer collections being bought or traded.')}</p>
                  <p className="text-sm mt-2">{t('tools.recordStore.recordDetailsOfferPricesAnd', 'Record details, offer prices, and approval status.')}</p>
                </div>
              </div>
            )}

            {/* Record Store Day Tab */}
            {activeTab === 'rsd' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.recordStoreDay', 'Record Store Day')}
                  </h3>
                  <button
                    onClick={() => { setValidationMessage('RSD form coming soon!'); setTimeout(() => setValidationMessage(null), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.addRsdItem', 'Add RSD Item')}
                  </button>
                </div>
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.recordStore.trackRecordStoreDayReleases', 'Track Record Store Day releases and customer holds.')}</p>
                  <p className="text-sm mt-2">{t('tools.recordStore.manageOrderQuantitiesReceivedInventory', 'Manage order quantities, received inventory, and reservations.')}</p>
                </div>
              </div>
            )}

            {/* Pre-Orders Tab */}
            {activeTab === 'preorders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.preOrders', 'Pre-Orders')}
                  </h3>
                  <button
                    onClick={() => { setValidationMessage('Pre-order form coming soon!'); setTimeout(() => setValidationMessage(null), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.newPreOrder', 'New Pre-Order')}
                  </button>
                </div>
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.recordStore.manageCustomerPreOrdersFor', 'Manage customer pre-orders for upcoming releases.')}</p>
                  <p className="text-sm mt-2">{t('tools.recordStore.trackDepositsReleaseDatesAnd', 'Track deposits, release dates, and pickup status.')}</p>
                </div>
              </div>
            )}

            {/* Listening Stations Tab */}
            {activeTab === 'listening' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.listeningStations', 'Listening Stations')}
                  </h3>
                  <button
                    onClick={() => { setValidationMessage('Listening session form coming soon!'); setTimeout(() => setValidationMessage(null), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.startSession', 'Start Session')}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map(station => (
                    <div
                      key={station}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <Headphones className="w-5 h-5 text-[#0D9488]" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Station {station}</h4>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recordStore.available', 'Available')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>{t('tools.recordStore.trackWhatRecordsAreBeing', 'Track what records are being auditioned at each listening station.')}</p>
                </div>
              </div>
            )}

            {/* Performances/Events Tab */}
            {activeTab === 'performances' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.inStoreEvents', 'In-Store Events')}
                  </h3>
                  <button
                    onClick={() => { setValidationMessage('Event form coming soon!'); setTimeout(() => setValidationMessage(null), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.scheduleEvent', 'Schedule Event')}
                  </button>
                </div>
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.recordStore.scheduleAndManageInStore', 'Schedule and manage in-store performances and events.')}</p>
                  <p className="text-sm mt-2">{t('tools.recordStore.albumReleasesArtistSigningsLive', 'Album releases, artist signings, live sets, and workshops.')}</p>
                </div>
              </div>
            )}

            {/* Consignment Tab */}
            {activeTab === 'consignment' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.consignmentManagement', 'Consignment Management')}
                  </h3>
                  <button
                    onClick={() => { setValidationMessage('Consignor form coming soon!'); setTimeout(() => setValidationMessage(null), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.addConsignor', 'Add Consignor')}
                  </button>
                </div>
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.recordStore.trackConsignmentSellersAndTheir', 'Track consignment sellers and their inventory.')}</p>
                  <p className="text-sm mt-2">{t('tools.recordStore.manageCommissionRatesSalesAnd', 'Manage commission rates, sales, and payouts.')}</p>
                </div>
              </div>
            )}

            {/* Online Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.recordStore.onlineOrderFulfillment', 'Online Order Fulfillment')}
                  </h3>
                  <button
                    onClick={() => { setValidationMessage('Order form coming soon!'); setTimeout(() => setValidationMessage(null), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.recordStore.addOrder', 'Add Order')}
                  </button>
                </div>
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.recordStore.trackOnlineOrdersFromReceipt', 'Track online orders from receipt to delivery.')}</p>
                  <p className="text-sm mt-2">{t('tools.recordStore.managePackingShippingAndTracking', 'Manage packing, shipping, and tracking information.')}</p>
                </div>
              </div>
            )}

            {/* Grading Reference */}
            <div className={`mt-8 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.recordStore.vinylGradingReference', 'Vinyl Grading Reference')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {CONDITIONS.map(c => (
                  <div key={c.value} className="flex items-start gap-2">
                    <span className={`font-bold ${getConditionColor(c.value)}`}>{c.value}</span>
                    <div>
                      <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>{c.label}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{c.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showRecordModal && (
        <RecordForm
          record={editingRecord}
          onSave={handleSaveRecord}
          onCancel={() => { setShowRecordModal(false); setEditingRecord(null); }}
        />
      )}
      {showWantListModal && (
        <WantListForm
          item={editingWantList}
          onSave={handleSaveWantList}
          onCancel={() => { setShowWantListModal(false); setEditingWantList(null); }}
        />
      )}

      {validationMessage && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span>{validationMessage}</span>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export default RecordStoreTool;
