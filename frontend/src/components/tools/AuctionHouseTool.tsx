'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  Users,
  Package,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  Image,
  Hash,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  FileText,
  Save,
  History,
  Percent,
  CreditCard,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface AuctionHouseToolProps {
  uiConfig?: UIConfig;
}

// Types
type TabType = 'dashboard' | 'consignors' | 'items' | 'auctions' | 'bidders' | 'settlements';
type AuctionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
type LotStatus = 'pending' | 'catalogued' | 'active' | 'sold' | 'unsold' | 'withdrawn';
type BidderStatus = 'registered' | 'approved' | 'suspended';
type SettlementStatus = 'pending' | 'processing' | 'completed' | 'disputed';

interface Consignor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  commissionRate: number;
  notes: string;
  createdAt: string;
}

interface AuctionItem {
  id: string;
  lotNumber: string;
  title: string;
  description: string;
  category: string;
  consignorId: string;
  estimateLow: number;
  estimateHigh: number;
  reservePrice: number;
  startingBid: number;
  hammerPrice: number | null;
  buyersPremium: number;
  status: LotStatus;
  auctionId: string | null;
  photoPlaceholder: string;
  condition: string;
  provenance: string;
  createdAt: string;
}

interface Auction {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: AuctionStatus;
  buyersPremiumRate: number;
  createdAt: string;
}

interface Bidder {
  id: string;
  paddleNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: BidderStatus;
  depositAmount: number;
  creditLimit: number;
  notes: string;
  createdAt: string;
}

interface Bid {
  id: string;
  auctionId: string;
  itemId: string;
  bidderId: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
}

interface Settlement {
  id: string;
  type: 'consignor' | 'buyer';
  referenceId: string;
  auctionId: string;
  itemIds: string[];
  subtotal: number;
  commission: number;
  buyersPremium: number;
  totalAmount: number;
  status: SettlementStatus;
  notes: string;
  createdAt: string;
  settledAt: string | null;
}

interface AuctionHouseData {
  consignors: Consignor[];
  items: AuctionItem[];
  auctions: Auction[];
  bidders: Bidder[];
  bids: Bid[];
  settlements: Settlement[];
  defaultBuyersPremiumRate: number;
  defaultCommissionRate: number;
}

