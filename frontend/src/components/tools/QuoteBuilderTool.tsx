import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { FileText, Plus, Search, Edit2, Trash2, CheckCircle, Clock, AlertCircle, X, Save, Send, Eye, Calendar, Building2, FileCheck, Copy, TrendingUp, XCircle, Percent } from 'lucide-react';
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
import { api } from '../../lib/api';
import useToolData from '../../hooks/useToolData';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
}

interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  product_id?: string;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  issue_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  discount_percent?: number;
  total: number;
  notes?: string;
  terms?: string;
  template_id?: string;
  items: QuoteItem[];
  created_at: string;
  updated_at: string;
}

interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  items: QuoteItem[];
  terms?: string;
  notes?: string;
}

interface UIConfig {
  prefillData?: {
    customer_id?: string;
    items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
    }>;
    notes?: string;
    valid_days?: number;
    template_id?: string;
  };
}

interface QuoteBuilderToolProps {
  config?: UIConfig;
}

// Column configuration for exports
const QUOTE_COLUMNS: ColumnConfig[] = [
  { key: 'quote_number', header: 'Quote #', type: 'string' },
  { key: 'customer_name', header: 'Customer', type: 'string' },
  { key: 'customer_company', header: 'Company', type: 'string' },
  { key: 'issue_date', header: 'Issue Date', type: 'date' },
  { key: 'valid_until', header: 'Valid Until', type: 'date' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'discount_percent', header: 'Discount %', type: 'number' },
  { key: 'discount_amount', header: 'Discount', type: 'currency' },
  { key: 'tax_rate', header: 'Tax Rate %', type: 'number' },
  { key: 'tax_amount', header: 'Tax', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'created_at', header: 'Created', type: 'date' },
];

