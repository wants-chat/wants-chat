import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Trash2, Edit2, CheckCircle, Clock, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Bill {
  id: number;
  name: string;
  category: string;
  amount: string;
  dueDate: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod: string;
  notes: string;
  autoPayEnabled: boolean;
  timestamp: string;
}

const CATEGORIES = [
  { id: 'utilities', name: 'Utilities', color: 'from-blue-500 to-cyan-500' },
  { id: 'rent', name: 'Rent/Mortgage', color: 'from-purple-500 to-pink-500' },
  { id: 'insurance', name: 'Insurance', color: 'from-emerald-500 to-teal-500' },
  { id: 'subscription', name: 'Subscriptions', color: 'from-orange-500 to-red-500' },
  { id: 'loan', name: 'Loans', color: 'from-amber-500 to-yellow-500' },
  { id: 'other', name: 'Other', color: 'from-slate-500 to-gray-500' },
];

const BillReminder: React.FC = () => {
  const { confirm } = useConfirm();
  const [bills, setBills] = useState<Bill[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'utilities',
    amount: '',
    dueDate: '',
    frequency: 'monthly' as 'one-time' | 'monthly' | 'quarterly' | 'yearly',
    paymentMethod: '',
    notes: '',
    autoPayEnabled: false,
  });

  useEffect(() => {
    loadBills();
    checkOverdueBills();
  }, []);

  const loadBills = () => {
    const stored = localStorage.getItem('bills');
    if (stored) {
      setBills(JSON.parse(stored));
    }
  };

  const saveBills = (newBills: Bill[]) => {
    localStorage.setItem('bills', JSON.stringify(newBills));
    setBills(newBills);
  };

  const checkOverdueBills = () => {
    const stored = localStorage.getItem('bills');
    if (stored) {
      const currentBills: Bill[] = JSON.parse(stored);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updated = currentBills.map(bill => {
        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (bill.status === 'pending' && dueDate < today) {
          return { ...bill, status: 'overdue' as const };
        }
        return bill;
      });

      localStorage.setItem('bills', JSON.stringify(updated));
      setBills(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBill: Bill = {
      id: editingBill?.id || Date.now(),
      ...formData,
      status: editingBill?.status || 'pending',
      timestamp: editingBill?.timestamp || new Date().toISOString(),
    };

    if (editingBill) {
      saveBills(bills.map(b => (b.id === editingBill.id ? newBill : b)));
    } else {
      saveBills([newBill, ...bills]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'utilities',
      amount: '',
      dueDate: '',
      frequency: 'monthly',
      paymentMethod: '',
      notes: '',
      autoPayEnabled: false,
    });
    setShowAddModal(false);
    setEditingBill(null);
  };

  const deleteBill = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Bill',
      message: 'Are you sure you want to delete this bill? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      saveBills(bills.filter(b => b.id !== id));
    }
  };

  const markAsPaid = (id: number) => {
    saveBills(bills.map(b => (b.id === id ? { ...b, status: 'paid' as const } : b)));
  };

  const editBill = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      category: bill.category,
      amount: bill.amount,
      dueDate: bill.dueDate,
      frequency: bill.frequency,
      paymentMethod: bill.paymentMethod,
      notes: bill.notes,
      autoPayEnabled: bill.autoPayEnabled,
    });
    setShowAddModal(true);
  };

  const filteredBills = bills.filter(bill => {
    const matchesCategory = selectedCategory === 'all' || bill.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'overdue': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalAmount = filteredBills
    .filter(b => b.status !== 'paid')
    .reduce((sum, bill) => sum + parseFloat(bill.amount || '0'), 0);

  const upcomingBills = bills.filter(b => {
    const days = getDaysUntilDue(b.dueDate);
    return b.status === 'pending' && days >= 0 && days <= 7;
  }).length;

  const overdueBills = bills.filter(b => b.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bill Reminder</h1>
          <p className="text-gray-400">Track and manage all your bills in one place</p>
        </div>

        {/* Stats */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-teal-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Pending</p>
                <p className="text-3xl font-bold text-white">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-teal-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Due This Week</p>
                <p className="text-3xl font-bold text-white">{upcomingBills}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Overdue</p>
                <p className="text-3xl font-bold text-white">{overdueBills}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-teal-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Bill
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedStatus('paid')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedStatus === 'paid'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setSelectedStatus('overdue')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedStatus === 'overdue'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                Overdue
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white`
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bills Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No bills found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
              >
                Add Your First Bill
              </button>
            </div>
          ) : (
            filteredBills.map(bill => {
              const category = CATEGORIES.find(c => c.id === bill.category);
              const daysUntil = getDaysUntilDue(bill.dueDate);

              return (
                <div
                  key={bill.id}
                  className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border p-6 hover:border-teal-500/50 transition-all ${
                    bill.status === 'overdue'
                      ? 'border-red-500/50'
                      : 'border-teal-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category?.color || 'from-teal-500 to-cyan-500'}`}>
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      {bill.status === 'pending' && (
                        <button
                          onClick={() => markAsPaid(bill.id)}
                          className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                          title="Mark as paid"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => editBill(bill)}
                        className="p-2 bg-slate-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">{bill.name}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-cyan-400 bg-cyan-500/20">
                      {bill.frequency}
                    </span>
                    {bill.autoPayEnabled && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-500/20">
                        Auto-Pay
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Amount</span>
                      <span className="text-xl font-bold text-white">${bill.amount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due Date
                      </span>
                      <span className="text-sm text-white">{bill.dueDate}</span>
                    </div>

                    {bill.status === 'pending' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Days Until Due</span>
                        <span
                          className={`text-sm font-medium ${
                            daysUntil < 0
                              ? 'text-red-400'
                              : daysUntil <= 3
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}
                        >
                          {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
                        </span>
                      </div>
                    )}

                    {bill.paymentMethod && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Payment Method</span>
                        <span className="text-sm text-white">{bill.paymentMethod}</span>
                      </div>
                    )}
                  </div>

                  {bill.notes && (
                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-xs text-gray-400">{bill.notes}</p>
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
            <div className="bg-slate-800 rounded-2xl border border-teal-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">
                  {editingBill ? 'Edit Bill' : 'Add Bill'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bill Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="e.g., Electric Bill"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      required
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      required
                    >
                      <option value="one-time">One-time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method (optional)</label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="e.g., Credit Card, Bank Transfer"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoPayEnabled}
                      onChange={(e) => setFormData({ ...formData, autoPayEnabled: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-300">Auto-pay enabled</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="Additional notes..."
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
                  >
                    {editingBill ? 'Update Bill' : 'Add Bill'}
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

export default BillReminder;
