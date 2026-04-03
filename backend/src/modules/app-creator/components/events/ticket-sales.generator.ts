/**
 * Ticket Sales Component Generators
 */

export interface TicketSalesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketStats(options: TicketSalesOptions = {}): string {
  const { componentName = 'TicketStats', endpoint = '/tickets/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Ticket, DollarSign, TrendingUp, Users, BarChart3, Clock } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    { label: 'Tickets Sold Today', value: stats?.tickets_sold_today || 0, icon: Ticket, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', change: stats?.tickets_change },
    { label: 'Revenue Today', value: stats?.revenue_today ? \`$\${stats.revenue_today.toLocaleString()}\` : '$0', icon: DollarSign, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', change: stats?.revenue_change },
    { label: 'Avg. Ticket Price', value: stats?.avg_ticket_price ? \`$\${stats.avg_ticket_price.toFixed(2)}\` : '$0', icon: BarChart3, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Total Customers', value: stats?.total_customers || 0, icon: Users, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'Conversion Rate', value: stats?.conversion_rate ? \`\${stats.conversion_rate}%\` : '0%', icon: TrendingUp, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: Clock, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className={\`p-3 rounded-lg \${stat.color}\`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
            {stat.change !== undefined && (
              <div className={\`text-sm font-medium \${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketSalesToday(options: TicketSalesOptions = {}): string {
  const { componentName = 'TicketSalesToday', endpoint = '/tickets/sales/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Ticket, Clock, User, CreditCard, MapPin, CheckCircle, XCircle, Clock3 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: sales, isLoading } = useQuery({
    queryKey: ['ticket-sales-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalRevenue = sales?.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.amount || 0), 0) || 0;
  const totalTickets = sales?.reduce((sum: number, sale: any) => sum + (sale.ticket_count || sale.quantity || 1), 0) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-500" />
            Today's Ticket Sales
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-900 dark:text-white">{totalTickets}</span> tickets
            </span>
            <span className="text-gray-500">
              <span className="font-semibold text-green-600">\${totalRevenue.toLocaleString()}</span> revenue
            </span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sales && sales.length > 0 ? (
          sales.map((sale: any) => (
            <Link
              key={sale.id}
              to={\`/orders/\${sale.order_id || sale.id}\`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={\`p-3 rounded-xl \${
                  sale.status === 'completed' || sale.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' :
                  sale.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  sale.status === 'failed' || sale.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }\`}>
                  {sale.status === 'completed' || sale.status === 'confirmed' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : sale.status === 'pending' ? (
                    <Clock3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  ) : sale.status === 'failed' || sale.status === 'cancelled' ? (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <Ticket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {sale.event_title || sale.event_name || 'Event Ticket'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{sale.order_number || sale.id?.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        \${(sale.total_amount || sale.amount || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.ticket_count || sale.quantity || 1} ticket(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {sale.customer_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {sale.customer_name}
                      </span>
                    )}
                    {sale.purchase_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {sale.purchase_time}
                      </span>
                    )}
                    {sale.payment_method && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {sale.payment_method}
                      </span>
                    )}
                    {sale.ticket_type && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
                        {sale.ticket_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No ticket sales today yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketSalesRecent(options: TicketSalesOptions = {}): string {
  const { componentName = 'TicketSalesRecent', endpoint = '/tickets/sales/recent' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Ticket, Calendar, User, ArrowUpRight, TrendingUp, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showFilters?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 10, showFilters = true }) => {
  const [dateRange, setDateRange] = React.useState('7d');
  const [eventFilter, setEventFilter] = React.useState('');

  const { data: sales, isLoading } = useQuery({
    queryKey: ['ticket-sales-recent', dateRange, eventFilter, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        range: dateRange,
        limit: limit.toString(),
      });
      if (eventFilter) params.append('event_id', eventFilter);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const groupedByDate = sales?.reduce((acc: any, sale: any) => {
    const date = sale.purchase_date || sale.created_at?.split('T')[0] || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(sale);
    return acc;
  }, {}) || {};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Recent Sales
          </h2>
          {showFilters && (
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              >
                <option value="1d">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.keys(groupedByDate).length > 0 ? (
          Object.entries(groupedByDate).map(([date, dateSales]: [string, any]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {date === new Date().toISOString().split('T')[0] ? 'Today' :
                     date === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'Yesterday' :
                     new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sm text-gray-500">
                    {dateSales.length} sale(s) - \${dateSales.reduce((sum: number, s: any) => sum + (s.total_amount || s.amount || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
              {dateSales.map((sale: any) => (
                <Link
                  key={sale.id}
                  to={\`/orders/\${sale.order_id || sale.id}\`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {sale.event_title || sale.event_name || 'Event Ticket'}
                      </h3>
                      {sale.ticket_type && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          {sale.ticket_type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {sale.customer_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {sale.customer_name}
                        </span>
                      )}
                      <span>{sale.ticket_count || sale.quantity || 1}x tickets</span>
                      {sale.purchase_time && (
                        <span>{sale.purchase_time}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        \${(sale.total_amount || sale.amount || 0).toFixed(2)}
                      </p>
                      <span className={\`text-xs \${
                        sale.status === 'completed' || sale.status === 'confirmed' ? 'text-green-600' :
                        sale.status === 'pending' ? 'text-yellow-600' :
                        sale.status === 'refunded' ? 'text-red-600' :
                        'text-gray-500'
                      }\`}>
                        {sale.status || 'Completed'}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No recent sales found
          </div>
        )}
      </div>

      {sales && sales.length >= limit && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/sales"
            className="block w-full py-2 text-center text-purple-600 hover:text-purple-700 font-medium"
          >
            View All Sales
          </Link>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