export function QuoteBuilderTool({ config }: QuoteBuilderToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use useToolData hook for backend sync
  const {
    data: quotes,
    addItem: addQuote,
    updateItem: updateQuote,
    deleteItem: deleteQuote,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    isLoading: toolDataLoading,
  } = useToolData<Quote>('quote-builder', [], QUOTE_COLUMNS);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(toolDataLoading);

  const [formData, setFormData] = useState({
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_rate: '0',
    discount_amount: '0',
    discount_percent: '0',
    notes: '',
    terms: 'Quote valid for 30 days from issue date.',
    status: 'draft' as const,
  });

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);

  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    terms: '',
    notes: '',
  });

  // Update loading state when tool data loading changes
  useEffect(() => {
    setLoading(toolDataLoading);
  }, [toolDataLoading]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get<{ items: Customer[] }>('/business/customers?limit=100');
      setCustomers(response.items || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await api.get<{ items: QuoteTemplate[] }>('/business/quotes/templates?limit=50');
      setTemplates(response.items || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchTemplates();
  }, [fetchCustomers, fetchTemplates]);

  useEffect(() => {
    if (config?.prefillData) {
      const prefill = config.prefillData;
      if (prefill.customer_id || prefill.items || prefill.template_id) {
        if (prefill.customer_id) {
          setFormData(prev => ({ ...prev, customer_id: prefill.customer_id! }));
        }
        if (prefill.items && prefill.items.length > 0) {
          setQuoteItems(prefill.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
          })));
        }
        if (prefill.notes) {
          setFormData(prev => ({ ...prev, notes: prefill.notes! }));
        }
        if (prefill.valid_days) {
          const validUntil = new Date(Date.now() + prefill.valid_days * 24 * 60 * 60 * 1000);
          setFormData(prev => ({ ...prev, valid_until: validUntil.toISOString().split('T')[0] }));
        }
        if (prefill.template_id) {
          applyTemplate(prefill.template_id);
        }
        setShowQuoteModal(true);
      }
    }
  }, [config?.prefillData]);

  const applyTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        if (template.items && template.items.length > 0) {
          setQuoteItems(template.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
          })));
        }
        if (template.terms) {
          setFormData(prev => ({ ...prev, terms: template.terms! }));
        }
        if (template.notes) {
          setFormData(prev => ({ ...prev, notes: template.notes! }));
        }
      }
    } catch (err) {
      console.error('Failed to apply template:', err);
    }
  };

  const calculateTotals = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.amount, 0);
    const discountPercent = parseFloat(formData.discount_percent) || 0;
    const discountFromPercent = subtotal * (discountPercent / 100);
    const discountAmount = parseFloat(formData.discount_amount) || 0;
    const totalDiscount = discountFromPercent + discountAmount;
    const afterDiscount = subtotal - totalDiscount;
    const taxAmount = afterDiscount * (parseFloat(formData.tax_rate) / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, taxAmount, totalDiscount, total };
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...quoteItems];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }
    setQuoteItems(newItems);
  };

  const addItem = () => {
    setQuoteItems([...quoteItems, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_id) {
      setError('Please select a customer');
      return;
    }

    if (quoteItems.some(item => !item.description || item.quantity <= 0)) {
      setError('Please fill in all item details');
      return;
    }

    const { subtotal, taxAmount, totalDiscount, total } = calculateTotals();

    try {
      const quotePayload: Quote = {
        id: editingQuote?.id || `quote-${Date.now()}`,
        quote_number: editingQuote?.quote_number || `QT-${Date.now()}`,
        customer_id: formData.customer_id,
        customer_name: customers.find(c => c.id === formData.customer_id)?.name || '',
        customer_company: customers.find(c => c.id === formData.customer_id)?.company_name,
        customer_email: customers.find(c => c.id === formData.customer_id)?.email,
        issue_date: formData.issue_date,
        valid_until: formData.valid_until,
        subtotal,
        tax_rate: parseFloat(formData.tax_rate) || 0,
        tax_amount: taxAmount,
        discount_amount: parseFloat(formData.discount_amount) || 0,
        discount_percent: parseFloat(formData.discount_percent) || 0,
        total,
        notes: formData.notes || undefined,
        terms: formData.terms || undefined,
        status: formData.status,
        items: quoteItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
        })),
        created_at: editingQuote?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingQuote) {
        updateQuote(editingQuote.id, quotePayload);
        setSuccessMessage('Quote updated successfully');
      } else {
        addQuote(quotePayload);
        setSuccessMessage('Quote created successfully');
      }

      setShowQuoteModal(false);
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save quote');
    }
  };

  const handleConvertToInvoice = async (quote: Quote) => {
    const confirmed = await confirm({
      title: 'Convert to Invoice',
      message: 'Convert this quote to an invoice? This will create a new invoice with the same details.',
      confirmText: 'Yes, Convert',
      cancelText: 'Cancel',
      variant: 'default',
    });
    if (!confirmed) return;

    try {
      await api.post(`/business/quotes/${quote.id}/convert-to-invoice`, {});
      setSuccessMessage('Quote converted to invoice successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to convert quote to invoice');
    }
  };

  const handleDuplicateQuote = async (quote: Quote) => {
    try {
      const fullQuote = await api.get<Quote>(`/business/quotes/${quote.id}`);
      setEditingQuote(null);
      setFormData({
        customer_id: fullQuote.customer_id,
        issue_date: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tax_rate: (fullQuote.tax_rate || 0).toString(),
        discount_amount: (fullQuote.discount_amount || 0).toString(),
        discount_percent: (fullQuote.discount_percent || 0).toString(),
        notes: fullQuote.notes || '',
        terms: fullQuote.terms || 'Quote valid for 30 days from issue date.',
        status: 'draft',
      });
      setQuoteItems(fullQuote.items?.length > 0 ? fullQuote.items : [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
      setShowQuoteModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate quote');
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateData.name) {
      setError('Please enter a template name');
      return;
    }

    try {
      await api.post('/business/quotes/templates', {
        name: templateData.name,
        description: templateData.description || null,
        terms: formData.terms || null,
        notes: formData.notes || null,
        items: quoteItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
        })),
      });
      setSuccessMessage('Template saved successfully');
      setShowTemplateModal(false);
      setTemplateData({ name: '', description: '', terms: '', notes: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    }
  };

  const handleDeleteQuote = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Quote',
      message: 'Are you sure you want to delete this quote?',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      deleteQuote(id);
      setSuccessMessage('Quote deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete quote');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax_rate: '0',
      discount_amount: '0',
      discount_percent: '0',
      notes: '',
      terms: 'Quote valid for 30 days from issue date.',
      status: 'draft',
    });
    setQuoteItems([{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    setEditingQuote(null);
  };

  const openEditModal = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      customer_id: quote.customer_id,
      issue_date: quote.issue_date?.split('T')[0] || '',
      valid_until: quote.valid_until?.split('T')[0] || '',
      tax_rate: (quote.tax_rate || 0).toString(),
      discount_amount: (quote.discount_amount || 0).toString(),
      discount_percent: (quote.discount_percent || 0).toString(),
      notes: quote.notes || '',
      terms: quote.terms || 'Quote valid for 30 days from issue date.',
      status: quote.status,
    });
    setQuoteItems(quote.items?.length > 0 ? quote.items : [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    setShowQuoteModal(true);
  };

  const openViewModal = async (quote: Quote) => {
    try {
      const fullQuote = await api.get<Quote>(`/business/quotes/${quote.id}`);
      setSelectedQuote(fullQuote);
      setShowViewModal(true);
    } catch (err) {
      setError('Failed to load quote details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-400 bg-green-500/10';
      case 'sent': return 'text-blue-400 bg-blue-500/10';
      case 'declined': return 'text-red-400 bg-red-500/10';
      case 'expired': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-amber-400 bg-amber-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'sent': return Send;
      case 'declined': return XCircle;
      case 'expired': return AlertCircle;
      default: return Clock;
    }
  };

  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    declined: quotes.filter(q => q.status === 'declined').length,
    expired: quotes.filter(q => q.status === 'expired').length,
    totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
    pendingValue: quotes.filter(q => q.status === 'sent' || q.status === 'draft').reduce((sum, q) => sum + q.total, 0),
    acceptedValue: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0),
    acceptanceRate: quotes.filter(q => q.status === 'accepted' || q.status === 'declined').length > 0
      ? (quotes.filter(q => q.status === 'accepted').length / quotes.filter(q => q.status === 'accepted' || q.status === 'declined').length) * 100
      : 0,
  };

  const { subtotal, taxAmount, totalDiscount, total } = calculateTotals();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <FileText className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('tools.quoteBuilder.quoteBuilder', 'Quote Builder')}</h1>
              <p className="text-gray-400">{t('tools.quoteBuilder.createAndManageQuotes', 'Create and manage quotes')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="quote-builder" toolName="Quote Builder" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme="dark"
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportToCSV(quotes, QUOTE_COLUMNS, { filename: 'quotes' })}
              onExportExcel={() => exportToExcel(quotes, QUOTE_COLUMNS, { filename: 'quotes' })}
              onExportJSON={() => exportToJSON(quotes, { filename: 'quotes' })}
              onExportPDF={async () => {
                await exportToPDF(quotes, QUOTE_COLUMNS, {
                  filename: 'quotes',
                  title: 'Quote Builder Report',
                  subtitle: `Total: ${stats.total} quotes | Accepted: ${stats.accepted} | Pending Value: $${stats.pendingValue.toLocaleString()}`,
                });
              }}
              onPrint={() => printData(quotes, QUOTE_COLUMNS, { title: 'Quote Builder Report' })}
              onCopyToClipboard={() => copyUtil(quotes, QUOTE_COLUMNS, 'tab')}
              disabled={quotes.length === 0}
              showImport={false}
              theme="dark"
            />
            <button
              onClick={() => {
                resetForm();
                setShowQuoteModal(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.quoteBuilder.newQuote', 'New Quote')}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">{t('tools.quoteBuilder.totalQuotes', 'Total Quotes')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t('tools.quoteBuilder.pendingValue', 'Pending Value')}</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">${stats.pendingValue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t('tools.quoteBuilder.acceptedValue', 'Accepted Value')}</span>
            </div>
            <p className="text-2xl font-bold text-green-400">${stats.acceptedValue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t('tools.quoteBuilder.acceptanceRate', 'Acceptance Rate')}</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.acceptanceRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.quoteBuilder.searchQuotes', 'Search quotes...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">{t('tools.quoteBuilder.allStatus', 'All Status')}</option>
            <option value="draft">{t('tools.quoteBuilder.draft', 'Draft')}</option>
            <option value="sent">{t('tools.quoteBuilder.sent', 'Sent')}</option>
            <option value="accepted">{t('tools.quoteBuilder.accepted', 'Accepted')}</option>
            <option value="declined">{t('tools.quoteBuilder.declined', 'Declined')}</option>
            <option value="expired">{t('tools.quoteBuilder.expired', 'Expired')}</option>
          </select>
        </div>

        {/* Quotes Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">{t('tools.quoteBuilder.loadingQuotes', 'Loading quotes...')}</div>
          ) : quotes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.quoteBuilder.noQuotesFound', 'No quotes found')}</p>
              <button
                onClick={() => setShowQuoteModal(true)}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
              >
                {t('tools.quoteBuilder.createYourFirstQuote', 'Create Your First Quote')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.quoteBuilder.quote', 'Quote #')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.quoteBuilder.customer', 'Customer')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.quoteBuilder.date', 'Date')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.quoteBuilder.validUntil', 'Valid Until')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.quoteBuilder.total', 'Total')}</th>
                    <th className="text-center p-4 text-gray-400 font-medium">{t('tools.quoteBuilder.status', 'Status')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.quoteBuilder.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map(quote => {
                    const StatusIcon = getStatusIcon(quote.status);
                    const isExpired = new Date(quote.valid_until) < new Date() && quote.status !== 'accepted' && quote.status !== 'declined';
                    return (
                      <tr key={quote.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="p-4">
                          <span className="text-white font-mono">{quote.quote_number}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{quote.customer_name}</p>
                            {quote.customer_company && (
                              <p className="text-gray-400 text-sm">{quote.customer_company}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">
                          {new Date(quote.issue_date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={isExpired ? 'text-red-400' : 'text-gray-300'}>
                            {new Date(quote.valid_until).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4 text-right text-white">${quote.total.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(quote.status)}`}>
                              <StatusIcon className="w-3 h-3" />
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openViewModal(quote)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                              title={t('tools.quoteBuilder.view', 'View')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {quote.status === 'accepted' && (
                              <button
                                onClick={() => handleConvertToInvoice(quote)}
                                className="p-2 hover:bg-gray-700 rounded-lg text-green-400 transition-colors"
                                title={t('tools.quoteBuilder.convertToInvoice2', 'Convert to Invoice')}
                              >
                                <FileCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDuplicateQuote(quote)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-amber-400 transition-colors"
                              title={t('tools.quoteBuilder.duplicate', 'Duplicate')}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(quote)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                              title={t('tools.quoteBuilder.edit', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuote(quote.id)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
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
          )}
        </div>

        {/* Quote Modal */}
        {showQuoteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingQuote ? t('tools.quoteBuilder.editQuote', 'Edit Quote') : t('tools.quoteBuilder.createQuote', 'Create Quote')}
                </h2>
                <div className="flex items-center gap-2">
                  {templates.length > 0 && !editingQuote && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          applyTemplate(e.target.value);
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                      defaultValue=""
                    >
                      <option value="">{t('tools.quoteBuilder.applyTemplate', 'Apply Template')}</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => {
                      setShowQuoteModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmitQuote} className="p-6 space-y-6">
                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.customer2', 'Customer *')}</label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      required
                    >
                      <option value="">{t('tools.quoteBuilder.selectCustomer', 'Select Customer')}</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.company_name && `(${customer.company_name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.issueDate', 'Issue Date')}</label>
                    <input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.validUntil2', 'Valid Until')}</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-400">{t('tools.quoteBuilder.lineItems', 'Line Items')}</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-amber-400 hover:text-amber-300"
                    >
                      {t('tools.quoteBuilder.addItem', '+ Add Item')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {quoteItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder={t('tools.quoteBuilder.description3', 'Description')}
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            placeholder={t('tools.quoteBuilder.qty2', 'Qty')}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={t('tools.quoteBuilder.price2', 'Price')}
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="col-span-2 text-right text-white">
                          ${item.amount.toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          {quoteItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 hover:bg-gray-600 rounded text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>{t('tools.quoteBuilder.subtotal', 'Subtotal:')}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Percent className="w-3 h-3" /> Discount:
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.discount_percent}
                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                        className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-gray-400">%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{t('tools.quoteBuilder.fixedDiscount', 'Fixed Discount:')}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discount_amount}
                        onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>{t('tools.quoteBuilder.totalDiscount', 'Total Discount:')}</span>
                        <span>-${totalDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{t('tools.quoteBuilder.tax', 'Tax (%):')}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                        className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-gray-400">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold border-t border-gray-600 pt-2">
                      <span>{t('tools.quoteBuilder.total2', 'Total:')}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.notes', 'Notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      placeholder={t('tools.quoteBuilder.additionalNotes', 'Additional notes...')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.terms', 'Terms')}</label>
                    <textarea
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.status2', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="draft">{t('tools.quoteBuilder.draft2', 'Draft')}</option>
                    <option value="sent">{t('tools.quoteBuilder.sent2', 'Sent')}</option>
                    <option value="accepted">{t('tools.quoteBuilder.accepted2', 'Accepted')}</option>
                    <option value="declined">{t('tools.quoteBuilder.declined2', 'Declined')}</option>
                    <option value="expired">{t('tools.quoteBuilder.expired2', 'Expired')}</option>
                  </select>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-amber-400 rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.quoteBuilder.saveAsTemplate2', 'Save as Template')}
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuoteModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      {t('tools.quoteBuilder.cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingQuote ? t('tools.quoteBuilder.update', 'Update') : t('tools.quoteBuilder.create', 'Create')} Quote
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Save as Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{t('tools.quoteBuilder.saveAsTemplate', 'Save as Template')}</h2>
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setTemplateData({ name: '', description: '', terms: '', notes: '' });
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.templateName', 'Template Name *')}</label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder={t('tools.quoteBuilder.eGWebDesignProject', 'e.g., Web Design Project')}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.quoteBuilder.description', 'Description')}</label>
                  <textarea
                    value={templateData.description}
                    onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder={t('tools.quoteBuilder.briefDescriptionOfThisTemplate', 'Brief description of this template...')}
                  />
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 text-sm text-gray-400">
                  <p>{t('tools.quoteBuilder.thisWillSaveTheCurrent', 'This will save the current line items, terms, and notes as a reusable template.')}</p>
                  <p className="mt-2">Items: {quoteItems.filter(i => i.description).length}</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false);
                      setTemplateData({ name: '', description: '', terms: '', notes: '' });
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    {t('tools.quoteBuilder.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveAsTemplate}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.quoteBuilder.saveTemplate', 'Save Template')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Quote Modal */}
        {showViewModal && selectedQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Quote #{selectedQuote.quote_number}</h2>
                <div className="flex items-center gap-2">
                  {selectedQuote.status === 'accepted' && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleConvertToInvoice(selectedQuote);
                      }}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 text-sm"
                    >
                      <FileCheck className="w-4 h-4" />
                      {t('tools.quoteBuilder.convertToInvoice', 'Convert to Invoice')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedQuote(null);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">{t('tools.quoteBuilder.quoteFor', 'Quote For')}</h3>
                    <p className="text-white font-medium">{selectedQuote.customer_name}</p>
                    {selectedQuote.customer_company && (
                      <p className="text-gray-300">{selectedQuote.customer_company}</p>
                    )}
                    {selectedQuote.customer_email && (
                      <p className="text-gray-400 text-sm">{selectedQuote.customer_email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuote.status)}`}>
                      {selectedQuote.status.toUpperCase()}
                    </span>
                    <div className="mt-2 text-gray-400 text-sm">
                      <p>Issue Date: {new Date(selectedQuote.issue_date).toLocaleDateString()}</p>
                      <p className={new Date(selectedQuote.valid_until) < new Date() && selectedQuote.status !== 'accepted' ? 'text-red-400' : ''}>
                        Valid Until: {new Date(selectedQuote.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">{t('tools.quoteBuilder.items', 'Items')}</h3>
                  <div className="bg-gray-700/50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left p-3 text-gray-400 text-sm">{t('tools.quoteBuilder.description2', 'Description')}</th>
                          <th className="text-right p-3 text-gray-400 text-sm">{t('tools.quoteBuilder.qty', 'Qty')}</th>
                          <th className="text-right p-3 text-gray-400 text-sm">{t('tools.quoteBuilder.price', 'Price')}</th>
                          <th className="text-right p-3 text-gray-400 text-sm">{t('tools.quoteBuilder.amount', 'Amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuote.items?.map((item, index) => (
                          <tr key={index} className="border-b border-gray-600/50">
                            <td className="p-3 text-white">{item.description}</td>
                            <td className="p-3 text-right text-gray-300">{item.quantity}</td>
                            <td className="p-3 text-right text-gray-300">${item.unit_price.toFixed(2)}</td>
                            <td className="p-3 text-right text-white">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>{t('tools.quoteBuilder.subtotal2', 'Subtotal:')}</span>
                      <span>${selectedQuote.subtotal.toFixed(2)}</span>
                    </div>
                    {((selectedQuote.discount_amount && selectedQuote.discount_amount > 0) || (selectedQuote.discount_percent && selectedQuote.discount_percent > 0)) && (
                      <div className="flex justify-between text-red-400">
                        <span>Discount{selectedQuote.discount_percent ? ` (${selectedQuote.discount_percent}%)` : ''}:</span>
                        <span>-${((selectedQuote.discount_amount || 0) + (selectedQuote.subtotal * (selectedQuote.discount_percent || 0) / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    {selectedQuote.tax_amount && selectedQuote.tax_amount > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Tax ({selectedQuote.tax_rate}%):</span>
                        <span>${selectedQuote.tax_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-semibold border-t border-gray-600 pt-2">
                      <span>{t('tools.quoteBuilder.total3', 'Total:')}</span>
                      <span>${selectedQuote.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedQuote.notes && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">{t('tools.quoteBuilder.notes2', 'Notes')}</h3>
                      <p className="text-gray-300 text-sm">{selectedQuote.notes}</p>
                    </div>
                  )}
                  {selectedQuote.terms && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">{t('tools.quoteBuilder.terms2', 'Terms')}</h3>
                      <p className="text-gray-300 text-sm">{selectedQuote.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
}

export default QuoteBuilderTool;
