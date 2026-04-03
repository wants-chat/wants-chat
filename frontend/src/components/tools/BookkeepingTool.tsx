import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface BookkeepingToolProps {
  uiConfig?: UIConfig;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

const categories = {
  income: ['Sales', 'Services', 'Investments', 'Other Income'],
  expense: ['Rent', 'Utilities', 'Supplies', 'Payroll', 'Marketing', 'Insurance', 'Other Expense'],
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
];

export const BookkeepingTool: React.FC<BookkeepingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the new useToolData hook for backend persistence
  const {
    data: transactions,
    setData: setTransactions,
    addItem,
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
  } = useToolData<Transaction>('bookkeeping', [], COLUMNS);

  const [showForm, setShowForm] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: 'Sales',
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount || params.description || params.title) {
        setFormData(prev => ({
          ...prev,
          description: params.description || params.title || prev.description,
          amount: params.amount?.toString() || prev.amount,
        }));
        setShowForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addTransaction = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
    };
    addItem(newTransaction);
    setShowForm(false);
    setFormData({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'income', category: 'Sales' });
  };

  const handleDeleteTransaction = (id: string) => deleteItem(id);

  // Calculate totals
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const inputClass = `w-full p-3 rounded-lg border ${
    isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:ring-2 focus:ring-[#0D9488]`;

  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

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
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.bookkeeping.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.bookkeeping.simpleBookkeeping', 'Simple Bookkeeping')}
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          {t('tools.bookkeeping.trackIncomeAndExpenses', 'Track income and expenses')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-green-500/10 rounded-lg"><TrendingUp className="w-6 h-6 text-green-500" /></div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bookkeeping.totalIncome', 'Total Income')}</p>
            <p className="text-xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-red-500/10 rounded-lg"><TrendingDown className="w-6 h-6 text-red-500" /></div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bookkeeping.totalExpenses', 'Total Expenses')}</p>
            <p className="text-xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-[#0D9488]/10 rounded-lg"><DollarSign className="w-6 h-6 text-[#0D9488]" /></div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bookkeeping.balance', 'Balance')}</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>${balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="bookkeeping" toolName="Bookkeeping" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
          />
          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {transactions.length} transactions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'bookkeeping-transactions' })}
            onExportExcel={() => exportExcel({ filename: 'bookkeeping-transactions' })}
            onExportJSON={() => exportJSON({ filename: 'bookkeeping-transactions' })}
            onExportPDF={() => exportPDF({
              filename: 'bookkeeping-transactions',
              title: 'Bookkeeping Transactions',
              subtitle: `Balance: $${balance.toFixed(2)}`
            })}
            onPrint={() => print('Bookkeeping Transactions')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
          />
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]">
            <Plus className="w-5 h-5" />Add Transaction
          </button>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
            <input type="text" placeholder={t('tools.bookkeeping.description', 'Description')} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.bookkeeping.amount', 'Amount')} value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={inputClass} />
            <select value={formData.type} onChange={(e) => {
              const type = e.target.value as 'income' | 'expense';
              setFormData({ ...formData, type, category: categories[type][0] });
            }} className={inputClass}>
              <option value="income">{t('tools.bookkeeping.income', 'Income')}</option>
              <option value="expense">{t('tools.bookkeeping.expense', 'Expense')}</option>
            </select>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
              {categories[formData.type].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={addTransaction} disabled={!formData.description || !formData.amount}
              className="px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50">
              {t('tools.bookkeeping.save', 'Save')}
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className={`${cardClass} text-center py-8`}>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.bookkeeping.noTransactionsYetClickAdd', 'No transactions yet. Click "Add Transaction" to get started.')}
            </p>
          </div>
        ) : (
          transactions.map(t => (
            <div key={t.id} className={`${cardClass} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                {t.type === 'income' ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.description}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.date} • {t.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>
                <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookkeepingTool;
