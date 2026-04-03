'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  X,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  RefreshCw,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface PortfolioTrackerToolProps {
  uiConfig?: UIConfig;
}

interface Investment {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  category: string;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvestmentCategory {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_CATEGORIES: InvestmentCategory[] = [
  { id: 'stocks', name: 'Stocks', color: '#3B82F6' },
  { id: 'bonds', name: 'Bonds', color: '#10B981' },
  { id: 'crypto', name: 'Crypto', color: '#F59E0B' },
  { id: 'etf', name: 'ETF', color: '#8B5CF6' },
  { id: 'mutual-fund', name: 'Mutual Funds', color: '#06B6D4' },
  { id: 'real-estate', name: 'Real Estate', color: '#EF4444' },
  { id: 'other', name: 'Other', color: '#6B7280' },
];

// Column configuration for exports
const INVESTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'symbol', header: 'Symbol', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'buyPrice', header: 'Buy Price', type: 'currency' },
  { key: 'currentPrice', header: 'Current Price', type: 'currency' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
];

export const PortfolioTrackerTool: React.FC<PortfolioTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // useToolData hook for investments management
  const {
    data: investments,
    addItem: addInvestment,
    updateItem: updateInvestment,
    deleteItem: deleteInvestment,
    isLoading: investmentsLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Investment>('portfolio-tracker', [], INVESTMENT_COLUMNS);

  // State
  const [categories, setCategories] = useState<InvestmentCategory[]>(DEFAULT_CATEGORIES);
  const [error, setError] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // UI State
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
    category: 'stocks',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [newCategory, setNewCategory] = useState({ name: '', color: '#6B7280' });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount || params.title) {
        setFormData((prev) => ({
          ...prev,
          name: params.title || prev.name,
          currentPrice: params.amount?.toString() || prev.currentPrice,
        }));
        setShowInvestmentModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // CRUD Operations
  const handleAddInvestment = () => {
    if (!formData.symbol || !formData.name || !formData.quantity || !formData.buyPrice || !formData.currentPrice) {
      setError('Please fill in all required fields');
      return;
    }

    const newInvestment: Investment = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      buyPrice: parseFloat(formData.buyPrice),
      currentPrice: parseFloat(formData.currentPrice),
      category: formData.category,
      purchaseDate: formData.purchaseDate,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInvestment(newInvestment);
    resetForm();
    setShowInvestmentModal(false);
  };

  const handleUpdateInvestment = () => {
    if (!editingInvestment) return;

    updateInvestment(editingInvestment.id, {
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      buyPrice: parseFloat(formData.buyPrice),
      currentPrice: parseFloat(formData.currentPrice),
      category: formData.category,
      purchaseDate: formData.purchaseDate,
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    });

    resetForm();
    setShowInvestmentModal(false);
    setEditingInvestment(null);
  };

  const handleDeleteInvestment = (investmentId: string) => {
    deleteInvestment(investmentId);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;

    const category: InvestmentCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      color: newCategory.color,
    };

    const customCategories = categories.filter((c) => !DEFAULT_CATEGORIES.find((dc) => dc.id === c.id));
    const updatedCustomCategories = [...customCategories, category];
    setCategories([...DEFAULT_CATEGORIES, ...updatedCustomCategories]);
    setNewCategory({ name: '', color: '#6B7280' });
    setShowCategoryModal(false);
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      buyPrice: '',
      currentPrice: '',
      category: 'stocks',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setError(null);
  };

