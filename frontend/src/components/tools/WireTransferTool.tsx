import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Building2,
  Globe,
  ArrowRight,
  FileText,
  Shield,
  User,
  Calendar,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Loader2 } from 'lucide-react';

interface WireTransfer {
  id: string;
  referenceNumber: string;
  transferType: 'domestic' | 'international' | 'internal';
  senderName: string;
  senderAccount: string;
  senderBank: string;
  senderRoutingNumber: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  recipientRoutingNumber: string;
  recipientSwiftCode: string;
  recipientCountry: string;
  amount: number;
  currency: string;
  fees: number;
  exchangeRate: number;
  convertedAmount: number;
  purpose: string;
  memo: string;
  priority: 'standard' | 'express' | 'same_day';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'on_hold';
  complianceStatus: 'pending' | 'approved' | 'flagged' | 'rejected';
  ofacScreening: boolean;
  initiatedBy: string;
  approvedBy: string;
  requestedDate: string;
  processedDate: string;
  completedDate: string;
  notes: string;
  createdAt: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'referenceNumber', header: 'Reference #', width: 15 },
  { key: 'transferType', header: 'Type', width: 12 },
  { key: 'senderName', header: 'Sender', width: 15 },
  { key: 'recipientName', header: 'Recipient', width: 15 },
  { key: 'recipientCountry', header: 'Country', width: 12 },
  { key: 'amount', header: 'Amount', width: 12 },
  { key: 'currency', header: 'Currency', width: 8 },
  { key: 'fees', header: 'Fees', width: 10 },
  { key: 'priority', header: 'Priority', width: 10 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'complianceStatus', header: 'Compliance', width: 12 },
  { key: 'requestedDate', header: 'Requested', width: 12 },
  { key: 'completedDate', header: 'Completed', width: 12 },
];

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'Processing' },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
  on_hold: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'On Hold' },
};

const COMPLIANCE_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  flagged: { color: 'bg-orange-100 text-orange-800', label: 'Flagged' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
};

