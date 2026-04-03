/**
 * Reports and Analytics Component Generators
 * For dashboards, reports, and analytics displays
 */

export interface ReportsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Sales Chart Component
 */
export function generateSalesChart(options: ReportsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SalesChartProps {
      data: Array<{
        date: string;
        sales: number;
        orders: number;
      }>;
      period: 'daily' | 'weekly' | 'monthly';
      title?: string;
    }

    const SalesChart: React.FC<SalesChartProps> = ({ data, period, title = 'Sales Overview' }) => {
      const maxSales = Math.max(...data.map(d => d.sales));

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">{title}</h3>
            <select className="px-3 py-1 border rounded-lg text-sm">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex items-end gap-1 h-48">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-40">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      height: \`\${(item.sales / maxSales) * 100}%\`,
                      backgroundColor: '${primaryColor}'
                    }}
                    title={\`Sales: \$\${item.sales.toLocaleString()}\`}
                  />
                </div>
                <span className="text-xs text-gray-500 truncate max-w-full">
                  {item.date}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t text-sm">
            <div>
              <p className="text-gray-500">Total Sales</p>
              <p className="font-semibold text-lg" style={{ color: '${primaryColor}' }}>
                \${data.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Total Orders</p>
              <p className="font-semibold text-lg">
                {data.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Revenue Chart Component
 */
export function generateRevenueChart(options: ReportsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface RevenueChartProps {
      data: Array<{
        month: string;
        revenue: number;
        expenses: number;
        profit: number;
      }>;
      title?: string;
    }

    const RevenueChart: React.FC<RevenueChartProps> = ({ data, title = 'Revenue & Expenses' }) => {
      const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.expenses)));

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-lg mb-6">{title}</h3>

          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.month}</span>
                  <span className="text-gray-500">
                    Profit: <span className={\`font-medium \${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                      \${item.profit.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: \`\${(item.revenue / maxValue) * 100}%\`,
                        backgroundColor: '${primaryColor}'
                      }}
                    />
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded"
                      style={{ width: \`\${(item.expenses / maxValue) * 100}%\` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6 pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '${primaryColor}' }} />
              <span className="text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded" />
              <span className="text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Utilization Report Component
 */
export function generateUtilizationReport(options: ReportsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface UtilizationReportProps {
      resources: Array<{
        id: string;
        name: string;
        category: string;
        totalHours: number;
        usedHours: number;
        utilization: number;
      }>;
      title?: string;
    }

    const UtilizationReport: React.FC<UtilizationReportProps> = ({ resources, title = 'Resource Utilization' }) => {
      const avgUtilization = resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length;

      const getUtilizationColor = (util: number) => {
        if (util >= 80) return 'text-green-600 bg-green-100';
        if (util >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">{title}</h3>
            <div className="text-right">
              <p className="text-sm text-gray-500">Average Utilization</p>
              <p className="text-xl font-bold" style={{ color: '${primaryColor}' }}>
                {avgUtilization.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="divide-y">
            {resources.map((resource) => (
              <div key={resource.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-sm text-gray-500">{resource.category}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-sm font-medium \${getUtilizationColor(resource.utilization)}\`}>
                    {resource.utilization}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: \`\${resource.utilization}%\`,
                        backgroundColor: '${primaryColor}'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {resource.usedHours}/{resource.totalHours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Sales Stats Gallery Component
 */
export function generateSalesStatsGallery(options: ReportsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SalesStatsGalleryProps {
      stats: Array<{
        label: string;
        value: string | number;
        change?: number;
        changeLabel?: string;
        icon: string;
      }>;
    }

    const SalesStatsGallery: React.FC<SalesStatsGalleryProps> = ({ stats }) => {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                {stat.change !== undefined && (
                  <span className={\`text-xs px-2 py-0.5 rounded-full \${stat.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              {stat.changeLabel && (
                <p className="text-xs text-gray-400 mt-1">{stat.changeLabel}</p>
              )}
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Fulfillment Report Component
 */
export function generateFulfillmentReport(options: ReportsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface FulfillmentReportProps {
      metrics: {
        totalOrders: number;
        fulfilled: number;
        pending: number;
        delayed: number;
        avgFulfillmentTime: string;
        onTimeRate: number;
      };
      recentOrders: Array<{
        id: string;
        orderId: string;
        customer: string;
        status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'delayed';
        date: string;
      }>;
    }

    const FulfillmentReport: React.FC<FulfillmentReportProps> = ({ metrics, recentOrders }) => {
      const statusColors = {
        pending: 'bg-gray-100 text-gray-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-yellow-100 text-yellow-800',
        delivered: 'bg-green-100 text-green-800',
        delayed: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Fulfillment Report</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 border-b">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{metrics.totalOrders}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{metrics.fulfilled}</p>
              <p className="text-sm text-gray-500">Fulfilled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{metrics.delayed}</p>
              <p className="text-sm text-gray-500">Delayed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{metrics.onTimeRate}%</p>
              <p className="text-sm text-gray-500">On-Time Rate</p>
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-medium mb-3">Recent Orders</h4>
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{order.orderId}</p>
                    <p className="text-xs text-gray-500">{order.customer}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{order.date}</span>
                    <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[order.status]}\`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Stock By Warehouse Component
 */
export function generateStockByWarehouse(options: ReportsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface StockByWarehouseProps {
      warehouses: Array<{
        id: string;
        name: string;
        location: string;
        totalItems: number;
        totalValue: number;
        capacity: number;
        used: number;
        lowStockItems: number;
      }>;
      onSelect?: (id: string) => void;
    }

    const StockByWarehouse: React.FC<StockByWarehouseProps> = ({ warehouses, onSelect }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Stock by Warehouse</h3>
          </div>
          <div className="divide-y">
            {warehouses.map((warehouse) => {
              const capacityPercent = (warehouse.used / warehouse.capacity) * 100;
              return (
                <div
                  key={warehouse.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect?.(warehouse.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{warehouse.name}</h4>
                      <p className="text-sm text-gray-500">📍 {warehouse.location}</p>
                    </div>
                    {warehouse.lowStockItems > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        {warehouse.lowStockItems} low stock
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Items</p>
                      <p className="font-medium">{warehouse.totalItems.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Value</p>
                      <p className="font-medium">\${warehouse.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="font-medium">{capacityPercent.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: \`\${capacityPercent}%\`,
                          backgroundColor: capacityPercent > 90 ? '#EF4444' : '${primaryColor}'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  `;
}
