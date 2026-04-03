import React from 'react';
import { Receipt, Dashboard, Analytics, AccountBalance, Add } from '@mui/icons-material';
import { Button } from '../../components/ui/button';
import { TabType } from '../../types/expense-tracker';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

interface ExpenseTrackerLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onAddExpense: () => void;
}

export const ExpenseTrackerLayout: React.FC<ExpenseTrackerLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onAddExpense,
}) => {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <BackgroundEffects />

      {/* Landing Page Header */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* Expense Tracker Navigation Tabs */}
      <div className="relative z-20 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-teal-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <Dashboard className="h-5 w-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'expenses'
                    ? 'border-teal-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <Receipt className="h-5 w-5" />
                My Expenses
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-teal-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <Analytics className="h-5 w-5" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'budget'
                    ? 'border-teal-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <AccountBalance className="h-5 w-5" />
                Budget
              </button>
            </nav>

            <Button
              onClick={onAddExpense}
              className="my-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
            >
              <Add className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};