const PRIORITY_CONFIG = {
  standard: { color: 'bg-gray-100 text-gray-800', label: 'Standard' },
  express: { color: 'bg-blue-100 text-blue-800', label: 'Express' },
  same_day: { color: 'bg-purple-100 text-purple-800', label: 'Same Day' },
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN'];

export default function WireTransferTool() {
  const { t } = useTranslation();
  const {
    data: transfers,
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
  } = useToolData<WireTransfer>('wire-transfer-tool', [], COLUMNS);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'transfers' | 'new' | 'analytics'>('transfers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<WireTransfer | null>(null);

  const [formData, setFormData] = useState({
    transferType: 'domestic' as const,
    senderName: '',
    senderAccount: '',
    senderBank: '',
    senderRoutingNumber: '',
    recipientName: '',
    recipientAccount: '',
    recipientBank: '',
    recipientRoutingNumber: '',
    recipientSwiftCode: '',
    recipientCountry: 'USA',
    amount: 0,
    currency: 'USD',
    fees: 0,
    exchangeRate: 1,
    purpose: '',
    memo: '',
    priority: 'standard' as const,
    initiatedBy: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      transferType: 'domestic',
      senderName: '',
      senderAccount: '',
      senderBank: '',
      senderRoutingNumber: '',
      recipientName: '',
      recipientAccount: '',
      recipientBank: '',
      recipientRoutingNumber: '',
      recipientSwiftCode: '',
      recipientCountry: 'USA',
      amount: 0,
      currency: 'USD',
      fees: 0,
      exchangeRate: 1,
      purpose: '',
      memo: '',
      priority: 'standard',
      initiatedBy: '',
      notes: '',
    });
    setEditingTransfer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const convertedAmount = formData.amount * formData.exchangeRate;
    const fees = formData.priority === 'same_day' ? 50 : formData.priority === 'express' ? 25 : 15;

    if (editingTransfer) {
      updateItem(editingTransfer.id, {
        ...formData,
        fees,
        convertedAmount,
      });
    } else {
      const newTransfer: WireTransfer = {
        id: Date.now().toString(),
        referenceNumber: `WR${Date.now().toString().slice(-8)}`,
        ...formData,
        fees,
        convertedAmount,
        status: 'pending',
        complianceStatus: 'pending',
        ofacScreening: false,
        approvedBy: '',
        requestedDate: new Date().toISOString().split('T')[0],
        processedDate: '',
        completedDate: '',
        createdAt: new Date().toISOString(),
      };
      addItem(newTransfer);
    }

    resetForm();
    setActiveTab('transfers');
  };

  const handleEdit = (transfer: WireTransfer) => {
    setEditingTransfer(transfer);
    setFormData({
      transferType: transfer.transferType,
      senderName: transfer.senderName,
      senderAccount: transfer.senderAccount,
      senderBank: transfer.senderBank,
      senderRoutingNumber: transfer.senderRoutingNumber,
      recipientName: transfer.recipientName,
      recipientAccount: transfer.recipientAccount,
      recipientBank: transfer.recipientBank,
      recipientRoutingNumber: transfer.recipientRoutingNumber,
      recipientSwiftCode: transfer.recipientSwiftCode,
      recipientCountry: transfer.recipientCountry,
      amount: transfer.amount,
      currency: transfer.currency,
      fees: transfer.fees,
      exchangeRate: transfer.exchangeRate,
      purpose: transfer.purpose,
      memo: transfer.memo,
      priority: transfer.priority,
      initiatedBy: transfer.initiatedBy,
      notes: transfer.notes,
    });
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Wire Transfer',
      message: 'Are you sure you want to delete this wire transfer?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const updateStatus = (id: string, status: WireTransfer['status']) => {
    const updates: Partial<WireTransfer> = { status };
    if (status === 'processing') {
      updates.processedDate = new Date().toISOString().split('T')[0];
    } else if (status === 'completed') {
      updates.completedDate = new Date().toISOString().split('T')[0];
    }
    updateItem(id, updates);
  };

  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch =
      transfer.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.recipientBank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesType = typeFilter === 'all' || transfer.transferType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Analytics calculations
  const totalTransfers = transfers.length;
  const totalVolume = transfers.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = transfers.reduce((sum, t) => sum + t.fees, 0);
  const completedTransfers = transfers.filter((t) => t.status === 'completed').length;
  const pendingTransfers = transfers.filter((t) => t.status === 'pending').length;
  const flaggedTransfers = transfers.filter((t) => t.complianceStatus === 'flagged').length;
  const internationalTransfers = transfers.filter((t) => t.transferType === 'international').length;

  const byType = transfers.reduce((acc, t) => {
    acc[t.transferType] = (acc[t.transferType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byPriority = transfers.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Send className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{t('tools.wireTransfer.wireTransferManager', 'Wire Transfer Manager')}</h1>
              <p className="text-sm text-gray-500">{t('tools.wireTransfer.processAndTrackWireTransfers', 'Process and track wire transfers')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="wire-transfer" toolName="Wire Transfer" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={() => exportPDF('Wire Transfers')}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              onCopyClipboard={copyToClipboard}
              onPrint={() => print('Wire Transfers')}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'transfers'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('tools.wireTransfer.wireTransfers', 'Wire Transfers')}
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab('new');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'new'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.wireTransfer.newTransfer', 'New Transfer')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('tools.wireTransfer.analytics', 'Analytics')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'transfers' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.wireTransfer.searchByReferenceSenderRecipient', 'Search by reference, sender, recipient, or bank...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">{t('tools.wireTransfer.allTypes', 'All Types')}</option>
                  <option value="domestic">{t('tools.wireTransfer.domestic', 'Domestic')}</option>
                  <option value="international">{t('tools.wireTransfer.international', 'International')}</option>
                  <option value="internal">{t('tools.wireTransfer.internal', 'Internal')}</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">{t('tools.wireTransfer.allStatuses', 'All Statuses')}</option>
                  <option value="pending">{t('tools.wireTransfer.pending', 'Pending')}</option>
                  <option value="processing">{t('tools.wireTransfer.processing', 'Processing')}</option>
                  <option value="completed">{t('tools.wireTransfer.completed', 'Completed')}</option>
                  <option value="failed">{t('tools.wireTransfer.failed', 'Failed')}</option>
                  <option value="cancelled">{t('tools.wireTransfer.cancelled', 'Cancelled')}</option>
                  <option value="on_hold">{t('tools.wireTransfer.onHold', 'On Hold')}</option>
                </select>
              </div>
            </div>

            {/* Transfer List */}
            <div className="space-y-3">
              {filteredTransfers.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('tools.wireTransfer.noWireTransfersFound', 'No wire transfers found')}</p>
                </div>
              ) : (
                filteredTransfers.map((transfer) => {
                  const statusConfig = STATUS_CONFIG[transfer.status];
                  const StatusIcon = statusConfig.icon;
                  const complianceConfig = COMPLIANCE_CONFIG[transfer.complianceStatus];
                  const priorityConfig = PRIORITY_CONFIG[transfer.priority];
                  const isExpanded = expandedId === transfer.id;

                  return (
                    <div
                      key={transfer.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedId(isExpanded ? null : transfer.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                              {transfer.transferType === 'international' ? (
                                <Globe className="w-5 h-5 text-indigo-600" />
                              ) : transfer.transferType === 'internal' ? (
                                <Building2 className="w-5 h-5 text-indigo-600" />
                              ) : (
                                <Send className="w-5 h-5 text-indigo-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {transfer.referenceNumber}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                                  {priorityConfig.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span>{transfer.senderName}</span>
                                <ArrowRight className="w-4 h-4" />
                                <span>{transfer.recipientName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {transfer.currency} {transfer.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-gray-500">
                                Fee: ${transfer.fees.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${complianceConfig.color}`}>
                                {complianceConfig.label}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sender Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" /> Sender Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.name', 'Name:')}</span>
                                  <span className="font-medium">{transfer.senderName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.account', 'Account:')}</span>
                                  <span className="font-medium">{transfer.senderAccount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.bank', 'Bank:')}</span>
                                  <span className="font-medium">{transfer.senderBank}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.routing', 'Routing #:')}</span>
                                  <span className="font-medium">{transfer.senderRoutingNumber}</span>
                                </div>
                              </div>
                            </div>

                            {/* Recipient Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Recipient Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.name2', 'Name:')}</span>
                                  <span className="font-medium">{transfer.recipientName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.account2', 'Account:')}</span>
                                  <span className="font-medium">{transfer.recipientAccount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.bank2', 'Bank:')}</span>
                                  <span className="font-medium">{transfer.recipientBank}</span>
                                </div>
                                {transfer.transferType === 'international' && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">{t('tools.wireTransfer.swiftCode', 'SWIFT Code:')}</span>
                                      <span className="font-medium">{transfer.recipientSwiftCode}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">{t('tools.wireTransfer.country', 'Country:')}</span>
                                      <span className="font-medium">{transfer.recipientCountry}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Transfer Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Transfer Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.purpose', 'Purpose:')}</span>
                                  <span className="font-medium">{transfer.purpose || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.exchangeRate', 'Exchange Rate:')}</span>
                                  <span className="font-medium">{transfer.exchangeRate.toFixed(4)}</span>
                                </div>
                                {transfer.transferType === 'international' && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">{t('tools.wireTransfer.convertedAmount', 'Converted Amount:')}</span>
                                    <span className="font-medium">${transfer.convertedAmount.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.memo', 'Memo:')}</span>
                                  <span className="font-medium">{transfer.memo || 'None'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Processing Info */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Processing Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.requestedDate', 'Requested Date:')}</span>
                                  <span className="font-medium">{transfer.requestedDate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.processedDate', 'Processed Date:')}</span>
                                  <span className="font-medium">{transfer.processedDate || 'Pending'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.completedDate', 'Completed Date:')}</span>
                                  <span className="font-medium">{transfer.completedDate || 'Pending'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.initiatedBy', 'Initiated By:')}</span>
                                  <span className="font-medium">{transfer.initiatedBy}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.wireTransfer.ofacScreening', 'OFAC Screening:')}</span>
                                  <span className={`font-medium ${transfer.ofacScreening ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {transfer.ofacScreening ? t('tools.wireTransfer.cleared', 'Cleared') : t('tools.wireTransfer.pending2', 'Pending')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {transfer.notes && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>{t('tools.wireTransfer.notes', 'Notes:')}</strong> {transfer.notes}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                              {transfer.status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(transfer.id, 'processing');
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  {t('tools.wireTransfer.startProcessing', 'Start Processing')}
                                </button>
                              )}
                              {transfer.status === 'processing' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(transfer.id, 'completed');
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    {t('tools.wireTransfer.markCompleted', 'Mark Completed')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(transfer.id, 'on_hold');
                                    }}
                                    className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                                  >
                                    {t('tools.wireTransfer.putOnHold', 'Put On Hold')}
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(transfer);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(transfer.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {editingTransfer ? t('tools.wireTransfer.editWireTransfer', 'Edit Wire Transfer') : t('tools.wireTransfer.newWireTransfer', 'New Wire Transfer')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transfer Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.wireTransfer.transferType', 'Transfer Type')}
                    </label>
                    <select
                      value={formData.transferType}
                      onChange={(e) => setFormData({ ...formData, transferType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="domestic">{t('tools.wireTransfer.domestic2', 'Domestic')}</option>
                      <option value="international">{t('tools.wireTransfer.international2', 'International')}</option>
                      <option value="internal">{t('tools.wireTransfer.internalTransfer', 'Internal Transfer')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.wireTransfer.priority', 'Priority')}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="standard">{t('tools.wireTransfer.standard15Fee', 'Standard ($15 fee)')}</option>
                      <option value="express">{t('tools.wireTransfer.express25Fee', 'Express ($25 fee)')}</option>
                      <option value="same_day">{t('tools.wireTransfer.sameDay50Fee', 'Same Day ($50 fee)')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.wireTransfer.initiatedBy2', 'Initiated By')}
                    </label>
                    <input
                      type="text"
                      value={formData.initiatedBy}
                      onChange={(e) => setFormData({ ...formData, initiatedBy: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Sender Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Sender Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.senderName', 'Sender Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.senderName}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.accountNumber', 'Account Number')}
                      </label>
                      <input
                        type="text"
                        value={formData.senderAccount}
                        onChange={(e) => setFormData({ ...formData, senderAccount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.bankName', 'Bank Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.senderBank}
                        onChange={(e) => setFormData({ ...formData, senderBank: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.routingNumber', 'Routing Number')}
                      </label>
                      <input
                        type="text"
                        value={formData.senderRoutingNumber}
                        onChange={(e) => setFormData({ ...formData, senderRoutingNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Recipient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.recipientName', 'Recipient Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.accountNumber2', 'Account Number')}
                      </label>
                      <input
                        type="text"
                        value={formData.recipientAccount}
                        onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.bankName2', 'Bank Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.recipientBank}
                        onChange={(e) => setFormData({ ...formData, recipientBank: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.routingNumber2', 'Routing Number')}
                      </label>
                      <input
                        type="text"
                        value={formData.recipientRoutingNumber}
                        onChange={(e) => setFormData({ ...formData, recipientRoutingNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required={formData.transferType !== 'international'}
                      />
                    </div>
                    {formData.transferType === 'international' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('tools.wireTransfer.swiftBicCode', 'SWIFT/BIC Code')}
                          </label>
                          <input
                            type="text"
                            value={formData.recipientSwiftCode}
                            onChange={(e) => setFormData({ ...formData, recipientSwiftCode: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('tools.wireTransfer.country2', 'Country')}
                          </label>
                          <input
                            type="text"
                            value={formData.recipientCountry}
                            onChange={(e) => setFormData({ ...formData, recipientCountry: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Amount Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.amount', 'Amount')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.currency', 'Currency')}
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    {formData.transferType === 'international' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('tools.wireTransfer.exchangeRate2', 'Exchange Rate')}
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          value={formData.exchangeRate}
                          onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.purposeOfTransfer', 'Purpose of Transfer')}
                      </label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={t('tools.wireTransfer.eGInvoicePaymentBusiness', 'e.g., Invoice payment, Business transaction')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.memoReference', 'Memo/Reference')}
                      </label>
                      <input
                        type="text"
                        value={formData.memo}
                        onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={t('tools.wireTransfer.referenceForRecipient', 'Reference for recipient')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.wireTransfer.internalNotes', 'Internal Notes')}
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('transfers');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {t('tools.wireTransfer.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingTransfer ? t('tools.wireTransfer.updateTransfer', 'Update Transfer') : t('tools.wireTransfer.submitTransfer', 'Submit Transfer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.wireTransfer.totalTransfers', 'Total Transfers')}</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTransfers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.wireTransfer.totalVolume', 'Total Volume')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${totalVolume.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.wireTransfer.completed2', 'Completed')}</p>
                    <p className="text-2xl font-bold text-gray-900">{completedTransfers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.wireTransfer.flagged', 'Flagged')}</p>
                    <p className="text-2xl font-bold text-gray-900">{flaggedTransfers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Type */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">{t('tools.wireTransfer.transfersByType', 'Transfers by Type')}</h3>
                <div className="space-y-3">
                  {Object.entries(byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(count / totalTransfers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Priority */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">{t('tools.wireTransfer.transfersByPriority', 'Transfers by Priority')}</h3>
                <div className="space-y-3">
                  {Object.entries(byPriority).map(([priority, count]) => {
                    const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <span className={`text-sm px-2 py-0.5 rounded ${config?.color || ''}`}>
                          {config?.label || priority}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${(count / totalTransfers) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">{t('tools.wireTransfer.quickStatistics', 'Quick Statistics')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.wireTransfer.totalFeesCollected', 'Total Fees Collected')}</p>
                  <p className="text-xl font-bold text-gray-900">${totalFees.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.wireTransfer.pendingTransfers', 'Pending Transfers')}</p>
                  <p className="text-xl font-bold text-gray-900">{pendingTransfers}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.wireTransfer.international3', 'International')}</p>
                  <p className="text-xl font-bold text-gray-900">{internationalTransfers}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.wireTransfer.avgTransferAmount', 'Avg Transfer Amount')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${totalTransfers > 0 ? (totalVolume / totalTransfers).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
}
