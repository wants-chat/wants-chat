import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, Plus, DollarSign, Clock, Trash2, Package, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Order {
  id: string;
  customer: string;
  item: string;
  design: string;
  stitchCount: number;
  quantity: number;
  pricePerItem: number;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

interface EmbroideryShopToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'customer', header: 'Customer', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'design', header: 'Design', type: 'string' },
  { key: 'stitchCount', header: 'Stitch Count', type: 'number' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'pricePerItem', header: 'Price Per Item', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
];

export const EmbroideryShopTool: React.FC<EmbroideryShopToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: orders,
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
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Order>('embroidery-shop', [], COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', item: '', design: '', stitchCount: 5000, quantity: 1, pricePerItem: 15, dueDate: '',
  });

  const resetForm = () => {
    setFormData({ customer: '', item: '', design: '', stitchCount: 5000, quantity: 1, pricePerItem: 15, dueDate: '' });
    setShowForm(false);
  };

  const handleAddOrder = () => {
    const newOrder: Order = { id: Date.now().toString(), ...formData, status: 'pending' };
    addItem(newOrder);
    resetForm();
  };

  const handleUpdateStatus = (id: string, status: Order['status']) => {
    updateItem(id, { status });
  };

  const handleDeleteOrder = (id: string) => {
    deleteItem(id);
  };

  // Calculate stats using useMemo for performance
  const { totalRevenue, pendingOrders } = useMemo(() => {
    const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.pricePerItem * o.quantity, 0);
    const pending = orders.filter(o => o.status !== 'completed').length;
    return { totalRevenue: revenue, pendingOrders: pending };
  }, [orders]);

  const inputClass = `w-full p-3 rounded-lg border ${
    theme === 'dark' ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:ring-2 focus:ring-[#0D9488]`;

  const cardClass = `p-4 rounded-lg ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    'in-progress': 'bg-blue-500/10 text-blue-500',
    completed: 'bg-green-500/10 text-green-500',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.embroideryShop.embroideryShopManager', 'Embroidery Shop Manager')}
        </h2>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {t('tools.embroideryShop.trackOrdersAndManageEmbroidery', 'Track orders and manage embroidery projects')}
        </p>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.embroideryShop.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-[#0D9488]/10 rounded-lg"><Package className="w-6 h-6 text-[#0D9488]" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.embroideryShop.totalOrders', 'Total Orders')}</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{orders.length}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-yellow-500/10 rounded-lg"><Clock className="w-6 h-6 text-yellow-500" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.embroideryShop.pending', 'Pending')}</p>
            <p className="text-xl font-bold text-yellow-500">{pendingOrders}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-green-500" /></div>
          <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.embroideryShop.revenue', 'Revenue')}</p>
            <p className="text-xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="flex justify-end gap-3 items-center">
        <WidgetEmbedButton toolSlug="embroidery-shop" toolName="Embroidery Shop" />

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
          onExportCSV={() => exportCSV({ filename: 'embroidery-orders' })}
          onExportExcel={() => exportExcel({ filename: 'embroidery-orders' })}
          onExportJSON={() => exportJSON({ filename: 'embroidery-orders' })}
          onExportPDF={() => exportPDF({ filename: 'embroidery-orders', title: 'Embroidery Orders' })}
          onPrint={() => print('Embroidery Orders')}
          onCopyToClipboard={() => copyToClipboard('tab')}
          onImportCSV={async (file) => { await importCSV(file); }}
          onImportJSON={async (file) => { await importJSON(file); }}
          disabled={orders.length === 0}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]">
          <Plus className="w-5 h-5" />New Order
        </button>
      </div>

      {showForm && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.embroideryShop.customerName', 'Customer Name')} value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })} className={inputClass} />
            <input type="text" placeholder={t('tools.embroideryShop.itemEGPoloShirt', 'Item (e.g., Polo Shirt)')} value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })} className={inputClass} />
            <input type="text" placeholder={t('tools.embroideryShop.designName', 'Design Name')} value={formData.design}
              onChange={(e) => setFormData({ ...formData, design: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.embroideryShop.stitchCount', 'Stitch Count')} value={formData.stitchCount}
              onChange={(e) => setFormData({ ...formData, stitchCount: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.embroideryShop.quantity', 'Quantity')} value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.embroideryShop.pricePerItem', 'Price Per Item')} value={formData.pricePerItem}
              onChange={(e) => setFormData({ ...formData, pricePerItem: parseFloat(e.target.value) })} className={inputClass} />
            <input type="date" value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className={inputClass} />
            <button onClick={handleAddOrder} disabled={!formData.customer || !formData.item}
              className="px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50">{t('tools.embroideryShop.saveOrder', 'Save Order')}</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className={cardClass}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{o.customer}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {o.quantity}x {o.item} • {o.design} • {o.stitchCount.toLocaleString()} stitches
                </p>
              </div>
              <button onClick={() => handleDeleteOrder(o.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Due: {o.dueDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0D9488]">${(o.pricePerItem * o.quantity).toFixed(2)}</span>
                <select value={o.status} onChange={(e) => handleUpdateStatus(o.id, e.target.value as Order['status'])}
                  className={`text-sm p-1 rounded border ${theme === 'dark' ? 'bg-[#252525] border-[#333] text-white' : 'bg-white border-gray-300'}`}>
                  <option value="pending">{t('tools.embroideryShop.pending2', 'Pending')}</option>
                  <option value="in-progress">{t('tools.embroideryShop.inProgress', 'In Progress')}</option>
                  <option value="completed">{t('tools.embroideryShop.completed', 'Completed')}</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmbroideryShopTool;
