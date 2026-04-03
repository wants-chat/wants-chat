'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import useToolData, { UseToolDataReturn } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface Sale {
  id: string;
  date: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customer: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface SalesTrackerToolProps {
  uiConfig?: any;
}

export const SalesTrackerTool: React.FC<SalesTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    product: '',
    quantity: '1',
    unitPrice: '',
    customer: '',
    status: 'pending' as const,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Column configuration for export/import
  const columns: ColumnConfig[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'product', label: 'Product', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'unitPrice', label: 'Unit Price', type: 'number' },
    { key: 'totalAmount', label: 'Total Amount', type: 'number' },
    { key: 'customer', label: 'Customer', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
  ];

  // Use the hook for data management with backend sync
  const {
    data: sales,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    forceSync,
    recordCount,
  }: UseToolDataReturn<Sale> = useToolData<Sale>(
    'sales-tracker',
    [],
    columns,
    {
      autoSave: true,
      autoSaveDelay: 1000,
      onError: (error) => console.error('Sales tracker error:', error),
    }
  );

  // Calculate total sales
  const totalSales = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  }, [sales]);

  // Calculate average order value
  const avgOrderValue = useMemo(() => {
    return sales.length > 0 ? totalSales / sales.length : 0;
  }, [sales, totalSales]);

  // Calculate completed orders
  const completedOrders = useMemo(() => {
    return sales.filter(s => s.status === 'completed').length;
  }, [sales]);

  // Generate unique ID
  const generateId = () => `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product || !formData.unitPrice || !formData.customer) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const quantity = parseInt(formData.quantity) || 1;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const totalAmount = quantity * unitPrice;

    const newSale: Sale = {
      id: editingId || generateId(),
      date: formData.date,
      product: formData.product,
      quantity,
      unitPrice,
      totalAmount,
      customer: formData.customer,
      status: formData.status,
    };

    if (editingId) {
      // Update existing
      updateItem(editingId, newSale);
      setEditingId(null);
    } else {
      // Add new
      addItem(newSale);
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      product: '',
      quantity: '1',
      unitPrice: '',
      customer: '',
      status: 'pending',
    });
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setFormData({
      date: sale.date,
      product: sale.product,
      quantity: sale.quantity.toString(),
      unitPrice: sale.unitPrice.toString(),
      customer: sale.customer,
      status: sale.status,
    });
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      product: '',
      quantity: '1',
      unitPrice: '',
      customer: '',
      status: 'pending',
    });
    setShowForm(false);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Handle export with proper integration
  const handleExportCSV = () => {
    const result = exportCSV();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export CSV');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportExcel = () => {
    const result = exportExcel();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export Excel');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportJSON = () => {
    const result = exportJSON();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export JSON');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportPDF = async () => {
    const result = await exportPDF();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export PDF');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleImportCSV = async (file: File) => {
    const result = await importCSV(file);
    if (result.success) {
      setValidationMessage(`Successfully imported ${result.rowCount || 0} sales records`);
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage(result.errors?.join(', ') || 'Failed to import CSV');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleImportJSON = async (file: File) => {
    const result = await importJSON(file);
    if (result.success) {
      setValidationMessage(`Successfully imported ${result.rowCount || 0} sales records`);
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage(result.errors?.join(', ') || 'Failed to import JSON');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-8 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.salesTracker.loadingSalesData', 'Loading sales data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.salesTracker.salesTracker', 'Sales Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salesTracker.trackAndManageYourSales', 'Track and manage your sales records')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="sales-tracker" toolName="Sales Tracker" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.salesTracker.totalSales', 'Total Sales')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(totalSales)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.salesTracker.averageOrder', 'Average Order')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(avgOrderValue)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.salesTracker.completedOrders', 'Completed Orders')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {completedOrders} / {recordCount}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? t('tools.salesTracker.cancel2', 'Cancel') : t('tools.salesTracker.addSale', 'Add Sale')}
          </button>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={() => print('Sales Report')}
            onCopyToClipboard={() => copyToClipboard('csv')}
            onImportCSV={handleImportCSV}
            onImportJSON={handleImportJSON}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.salesTracker.date2', 'Date')}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.salesTracker.product2', 'Product')}
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  placeholder={t('tools.salesTracker.productName', 'Product name')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.salesTracker.quantity', 'Quantity')}
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.salesTracker.unitPrice2', 'Unit Price')}
                </label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.salesTracker.customer2', 'Customer')}
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder={t('tools.salesTracker.customerName', 'Customer name')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.salesTracker.status2', 'Status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'completed' | 'cancelled' })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="pending">{t('tools.salesTracker.pending', 'Pending')}</option>
                  <option value="completed">{t('tools.salesTracker.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.salesTracker.cancelled', 'Cancelled')}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingId ? t('tools.salesTracker.update', 'Update') : t('tools.salesTracker.save', 'Save')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                {t('tools.salesTracker.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Sales Table */}
        {sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.date', 'Date')}</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.product', 'Product')}</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.customer', 'Customer')}</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.qty', 'Qty')}</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.unitPrice', 'Unit Price')}</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.total', 'Total')}</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.status', 'Status')}</th>
                  <th className={`px-6 py-3 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{t('tools.salesTracker.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <td className={`px-6 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sale.date}</td>
                    <td className={`px-6 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sale.product}</td>
                    <td className={`px-6 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sale.customer}</td>
                    <td className={`px-6 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sale.quantity}</td>
                    <td className={`px-6 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formatCurrency(sale.unitPrice)}</td>
                    <td className={`px-6 py-3 font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(sale.totalAmount)}</td>
                    <td className={`px-6 py-3`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' ? (isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                        sale.status === 'pending' ? (isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                        (isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className={`px-6 py-3 flex justify-center gap-2`}>
                      <button
                        onClick={() => handleEdit(sale)}
                        className={`p-1 rounded hover:bg-blue-500/20 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        title={t('tools.salesTracker.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: 'Confirm Delete',
                            message: 'Are you sure you want to delete this sale?',
                            confirmText: 'Delete',
                            cancelText: 'Cancel',
                            variant: 'danger',
                          });
                          if (!confirmed) return;
                          deleteItem(sale.id);
                        }}
                        className={`p-1 rounded hover:bg-red-500/20 ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`py-12 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <TrendingUp className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salesTracker.noSalesRecordedYet', 'No sales recorded yet')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salesTracker.addYourFirstSaleTo', 'Add your first sale to get started')}</p>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default SalesTrackerTool;
