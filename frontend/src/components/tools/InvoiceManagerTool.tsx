import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Search, Filter, Edit2, Trash2, DollarSign, CheckCircle, Clock, AlertCircle, X, Save, Send, Download, Eye, Calendar, Building2, CreditCard, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
}

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  product_id?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  created_at: string;
  updated_at: string;
}

interface InvoicePayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
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
    due_days?: number;
  };
}

interface InvoiceManagerToolProps {
  config?: UIConfig;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'invoice_number', header: 'Invoice #', type: 'string' },
  { key: 'customer_name', header: 'Customer', type: 'string' },
  { key: 'customer_company', header: 'Company', type: 'string' },
  { key: 'issue_date', header: 'Issue Date', type: 'date' },
  { key: 'due_date', header: 'Due Date', type: 'date' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'tax_rate', header: 'Tax Rate (%)', type: 'number' },
  { key: 'tax_amount', header: 'Tax Amount', type: 'currency' },
  { key: 'discount_amount', header: 'Discount', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'amount_paid', header: 'Amount Paid', type: 'currency' },
  { key: 'balance_due', header: 'Balance Due', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export function InvoiceManagerTool({ config }: InvoiceManagerToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend sync and export functionality
  const {
    data: invoices,
    setData: setInvoices,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading: isToolDataLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Invoice>('invoice-manager', [], COLUMNS);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_rate: '0',
    discount_amount: '0',
    notes: '',
    terms: 'Payment due within 30 days',
    status: 'draft' as const,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);

  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    reference: '',
    notes: '',
  });

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '100');

      const response = await api.get<{ items: Invoice[]; total: number }>(`/business/invoices?${params}`);
      const fetchedInvoices = response.items || [];
      setInvoices(fetchedInvoices);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, setInvoices]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get<{ items: Customer[] }>('/business/customers?limit=100');
      setCustomers(response.items || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [fetchInvoices, fetchCustomers]);

  useEffect(() => {
    if (config?.prefillData) {
      const prefill = config.prefillData;
      if (prefill.customer_id || prefill.items) {
        if (prefill.customer_id) {
          setFormData(prev => ({ ...prev, customer_id: prefill.customer_id! }));
        }
        if (prefill.items && prefill.items.length > 0) {
          setInvoiceItems(prefill.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
          })));
        }
        if (prefill.notes) {
          setFormData(prev => ({ ...prev, notes: prefill.notes! }));
        }
        if (prefill.due_days) {
          const dueDate = new Date(Date.now() + prefill.due_days * 24 * 60 * 60 * 1000);
          setFormData(prev => ({ ...prev, due_date: dueDate.toISOString().split('T')[0] }));
        }
        setShowInvoiceModal(true);
      }
    }
  }, [config?.prefillData]);

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (parseFloat(formData.tax_rate) / 100);
    const discountAmount = parseFloat(formData.discount_amount) || 0;
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }
    setInvoiceItems(newItems);
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_id) {
      setError('Please select a customer');
      return;
    }

    if (invoiceItems.some(item => !item.description || item.quantity <= 0)) {
      setError('Please fill in all item details');
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();

    try {
      const payload = {
        customer_id: formData.customer_id,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        subtotal,
        tax_rate: parseFloat(formData.tax_rate) || 0,
        tax_amount: taxAmount,
        discount_amount: parseFloat(formData.discount_amount) || 0,
        total,
        notes: formData.notes || null,
        terms: formData.terms || null,
        status: formData.status,
        items: invoiceItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
        })),
      };

      if (editingInvoice) {
        await api.put(`/business/invoices/${editingInvoice.id}`, payload);
        setSuccessMessage('Invoice updated successfully');
      } else {
        await api.post('/business/invoices', payload);
        setSuccessMessage('Invoice created successfully');
      }

      setShowInvoiceModal(false);
      resetForm();
      fetchInvoices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await api.post(`/business/invoices/${selectedInvoice.id}/payments`, {
        amount: parseFloat(paymentData.amount),
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        reference: paymentData.reference || null,
        notes: paymentData.notes || null,
      });

      setSuccessMessage('Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        reference: '',
        notes: '',
      });
      fetchInvoices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await api.delete(`/business/invoices/${id}`);
      setSuccessMessage('Invoice deleted successfully');
      fetchInvoices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete invoice');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax_rate: '0',
      discount_amount: '0',
      notes: '',
      terms: 'Payment due within 30 days',
      status: 'draft',
    });
    setInvoiceItems([{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    setEditingInvoice(null);
  };

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer_id: invoice.customer_id,
      issue_date: invoice.issue_date?.split('T')[0] || '',
      due_date: invoice.due_date?.split('T')[0] || '',
      tax_rate: (invoice.tax_rate || 0).toString(),
      discount_amount: (invoice.discount_amount || 0).toString(),
      notes: invoice.notes || '',
      terms: invoice.terms || 'Payment due within 30 days',
      status: invoice.status,
    });
    setInvoiceItems(invoice.items?.length > 0 ? invoice.items : [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    setShowInvoiceModal(true);
  };

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      ...paymentData,
      amount: invoice.balance_due.toString(),
    });
    setShowPaymentModal(true);
  };

  const openViewModal = async (invoice: Invoice) => {
    try {
      const fullInvoice = await api.get<Invoice>(`/business/invoices/${invoice.id}`);
      setSelectedInvoice(fullInvoice);
      setShowViewModal(true);
    } catch (err) {
      setError('Failed to load invoice details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-500/10';
      case 'sent': return 'text-blue-400 bg-blue-500/10';
      case 'overdue': return 'text-red-400 bg-red-500/10';
      case 'cancelled': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-yellow-400 bg-yellow-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'sent': return Send;
      case 'overdue': return AlertCircle;
      default: return Clock;
    }
  };

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    totalPaid: invoices.reduce((sum, i) => sum + i.amount_paid, 0),
    totalDue: invoices.reduce((sum, i) => sum + i.balance_due, 0),
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  // Loading state
  if (isToolDataLoading && loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('tools.invoiceManager.invoiceManager', 'Invoice Manager')}</h1>
              <p className="text-gray-400">{t('tools.invoiceManager.createAndManageInvoices', 'Create and manage invoices')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="invoice-manager" toolName="Invoice Manager" />

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
              onExportCSV={() => exportCSV({ filename: 'invoices' })}
              onExportExcel={() => exportExcel({ filename: 'invoices' })}
              onExportJSON={() => exportJSON({ filename: 'invoices' })}
              onExportPDF={() => exportPDF({
                filename: 'invoices',
                title: 'Invoice Report',
                subtitle: `Total: ${stats.total} invoices | Outstanding: $${stats.totalDue.toLocaleString()}`,
                orientation: 'landscape',
              })}
              onPrint={() => print('Invoice Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); fetchInvoices(); }}
              onImportJSON={async (file) => { await importJSON(file); fetchInvoices(); }}
              disabled={invoices.length === 0}
              theme="dark"
            />
            <button
              onClick={() => {
                resetForm();
                setShowInvoiceModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.invoiceManager.newInvoice', 'New Invoice')}
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
              <span className="text-sm">{t('tools.invoiceManager.totalInvoices', 'Total Invoices')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t('tools.invoiceManager.totalPaid', 'Total Paid')}</span>
            </div>
            <p className="text-2xl font-bold text-green-400">${stats.totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t('tools.invoiceManager.outstanding', 'Outstanding')}</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">${stats.totalDue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{t('tools.invoiceManager.overdue', 'Overdue')}</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.invoiceManager.searchInvoices', 'Search invoices...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">{t('tools.invoiceManager.allStatus', 'All Status')}</option>
            <option value="draft">{t('tools.invoiceManager.draft', 'Draft')}</option>
            <option value="sent">{t('tools.invoiceManager.sent', 'Sent')}</option>
            <option value="paid">{t('tools.invoiceManager.paid', 'Paid')}</option>
            <option value="overdue">{t('tools.invoiceManager.overdue2', 'Overdue')}</option>
            <option value="cancelled">{t('tools.invoiceManager.cancelled', 'Cancelled')}</option>
          </select>
        </div>

        {/* Invoices Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">{t('tools.invoiceManager.loadingInvoices', 'Loading invoices...')}</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.invoiceManager.noInvoicesFound', 'No invoices found')}</p>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
              >
                {t('tools.invoiceManager.createYourFirstInvoice', 'Create Your First Invoice')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.invoiceManager.invoice', 'Invoice #')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.invoiceManager.customer', 'Customer')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.invoiceManager.date', 'Date')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.invoiceManager.dueDate', 'Due Date')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.invoiceManager.total', 'Total')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.invoiceManager.balance', 'Balance')}</th>
                    <th className="text-center p-4 text-gray-400 font-medium">{t('tools.invoiceManager.status', 'Status')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.invoiceManager.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => {
                    const StatusIcon = getStatusIcon(invoice.status);
                    return (
                      <tr key={invoice.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="p-4">
                          <span className="text-white font-mono">{invoice.invoice_number}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{invoice.customer_name}</p>
                            {invoice.customer_company && (
                              <p className="text-gray-400 text-sm">{invoice.customer_company}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-gray-300">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right text-white">${invoice.total.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <span className={invoice.balance_due > 0 ? 'text-yellow-400' : 'text-green-400'}>
                            ${invoice.balance_due.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                              <StatusIcon className="w-3 h-3" />
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openViewModal(invoice)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                              title={t('tools.invoiceManager.view', 'View')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <button
                                onClick={() => openPaymentModal(invoice)}
                                className="p-2 hover:bg-gray-700 rounded-lg text-green-400 transition-colors"
                                title={t('tools.invoiceManager.recordPayment3', 'Record Payment')}
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(invoice)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                              title={t('tools.invoiceManager.edit', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
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

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingInvoice ? t('tools.invoiceManager.editInvoice', 'Edit Invoice') : t('tools.invoiceManager.createInvoice', 'Create Invoice')}
                </h2>
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitInvoice} className="p-6 space-y-6">
                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.customer2', 'Customer *')}</label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="">{t('tools.invoiceManager.selectCustomer', 'Select Customer')}</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.company_name && `(${customer.company_name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.issueDate', 'Issue Date')}</label>
                    <input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.dueDate2', 'Due Date')}</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-400">{t('tools.invoiceManager.lineItems', 'Line Items')}</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      {t('tools.invoiceManager.addItem', '+ Add Item')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder={t('tools.invoiceManager.description2', 'Description')}
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            placeholder={t('tools.invoiceManager.qty2', 'Qty')}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={t('tools.invoiceManager.price2', 'Price')}
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="col-span-2 text-right text-white">
                          ${item.amount.toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          {invoiceItems.length > 1 && (
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
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>{t('tools.invoiceManager.subtotal', 'Subtotal:')}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{t('tools.invoiceManager.tax', 'Tax (%):')}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-gray-400">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{t('tools.invoiceManager.discount', 'Discount:')}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discount_amount}
                        onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex justify-between text-white font-semibold border-t border-gray-600 pt-2">
                      <span>{t('tools.invoiceManager.total2', 'Total:')}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.notes', 'Notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      placeholder={t('tools.invoiceManager.additionalNotes', 'Additional notes...')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.terms', 'Terms')}</label>
                    <textarea
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.status2', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="draft">{t('tools.invoiceManager.draft2', 'Draft')}</option>
                    <option value="sent">{t('tools.invoiceManager.sent2', 'Sent')}</option>
                    <option value="paid">{t('tools.invoiceManager.paid2', 'Paid')}</option>
                    <option value="overdue">{t('tools.invoiceManager.overdue3', 'Overdue')}</option>
                    <option value="cancelled">{t('tools.invoiceManager.cancelled2', 'Cancelled')}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvoiceModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    {t('tools.invoiceManager.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingInvoice ? t('tools.invoiceManager.update', 'Update') : t('tools.invoiceManager.create', 'Create')} Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{t('tools.invoiceManager.recordPayment', 'Record Payment')}</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-white font-medium">Invoice #{selectedInvoice.invoice_number}</p>
                  <p className="text-gray-400 text-sm">Balance Due: ${selectedInvoice.balance_due.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.amount', 'Amount *')}</label>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedInvoice.balance_due}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.paymentDate', 'Payment Date')}</label>
                  <input
                    type="date"
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.paymentMethod', 'Payment Method')}</label>
                  <select
                    value={paymentData.payment_method}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="bank_transfer">{t('tools.invoiceManager.bankTransfer', 'Bank Transfer')}</option>
                    <option value="credit_card">{t('tools.invoiceManager.creditCard', 'Credit Card')}</option>
                    <option value="cash">{t('tools.invoiceManager.cash', 'Cash')}</option>
                    <option value="check">{t('tools.invoiceManager.check', 'Check')}</option>
                    <option value="paypal">{t('tools.invoiceManager.paypal', 'PayPal')}</option>
                    <option value="other">{t('tools.invoiceManager.other', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.reference', 'Reference #')}</label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder={t('tools.invoiceManager.transactionIdCheckNumberEtc', 'Transaction ID, check number, etc.')}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.invoiceManager.notes2', 'Notes')}</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedInvoice(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    {t('tools.invoiceManager.cancel2', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {t('tools.invoiceManager.recordPayment2', 'Record Payment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Invoice Modal */}
        {showViewModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Invoice #{selectedInvoice.invoice_number}</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">{t('tools.invoiceManager.billTo', 'Bill To')}</h3>
                    <p className="text-white font-medium">{selectedInvoice.customer_name}</p>
                    {selectedInvoice.customer_company && (
                      <p className="text-gray-300">{selectedInvoice.customer_company}</p>
                    )}
                    {selectedInvoice.customer_email && (
                      <p className="text-gray-400 text-sm">{selectedInvoice.customer_email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                    <div className="mt-2 text-gray-400 text-sm">
                      <p>Issue Date: {new Date(selectedInvoice.issue_date).toLocaleDateString()}</p>
                      <p>Due Date: {new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">{t('tools.invoiceManager.items', 'Items')}</h3>
                  <div className="bg-gray-700/50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left p-3 text-gray-400 text-sm">{t('tools.invoiceManager.description', 'Description')}</th>
                          <th className="text-right p-3 text-gray-400 text-sm">{t('tools.invoiceManager.qty', 'Qty')}</th>
                          <th className="text-right p-3 text-gray-400 text-sm">{t('tools.invoiceManager.price', 'Price')}</th>
                          <th className="text-right p-3 text-gray-400 text-sm">{t('tools.invoiceManager.amount2', 'Amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items?.map((item, index) => (
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
                      <span>{t('tools.invoiceManager.subtotal2', 'Subtotal:')}</span>
                      <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedInvoice.tax_amount && selectedInvoice.tax_amount > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Tax ({selectedInvoice.tax_rate}%):</span>
                        <span>${selectedInvoice.tax_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedInvoice.discount_amount && selectedInvoice.discount_amount > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>{t('tools.invoiceManager.discount2', 'Discount:')}</span>
                        <span>-${selectedInvoice.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-semibold border-t border-gray-600 pt-2">
                      <span>{t('tools.invoiceManager.total3', 'Total:')}</span>
                      <span>${selectedInvoice.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>{t('tools.invoiceManager.paid3', 'Paid:')}</span>
                      <span>${selectedInvoice.amount_paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-yellow-400 font-semibold">
                      <span>{t('tools.invoiceManager.balanceDue', 'Balance Due:')}</span>
                      <span>${selectedInvoice.balance_due.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payments */}
                {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">{t('tools.invoiceManager.paymentHistory', 'Payment History')}</h3>
                    <div className="space-y-2">
                      {selectedInvoice.payments.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                          <div>
                            <p className="text-white">${payment.amount.toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(payment.payment_date).toLocaleDateString()} - {payment.payment_method}
                            </p>
                          </div>
                          {payment.reference && (
                            <span className="text-gray-400 text-sm">Ref: {payment.reference}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes & Terms */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedInvoice.notes && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">{t('tools.invoiceManager.notes3', 'Notes')}</h3>
                      <p className="text-gray-300 text-sm">{selectedInvoice.notes}</p>
                    </div>
                  )}
                  {selectedInvoice.terms && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">{t('tools.invoiceManager.terms2', 'Terms')}</h3>
                      <p className="text-gray-300 text-sm">{selectedInvoice.terms}</p>
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

export default InvoiceManagerTool;