  const openEditModal = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      symbol: investment.symbol,
      name: investment.name,
      quantity: investment.quantity.toString(),
      buyPrice: investment.buyPrice.toString(),
      currentPrice: investment.currentPrice.toString(),
      category: investment.category,
      purchaseDate: investment.purchaseDate,
      notes: investment.notes || '',
    });
    setShowInvestmentModal(true);
  };

  // Computed values
  const filteredInvestments = useMemo(() => {
    return investments.filter((investment) => {
      const matchesSearch =
        investment.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        investment.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || investment.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [investments, searchQuery, categoryFilter]);

  const stats = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.quantity * inv.buyPrice, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.quantity * inv.currentPrice, 0);
    const totalGainLoss = totalCurrentValue - totalInvested;
    const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrentValue, totalGainLoss, gainLossPercent };
  }, [investments]);

  const getCategoryById = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  };

  // Styles
  const cardClass = `rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`;
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all`;
  const buttonPrimary = 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium';
  const buttonSecondary = `px-4 py-2 rounded-lg border ${
    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  } transition-colors`;

  const calculateInvestmentValue = (investment: Investment) => {
    return {
      totalInvested: investment.quantity * investment.buyPrice,
      currentValue: investment.quantity * investment.currentPrice,
      gainLoss: investment.quantity * (investment.currentPrice - investment.buyPrice),
      gainLossPercent: ((investment.currentPrice - investment.buyPrice) / investment.buyPrice) * 100,
    };
  };

  return (
    <div className="space-y-6">
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-500 font-medium">{t('tools.portfolioTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.portfolioTracker.portfolioTracker', 'Portfolio Tracker')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.portfolioTracker.trackAndManageYourInvestment', 'Track and manage your investment portfolio')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.portfolioTracker.totalInvested', 'Total Invested')}</p>
              <p className="text-xl font-bold text-blue-500">${stats.totalInvested.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.portfolioTracker.currentValue', 'Current Value')}</p>
              <p className="text-xl font-bold text-cyan-500">${stats.totalCurrentValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${stats.totalGainLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {stats.totalGainLoss >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.portfolioTracker.gainLoss', 'Gain/Loss')}</p>
              <p className={`text-xl font-bold ${stats.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${stats.totalGainLoss.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${stats.gainLossPercent >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <AlertCircle className={`w-6 h-6 ${stats.gainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.portfolioTracker.return', 'Return %')}</p>
              <p className={`text-xl font-bold ${stats.gainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.gainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.portfolioTracker.searchInvestments', 'Search investments...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>

        <button onClick={() => setShowFilters(!showFilters)} className={buttonSecondary}>
          <Filter className="w-4 h-4 inline mr-2" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4 inline ml-2" /> : <ChevronDown className="w-4 h-4 inline ml-2" />}
        </button>

        <ExportDropdown
          onExportCSV={() => exportToCSV(filteredInvestments, INVESTMENT_COLUMNS, { filename: 'portfolio' })}
          onExportExcel={() => exportToExcel(filteredInvestments, INVESTMENT_COLUMNS, { filename: 'portfolio' })}
          onExportJSON={() => exportToJSON({ investments: filteredInvestments }, { filename: 'portfolio-data' })}
          onExportPDF={async () => {
            await exportToPDF(filteredInvestments, INVESTMENT_COLUMNS, {
              filename: 'portfolio',
              title: 'Portfolio Report',
              subtitle: `Total Value: $${stats.totalCurrentValue.toFixed(2)} | Gain/Loss: ${stats.gainLossPercent.toFixed(2)}%`,
            });
          }}
          onPrint={() => printData(filteredInvestments, INVESTMENT_COLUMNS, { title: 'Portfolio Report' })}
          onCopyToClipboard={() => copyUtil(filteredInvestments, INVESTMENT_COLUMNS, 'tab')}
          theme={isDark ? 'dark' : 'light'}
        />

        <button
          onClick={() => {
            resetForm();
            setEditingInvestment(null);
            setShowInvestmentModal(true);
          }}
          className={buttonPrimary}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          {t('tools.portfolioTracker.addInvestment', 'Add Investment')}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`${cardClass} p-4 flex flex-wrap gap-4`}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.portfolioTracker.category', 'Category')}</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass}>
              <option value="all">{t('tools.portfolioTracker.allCategories', 'All Categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowCategoryModal(true)} className={buttonSecondary}>
              <Plus className="w-4 h-4 inline mr-1" />
              {t('tools.portfolioTracker.newCategory', 'New Category')}
            </button>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="flex justify-end">
        <WidgetEmbedButton toolSlug="portfolio-tracker" toolName="Portfolio Tracker" />

        <SyncStatus
          isSynced={isSynced}
          isSaving={isSaving}
          lastSaved={lastSaved}
          syncError={syncError}
          onForceSync={forceSync}
          theme={isDark ? 'dark' : 'light'}
          showLabel={true}
          size="sm"
        />
      </div>

      {/* Investments List */}
      <div className="space-y-3">
        {investmentsLoading ? (
          <div className={`${cardClass} p-8 text-center`}>
            <RefreshCw className={`w-8 h-8 mx-auto animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.portfolioTracker.loadingInvestments', 'Loading investments...')}</p>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className={`${cardClass} p-8 text-center`}>
            <TrendingUp className={`w-12 h-12 mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {investments.length === 0 ? t('tools.portfolioTracker.noInvestmentsYetAddYour', 'No investments yet. Add your first investment!') : t('tools.portfolioTracker.noInvestmentsMatchYourFilters', 'No investments match your filters.')}
            </p>
          </div>
        ) : (
          filteredInvestments.map((investment) => {
            const category = getCategoryById(investment.category);
            const value = calculateInvestmentValue(investment);

            return (
              <div key={investment.id} className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <TrendingUp className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {investment.symbol} - {investment.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {category.name} • {investment.quantity} shares
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${value.currentValue.toFixed(2)}
                      </p>
                      <div className={`text-sm font-medium ${value.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {value.gainLoss >= 0 ? '+' : ''}${value.gainLoss.toFixed(2)} ({value.gainLossPercent.toFixed(2)}%)
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(investment)}
                        className={`p-2 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-colors`}
                        title={t('tools.portfolioTracker.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvestment(investment.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {investment.notes && (
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} pl-16`}>{investment.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Investment Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg ${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingInvestment ? t('tools.portfolioTracker.editInvestment', 'Edit Investment') : t('tools.portfolioTracker.addNewInvestment', 'Add New Investment')}
              </h3>
              <button
                onClick={() => {
                  setShowInvestmentModal(false);
                  setEditingInvestment(null);
                  resetForm();
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.portfolioTracker.symbol', 'Symbol *')}
                  </label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder={t('tools.portfolioTracker.eGAapl', 'e.g., AAPL')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.portfolioTracker.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('tools.portfolioTracker.eGAppleInc', 'e.g., Apple Inc')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.portfolioTracker.quantity', 'Quantity *')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.portfolioTracker.category2', 'Category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.portfolioTracker.buyPrice', 'Buy Price *')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.buyPrice}
                      onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                      placeholder="0.00"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.portfolioTracker.currentPrice', 'Current Price *')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      placeholder="0.00"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.portfolioTracker.purchaseDate', 'Purchase Date')}</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.portfolioTracker.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('tools.portfolioTracker.addAnyNotes', 'Add any notes...')}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowInvestmentModal(false);
                    setEditingInvestment(null);
                    resetForm();
                  }}
                  className={`flex-1 ${buttonSecondary}`}
                >
                  {t('tools.portfolioTracker.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingInvestment ? handleUpdateInvestment : handleAddInvestment}
                  className={`flex-1 ${buttonPrimary}`}
                >
                  {editingInvestment ? t('tools.portfolioTracker.updateInvestment', 'Update Investment') : t('tools.portfolioTracker.addInvestment2', 'Add Investment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm ${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.portfolioTracker.addCategory', 'Add Category')}</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.portfolioTracker.categoryName', 'Category Name')}
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder={t('tools.portfolioTracker.eGCommodities', 'e.g., Commodities')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.portfolioTracker.color', 'Color')}</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCategoryModal(false)} className={`flex-1 ${buttonSecondary}`}>
                  {t('tools.portfolioTracker.cancel2', 'Cancel')}
                </button>
                <button onClick={handleAddCategory} className={`flex-1 ${buttonPrimary}`}>
                  {t('tools.portfolioTracker.addCategory2', 'Add Category')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTrackerTool;
