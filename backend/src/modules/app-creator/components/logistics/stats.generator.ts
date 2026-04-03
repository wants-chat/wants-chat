/**
 * Logistics Stats Component Generator
 *
 * Generates comprehensive logistics dashboard statistics.
 */

export interface LogisticsStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLogisticsStats(options: LogisticsStatsOptions = {}): string {
  const { componentName = 'LogisticsStats', endpoint = '/logistics/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, Truck, Clock, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Warehouse, MapPin, Users, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

interface LogisticsMetrics {
  shipments: {
    total: number;
    in_transit: number;
    delivered_today: number;
    pending: number;
    exceptions: number;
    on_time_rate: number;
    change: number;
  };
  warehouse: {
    total_orders: number;
    picking_queue: number;
    packing_queue: number;
    ready_to_ship: number;
    receiving_pending: number;
    utilization: number;
  };
  delivery: {
    active_routes: number;
    completed_today: number;
    average_delivery_time: number; // minutes
    success_rate: number;
    drivers_active: number;
    vehicles_in_use: number;
  };
  performance: {
    orders_per_hour: number;
    picks_per_hour: number;
    average_cycle_time: number; // minutes
    accuracy_rate: number;
  };
}

interface ${componentName}Props {
  warehouseId?: string;
  dateRange?: { start: string; end: string };
  showDetails?: boolean;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  dateRange,
  showDetails = true,
  className = '',
}) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['logistics-stats', warehouseId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (dateRange?.start) params.append('start_date', dateRange.start);
      if (dateRange?.end) params.append('end_date', dateRange.end);
      const url = params.toString() ? \`${endpoint}?\${params.toString()}\` : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const renderChange = (value: number) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={\`flex items-center text-xs \${isPositive ? 'text-green-600' : 'text-red-600'}\`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(value)}%
      </span>
    );
  };

  const renderProgressBar = (value: number, color: string = 'bg-blue-500') => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
      <div
        className={\`h-2 rounded-full \${color}\`}
        style={{ width: \`\${Math.min(100, value)}%\` }}
      />
    </div>
  );

  const getHealthColor = (rate: number) => {
    if (rate >= 95) return 'text-green-500';
    if (rate >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={\`space-y-6 \${className}\`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Shipments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            {renderChange(metrics?.shipments?.change || 0)}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics?.shipments?.in_transit?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500">In Transit</p>
        </div>

        {/* Delivered Today */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics?.shipments?.delivered_today?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500">Delivered Today</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(metrics?.warehouse?.picking_queue || 0) + (metrics?.warehouse?.packing_queue || 0)}
          </p>
          <p className="text-sm text-gray-500">Pending Fulfillment</p>
        </div>

        {/* Exceptions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${(metrics?.shipments?.exceptions || 0) > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'}\`}>
              <AlertTriangle className={\`w-5 h-5 \${(metrics?.shipments?.exceptions || 0) > 0 ? 'text-red-600' : 'text-gray-400'}\`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics?.shipments?.exceptions || 0}
          </p>
          <p className="text-sm text-gray-500">Exceptions</p>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipment Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Shipment Performance
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">On-Time Delivery Rate</span>
                    <span className={\`font-semibold \${getHealthColor(metrics?.shipments?.on_time_rate || 0)}\`}>
                      {metrics?.shipments?.on_time_rate || 0}%
                    </span>
                  </div>
                  {renderProgressBar(
                    metrics?.shipments?.on_time_rate || 0,
                    metrics?.shipments?.on_time_rate >= 95 ? 'bg-green-500' : metrics?.shipments?.on_time_rate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Delivery Success Rate</span>
                    <span className={\`font-semibold \${getHealthColor(metrics?.delivery?.success_rate || 0)}\`}>
                      {metrics?.delivery?.success_rate || 0}%
                    </span>
                  </div>
                  {renderProgressBar(
                    metrics?.delivery?.success_rate || 0,
                    metrics?.delivery?.success_rate >= 95 ? 'bg-green-500' : metrics?.delivery?.success_rate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Delivery Time</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metrics?.delivery?.average_delivery_time || 0} min
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Routes</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metrics?.delivery?.active_routes || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-purple-600" />
                Warehouse Performance
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Warehouse Utilization</span>
                    <span className={\`font-semibold \${metrics?.warehouse?.utilization > 90 ? 'text-red-500' : metrics?.warehouse?.utilization > 75 ? 'text-yellow-500' : 'text-green-500'}\`}>
                      {metrics?.warehouse?.utilization || 0}%
                    </span>
                  </div>
                  {renderProgressBar(
                    metrics?.warehouse?.utilization || 0,
                    metrics?.warehouse?.utilization > 90 ? 'bg-red-500' : metrics?.warehouse?.utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Pick Accuracy</span>
                    <span className={\`font-semibold \${getHealthColor(metrics?.performance?.accuracy_rate || 0)}\`}>
                      {metrics?.performance?.accuracy_rate || 0}%
                    </span>
                  </div>
                  {renderProgressBar(
                    metrics?.performance?.accuracy_rate || 0,
                    metrics?.performance?.accuracy_rate >= 99 ? 'bg-green-500' : metrics?.performance?.accuracy_rate >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Orders/Hour</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metrics?.performance?.orders_per_hour || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Picks/Hour</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metrics?.performance?.picks_per_hour || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Fulfillment Pipeline
            </h3>

            <div className="flex items-center justify-between">
              {[
                { label: 'Receiving', value: metrics?.warehouse?.receiving_pending || 0, color: 'bg-purple-500' },
                { label: 'Picking', value: metrics?.warehouse?.picking_queue || 0, color: 'bg-blue-500' },
                { label: 'Packing', value: metrics?.warehouse?.packing_queue || 0, color: 'bg-orange-500' },
                { label: 'Ready to Ship', value: metrics?.warehouse?.ready_to_ship || 0, color: 'bg-green-500' },
              ].map((stage, index, arr) => (
                <React.Fragment key={stage.label}>
                  <div className="text-center flex-1">
                    <div className={\`w-16 h-16 mx-auto rounded-full \${stage.color} bg-opacity-20 flex items-center justify-center mb-2\`}>
                      <span className={\`text-xl font-bold \${stage.color.replace('bg-', 'text-')}\`}>
                        {stage.value}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{stage.label}</p>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.delivery?.drivers_active || 0}
                  </p>
                  <p className="text-sm text-gray-500">Active Drivers</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.delivery?.vehicles_in_use || 0}
                  </p>
                  <p className="text-sm text-gray-500">Vehicles in Use</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.delivery?.completed_today || 0}
                  </p>
                  <p className="text-sm text-gray-500">Deliveries Today</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
