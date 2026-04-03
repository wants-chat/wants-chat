/**
 * Accounting Generator
 *
 * Generates accounting-related components:
 * - AccountingStats: Dashboard stats for accounting metrics
 * - CalendarAccounting: Calendar for deadlines, payments, tax dates
 * - TaxReturnFilters: Filters for tax return management
 */

import { pascalCase } from 'change-case';

export interface AccountingStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showRevenue?: boolean;
  showExpenses?: boolean;
  showTaxes?: boolean;
  showInvoices?: boolean;
}

export interface CalendarAccountingOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showDeadlines?: boolean;
  showPayments?: boolean;
  showReconciliations?: boolean;
}

export interface TaxReturnFiltersOptions {
  componentName?: string;
  taxYears?: number[];
  statuses?: string[];
  types?: string[];
  showClientFilter?: boolean;
  clientsEndpoint?: string;
}

/**
 * Generate an AccountingStats component
 */
export function generateAccountingStats(options: AccountingStatsOptions = {}): string {
  const {
    componentName = 'AccountingStats',
    endpoint = '/accounting/stats',
    queryKey = 'accounting-stats',
    showRevenue = true,
    showExpenses = true,
    showTaxes = true,
    showInvoices = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  FileText,
  Calculator,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  period?: 'month' | 'quarter' | 'year';
  clientId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  period = 'month',
  clientId,
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}', period, clientId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ period });
        if (clientId) params.append('clientId', clientId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch accounting stats:', err);
        return {};
      }
    },
  });

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return \`\${value >= 0 ? '+' : ''}\${value.toFixed(1)}%\`;
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${showRevenue ? `{/* Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            {stats?.revenueChange !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {stats.revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {formatPercentage(stats.revenueChange)}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(stats?.totalRevenue)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
        </div>` : ''}

        ${showExpenses ? `{/* Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            {stats?.expensesChange !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                stats.expensesChange <= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {stats.expensesChange <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                {formatPercentage(Math.abs(stats.expensesChange))}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(stats?.totalExpenses)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
        </div>` : ''}

        {/* Net Profit */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              'p-3 rounded-lg',
              (stats?.netProfit || 0) >= 0
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-orange-100 dark:bg-orange-900/30'
            )}>
              <PiggyBank className={cn(
                'w-6 h-6',
                (stats?.netProfit || 0) >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              )} />
            </div>
            {stats?.profitMargin !== undefined && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stats.profitMargin.toFixed(1)}% margin
              </span>
            )}
          </div>
          <div className={cn(
            'text-3xl font-bold mb-1',
            (stats?.netProfit || 0) >= 0
              ? 'text-gray-900 dark:text-white'
              : 'text-red-600 dark:text-red-400'
          )}>
            {formatCurrency(stats?.netProfit)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Net Profit</div>
        </div>

        ${showInvoices ? `{/* Outstanding Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Receipt className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            {stats?.overdueInvoices > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                {stats.overdueInvoices} overdue
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(stats?.outstandingInvoices)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Outstanding Invoices</div>
        </div>` : ''}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${showTaxes ? `{/* Tax Liabilities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tax Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Tax</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats?.estimatedTax)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tax Paid YTD</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats?.taxPaidYTD)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tax Due</span>
              <span className={cn(
                'text-sm font-medium',
                (stats?.taxDue || 0) > 0 ? 'text-red-600' : 'text-green-600'
              )}>
                {formatCurrency(stats?.taxDue)}
              </span>
            </div>
          </div>
        </div>` : ''}

        {/* Accounts Receivable */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Accounts Receivable</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">0-30 Days</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats?.ar0to30)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">31-60 Days</span>
              <span className="text-sm font-medium text-yellow-600">
                {formatCurrency(stats?.ar31to60)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">60+ Days</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(stats?.ar60plus)}
              </span>
            </div>
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Accounts Payable</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Due This Week</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats?.apDueThisWeek)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Due This Month</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats?.apDueThisMonth)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
              <span className={cn(
                'text-sm font-medium',
                (stats?.apOverdue || 0) > 0 ? 'text-red-600' : 'text-green-600'
              )}>
                {formatCurrency(stats?.apOverdue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats?.alerts && stats.alerts.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Financial Alerts
          </h3>
          <div className="space-y-3">
            {stats.alerts.map((alert: any, idx: number) => (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg',
                  alert.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20',
                  alert.type === 'error' && 'bg-red-50 dark:bg-red-900/20',
                  alert.type === 'info' && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                {alert.type === 'info' && <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a CalendarAccounting component
 */
export function generateCalendarAccounting(options: CalendarAccountingOptions = {}): string {
  const {
    componentName = 'CalendarAccounting',
    endpoint = '/accounting/calendar',
    queryKey = 'accounting-calendar',
    showDeadlines = true,
    showPayments = true,
    showReconciliations = true,
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  Plus,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface AccountingEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'payment' | 'reconciliation' | 'tax' | 'other';
  amount?: number;
  status?: 'pending' | 'completed' | 'overdue';
  description?: string;
  clientName?: string;
  recurring?: boolean;
}

interface ${componentName}Props {
  events?: AccountingEvent[];
  className?: string;
  onEventClick?: (event: AccountingEvent) => void;
  onAddEvent?: (date: Date) => void;
  clientId?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_TYPES = [
  { key: 'all', label: 'All', color: 'gray' },
  { key: 'deadline', label: 'Deadlines', color: 'red' },
  { key: 'payment', label: 'Payments', color: 'green' },
  { key: 'reconciliation', label: 'Reconciliations', color: 'blue' },
  { key: 'tax', label: 'Tax', color: 'purple' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  events: propEvents,
  className,
  onEventClick,
  onAddEvent,
  clientId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AccountingEvent | null>(null);

  // Fetch events
  const { data: fetchedEvents = [], isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear(), clientId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        if (clientId) params.append('clientId', clientId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        return [];
      }
    },
    enabled: !propEvents || propEvents.length === 0,
  });

  const events = propEvents && propEvents.length > 0 ? propEvents : fetchedEvents;

  // Filter events
  const filteredEvents = useMemo(() => {
    if (selectedType === 'all') return events;
    return events.filter((e: AccountingEvent) => e.type === selectedType);
  }, [events, selectedType]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Get events for date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event: AccountingEvent) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const getEventColor = (type: string, status?: string) => {
    if (status === 'overdue') {
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    }
    if (status === 'completed') {
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    }
    const colors: Record<string, string> = {
      deadline: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
      payment: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
      reconciliation: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
      tax: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
      other: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[type] || colors.other;
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.FC<any>> = {
      deadline: AlertCircle,
      payment: DollarSign,
      reconciliation: CheckCircle,
      tax: FileText,
      other: CalendarIcon,
    };
    return icons[type] || CalendarIcon;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const navigatePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const handleEventClick = (event: AccountingEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      setSelectedEvent(event);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goToToday} className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Today
              </button>
              <button onClick={navigateNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {onAddEvent && (
            <button
              onClick={() => onAddEvent(new Date())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                selectedType === type.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day.date);
              const hasOverdue = dayEvents.some((e: AccountingEvent) => e.status === 'overdue');

              return (
                <div
                  key={idx}
                  onClick={() => onAddEvent && onAddEvent(day.date)}
                  className={cn(
                    'min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 transition-colors',
                    !day.isCurrentMonth && 'bg-gray-50 dark:bg-gray-800/50',
                    onAddEvent && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    idx % 7 === 6 && 'border-r-0'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                    isToday(day.date) && 'bg-blue-600 text-white',
                    hasOverdue && !isToday(day.date) && 'text-red-600 font-bold',
                    !isToday(day.date) && !hasOverdue && !day.isCurrentMonth && 'text-gray-400'
                  )}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: AccountingEvent) => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                          className={cn(
                            'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2 flex items-center gap-1',
                            getEventColor(event.type, event.status)
                          )}
                        >
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        ${showDeadlines ? `{filteredEvents.filter((e: AccountingEvent) => e.type === 'deadline' && e.status !== 'completed').length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-2">
              {filteredEvents
                .filter((e: AccountingEvent) => e.type === 'deadline' && e.status !== 'completed')
                .slice(0, 5)
                .map((event: AccountingEvent) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    {event.amount && (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(event.amount)}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}` : ''}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {React.createElement(getEventIcon(selectedEvent.type), {
                  className: 'w-6 h-6 text-blue-600 dark:text-blue-400'
                })}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedEvent.title}
                </h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                  getEventColor(selectedEvent.type, selectedEvent.status)
                )}>
                  {selectedEvent.type}
                </span>
                {selectedEvent.status && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    selectedEvent.status === 'completed' && 'bg-green-100 text-green-700',
                    selectedEvent.status === 'overdue' && 'bg-red-100 text-red-700',
                    selectedEvent.status === 'pending' && 'bg-yellow-100 text-yellow-700'
                  )}>
                    {selectedEvent.status}
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date: </span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </span>
              </div>
              {selectedEvent.amount && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Amount: </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(selectedEvent.amount)}
                  </span>
                </div>
              )}
              {selectedEvent.clientName && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Client: </span>
                  <span className="text-gray-900 dark:text-white">{selectedEvent.clientName}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Description: </span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a TaxReturnFilters component
 */
export function generateTaxReturnFilters(options: TaxReturnFiltersOptions = {}): string {
  const {
    componentName = 'TaxReturnFilters',
    taxYears = [2024, 2023, 2022, 2021, 2020],
    statuses = ['All', 'Not Started', 'In Progress', 'Under Review', 'Filed', 'Amended'],
    types = ['All', 'Individual', 'Business', 'Partnership', 'Corporation', 'Trust'],
    showClientFilter = true,
    clientsEndpoint = '/clients',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  User,
  Building,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  taxYear: string;
  status: string;
  type: string;
  clientId: string;
  filedDateStart: string;
  filedDateEnd: string;
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
  collapsible?: boolean;
}

const taxYears = ${JSON.stringify(taxYears)};
const statuses = ${JSON.stringify(statuses)};
const types = ${JSON.stringify(types)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
  collapsible = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    taxYear: '',
    status: 'All',
    type: 'All',
    clientId: '',
    filedDateStart: '',
    filedDateEnd: '',
  });

  ${showClientFilter ? `// Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-filter'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${clientsEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        return [];
      }
    },
  });` : ''}

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    const cleared: FilterValues = {
      search: '',
      taxYear: '',
      status: 'All',
      type: 'All',
      clientId: '',
      filedDateStart: '',
      filedDateEnd: '',
    };
    setFilters(cleared);
    if (onChange) onChange(cleared);
    if (onSearch) onSearch(cleared);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.taxYear ||
    currentFilters.status !== 'All' ||
    currentFilters.type !== 'All' ||
    currentFilters.clientId ||
    currentFilters.filedDateStart ||
    currentFilters.filedDateEnd;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Under Review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Filed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Amended': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      {collapsible && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">Tax Return Filters</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                Active
              </span>
            )}
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      )}

      {(!collapsible || expanded) && (
        <div className={cn('p-4', collapsible && 'border-t border-gray-200 dark:border-gray-700')}>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={currentFilters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search tax returns..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {currentFilters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tax Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Tax Year
                </label>
                <select
                  value={currentFilters.taxYear}
                  onChange={(e) => updateFilter('taxYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Years</option>
                  {taxYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Status
                </label>
                <select
                  value={currentFilters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  Return Type
                </label>
                <select
                  value={currentFilters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              ${showClientFilter ? `{/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Client
                </label>
                <select
                  value={currentFilters.clientId}
                  onChange={(e) => updateFilter('clientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Clients</option>
                  {clients.map((client: any) => (
                    <option key={client.id || client._id} value={client.id || client._id}>
                      {client.name || client.companyName}
                    </option>
                  ))}
                </select>
              </div>` : ''}
            </div>

            {/* Status Pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateFilter('status', status)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full transition-colors',
                      currentFilters.status === status
                        ? status === 'All'
                          ? 'bg-blue-600 text-white'
                          : getStatusColor(status)
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Filed Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Filed Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={currentFilters.filedDateStart}
                  onChange={(e) => updateFilter('filedDateStart', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={currentFilters.filedDateEnd}
                  onChange={(e) => updateFilter('filedDateEnd', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearAll}
                disabled={!hasActiveFilters}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
              >
                Clear all filters
              </button>
              {onSearch && (
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate accounting stats for specific domain
 */
export function generateDomainAccountingStats(
  domain: string,
  options?: Partial<AccountingStatsOptions>
): string {
  return generateAccountingStats({
    componentName: pascalCase(domain) + 'AccountingStats',
    ...options,
  });
}

/**
 * Generate accounting calendar for specific domain
 */
export function generateDomainCalendarAccounting(
  domain: string,
  options?: Partial<CalendarAccountingOptions>
): string {
  return generateCalendarAccounting({
    componentName: pascalCase(domain) + 'CalendarAccounting',
    ...options,
  });
}

/**
 * Generate tax return filters for specific domain
 */
export function generateDomainTaxReturnFilters(
  domain: string,
  options?: Partial<TaxReturnFiltersOptions>
): string {
  return generateTaxReturnFilters({
    componentName: pascalCase(domain) + 'TaxReturnFilters',
    ...options,
  });
}
