import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Search, Trash2, Edit2, DollarSign, Percent, BarChart3, PieChart, ArrowUp, ArrowDown } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Investment {
  id: number;
  name: string;
  type: 'stocks' | 'crypto' | 'bonds' | 'mutual-funds' | 'etf' | 'real-estate' | 'other';
  symbol: string;
  quantity: string;
  buyPrice: string;
  currentPrice: string;
  purchaseDate: string;
  notes: string;
  timestamp: string;
}

const INVESTMENT_TYPES = [
  { id: 'stocks', name: 'Stocks', color: 'from-blue-500 to-cyan-500' },
  { id: 'crypto', name: 'Cryptocurrency', color: 'from-orange-500 to-amber-500' },
  { id: 'bonds', name: 'Bonds', color: 'from-emerald-500 to-teal-500' },
  { id: 'mutual-funds', name: 'Mutual Funds', color: 'from-purple-500 to-pink-500' },
  { id: 'etf', name: 'ETF', color: 'from-indigo-500 to-blue-500' },
  { id: 'real-estate', name: 'Real Estate', color: 'from-green-500 to-emerald-500' },
  { id: 'other', name: 'Other', color: 'from-slate-500 to-gray-500' },
];

const InvestmentTracker: React.FC = () => {
  const { confirm } = useConfirm();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'stocks' as Investment['type'],
    symbol: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
    purchaseDate: '',
    notes: '',
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = () => {
    const stored = localStorage.getItem('investments');
    if (stored) {
      setInvestments(JSON.parse(stored));
    }
  };

  const saveInvestments = (newInvestments: Investment[]) => {
    localStorage.setItem('investments', JSON.stringify(newInvestments));
    setInvestments(newInvestments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInvestment: Investment = {
      id: editingInvestment?.id || Date.now(),
      ...formData,
      timestamp: editingInvestment?.timestamp || new Date().toISOString(),
    };

    if (editingInvestment) {
      saveInvestments(investments.map(i => (i.id === editingInvestment.id ? newInvestment : i)));
    } else {
      saveInvestments([newInvestment, ...investments]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'stocks',
      symbol: '',
      quantity: '',
      buyPrice: '',
      currentPrice: '',
      purchaseDate: '',
      notes: '',
    });
    setShowAddModal(false);
    setEditingInvestment(null);
  };

  const deleteInvestment = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Investment',
      message: 'Are you sure you want to delete this investment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      saveInvestments(investments.filter(i => i.id !== id));
    }
  };

  const editInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol,
      quantity: investment.quantity,
      buyPrice: investment.buyPrice,
      currentPrice: investment.currentPrice,
      purchaseDate: investment.purchaseDate,
      notes: investment.notes,
    });
    setShowAddModal(true);
  };

  const calculateGainLoss = (investment: Investment) => {
    const quantity = parseFloat(investment.quantity || '0');
    const buyPrice = parseFloat(investment.buyPrice || '0');
    const currentPrice = parseFloat(investment.currentPrice || '0');

    const invested = quantity * buyPrice;
    const currentValue = quantity * currentPrice;
    const gainLoss = currentValue - invested;
    const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

    return {
      invested,
      currentValue,
      gainLoss,
      gainLossPercent,
    };
  };

  const filteredInvestments = investments.filter(investment => {
    const matchesType = selectedType === 'all' || investment.type === selectedType;
    const matchesSearch =
      investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investment.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate portfolio stats
  const portfolioStats = filteredInvestments.reduce(
    (acc, investment) => {
      const stats = calculateGainLoss(investment);
      return {
        totalInvested: acc.totalInvested + stats.invested,
        totalCurrentValue: acc.totalCurrentValue + stats.currentValue,
        totalGainLoss: acc.totalGainLoss + stats.gainLoss,
      };
    },
    { totalInvested: 0, totalCurrentValue: 0, totalGainLoss: 0 }
  );

  const portfolioGainLossPercent =
    portfolioStats.totalInvested > 0
      ? (portfolioStats.totalGainLoss / portfolioStats.totalInvested) * 100
      : 0;

  // Type breakdown
  const typeBreakdown = INVESTMENT_TYPES.map(type => {
    const typeInvestments = filteredInvestments.filter(i => i.type === type.id);
    const value = typeInvestments.reduce((sum, i) => sum + calculateGainLoss(i).currentValue, 0);
    return {
      ...type,
      value,
      count: typeInvestments.length,
    };
  }).filter(t => t.count > 0);

  return (
    <div className="min-h-screen bg-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Investment Tracker</h1>
          <p className="text-gray-400">Monitor your investment portfolio performance</p>
        </div>

        {/* Portfolio Overview */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Invested</p>
                <p className="text-3xl font-bold text-white">
                  ${portfolioStats.totalInvested.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Value</p>
                <p className="text-3xl font-bold text-white">
                  ${portfolioStats.totalCurrentValue.toFixed(2)}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-400 opacity-50" />
            </div>
          </div>

          <div
            className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border p-6 ${
              portfolioStats.totalGainLoss >= 0 ? 'border-green-500/30' : 'border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Gain/Loss</p>
                <p
                  className={`text-3xl font-bold ${
                    portfolioStats.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {portfolioStats.totalGainLoss >= 0 ? '+' : ''}$
                  {portfolioStats.totalGainLoss.toFixed(2)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    portfolioStats.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {portfolioGainLossPercent >= 0 ? '+' : ''}
                  {portfolioGainLossPercent.toFixed(2)}%
                </p>
              </div>
              {portfolioStats.totalGainLoss >= 0 ? (
                <ArrowUp className="w-12 h-12 text-green-400 opacity-50" />
              ) : (
                <ArrowDown className="w-12 h-12 text-red-400 opacity-50" />
              )}
            </div>
          </div>
        </div>

        {/* Type Breakdown */}
        {typeBreakdown.length > 0 && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-teal-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="w-6 h-6 text-teal-400" />
                <h2 className="text-xl font-semibold text-white">Portfolio Breakdown</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {typeBreakdown.map(type => (
                  <div key={type.id} className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">{type.name}</p>
                    <p className="text-xl font-bold text-white">${type.value.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{type.count} holdings</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-teal-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Investment
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            {INVESTMENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedType === type.id
                    ? `bg-gradient-to-r ${type.color} text-white`
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Investments Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No investments found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all"
              >
                Add Your First Investment
              </button>
            </div>
          ) : (
            filteredInvestments.map(investment => {
              const type = INVESTMENT_TYPES.find(t => t.id === investment.type);
              const stats = calculateGainLoss(investment);

              return (
                <div
                  key={investment.id}
                  className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-teal-500/30 p-6 hover:border-teal-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${type?.color || 'from-teal-500 to-cyan-500'}`}>
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editInvestment(investment)}
                        className="p-2 bg-slate-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteInvestment(investment.id)}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white mb-1">{investment.name}</h3>
                    <p className="text-sm text-gray-400">{investment.symbol}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Quantity</span>
                      <span className="text-sm font-medium text-white">{investment.quantity}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Buy Price</span>
                      <span className="text-sm font-medium text-white">${investment.buyPrice}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Current Price</span>
                      <span className="text-sm font-medium text-white">${investment.currentPrice}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Invested</span>
                        <span className="text-sm font-medium text-white">${stats.invested.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Current Value</span>
                        <span className="text-sm font-medium text-white">${stats.currentValue.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Gain/Loss</span>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              stats.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {stats.gainLoss >= 0 ? '+' : ''}${stats.gainLoss.toFixed(2)}
                          </p>
                          <p
                            className={`text-xs ${
                              stats.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {stats.gainLossPercent >= 0 ? '+' : ''}
                            {stats.gainLossPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Purchased: {investment.purchaseDate}</span>
                  </div>

                  {investment.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-gray-400">{investment.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl border border-green-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">
                  {editingInvestment ? 'Edit Investment' : 'Add Investment'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Investment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                    required
                  >
                    {INVESTMENT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                      placeholder="e.g., Apple Inc."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                      placeholder="e.g., AAPL"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Buy Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.buyPrice}
                      onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all"
                  >
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentTracker;
