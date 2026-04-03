import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Filter, Edit2, Trash2, Download, Calendar, DollarSign, Tag } from 'lucide-react';
import type { Expense, Income } from '../../services/financeService';

interface TransactionListProps {
  transactions: (Expense | Income)[];
  isLoading?: boolean;
  onEdit?: (transaction: Expense | Income) => void;
  onDelete?: (id: string) => void;
  onExport?: () => void;
  type?: 'all' | 'expenses' | 'income';
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  onEdit,
  onDelete,
  onExport,
  type = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique categories and payment methods for filters
  const categories = Array.from(new Set(
    transactions.map(t => t.category).filter(Boolean)
  ));

  const paymentMethods = Array.from(new Set(
    transactions
      .filter((t): t is Expense => 'paymentMethod' in t)
      .map(t => t.paymentMethod)
      .filter(Boolean)
  ));

  // Filter and sort logic
  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (transaction.tags && transaction.tags.some(tag => 
                            tag.toLowerCase().includes(searchQuery.toLowerCase())
                          ));
      
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      
      const matchesPaymentMethod = filterPaymentMethod === 'all' || 
                                 !('paymentMethod' in transaction) ||
                                 transaction.paymentMethod === filterPaymentMethod;
      
      return matchesSearch && matchesCategory && matchesPaymentMethod;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'date':
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number, isIncome = false) => {
    const formatted = `$${Math.abs(amount).toFixed(2)}`;
    return isIncome ? `+${formatted}` : `-${formatted}`;
  };

  const isIncome = (transaction: Expense | Income): transaction is Income => {
    return 'source' in transaction;
  };

  const getTransactionIcon = (transaction: Expense | Income) => {
    return isIncome(transaction) ? (
      <DollarSign className="h-5 w-5 text-green-600" />
    ) : (
      <DollarSign className="h-5 w-5 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                    <div className="space-y-1">
                      <div className="w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="w-20 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transactions</span>
            {onExport && (
              <Button
                variant="outline"
                onClick={onExport}
                className="rounded-xl"
                size="sm"
                disabled={filteredAndSortedTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            {type !== 'income' && (
              <div className="space-y-1">
                <Label className="text-sm font-medium">Payment Method</Label>
                <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>
                        {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sort By */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Order</Label>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || filterCategory !== 'all' || filterPaymentMethod !== 'all') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filterCategory}
                  <button 
                    onClick={() => setFilterCategory('all')}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterPaymentMethod !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Payment: {filterPaymentMethod.replace('_', ' ')}
                  <button 
                    onClick={() => setFilterPaymentMethod('all')}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterPaymentMethod('all');
                }}
                className="text-xs h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="rounded-xl">
        <CardContent className="p-0">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-xl font-semibold mb-2 text-white">No transactions found</h3>
              <p className="text-white/60">
                {searchQuery || filterCategory !== 'all' || filterPaymentMethod !== 'all'
                  ? 'No transactions match your current filters'
                  : 'No transactions recorded yet'
                }
              </p>
              {(searchQuery || filterCategory !== 'all' || filterPaymentMethod !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                    setFilterPaymentMethod('all');
                  }}
                  variant="outline"
                  className="mt-4 rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isIncome(transaction) ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {getTransactionIcon(transaction)}
                      </div>
                      
                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white truncate">
                            {transaction.description || 'No description'}
                          </h3>
                          {transaction.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.date)}
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                          
                          {'paymentMethod' in transaction && transaction.paymentMethod && (
                            <span className="text-xs">
                              {transaction.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          )}
                          
                          {isIncome(transaction) && transaction.source && (
                            <span className="text-xs">
                              {transaction.source}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <div className="flex gap-1">
                              {transaction.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {transaction.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{transaction.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          isIncome(transaction) ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatAmount(transaction.amount, isIncome(transaction))}
                        </div>
                        {'location' in transaction && transaction.location && (
                          <div className="text-xs text-white/60">
                            {transaction.location}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(transaction)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(transaction.id)}
                            className="h-8 w-8 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;