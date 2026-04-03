'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  Edit2,
  X,
  Award,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface SubcontractorBidToolProps {
  uiConfig?: UIConfig;
}

// Types
type BidStatus = 'invited' | 'submitted' | 'under_review' | 'awarded' | 'declined' | 'rejected';

interface BidItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface Subcontractor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  trade: string;
  rating: number;
  prequalified: boolean;
  insuranceExpiry: string;
  licenseNumber: string;
}

interface Bid {
  id: string;
  projectName: string;
  projectNumber: string;
  scope: string;
  subcontractorId: string;
  subcontractor: Subcontractor;
  invitedDate: string;
  dueDate: string;
  submittedDate: string;
  status: BidStatus;
  bidAmount: number;
  items: BidItem[];
  alternates: string;
  exclusions: string;
  leadTime: string;
  validityPeriod: number;
  notes: string;
  evaluationScore: number;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TRADES = [
  'General Contractor',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Roofing',
  'Flooring',
  'Painting',
  'Drywall',
  'Framing',
  'Concrete',
  'Masonry',
  'Landscaping',
  'Demolition',
  'Excavation',
  'Steel',
  'Glazing',
  'Fire Protection',
  'Insulation',
  'Millwork',
  'Other',
];

const STATUS_CONFIG: Record<BidStatus, { color: string; label: string }> = {
  invited: { color: 'bg-blue-100 text-blue-800', label: 'Invited' },
  submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
  under_review: { color: 'bg-purple-100 text-purple-800', label: 'Under Review' },
  awarded: { color: 'bg-green-100 text-green-800', label: 'Awarded' },
  declined: { color: 'bg-gray-100 text-gray-800', label: 'Declined' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
};

// Column configuration
const BID_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'scope', header: 'Scope', type: 'string' },
  { key: 'subcontractorName', header: 'Subcontractor', type: 'string' },
  { key: 'bidAmount', header: 'Bid Amount', type: 'currency' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'evaluationScore', header: 'Score', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const SubcontractorBidTool: React.FC<SubcontractorBidToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: bids,
    addItem: addBid,
    updateItem: updateBid,
    deleteItem: deleteBid,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<Bid>('subcontractor-bids', [], BID_COLUMNS);

  const {
    data: subcontractors,
    addItem: addSubcontractor,
    updateItem: updateSubcontractor,
    deleteItem: deleteSubcontractor,
  } = useToolData<Subcontractor>('subcontractors', [], []);

  // UI State
  const [activeTab, setActiveTab] = useState<'bids' | 'subcontractors' | 'create-bid' | 'create-sub' | 'edit-bid'>('bids');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);

  // New Bid State
  const [newBid, setNewBid] = useState<Partial<Bid>>({
    projectName: '',
    projectNumber: '',
    scope: '',
    subcontractorId: '',
    invitedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    submittedDate: '',
    status: 'invited',
    bidAmount: 0,
    items: [],
    alternates: '',
    exclusions: '',
    leadTime: '',
    validityPeriod: 30,
    notes: '',
    evaluationScore: 0,
  });

