import React from 'react';
import { Search, Add, Close, Edit, FileDownload, Receipt } from '@mui/icons-material';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Expense } from '../../../types/expense-tracker';
import { GlassCard } from '../../ui/GlassCard';

interface ExpensesTabProps {
  filteredAndSortedExpenses: Expense[];
  expenses: Expense[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  sortBy: 'date' | 'amount' | 'category' | 'title';
  setSortBy: (sortBy: 'date' | 'amount' | 'category' | 'title') => void;
  allCategories: string[];
  onAddExpense: () => void;
  onEditExpense: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  exportExpensesToCSV: () => void;
  deletingExpenseId?: string | null;
  loading?: boolean;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  filteredAndSortedExpenses,
  expenses,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  allCategories,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  exportExpensesToCSV,
  deletingExpenseId,
  loading,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Expenses
          </h1>
          <p className="text-white/60">
            Track and manage your daily expenses ({filteredAndSortedExpenses.length} of {expenses.length})
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={exportExpensesToCSV}
          disabled={filteredAndSortedExpenses.length === 0}
          className="border border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
        >
          <FileDownload className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search and Filter Section */}
      <GlassCard hover={false} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Label htmlFor="search" className="text-sm font-medium text-white mb-2 block">
              Search Expenses
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-white/40" />
              <Input
                id="search"
                type="text"
                placeholder="Search by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Filter by Category */}
          <div className="w-full md:w-48">
            <Label htmlFor="category-filter" className="text-sm font-medium text-white mb-2 block">
              Filter by Category
            </Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger id="category-filter" className="h-12 rounded-xl bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <Label htmlFor="sort-by" className="text-sm font-medium text-white mb-2 block">
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger id="sort-by" className="h-12 rounded-xl bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="amount">Highest Amount</SelectItem>
                <SelectItem value="category">Category A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || filterCategory !== 'all') && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-white/60">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-white/20">
                Search: "{searchQuery}"
                <Close
                  className="h-3 w-3 cursor-pointer hover:text-red-400"
                  onClick={() => setSearchQuery('')}
                />
              </Badge>
            )}
            {filterCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-white/20">
                Category: {filterCategory}
                <Close
                  className="h-3 w-3 cursor-pointer hover:text-red-400"
                  onClick={() => setFilterCategory('all')}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
              }}
              className="text-xs h-6 px-2 text-white hover:bg-white/10"
            >
              Clear all
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Expense Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <GlassCard key={index} hover={false}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-white/10 animate-pulse rounded"></div>
                    <div className="h-8 w-8 bg-white/10 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-white/10 animate-pulse rounded w-3/4"></div>
                  <div className="h-8 bg-white/10 animate-pulse rounded w-1/2"></div>
                  <div className="h-4 bg-white/10 animate-pulse rounded w-full"></div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <GlassCard hover={false} className="p-12 text-center">
          <Receipt className="h-16 w-16 mx-auto mb-4 text-teal-400/50" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Expenses Yet</h3>
          <p className="text-white/60 mb-6">
            Start tracking your expenses to manage your budget better
          </p>
          <Button
            onClick={onAddExpense}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
          >
            <Add className="h-4 w-4 mr-2" />
            Add Your First Expense
          </Button>
        </GlassCard>
      ) : filteredAndSortedExpenses.length === 0 ? (
        <GlassCard hover={false} className="p-12 text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-teal-400/50" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Expenses Found</h3>
          <p className="text-white/60 mb-6">
            No expenses match your current search and filters
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
            }}
            variant="outline"
            className="rounded-xl border-white/30 text-white hover:bg-white/10"
          >
            Clear Filters
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedExpenses.map((expense) => (
            <GlassCard key={expense.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                  {expense.icon}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditExpense(expense.id)}
                    className="h-8 w-8 text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDeleteExpense(expense.id)}
                    disabled={deletingExpenseId === expense.id}
                    className="h-8 w-8 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    {deletingExpenseId === expense.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    ) : (
                      <Close className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-white">
                  {expense.title}
                </h3>
                <p className="text-2xl font-bold text-teal-400">
                  ${expense.amount.toFixed(2)}
                </p>
                <p className="text-sm text-white/60">
                  {expense.description}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <Badge variant="outline" className="text-xs border-white/30 text-white">
                    {expense.category}
                  </Badge>
                  <span className="text-xs text-white/40">
                    {expense.date}
                  </span>
                </div>
                <div className="text-xs text-white/40">
                  {expense.paymentMethod}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};