const ITEM_CATEGORIES = [
  'Fine Art',
  'Antiques',
  'Jewelry',
  'Furniture',
  'Collectibles',
  'Decorative Arts',
  'Books & Manuscripts',
  'Wine & Spirits',
  'Automobiles',
  'Real Estate',
  'Other',
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Wrapper interface for storing AuctionHouseData with useToolData
interface AuctionDataWrapper {
  id: string;
  auctionData: AuctionHouseData;
}

// Column configurations for export (mainly for items as the primary exportable data)
const auctionItemColumns: ColumnConfig[] = [
  { key: 'lotNumber', header: 'Lot #', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'estimateLow', header: 'Est. Low', type: 'currency' },
  { key: 'estimateHigh', header: 'Est. High', type: 'currency' },
  { key: 'reservePrice', header: 'Reserve', type: 'currency' },
  { key: 'startingBid', header: 'Starting Bid', type: 'currency' },
  { key: 'hammerPrice', header: 'Hammer Price', type: 'currency' },
  { key: 'buyersPremium', header: "Buyer's Premium", type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
];

const getDefaultAuctionData = (): AuctionHouseData => ({
  consignors: [],
  items: [],
  auctions: [],
  bidders: [],
  bids: [],
  settlements: [],
  defaultBuyersPremiumRate: 25,
  defaultCommissionRate: 15,
});

const getDefaultWrappedData = (): AuctionDataWrapper[] => [{
  id: 'auction-house-main',
  auctionData: getDefaultAuctionData(),
}];

export const AuctionHouseTool: React.FC<AuctionHouseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use useToolData hook for backend sync with localStorage fallback
  const toolData = useToolData<AuctionDataWrapper>(
    'auction-house',
    getDefaultWrappedData(),
    auctionItemColumns,
    { autoSave: true }
  );

  // Extract sync status from toolData
  const { isSynced, isSaving, lastSaved, syncError, forceSync } = toolData;

  // Extract the actual auction data from the wrapper
  const data: AuctionHouseData = useMemo(() => {
    if (toolData.data.length > 0 && toolData.data[0]?.auctionData) {
      return toolData.data[0].auctionData;
    }
    return getDefaultAuctionData();
  }, [toolData.data]);

  // Helper to update the data through the hook
  const setData = (updater: AuctionHouseData | ((prev: AuctionHouseData) => AuctionHouseData)) => {
    toolData.setData((prev) => {
      const currentData = prev.length > 0 && prev[0]?.auctionData
        ? prev[0].auctionData
        : getDefaultAuctionData();
      const newData = typeof updater === 'function' ? updater(currentData) : updater;
      return [{
        id: 'auction-house-main',
        auctionData: newData,
      }];
    });
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill item name/title
      if (params.itemName || params.title || params.name) {
        // Could be used to pre-populate a new item form
        hasChanges = true;
      }

      // Prefill price/estimate
      if (params.price || params.amount || params.estimatedValue) {
        hasChanges = true;
      }

      // Prefill customer/consignor name
      if (params.customerName || params.consignorName) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter states
  const [itemStatusFilter, setItemStatusFilter] = useState<LotStatus | 'all'>('all');
  const [auctionStatusFilter, setAuctionStatusFilter] = useState<AuctionStatus | 'all'>('all');
  const [bidderStatusFilter, setBidderStatusFilter] = useState<BidderStatus | 'all'>('all');

  // Form visibility states
  const [showAddConsignor, setShowAddConsignor] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddAuction, setShowAddAuction] = useState(false);
  const [showAddBidder, setShowAddBidder] = useState(false);
  const [showAddBid, setShowAddBid] = useState(false);

  // Edit states
  const [editingConsignor, setEditingConsignor] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingAuction, setEditingAuction] = useState<string | null>(null);
  const [editingBidder, setEditingBidder] = useState<string | null>(null);

  // Selected item for bid tracking
  const [selectedItemForBids, setSelectedItemForBids] = useState<string | null>(null);

  // Computed values using useMemo
  const stats = useMemo(() => {
    const totalItems = data.items.length;
    const soldItems = data.items.filter(i => i.status === 'sold');
    const unsoldItems = data.items.filter(i => i.status === 'unsold');
    const activeAuctions = data.auctions.filter(a => a.status === 'live');
    const upcomingAuctions = data.auctions.filter(a => a.status === 'scheduled');
    const totalHammerValue = soldItems.reduce((sum, i) => sum + (i.hammerPrice || 0), 0);
    const totalBuyersPremium = soldItems.reduce((sum, i) => sum + i.buyersPremium, 0);
    const totalCommissions = soldItems.reduce((sum, i) => {
      const consignor = data.consignors.find(c => c.id === i.consignorId);
      const rate = consignor?.commissionRate || data.defaultCommissionRate;
      return sum + ((i.hammerPrice || 0) * rate / 100);
    }, 0);

    return {
      totalItems,
      soldItems: soldItems.length,
      unsoldItems: unsoldItems.length,
      activeAuctions: activeAuctions.length,
      upcomingAuctions: upcomingAuctions.length,
      totalHammerValue,
      totalBuyersPremium,
      totalCommissions,
      totalRevenue: totalBuyersPremium + totalCommissions,
      activeConsignors: data.consignors.length,
      registeredBidders: data.bidders.filter(b => b.status === 'approved').length,
    };
  }, [data]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return itemStatusFilter === 'all'
      ? data.items
      : data.items.filter(i => i.status === itemStatusFilter);
  }, [data.items, itemStatusFilter]);

  // Filtered auctions
  const filteredAuctions = useMemo(() => {
    return auctionStatusFilter === 'all'
      ? data.auctions
      : data.auctions.filter(a => a.status === auctionStatusFilter);
  }, [data.auctions, auctionStatusFilter]);

  // Filtered bidders
  const filteredBidders = useMemo(() => {
    return bidderStatusFilter === 'all'
      ? data.bidders
      : data.bidders.filter(b => b.status === bidderStatusFilter);
  }, [data.bidders, bidderStatusFilter]);

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'consignors', label: 'Consignors', icon: <Users className="w-4 h-4" /> },
    { id: 'items', label: 'Items', icon: <Package className="w-4 h-4" /> },
    { id: 'auctions', label: 'Auctions', icon: <Gavel className="w-4 h-4" /> },
    { id: 'bidders', label: 'Bidders', icon: <Users className="w-4 h-4" /> },
    { id: 'settlements', label: 'Settlements', icon: <CreditCard className="w-4 h-4" /> },
  ];

  // CRUD Operations for Consignors
  const addConsignor = (consignor: Omit<Consignor, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      consignors: [...prev.consignors, {
        ...consignor,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }]
    }));
    setShowAddConsignor(false);
  };

  const updateConsignor = (id: string, updates: Partial<Consignor>) => {
    setData(prev => ({
      ...prev,
      consignors: prev.consignors.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
    setEditingConsignor(null);
  };

  const deleteConsignor = (id: string) => {
    setData(prev => ({
      ...prev,
      consignors: prev.consignors.filter(c => c.id !== id)
    }));
  };

  // CRUD Operations for Items
  const addItem = (item: Omit<AuctionItem, 'id' | 'createdAt' | 'hammerPrice' | 'buyersPremium'>) => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, {
        ...item,
        id: generateId(),
        hammerPrice: null,
        buyersPremium: 0,
        createdAt: new Date().toISOString(),
      }]
    }));
    setShowAddItem(false);
  };

  const updateItem = (id: string, updates: Partial<AuctionItem>) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
      bids: prev.bids.filter(b => b.itemId !== id)
    }));
  };

  // Record hammer price and calculate buyer's premium
  const recordHammerPrice = (itemId: string, hammerPrice: number) => {
    const item = data.items.find(i => i.id === itemId);
    if (!item) return;

    const auction = data.auctions.find(a => a.id === item.auctionId);
    const premiumRate = auction?.buyersPremiumRate || data.defaultBuyersPremiumRate;
    const buyersPremium = hammerPrice * premiumRate / 100;

    // Update winning bid
    const highestBid = data.bids
      .filter(b => b.itemId === itemId)
      .sort((a, b) => b.amount - a.amount)[0];

    setData(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.id === itemId
          ? { ...i, hammerPrice, buyersPremium, status: 'sold' as LotStatus }
          : i
      ),
      bids: prev.bids.map(b =>
        b.id === highestBid?.id
          ? { ...b, isWinning: true }
          : b.itemId === itemId
            ? { ...b, isWinning: false }
            : b
      )
    }));
  };

  // Mark item as unsold
  const markAsUnsold = (itemId: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.id === itemId
          ? { ...i, status: 'unsold' as LotStatus, hammerPrice: null, buyersPremium: 0 }
          : i
      )
    }));
  };

  // CRUD Operations for Auctions
  const addAuction = (auction: Omit<Auction, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      auctions: [...prev.auctions, {
        ...auction,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }]
    }));
    setShowAddAuction(false);
  };

  const updateAuction = (id: string, updates: Partial<Auction>) => {
    setData(prev => ({
      ...prev,
      auctions: prev.auctions.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
    setEditingAuction(null);
  };

  const deleteAuction = (id: string) => {
    setData(prev => ({
      ...prev,
      auctions: prev.auctions.filter(a => a.id !== id),
      items: prev.items.map(i => i.auctionId === id ? { ...i, auctionId: null } : i)
    }));
  };

  // CRUD Operations for Bidders
  const addBidder = (bidder: Omit<Bidder, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      bidders: [...prev.bidders, {
        ...bidder,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }]
    }));
    setShowAddBidder(false);
  };

  const updateBidder = (id: string, updates: Partial<Bidder>) => {
    setData(prev => ({
      ...prev,
      bidders: prev.bidders.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
    setEditingBidder(null);
  };

  const deleteBidder = (id: string) => {
    setData(prev => ({
      ...prev,
      bidders: prev.bidders.filter(b => b.id !== id),
      bids: prev.bids.filter(b => b.bidderId !== id)
    }));
  };

  // Add Bid
  const addBid = (bid: Omit<Bid, 'id' | 'timestamp' | 'isWinning'>) => {
    setData(prev => ({
      ...prev,
      bids: [...prev.bids, {
        ...bid,
        id: generateId(),
        timestamp: new Date().toISOString(),
        isWinning: false,
      }]
    }));
    setShowAddBid(false);
  };

  // Get bids for an item
  const getBidsForItem = (itemId: string) => {
    return data.bids
      .filter(b => b.itemId === itemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Calculate consignor settlement
  const calculateConsignorSettlement = (consignorId: string, auctionId: string) => {
    const consignor = data.consignors.find(c => c.id === consignorId);
    if (!consignor) return null;

    const soldItems = data.items.filter(
      i => i.consignorId === consignorId &&
           i.auctionId === auctionId &&
           i.status === 'sold'
    );

    const subtotal = soldItems.reduce((sum, i) => sum + (i.hammerPrice || 0), 0);
    const commission = subtotal * consignor.commissionRate / 100;
    const totalAmount = subtotal - commission;

    return {
      consignor,
      items: soldItems,
      subtotal,
      commission,
      totalAmount,
    };
  };

  // Process settlement
  const processSettlement = (settlement: Omit<Settlement, 'id' | 'createdAt' | 'settledAt'>) => {
    setData(prev => ({
      ...prev,
      settlements: [...prev.settlements, {
        ...settlement,
        id: generateId(),
        createdAt: new Date().toISOString(),
        settledAt: null,
      }]
    }));
  };

  // Mark settlement as completed
  const completeSettlement = (settlementId: string) => {
    setData(prev => ({
      ...prev,
      settlements: prev.settlements.map(s =>
        s.id === settlementId
          ? { ...s, status: 'completed' as SettlementStatus, settledAt: new Date().toISOString() }
          : s
      )
    }));
  };

  // Helper functions
  const getConsignorName = (id: string) => {
    return data.consignors.find(c => c.id === id)?.name || 'Unknown';
  };

  const getAuctionName = (id: string | null) => {
    if (!id) return 'Unassigned';
    return data.auctions.find(a => a.id === id)?.name || 'Unknown';
  };

  const getBidderName = (id: string) => {
    const bidder = data.bidders.find(b => b.id === id);
    return bidder ? `${bidder.name} (#${bidder.paddleNumber})` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sold':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'active':
      case 'live':
      case 'registered':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
      case 'scheduled':
      case 'catalogued':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'unsold':
      case 'cancelled':
      case 'suspended':
      case 'withdrawn':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'processing':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'disputed':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} mb-6`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 rounded-xl">
                  <Gavel className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.auctionHouse.auctionHouseManager', 'Auction House Manager')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.auctionHouse.manageConsignmentsAuctionsBiddersAnd', 'Manage consignments, auctions, bidders, and settlements')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WidgetEmbedButton toolSlug="auction-house" toolName="Auction House" />

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
                  onExportCSV={() => exportToCSV(data.items, auctionItemColumns, { filename: 'auction-items' })}
                  onExportExcel={() => exportToExcel(data.items, auctionItemColumns, { filename: 'auction-items' })}
                  onExportJSON={() => exportToJSON(data.items, { filename: 'auction-items' })}
                  onExportPDF={async () => { await exportToPDF(data.items, auctionItemColumns, { filename: 'auction-items', title: 'Auction Items' }); }}
                  onPrint={() => printData(data.items, auctionItemColumns, { title: 'Auction Items' })}
                  onCopyToClipboard={async () => { copyUtil(data.items, auctionItemColumns, 'tab'); return true; }}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
          <div className={`flex overflow-x-auto border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <CardContent className="p-6">
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">{t('tools.auctionHouse.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.auctionHouse.totalItems', 'Total Items')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalItems}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.auctionHouse.soldItems', 'Sold Items')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      {stats.soldItems}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{t('tools.auctionHouse.unsoldItems', 'Unsold Items')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      {stats.unsoldItems}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{t('tools.auctionHouse.activeAuctions', 'Active Auctions')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      {stats.activeAuctions}
                    </div>
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.auctionHouse.totalHammerValue', 'Total Hammer Value')}</span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${stats.totalHammerValue.toLocaleString()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.auctionHouse.buyerSPremium', 'Buyer\'s Premium')}</span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${stats.totalBuyersPremium.toLocaleString()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{t('tools.auctionHouse.totalRevenue', 'Total Revenue')}</span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      ${stats.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.auctionHouse.activeConsignors', 'Active Consignors')}</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.activeConsignors}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.auctionHouse.approvedBidders', 'Approved Bidders')}</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.registeredBidders}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.auctionHouse.upcomingAuctions', 'Upcoming Auctions')}</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.upcomingAuctions}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.auctionHouse.totalCommissions', 'Total Commissions')}</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${stats.totalCommissions.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Default Settings */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.auctionHouse.defaultSettings', 'Default Settings')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.auctionHouse.defaultBuyerSPremiumRate', 'Default Buyer\'s Premium Rate (%)')}
                      </label>
                      <input
                        type="number"
                        value={data.defaultBuyersPremiumRate}
                        onChange={(e) => setData(prev => ({ ...prev, defaultBuyersPremiumRate: parseFloat(e.target.value) || 0 }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.auctionHouse.defaultCommissionRate', 'Default Commission Rate (%)')}
                      </label>
                      <input
                        type="number"
                        value={data.defaultCommissionRate}
                        onChange={(e) => setData(prev => ({ ...prev, defaultCommissionRate: parseFloat(e.target.value) || 0 }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Consignors Tab */}
            {activeTab === 'consignors' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddConsignor(!showAddConsignor)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.auctionHouse.addConsignor', 'Add Consignor')}
                  </button>
                </div>

                {showAddConsignor && (
                  <ConsignorForm
                    isDark={isDark}
                    defaultCommissionRate={data.defaultCommissionRate}
                    onSubmit={addConsignor}
                    onCancel={() => setShowAddConsignor(false)}
                  />
                )}

                {/* Consignor List */}
                <div className="space-y-4">
                  {data.consignors.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.auctionHouse.noConsignorsAddedYet', 'No consignors added yet')}
                    </p>
                  ) : (
                    data.consignors.map(consignor => (
                      <div
                        key={consignor.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        {editingConsignor === consignor.id ? (
                          <ConsignorForm
                            isDark={isDark}
                            defaultCommissionRate={data.defaultCommissionRate}
                            initialData={consignor}
                            onSubmit={(data) => updateConsignor(consignor.id, data)}
                            onCancel={() => setEditingConsignor(null)}
                            isEdit
                          />
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <div className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {consignor.name}
                              </div>
                              <div className={`text-sm space-y-1 mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {consignor.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {consignor.email}
                                  </div>
                                )}
                                {consignor.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {consignor.phone}
                                  </div>
                                )}
                                {consignor.address && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {consignor.address}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Percent className="w-4 h-4" />
                                  Commission Rate: {consignor.commissionRate}%
                                </div>
                                {consignor.notes && (
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {consignor.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {data.items.filter(i => i.consignorId === consignor.id).length} items
                              </span>
                              <button
                                onClick={() => setEditingConsignor(consignor.id)}
                                className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteConsignor(consignor.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-6">
                {/* Filter and Add */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <select
                      value={itemStatusFilter}
                      onChange={(e) => setItemStatusFilter(e.target.value as LotStatus | 'all')}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.auctionHouse.allItems', 'All Items')}</option>
                      <option value="pending">{t('tools.auctionHouse.pending', 'Pending')}</option>
                      <option value="catalogued">{t('tools.auctionHouse.catalogued', 'Catalogued')}</option>
                      <option value="active">{t('tools.auctionHouse.active', 'Active')}</option>
                      <option value="sold">{t('tools.auctionHouse.sold', 'Sold')}</option>
                      <option value="unsold">{t('tools.auctionHouse.unsold', 'Unsold')}</option>
                      <option value="withdrawn">{t('tools.auctionHouse.withdrawn', 'Withdrawn')}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddItem(!showAddItem)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.auctionHouse.addItem', 'Add Item')}
                  </button>
                </div>

                {showAddItem && (
                  <ItemForm
                    isDark={isDark}
                    consignors={data.consignors}
                    auctions={data.auctions}
                    onSubmit={addItem}
                    onCancel={() => setShowAddItem(false)}
                  />
                )}

                {/* Items List */}
                <div className="space-y-4">
                  {filteredItems.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.auctionHouse.noItemsFound', 'No items found')}
                    </p>
                  ) : (
                    filteredItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        {editingItem === item.id ? (
                          <ItemForm
                            isDark={isDark}
                            consignors={data.consignors}
                            auctions={data.auctions}
                            initialData={item}
                            onSubmit={(data) => updateItem(item.id, data)}
                            onCancel={() => setEditingItem(null)}
                            isEdit
                          />
                        ) : (
                          <div>
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    Lot #{item.lotNumber}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </span>
                                </div>
                                <div className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item.title}
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.category} | Consignor: {getConsignorName(item.consignorId)}
                                </div>
                                {item.description && (
                                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Estimate: ${item.estimateLow.toLocaleString()} - ${item.estimateHigh.toLocaleString()}
                                </div>
                                {item.reservePrice > 0 && (
                                  <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                    Reserve: ${item.reservePrice.toLocaleString()}
                                  </div>
                                )}
                                {item.hammerPrice !== null && (
                                  <div className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                    Hammer: ${item.hammerPrice.toLocaleString()}
                                  </div>
                                )}
                                {item.buyersPremium > 0 && (
                                  <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                    Premium: ${item.buyersPremium.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Item Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-600">
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Auction: {getAuctionName(item.auctionId)}
                              </div>
                              <div className="flex items-center gap-2">
                                {item.status === 'active' && (
                                  <>
                                    <button
                                      onClick={() => setSelectedItemForBids(selectedItemForBids === item.id ? null : item.id)}
                                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                                        isDark
                                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                                      }`}
                                    >
                                      <History className="w-4 h-4" />
                                      Bids ({getBidsForItem(item.id).length})
                                    </button>
                                    <button
                                      onClick={() => {
                                        const price = prompt('Enter hammer price:');
                                        if (price) recordHammerPrice(item.id, parseFloat(price));
                                      }}
                                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                                        isDark
                                          ? 'bg-green-600 hover:bg-green-700 text-white'
                                          : 'bg-green-500 hover:bg-green-600 text-white'
                                      }`}
                                    >
                                      <Gavel className="w-4 h-4" />
                                      {t('tools.auctionHouse.sold3', 'Sold')}
                                    </button>
                                    <button
                                      onClick={() => markAsUnsold(item.id)}
                                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                                        isDark
                                          ? 'bg-red-600 hover:bg-red-700 text-white'
                                          : 'bg-red-500 hover:bg-red-600 text-white'
                                      }`}
                                    >
                                      <X className="w-4 h-4" />
                                      {t('tools.auctionHouse.unsold3', 'Unsold')}
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setEditingItem(item.id)}
                                  className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Bid History */}
                            {selectedItemForBids === item.id && (
                              <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {t('tools.auctionHouse.bidHistory', 'Bid History')}
                                  </h4>
                                  <button
                                    onClick={() => setShowAddBid(true)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                                  >
                                    <Plus className="w-4 h-4" />
                                    {t('tools.auctionHouse.addBid', 'Add Bid')}
                                  </button>
                                </div>

                                {showAddBid && (
                                  <BidForm
                                    isDark={isDark}
                                    auctionId={item.auctionId || ''}
                                    itemId={item.id}
                                    bidders={data.bidders.filter(b => b.status === 'approved')}
                                    currentHighBid={getBidsForItem(item.id)[0]?.amount || item.startingBid}
                                    onSubmit={addBid}
                                    onCancel={() => setShowAddBid(false)}
                                  />
                                )}

                                <div className="space-y-2">
                                  {getBidsForItem(item.id).length === 0 ? (
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      No bids yet. Starting bid: ${item.startingBid.toLocaleString()}
                                    </p>
                                  ) : (
                                    getBidsForItem(item.id).map((bid, index) => (
                                      <div
                                        key={bid.id}
                                        className={`flex items-center justify-between p-2 rounded ${
                                          index === 0
                                            ? isDark ? 'bg-green-900/30' : 'bg-green-50'
                                            : isDark ? 'bg-gray-700' : 'bg-gray-50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {index === 0 && (
                                            <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                          )}
                                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            ${bid.amount.toLocaleString()}
                                          </span>
                                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            by {getBidderName(bid.bidderId)}
                                          </span>
                                        </div>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {new Date(bid.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Auctions Tab */}
            {activeTab === 'auctions' && (
              <div className="space-y-6">
                {/* Filter and Add */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <select
                      value={auctionStatusFilter}
                      onChange={(e) => setAuctionStatusFilter(e.target.value as AuctionStatus | 'all')}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.auctionHouse.allAuctions', 'All Auctions')}</option>
                      <option value="scheduled">{t('tools.auctionHouse.scheduled', 'Scheduled')}</option>
                      <option value="live">{t('tools.auctionHouse.live', 'Live')}</option>
                      <option value="completed">{t('tools.auctionHouse.completed', 'Completed')}</option>
                      <option value="cancelled">{t('tools.auctionHouse.cancelled', 'Cancelled')}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddAuction(!showAddAuction)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.auctionHouse.addAuction', 'Add Auction')}
                  </button>
                </div>

                {showAddAuction && (
                  <AuctionForm
                    isDark={isDark}
                    defaultBuyersPremiumRate={data.defaultBuyersPremiumRate}
                    onSubmit={addAuction}
                    onCancel={() => setShowAddAuction(false)}
                  />
                )}

                {/* Auctions List */}
                <div className="space-y-4">
                  {filteredAuctions.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.auctionHouse.noAuctionsFound', 'No auctions found')}
                    </p>
                  ) : (
                    filteredAuctions.map(auction => (
                      <div
                        key={auction.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        {editingAuction === auction.id ? (
                          <AuctionForm
                            isDark={isDark}
                            defaultBuyersPremiumRate={data.defaultBuyersPremiumRate}
                            initialData={auction}
                            onSubmit={(data) => updateAuction(auction.id, data)}
                            onCancel={() => setEditingAuction(null)}
                            isEdit
                          />
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {auction.name}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(auction.status)}`}>
                                  {auction.status}
                                </span>
                              </div>
                              <div className={`text-sm space-y-1 mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(auction.date).toLocaleDateString()} | {auction.startTime} - {auction.endTime}
                                </div>
                                {auction.location && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {auction.location}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Percent className="w-4 h-4" />
                                  Buyer's Premium: {auction.buyersPremiumRate}%
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  {data.items.filter(i => i.auctionId === auction.id).length} lots
                                </div>
                              </div>
                              {auction.description && (
                                <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {auction.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={auction.status}
                                onChange={(e) => updateAuction(auction.id, { status: e.target.value as AuctionStatus })}
                                className={`px-2 py-1 text-sm rounded border ${
                                  isDark
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="scheduled">{t('tools.auctionHouse.scheduled2', 'Scheduled')}</option>
                                <option value="live">{t('tools.auctionHouse.live2', 'Live')}</option>
                                <option value="completed">{t('tools.auctionHouse.completed2', 'Completed')}</option>
                                <option value="cancelled">{t('tools.auctionHouse.cancelled2', 'Cancelled')}</option>
                              </select>
                              <button
                                onClick={() => setEditingAuction(auction.id)}
                                className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteAuction(auction.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Bidders Tab */}
            {activeTab === 'bidders' && (
              <div className="space-y-6">
                {/* Filter and Add */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <select
                      value={bidderStatusFilter}
                      onChange={(e) => setBidderStatusFilter(e.target.value as BidderStatus | 'all')}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.auctionHouse.allBidders', 'All Bidders')}</option>
                      <option value="registered">{t('tools.auctionHouse.registered', 'Registered')}</option>
                      <option value="approved">{t('tools.auctionHouse.approved', 'Approved')}</option>
                      <option value="suspended">{t('tools.auctionHouse.suspended', 'Suspended')}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddBidder(!showAddBidder)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.auctionHouse.registerBidder', 'Register Bidder')}
                  </button>
                </div>

                {showAddBidder && (
                  <BidderForm
                    isDark={isDark}
                    existingPaddleNumbers={data.bidders.map(b => b.paddleNumber)}
                    onSubmit={addBidder}
                    onCancel={() => setShowAddBidder(false)}
                  />
                )}

                {/* Bidders List */}
                <div className="space-y-4">
                  {filteredBidders.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.auctionHouse.noBiddersFound', 'No bidders found')}
                    </p>
                  ) : (
                    filteredBidders.map(bidder => (
                      <div
                        key={bidder.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        {editingBidder === bidder.id ? (
                          <BidderForm
                            isDark={isDark}
                            existingPaddleNumbers={data.bidders.filter(b => b.id !== bidder.id).map(b => b.paddleNumber)}
                            initialData={bidder}
                            onSubmit={(data) => updateBidder(bidder.id, data)}
                            onCancel={() => setEditingBidder(null)}
                            isEdit
                          />
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-sm font-mono rounded ${
                                  isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  #{bidder.paddleNumber}
                                </span>
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {bidder.name}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(bidder.status)}`}>
                                  {bidder.status}
                                </span>
                              </div>
                              <div className={`text-sm space-y-1 mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {bidder.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {bidder.email}
                                  </div>
                                )}
                                {bidder.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {bidder.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-4">
                                  <span>Deposit: ${bidder.depositAmount.toLocaleString()}</span>
                                  <span>Credit Limit: ${bidder.creditLimit.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={bidder.status}
                                onChange={(e) => updateBidder(bidder.id, { status: e.target.value as BidderStatus })}
                                className={`px-2 py-1 text-sm rounded border ${
                                  isDark
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="registered">{t('tools.auctionHouse.registered2', 'Registered')}</option>
                                <option value="approved">{t('tools.auctionHouse.approved2', 'Approved')}</option>
                                <option value="suspended">{t('tools.auctionHouse.suspended2', 'Suspended')}</option>
                              </select>
                              <button
                                onClick={() => setEditingBidder(bidder.id)}
                                className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteBidder(bidder.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Settlements Tab */}
            {activeTab === 'settlements' && (
              <div className="space-y-6">
                {/* Settlement Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.auctionHouse.pending2', 'Pending')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      {data.settlements.filter(s => s.status === 'pending').length}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.auctionHouse.processing', 'Processing')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                      {data.settlements.filter(s => s.status === 'processing').length}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.auctionHouse.completed3', 'Completed')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      {data.settlements.filter(s => s.status === 'completed').length}
                    </div>
                  </div>
                </div>

                {/* Generate Settlement Section */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.auctionHouse.generateConsignorSettlement', 'Generate Consignor Settlement')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      id="settlement-consignor"
                      className={`px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.auctionHouse.selectConsignor', 'Select Consignor')}</option>
                      {data.consignors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      id="settlement-auction"
                      className={`px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.auctionHouse.selectAuction', 'Select Auction')}</option>
                      {data.auctions.filter(a => a.status === 'completed').map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const consignorId = (document.getElementById('settlement-consignor') as HTMLSelectElement).value;
                        const auctionId = (document.getElementById('settlement-auction') as HTMLSelectElement).value;
                        if (!consignorId || !auctionId) {
                          setValidationMessage('Please select both consignor and auction');
                          setTimeout(() => setValidationMessage(null), 3000);
                          return;
                        }
                        const settlement = calculateConsignorSettlement(consignorId, auctionId);
                        if (!settlement || settlement.items.length === 0) {
                          setValidationMessage('No sold items found for this consignor in this auction');
                          setTimeout(() => setValidationMessage(null), 3000);
                          return;
                        }
                        processSettlement({
                          type: 'consignor',
                          referenceId: consignorId,
                          auctionId,
                          itemIds: settlement.items.map(i => i.id),
                          subtotal: settlement.subtotal,
                          commission: settlement.commission,
                          buyersPremium: 0,
                          totalAmount: settlement.totalAmount,
                          status: 'pending',
                          notes: '',
                        });
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                      {t('tools.auctionHouse.generateSettlement', 'Generate Settlement')}
                    </button>
                  </div>
                </div>

                {/* Settlements List */}
                <div className="space-y-4">
                  {data.settlements.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.auctionHouse.noSettlementsCreatedYet', 'No settlements created yet')}
                    </p>
                  ) : (
                    data.settlements.map(settlement => (
                      <div
                        key={settlement.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                settlement.type === 'consignor'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {settlement.type === 'consignor' ? t('tools.auctionHouse.consignor', 'Consignor') : t('tools.auctionHouse.buyer', 'Buyer')}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(settlement.status)}`}>
                                {settlement.status}
                              </span>
                            </div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {settlement.type === 'consignor'
                                ? getConsignorName(settlement.referenceId)
                                : getBidderName(settlement.referenceId)}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Auction: {getAuctionName(settlement.auctionId)} | {settlement.itemIds.length} items
                            </div>
                            <div className={`text-sm mt-2 space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <div>Subtotal: ${settlement.subtotal.toLocaleString()}</div>
                              <div>Commission: ${settlement.commission.toLocaleString()}</div>
                              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Total Due: ${settlement.totalAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {settlement.status === 'pending' && (
                              <button
                                onClick={() => setData(prev => ({
                                  ...prev,
                                  settlements: prev.settlements.map(s =>
                                    s.id === settlement.id ? { ...s, status: 'processing' as SettlementStatus } : s
                                  )
                                }))}
                                className={`px-3 py-1.5 text-sm rounded-lg ${
                                  isDark
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                                }`}
                              >
                                {t('tools.auctionHouse.process', 'Process')}
                              </button>
                            )}
                            {settlement.status === 'processing' && (
                              <button
                                onClick={() => completeSettlement(settlement.id)}
                                className={`px-3 py-1.5 text-sm rounded-lg ${
                                  isDark
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                              >
                                {t('tools.auctionHouse.complete', 'Complete')}
                              </button>
                            )}
                            {settlement.status === 'completed' && settlement.settledAt && (
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Settled: {new Date(settlement.settledAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {validationMessage && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg shadow-lg text-sm">
          {validationMessage}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

// Form Components
interface ConsignorFormProps {
  isDark: boolean;
  defaultCommissionRate: number;
  initialData?: Consignor;
  onSubmit: (consignor: Omit<Consignor, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ConsignorForm = ({ isDark, defaultCommissionRate, initialData, onSubmit, onCancel, isEdit }: ConsignorFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [commissionRate, setCommissionRate] = useState(initialData?.commissionRate?.toString() || defaultCommissionRate.toString());
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({
      name,
      email,
      phone,
      address,
      commissionRate: parseFloat(commissionRate) || defaultCommissionRate,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tools.auctionHouse.consignorName', 'Consignor Name *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('tools.auctionHouse.email', 'Email')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('tools.auctionHouse.phone', 'Phone')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
          placeholder={t('tools.auctionHouse.commissionRate', 'Commission Rate (%)')}
          step="0.1"
          min="0"
          max="100"
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t('tools.auctionHouse.address', 'Address')}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('tools.auctionHouse.notes', 'Notes')}
        rows={2}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.auctionHouse.cancel', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? t('tools.auctionHouse.saveChanges', 'Save Changes') : t('tools.auctionHouse.addConsignor2', 'Add Consignor')}
        </button>
      </div>
    </form>
  );
};

interface ItemFormProps {
  isDark: boolean;
  consignors: Consignor[];
  auctions: Auction[];
  initialData?: AuctionItem;
  onSubmit: (item: Omit<AuctionItem, 'id' | 'createdAt' | 'hammerPrice' | 'buyersPremium'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ItemForm = ({ isDark, consignors, auctions, initialData, onSubmit, onCancel, isEdit }: ItemFormProps) => {
  const [lotNumber, setLotNumber] = useState(initialData?.lotNumber || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || ITEM_CATEGORIES[0]);
  const [consignorId, setConsignorId] = useState(initialData?.consignorId || '');
  const [estimateLow, setEstimateLow] = useState(initialData?.estimateLow?.toString() || '');
  const [estimateHigh, setEstimateHigh] = useState(initialData?.estimateHigh?.toString() || '');
  const [reservePrice, setReservePrice] = useState(initialData?.reservePrice?.toString() || '0');
  const [startingBid, setStartingBid] = useState(initialData?.startingBid?.toString() || '');
  const [status, setStatus] = useState<LotStatus>(initialData?.status || 'pending');
  const [auctionId, setAuctionId] = useState(initialData?.auctionId || '');
  const [photoPlaceholder, setPhotoPlaceholder] = useState(initialData?.photoPlaceholder || '');
  const [condition, setCondition] = useState(initialData?.condition || '');
  const [provenance, setProvenance] = useState(initialData?.provenance || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotNumber || !title || !consignorId) return;
    onSubmit({
      lotNumber,
      title,
      description,
      category,
      consignorId,
      estimateLow: parseFloat(estimateLow) || 0,
      estimateHigh: parseFloat(estimateHigh) || 0,
      reservePrice: parseFloat(reservePrice) || 0,
      startingBid: parseFloat(startingBid) || 0,
      status,
      auctionId: auctionId || null,
      photoPlaceholder,
      condition,
      provenance,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          placeholder={t('tools.auctionHouse.lotNumber', 'Lot Number *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('tools.auctionHouse.itemTitle', 'Item Title *')}
          className={`md:col-span-2 px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {ITEM_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={consignorId}
          onChange={(e) => setConsignorId(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        >
          <option value="">{t('tools.auctionHouse.selectConsignor2', 'Select Consignor *')}</option>
          {consignors.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={auctionId}
          onChange={(e) => setAuctionId(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">{t('tools.auctionHouse.assignToAuction', 'Assign to Auction')}</option>
          {auctions.filter(a => a.status !== 'completed' && a.status !== 'cancelled').map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('tools.auctionHouse.description', 'Description')}
        rows={2}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <input
          type="number"
          value={estimateLow}
          onChange={(e) => setEstimateLow(e.target.value)}
          placeholder={t('tools.auctionHouse.estimateLow', 'Estimate Low ($)')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={estimateHigh}
          onChange={(e) => setEstimateHigh(e.target.value)}
          placeholder={t('tools.auctionHouse.estimateHigh', 'Estimate High ($)')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={reservePrice}
          onChange={(e) => setReservePrice(e.target.value)}
          placeholder={t('tools.auctionHouse.reservePrice', 'Reserve Price ($)')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
          placeholder={t('tools.auctionHouse.startingBid', 'Starting Bid ($)')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LotStatus)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="pending">{t('tools.auctionHouse.pending3', 'Pending')}</option>
          <option value="catalogued">{t('tools.auctionHouse.catalogued2', 'Catalogued')}</option>
          <option value="active">{t('tools.auctionHouse.active2', 'Active')}</option>
          <option value="sold">{t('tools.auctionHouse.sold2', 'Sold')}</option>
          <option value="unsold">{t('tools.auctionHouse.unsold2', 'Unsold')}</option>
          <option value="withdrawn">{t('tools.auctionHouse.withdrawn2', 'Withdrawn')}</option>
        </select>
        <input
          type="text"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder={t('tools.auctionHouse.condition', 'Condition')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="text"
          value={photoPlaceholder}
          onChange={(e) => setPhotoPlaceholder(e.target.value)}
          placeholder={t('tools.auctionHouse.photoUrlPlaceholder', 'Photo URL (placeholder)')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <textarea
        value={provenance}
        onChange={(e) => setProvenance(e.target.value)}
        placeholder={t('tools.auctionHouse.provenance', 'Provenance')}
        rows={2}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.auctionHouse.cancel2', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? t('tools.auctionHouse.saveChanges2', 'Save Changes') : t('tools.auctionHouse.addItem2', 'Add Item')}
        </button>
      </div>
    </form>
  );
};

interface AuctionFormProps {
  isDark: boolean;
  defaultBuyersPremiumRate: number;
  initialData?: Auction;
  onSubmit: (auction: Omit<Auction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const AuctionForm = ({ isDark, defaultBuyersPremiumRate, initialData, onSubmit, onCancel, isEdit }: AuctionFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '');
  const [endTime, setEndTime] = useState(initialData?.endTime || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [status, setStatus] = useState<AuctionStatus>(initialData?.status || 'scheduled');
  const [buyersPremiumRate, setBuyersPremiumRate] = useState(initialData?.buyersPremiumRate?.toString() || defaultBuyersPremiumRate.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    onSubmit({
      name,
      description,
      date,
      startTime,
      endTime,
      location,
      status,
      buyersPremiumRate: parseFloat(buyersPremiumRate) || defaultBuyersPremiumRate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tools.auctionHouse.auctionName', 'Auction Name *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder={t('tools.auctionHouse.startTime', 'Start Time')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder={t('tools.auctionHouse.endTime', 'End Time')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('tools.auctionHouse.location', 'Location')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={buyersPremiumRate}
          onChange={(e) => setBuyersPremiumRate(e.target.value)}
          placeholder={t('tools.auctionHouse.buyerSPremiumRate', 'Buyer\'s Premium Rate (%)')}
          step="0.1"
          min="0"
          max="100"
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('tools.auctionHouse.description2', 'Description')}
        rows={2}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AuctionStatus)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="scheduled">{t('tools.auctionHouse.scheduled3', 'Scheduled')}</option>
          <option value="live">{t('tools.auctionHouse.live3', 'Live')}</option>
          <option value="completed">{t('tools.auctionHouse.completed4', 'Completed')}</option>
          <option value="cancelled">{t('tools.auctionHouse.cancelled3', 'Cancelled')}</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.auctionHouse.cancel3', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? t('tools.auctionHouse.saveChanges3', 'Save Changes') : t('tools.auctionHouse.addAuction2', 'Add Auction')}
        </button>
      </div>
    </form>
  );
};

interface BidderFormProps {
  isDark: boolean;
  existingPaddleNumbers: string[];
  initialData?: Bidder;
  onSubmit: (bidder: Omit<Bidder, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const BidderForm = ({ isDark, existingPaddleNumbers, initialData, onSubmit, onCancel, isEdit }: BidderFormProps) => {
  const [paddleNumber, setPaddleNumber] = useState(initialData?.paddleNumber || '');
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [status, setStatus] = useState<BidderStatus>(initialData?.status || 'registered');
  const [depositAmount, setDepositAmount] = useState(initialData?.depositAmount?.toString() || '0');
  const [creditLimit, setCreditLimit] = useState(initialData?.creditLimit?.toString() || '0');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paddleNumber || !name) return;
    if (!isEdit && existingPaddleNumbers.includes(paddleNumber)) {
      setValidationMessage('Paddle number already exists');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    onSubmit({
      paddleNumber,
      name,
      email,
      phone,
      address,
      status,
      depositAmount: parseFloat(depositAmount) || 0,
      creditLimit: parseFloat(creditLimit) || 0,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          value={paddleNumber}
          onChange={(e) => setPaddleNumber(e.target.value)}
          placeholder={t('tools.auctionHouse.paddleNumber', 'Paddle Number *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tools.auctionHouse.bidderName', 'Bidder Name *')}
          className={`md:col-span-2 px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('tools.auctionHouse.email2', 'Email')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('tools.auctionHouse.phone2', 'Phone')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t('tools.auctionHouse.address2', 'Address')}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BidderStatus)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="registered">{t('tools.auctionHouse.registered3', 'Registered')}</option>
          <option value="approved">{t('tools.auctionHouse.approved3', 'Approved')}</option>
          <option value="suspended">{t('tools.auctionHouse.suspended3', 'Suspended')}</option>
        </select>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder={t('tools.auctionHouse.depositAmount', 'Deposit Amount ($)')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          placeholder={t('tools.auctionHouse.creditLimit', 'Credit Limit ($)')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('tools.auctionHouse.notes2', 'Notes')}
        rows={2}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      {validationMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {validationMessage}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.auctionHouse.cancel4', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? t('tools.auctionHouse.saveChanges4', 'Save Changes') : t('tools.auctionHouse.registerBidder2', 'Register Bidder')}
        </button>
      </div>
    </form>
  );
};

interface BidFormProps {
  isDark: boolean;
  auctionId: string;
  itemId: string;
  bidders: Bidder[];
  currentHighBid: number;
  onSubmit: (bid: Omit<Bid, 'id' | 'timestamp' | 'isWinning'>) => void;
  onCancel: () => void;
}

const BidForm = ({ isDark, auctionId, itemId, bidders, currentHighBid, onSubmit, onCancel }: BidFormProps) => {
  const [bidderId, setBidderId] = useState('');
  const [amount, setAmount] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidderId || !amount) return;
    const bidAmount = parseFloat(amount);
    if (bidAmount <= currentHighBid) {
      setValidationMessage(`Bid must be higher than current high bid of $${currentHighBid.toLocaleString()}`);
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    onSubmit({
      auctionId,
      itemId,
      bidderId,
      amount: bidAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={bidderId}
          onChange={(e) => setBidderId(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        >
          <option value="">{t('tools.auctionHouse.selectBidder', 'Select Bidder *')}</option>
          {bidders.map(b => (
            <option key={b.id} value={b.id}>{b.name} (#{b.paddleNumber})</option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Bid Amount (min $${(currentHighBid + 1).toLocaleString()})`}
          min={currentHighBid + 1}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
      </div>
      {validationMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {validationMessage}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.auctionHouse.cancel5', 'Cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
        >
          {t('tools.auctionHouse.placeBid', 'Place Bid')}
        </button>
      </div>
    </form>
  );
};

export default AuctionHouseTool;
