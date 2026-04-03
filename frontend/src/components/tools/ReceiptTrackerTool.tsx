'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  MapPin,
  FileText,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';

interface ReceiptCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  receipt_date: string;
  location?: string;
  payment_method?: string;
  items_count?: number;
  receipt_url?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

interface ReceiptTrackerToolProps {
  uiConfig?: UIConfig;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
];

// Column configuration for exports
const receiptColumns: ColumnConfig[] = [
  { key: 'merchant', header: 'Merchant', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'currency', header: 'Currency', type: 'string' },
  { key: 'category_name', header: 'Category', type: 'string' },
  { key: 'payment_method', header: 'Payment Method', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'receipt_date', header: 'Date', type: 'date' },
  { key: 'items_count', header: 'Items', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const ReceiptTrackerTool: React.FC<ReceiptTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for receipts with backend sync
  const {
    data: receipts,
    addItem,
    updateItem,
    deleteItem,
    isLoading: loading,
    isSaving: saving,
    isSynced,
    syncError,
    lastSaved,
    forceSync,
    exportCSV: exportReceiptsCSV,
    exportExcel: exportReceiptsExcel,
    exportJSON: exportReceiptsJSON,
    exportPDF: exportReceiptsPDF,
    print: printReceipts,
    copyToClipboard: copyReceiptsToClipboard,
  } = useToolData<Receipt>(
    'receipt-tracker',
    [],
    receiptColumns
  );

  const [categories, setCategories] = useState<ReceiptCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Summary
  const [summary, setSummary] = useState({ total_amount: 0, count: 0, avg_amount: 0 });

  // Form state
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    currency: 'USD',
    category_id: '',
    payment_method: 'cash',
    location: '',
    receipt_date: new Date().toISOString().split('T')[0],
    items_count: '',
    notes: '',
    tags: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#F59E0B',
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/business/receipt-categories');
      setCategories(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update summary whenever receipts change
  useEffect(() => {
    const total = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const count = receipts.length;
    const avg = count > 0 ? total / count : 0;
    setSummary({ total_amount: total, count, avg_amount: avg });
  }, [receipts]);

  // Open modal for new receipt
  const handleAddNew = () => {
    setEditingReceipt(null);
    setFormData({
      merchant: '',
      amount: '',
      currency: 'USD',
      category_id: '',
      payment_method: 'cash',
      location: '',
      receipt_date: new Date().toISOString().split('T')[0],
      items_count: '',
      notes: '',
      tags: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setFormData({
      merchant: receipt.merchant,
      amount: receipt.amount.toString(),
      currency: receipt.currency,
      category_id: receipt.category_id || '',
      payment_method: receipt.payment_method || 'cash',
      location: receipt.location || '',
      receipt_date: receipt.receipt_date.split('T')[0],
      items_count: receipt.items_count?.toString() || '',
      notes: receipt.notes || '',
      tags: (receipt.tags || []).join(', '),
    });
    setShowModal(true);
  };

  // Save receipt
  const handleSave = async () => {
    if (!formData.merchant.trim() || !formData.amount) {
      setError('Merchant and amount are required');
      return;
    }

    try {
      setError(null);

      const receiptData = {
        ...formData,
        amount: parseFloat(formData.amount),
        items_count: formData.items_count ? parseInt(formData.items_count) : null,
        category_id: formData.category_id || null,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      };

      if (editingReceipt) {
        // Update existing receipt
        updateItem(editingReceipt.id, receiptData);
      } else {
        // Add new receipt with generated ID
        const newReceipt: Receipt = {
          ...receiptData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };
        addItem(newReceipt);
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save receipt');
    }
  };

  // Save category
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await api.post('/business/receipt-categories', {
        name: categoryForm.name,
        color: categoryForm.color,
      });
      setShowCategoryModal(false);
      fetchCategories();
      setCategoryForm({ name: '', color: '#F59E0B' });
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    }
  };

  // Delete receipt
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Receipt',
      message: 'Are you sure you want to delete this receipt?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      deleteItem(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete receipt');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  // Filter receipts
  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !filterCategory || receipt.category_id === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : t('tools.receiptTracker.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#F59E0B]/5 border-gray-100')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F59E0B]/10 rounded-lg">
              <Receipt className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.receiptTracker.receiptTracker', 'Receipt Tracker')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.receiptTracker.trackAndOrganizeYourReceipts', 'Track and organize your receipts')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="receipt-tracker" toolName="Receipt Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={saving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportReceiptsCSV({ filename: 'receipts' })}
              onExportExcel={() => exportReceiptsExcel({ filename: 'receipts' })}
              onExportJSON={() => exportReceiptsJSON({ filename: 'receipts' })}
              onExportPDF={() => exportReceiptsPDF({ filename: 'receipts', title: 'Receipt Report' })}
              onPrint={() => printReceipts('Receipt Report')}
              onCopyToClipboard={() => copyReceiptsToClipboard('csv')}
              disabled={receipts.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowCategoryModal(true)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Tag className="w-4 h-4" />
              {t('tools.receiptTracker.categories', 'Categories')}
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#F59E0B]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.receiptTracker.addReceipt', 'Add Receipt')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={`grid grid-cols-3 gap-4 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-[#F59E0B]" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.receiptTracker.totalAmount', 'Total Amount')}</p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(summary.total_amount)}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.receiptTracker.receipts', 'Receipts')}</p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {summary.count}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-5 h-5 text-green-500" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.receiptTracker.average', 'Average')}</p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(summary.avg_amount)}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.receiptTracker.searchReceipts', 'Search receipts...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.receiptTracker.allCategories', 'All Categories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Receipt List */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{receipts.length === 0 ? t('tools.receiptTracker.noReceiptsFound', 'No receipts found') : t('tools.receiptTracker.noReceiptsMatchYourSearch', 'No receipts match your search')}</p>
            {receipts.length === 0 && (
              <button onClick={handleAddNew} className="mt-2 text-[#F59E0B] hover:underline">
                {t('tools.receiptTracker.addYourFirstReceipt', 'Add your first receipt')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {receipt.merchant}
                      </h4>
                      {receipt.category_name && (
                        <span
                          className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: receipt.category_color || '#F59E0B' }}
                        >
                          {receipt.category_name}
                        </span>
                      )}
                    </div>
                    <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1 font-semibold text-[#F59E0B]">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(receipt.amount, receipt.currency)}
                      </span>
                      {receipt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {receipt.location}
                        </span>
                      )}
                      {receipt.payment_method && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {receipt.payment_method}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(receipt.receipt_date).toLocaleDateString()}
                      </span>
                      {receipt.items_count && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {receipt.items_count} items
                        </span>
                      )}
                    </div>
                    {receipt.notes && (
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {receipt.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(receipt)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingReceipt ? t('tools.receiptTracker.editReceipt', 'Edit Receipt') : t('tools.receiptTracker.addReceipt2', 'Add Receipt')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.receiptTracker.merchant', 'Merchant *')}
                </label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.receiptTracker.whereDidYouShop', 'Where did you shop?')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.receiptTracker.amount', 'Amount *')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.receiptTracker.date', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.receiptTracker.category', 'Category')}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="">{t('tools.receiptTracker.selectCategory', 'Select category')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.receiptTracker.paymentMethod', 'Payment Method')}
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.receiptTracker.location', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.receiptTracker.storeLocation', 'Store location')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.receiptTracker.itemsCount', 'Items Count')}
                  </label>
                  <input
                    type="number"
                    value={formData.items_count}
                    onChange={(e) => setFormData({ ...formData, items_count: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.receiptTracker.numberOfItems', 'Number of items')}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.receiptTracker.tagsCommaSeparated', 'Tags (comma-separated)')}
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.receiptTracker.businessPersonalEtc', 'business, personal, etc.')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.receiptTracker.notes', 'Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.receiptTracker.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#F59E0B]/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t('tools.receiptTracker.saving', 'Saving...') : t('tools.receiptTracker.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.receiptTracker.addCategory', 'Add Category')}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.receiptTracker.categoryName', 'Category Name *')}
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.receiptTracker.eGGroceriesMedicalBusiness', 'e.g., Groceries, Medical, Business')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.receiptTracker.color', 'Color')}
                </label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Existing categories */}
              {categories.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.receiptTracker.existingCategories', 'Existing Categories:')}</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <span
                        key={c.id}
                        className={`px-3 py-1 text-sm rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        style={{ borderLeft: `3px solid ${c.color || '#F59E0B'}` }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowCategoryModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.receiptTracker.close', 'Close')}
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#F59E0B]/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ReceiptTrackerTool;