  // New Subcontractor State
  const [newSub, setNewSub] = useState<Partial<Subcontractor>>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    trade: 'General Contractor',
    rating: 3,
    prequalified: false,
    insuranceExpiry: '',
    licenseNumber: '',
  });

  // Calculate totals
  const calculateBidTotal = (items: BidItem[]): number => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  // Add bid item
  const addBidItem = (bid: Partial<Bid>, setBid: Function) => {
    const newItem: BidItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      unit: 'ea',
      unitPrice: 0,
      totalPrice: 0,
    };
    const updatedItems = [...(bid.items || []), newItem];
    setBid({ ...bid, items: updatedItems, bidAmount: calculateBidTotal(updatedItems) });
  };

  // Update bid item
  const updateBidItem = (bid: Partial<Bid>, setBid: Function, itemId: string, field: keyof BidItem, value: any) => {
    const updatedItems = (bid.items || []).map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        updated.totalPrice = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    });
    setBid({ ...bid, items: updatedItems, bidAmount: calculateBidTotal(updatedItems) });
  };

  // Remove bid item
  const removeBidItem = (bid: Partial<Bid>, setBid: Function, itemId: string) => {
    const updatedItems = (bid.items || []).filter(item => item.id !== itemId);
    setBid({ ...bid, items: updatedItems, bidAmount: calculateBidTotal(updatedItems) });
  };

  // Save bid
  const handleSaveBid = () => {
    const sub = subcontractors.find(s => s.id === newBid.subcontractorId);
    if (!sub) return;

    const bid: Bid = {
      id: generateId(),
      projectName: newBid.projectName || '',
      projectNumber: newBid.projectNumber || '',
      scope: newBid.scope || '',
      subcontractorId: newBid.subcontractorId || '',
      subcontractor: sub,
      invitedDate: newBid.invitedDate || new Date().toISOString().split('T')[0],
      dueDate: newBid.dueDate || '',
      submittedDate: newBid.submittedDate || '',
      status: newBid.status || 'invited',
      bidAmount: newBid.bidAmount || 0,
      items: newBid.items || [],
      alternates: newBid.alternates || '',
      exclusions: newBid.exclusions || '',
      leadTime: newBid.leadTime || '',
      validityPeriod: newBid.validityPeriod || 30,
      notes: newBid.notes || '',
      evaluationScore: newBid.evaluationScore || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addBid(bid);
    setNewBid({
      projectName: '',
      projectNumber: '',
      scope: '',
      subcontractorId: '',
      invitedDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'invited',
      bidAmount: 0,
      items: [],
    });
    setActiveTab('bids');
  };

  // Update bid
  const handleUpdateBid = () => {
    if (!editingBid) return;
    updateBid(editingBid.id, {
      ...editingBid,
      updatedAt: new Date().toISOString(),
    });
    setEditingBid(null);
    setActiveTab('bids');
  };

  // Save subcontractor
  const handleSaveSubcontractor = () => {
    const sub: Subcontractor = {
      id: generateId(),
      companyName: newSub.companyName || '',
      contactName: newSub.contactName || '',
      email: newSub.email || '',
      phone: newSub.phone || '',
      trade: newSub.trade || 'General Contractor',
      rating: newSub.rating || 3,
      prequalified: newSub.prequalified || false,
      insuranceExpiry: newSub.insuranceExpiry || '',
      licenseNumber: newSub.licenseNumber || '',
    };
    addSubcontractor(sub);
    setNewSub({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      trade: 'General Contractor',
      rating: 3,
      prequalified: false,
    });
    setActiveTab('subcontractors');
  };

  // Filter bids
  const filteredBids = useMemo(() => {
    return bids.filter(bid => {
      const matchesSearch =
        bid.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.subcontractor.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || bid.status === filterStatus;
      const matchesTrade = filterTrade === 'all' || bid.subcontractor.trade === filterTrade;
      return matchesSearch && matchesStatus && matchesTrade;
    });
  }, [bids, searchTerm, filterStatus, filterTrade]);

  // Filter subcontractors
  const filteredSubcontractors = useMemo(() => {
    return subcontractors.filter(sub => {
      const matchesSearch =
        sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.contactName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrade = filterTrade === 'all' || sub.trade === filterTrade;
      return matchesSearch && matchesTrade;
    });
  }, [subcontractors, searchTerm, filterTrade]);

  // Stats
  const stats = useMemo(() => {
    const awardedBids = bids.filter(b => b.status === 'awarded');
    const pendingBids = bids.filter(b => b.status === 'submitted' || b.status === 'under_review');
    return {
      totalBids: bids.length,
      totalSubcontractors: subcontractors.length,
      awardedValue: awardedBids.reduce((sum, b) => sum + b.bidAmount, 0),
      pendingBids: pendingBids.length,
      avgBidAmount: bids.length > 0 ? bids.reduce((sum, b) => sum + b.bidAmount, 0) / bids.length : 0,
    };
  }, [bids, subcontractors]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv':
        exportCSV({ filename: 'subcontractor-bids' });
        break;
      case 'excel':
        exportExcel({ filename: 'subcontractor-bids' });
        break;
      case 'json':
        exportJSON({ filename: 'subcontractor-bids' });
        break;
      case 'pdf':
        await exportPDF({ filename: 'subcontractor-bids', title: 'Subcontractor Bids' });
        break;
    }
  };

  // Render star rating
  const renderStarRating = (rating: number, editable: boolean = false, onChange?: (r: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!editable}
          onClick={() => editable && onChange?.(star)}
          className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Users className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.subcontractorBid.subcontractorBidTracking', 'Subcontractor Bid Tracking')}</h1>
            <p className="text-gray-500">{t('tools.subcontractorBid.manageSubcontractorBidsAndEvaluations', 'Manage subcontractor bids and evaluations')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="subcontractor-bid" toolName="Subcontractor Bid" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onSync={forceSync}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.subcontractorBid.totalBids', 'Total Bids')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBids}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.subcontractorBid.subcontractors', 'Subcontractors')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalSubcontractors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.subcontractorBid.awardedValue', 'Awarded Value')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.awardedValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.subcontractorBid.pendingReview', 'Pending Review')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingBids}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.subcontractorBid.avgBid', 'Avg Bid')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.avgBidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bids')}
          className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'bids' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.subcontractorBid.bids', 'Bids')}
        </button>
        <button
          onClick={() => setActiveTab('subcontractors')}
          className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'subcontractors' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.subcontractorBid.subcontractors2', 'Subcontractors')}
        </button>
        <button
          onClick={() => setActiveTab('create-bid')}
          className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'create-bid' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.subcontractorBid.newBid', 'New Bid')}
        </button>
        <button
          onClick={() => setActiveTab('create-sub')}
          className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'create-sub' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.subcontractorBid.addSubcontractor2', 'Add Subcontractor')}
        </button>
      </div>

      {/* Bids List */}
      {activeTab === 'bids' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.subcontractorBid.searchBids', 'Search bids...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">{t('tools.subcontractorBid.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterTrade}
              onChange={e => setFilterTrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">{t('tools.subcontractorBid.allTrades', 'All Trades')}</option>
              {TRADES.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredBids.map(bid => (
              <div key={bid.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === bid.id ? null : bid.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bid.projectName}</h3>
                        <p className="text-sm text-gray-500">{bid.subcontractor.companyName} - {bid.scope}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(bid.bidAmount)}</p>
                        <p className="text-sm text-gray-500">Due: {formatDate(bid.dueDate)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[bid.status].color}`}>
                        {STATUS_CONFIG[bid.status].label}
                      </span>
                      {expandedId === bid.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === bid.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.subcontractorBid.trade', 'Trade')}</p>
                        <p className="font-medium">{bid.subcontractor.trade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.subcontractorBid.invited', 'Invited')}</p>
                        <p className="font-medium">{formatDate(bid.invitedDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.subcontractorBid.leadTime', 'Lead Time')}</p>
                        <p className="font-medium">{bid.leadTime || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.subcontractorBid.rating', 'Rating')}</p>
                        {renderStarRating(bid.subcontractor.rating)}
                      </div>
                    </div>

                    {bid.exclusions && (
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.subcontractorBid.exclusions', 'Exclusions')}</p>
                        <p className="text-sm text-gray-700">{bid.exclusions}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBid(bid);
                          setActiveTab('edit-bid');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.subcontractorBid.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => updateBid(bid.id, { status: 'awarded' })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                      >
                        <Award className="w-4 h-4" />
                        {t('tools.subcontractorBid.award', 'Award')}
                      </button>
                      <button
                        onClick={() => deleteBid(bid.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredBids.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.subcontractorBid.noBidsFound', 'No bids found')}</h3>
                <p className="text-gray-500 mt-1">{t('tools.subcontractorBid.createANewBidInvitation', 'Create a new bid invitation')}</p>
                <button
                  onClick={() => setActiveTab('create-bid')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {t('tools.subcontractorBid.createBid', 'Create Bid')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subcontractors List */}
      {activeTab === 'subcontractors' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.subcontractorBid.searchSubcontractors', 'Search subcontractors...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={filterTrade}
              onChange={e => setFilterTrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">{t('tools.subcontractorBid.allTrades2', 'All Trades')}</option>
              {TRADES.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubcontractors.map(sub => (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{sub.companyName}</h3>
                    <p className="text-sm text-gray-500">{sub.trade}</p>
                  </div>
                  {sub.prequalified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {t('tools.subcontractorBid.prequalified2', 'Prequalified')}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    {sub.contactName}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {sub.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {sub.phone}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  {renderStarRating(sub.rating)}
                  <button
                    onClick={() => deleteSubcontractor(sub.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSubcontractors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.subcontractorBid.noSubcontractorsFound', 'No subcontractors found')}</h3>
              <button
                onClick={() => setActiveTab('create-sub')}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                {t('tools.subcontractorBid.addSubcontractor3', 'Add Subcontractor')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Bid */}
      {activeTab === 'create-bid' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('tools.subcontractorBid.newBidRequest', 'New Bid Request')}</h2>
            <button onClick={() => setActiveTab('bids')} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.projectName', 'Project Name')}</label>
              <input
                type="text"
                value={newBid.projectName}
                onChange={e => setNewBid({ ...newBid, projectName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.scopeOfWork', 'Scope of Work')}</label>
              <input
                type="text"
                value={newBid.scope}
                onChange={e => setNewBid({ ...newBid, scope: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.subcontractor', 'Subcontractor')}</label>
              <select
                value={newBid.subcontractorId}
                onChange={e => setNewBid({ ...newBid, subcontractorId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">{t('tools.subcontractorBid.selectSubcontractor', 'Select Subcontractor')}</option>
                {subcontractors.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.companyName} ({sub.trade})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.dueDate', 'Due Date')}</label>
              <input
                type="date"
                value={newBid.dueDate}
                onChange={e => setNewBid({ ...newBid, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.bidAmount', 'Bid Amount')}</label>
              <input
                type="number"
                value={newBid.bidAmount}
                onChange={e => setNewBid({ ...newBid, bidAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.status', 'Status')}</label>
              <select
                value={newBid.status}
                onChange={e => setNewBid({ ...newBid, status: e.target.value as BidStatus })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.exclusions2', 'Exclusions')}</label>
            <textarea
              value={newBid.exclusions}
              onChange={e => setNewBid({ ...newBid, exclusions: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setActiveTab('bids')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('tools.subcontractorBid.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSaveBid}
              disabled={!newBid.subcontractorId}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {t('tools.subcontractorBid.saveBid', 'Save Bid')}
            </button>
          </div>
        </div>
      )}

      {/* Edit Bid */}
      {activeTab === 'edit-bid' && editingBid && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('tools.subcontractorBid.editBid', 'Edit Bid')}</h2>
            <button onClick={() => { setActiveTab('bids'); setEditingBid(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.status2', 'Status')}</label>
              <select
                value={editingBid.status}
                onChange={e => setEditingBid({ ...editingBid, status: e.target.value as BidStatus })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.bidAmount2', 'Bid Amount')}</label>
              <input
                type="number"
                value={editingBid.bidAmount}
                onChange={e => setEditingBid({ ...editingBid, bidAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.evaluationScore0100', 'Evaluation Score (0-100)')}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editingBid.evaluationScore}
                onChange={e => setEditingBid({ ...editingBid, evaluationScore: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.leadTime2', 'Lead Time')}</label>
              <input
                type="text"
                value={editingBid.leadTime}
                onChange={e => setEditingBid({ ...editingBid, leadTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={t('tools.subcontractorBid.eG23Weeks', 'e.g., 2-3 weeks')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setActiveTab('bids'); setEditingBid(null); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('tools.subcontractorBid.cancel2', 'Cancel')}
            </button>
            <button
              onClick={handleUpdateBid}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Save className="w-4 h-4" />
              {t('tools.subcontractorBid.updateBid', 'Update Bid')}
            </button>
          </div>
        </div>
      )}

      {/* Create Subcontractor */}
      {activeTab === 'create-sub' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('tools.subcontractorBid.addSubcontractor', 'Add Subcontractor')}</h2>
            <button onClick={() => setActiveTab('subcontractors')} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.companyName', 'Company Name')}</label>
              <input
                type="text"
                value={newSub.companyName}
                onChange={e => setNewSub({ ...newSub, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.trade2', 'Trade')}</label>
              <select
                value={newSub.trade}
                onChange={e => setNewSub({ ...newSub, trade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {TRADES.map(trade => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.contactName', 'Contact Name')}</label>
              <input
                type="text"
                value={newSub.contactName}
                onChange={e => setNewSub({ ...newSub, contactName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.email', 'Email')}</label>
              <input
                type="email"
                value={newSub.email}
                onChange={e => setNewSub({ ...newSub, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.phone', 'Phone')}</label>
              <input
                type="tel"
                value={newSub.phone}
                onChange={e => setNewSub({ ...newSub, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.licenseNumber', 'License Number')}</label>
              <input
                type="text"
                value={newSub.licenseNumber}
                onChange={e => setNewSub({ ...newSub, licenseNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.subcontractorBid.rating2', 'Rating')}</label>
              {renderStarRating(newSub.rating || 3, true, r => setNewSub({ ...newSub, rating: r }))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prequalified"
                checked={newSub.prequalified}
                onChange={e => setNewSub({ ...newSub, prequalified: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <label htmlFor="prequalified" className="text-sm font-medium text-gray-700">{t('tools.subcontractorBid.prequalified', 'Prequalified')}</label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setActiveTab('subcontractors')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('tools.subcontractorBid.cancel3', 'Cancel')}
            </button>
            <button
              onClick={handleSaveSubcontractor}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Save className="w-4 h-4" />
              {t('tools.subcontractorBid.saveSubcontractor', 'Save Subcontractor')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorBidTool;
